/**
 * Testes de `lib/cms.ts` — readers + writers do CMS Supabase.
 *
 * Mocka `@/lib/supabase/client` pra controlar respostas. Foco:
 *  - Readers caem pro default quando cliente é null/erro/vazio
 *  - Readers traduzem snake_case → camelCase
 *  - Writers chamam o método correto da Supabase API
 *  - uploadImage encadeia upload + getPublicUrl
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- Mock chainável da query builder ----
// Pattern: cada teste enfileira um `result` via queueResult(). O próximo
// `from()` chamado pelo lib pega esse result. Asserções inspecionam o
// `lastBuilder` (snapshot do que rodou) DEPOIS do await.

interface BuilderSnapshot {
  table: string
  select?: string
  order?: { column: string; ascending: boolean }
  insert?: unknown
  update?: unknown
  upsert?: unknown
  upsertOptions?: unknown
  delete?: boolean
  eqFilters: Array<[string, unknown]>
}

interface MockResult {
  data: unknown
  error: unknown
}

let resultQueue: MockResult[] = []
let lastBuilder: BuilderSnapshot

function queueResult(r: MockResult) {
  resultQueue.push(r)
}

function nextResult(): MockResult {
  return resultQueue.shift() ?? { data: null, error: null }
}

function makeBuilder(table: string) {
  const snapshot: BuilderSnapshot = { table, eqFilters: [] }
  lastBuilder = snapshot
  // O `result` é resolvido lazily no momento do await, depois que o teste
  // já fez todas as suas configurações de queue/insert.
  let resultPromise: Promise<MockResult> | null = null
  const finalize = () => {
    if (!resultPromise) resultPromise = Promise.resolve(nextResult())
    return resultPromise
  }

  // Chain object — usa `any` aqui pra simplificar; é só código de teste.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {
    select: (s: string) => {
      snapshot.select = s
      return chain
    },
    order: (column: string, opts: { ascending: boolean }) => {
      snapshot.order = { column, ascending: opts.ascending }
      return finalize()
    },
    eq: (column: string, value: unknown) => {
      snapshot.eqFilters.push([column, value])
      return chain
    },
    maybeSingle: () => finalize(),
    single: () => finalize(),
    insert: (payload: unknown) => {
      snapshot.insert = payload
      return chain
    },
    update: (payload: unknown) => {
      snapshot.update = payload
      return chain
    },
    upsert: (payload: unknown, options?: unknown) => {
      snapshot.upsert = payload
      snapshot.upsertOptions = options
      return finalize()
    },
    delete: () => {
      snapshot.delete = true
      return chain
    },
  }
  // Permite `await sb.from('x').select(...)` sem método terminal explícito
  chain.then = (fn: (r: unknown) => unknown) => finalize().then(fn)
  return chain
}

// Image upload mocks
const mockStorageUpload = vi.fn()
const mockGetPublicUrl = vi.fn()

const mockClient = {
  from: vi.fn((table: string) => makeBuilder(table)),
  storage: {
    from: vi.fn(() => ({
      upload: mockStorageUpload,
      getPublicUrl: mockGetPublicUrl,
    })),
  },
}

let returnNull = false

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => (returnNull ? null : mockClient),
}))

// Importar DEPOIS do mock
import {
  getBanners,
  getMinisterios,
  getEventos,
  getAviso,
  getTextos,
  getHistoria,
  getChurchEffective,
  saveAviso,
  saveTextos,
  uploadImage,
  createBanner,
  deleteBanner,
  createHistoria,
  upsertHistoria,
  deleteHistoria,
} from '@/lib/cms'

beforeEach(() => {
  returnNull = false
  resultQueue = []
  mockStorageUpload.mockReset()
  mockGetPublicUrl.mockReset()
  mockClient.from.mockClear()
})

// ============================================================
// Readers — fallback paths
// ============================================================

describe('cms readers — fallback', () => {
  it('getBanners cai pro default se cliente Supabase é null', async () => {
    returnNull = true
    const result = await getBanners()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toMatch(/^default-/)
  })

  it('getBanners cai pro default se erro na query', async () => {
    queueResult({ data: null, error: { message: 'boom' } })
    const result = await getBanners()
    expect(result[0].id).toMatch(/^default-/)
  })

  it('getMinisterios cai pro default se tabela vazia', async () => {
    queueResult({ data: [], error: null })
    const result = await getMinisterios()
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((m) => m.name.includes('Louvor'))).toBe(true)
  })
})

// ============================================================
// Readers — happy path com mapeamento snake_case → camelCase
// ============================================================

describe('cms readers — mapping', () => {
  it('getBanners traduz snake_case da DB pra camelCase', async () => {
    queueResult({
      data: [
        {
          id: 'abc-123',
          title: 'Banner 1',
          subtitle: 'Sub',
          image_url: 'https://img.test/a.jpg',
          button_text: 'Clique',
          link: '/x',
          sort_order: 0,
        },
      ],
      error: null,
    })
    const result = await getBanners()
    expect(result).toEqual([
      {
        id: 'abc-123',
        title: 'Banner 1',
        subtitle: 'Sub',
        imageUrl: 'https://img.test/a.jpg',
        buttonText: 'Clique',
        link: '/x',
        sortOrder: 0,
      },
    ])
  })

  it('getEventos traduz e usa coluna date pra ordenar', async () => {
    queueResult({
      data: [
        {
          id: 'e1',
          title: 'Culto',
          description: '',
          date: '2026-05-01',
          time: '19:00',
          location: 'T',
          category: 'culto',
          image_url: null,
        },
      ],
      error: null,
    })
    const result = await getEventos()
    expect(result[0].imageUrl).toBeNull()
    expect(lastBuilder.order?.column).toBe('date')
  })

  it('getAviso retorna default quando não há linha', async () => {
    queueResult({ data: null, error: null })
    const aviso = await getAviso()
    expect(aviso.ativo).toBe(false)
    expect(aviso.mensagem).toBe('')
  })

  it('getAviso traduz link_texto → linkTexto', async () => {
    queueResult({
      data: {
        id: 1,
        ativo: true,
        severidade: 'urgente',
        mensagem: 'Cancelado!',
        link: '/eventos',
        link_texto: 'Ver',
      },
      error: null,
    })
    const aviso = await getAviso()
    expect(aviso).toEqual({
      ativo: true,
      severidade: 'urgente',
      mensagem: 'Cancelado!',
      link: '/eventos',
      linkTexto: 'Ver',
    })
  })

  it('getTextos faz merge KV em cima dos defaults', async () => {
    queueResult({
      data: [{ key: 'homeTitulo', value: 'Custom title' }],
      error: null,
    })
    const t = await getTextos()
    expect(t.homeTitulo).toBe('Custom title')
    expect(t.versiculoReferencia).toBeTruthy()
  })
})

// ============================================================
// Writers
// ============================================================

describe('cms writers', () => {
  it('saveAviso chama upsert em cms_avisos com id=1', async () => {
    queueResult({ data: null, error: null })

    await saveAviso({
      ativo: true,
      severidade: 'info',
      mensagem: 'Olá',
      link: null,
      linkTexto: null,
    })

    expect(lastBuilder.table).toBe('cms_avisos')
    expect(lastBuilder.upsert).toMatchObject({
      id: 1,
      ativo: true,
      severidade: 'info',
      mensagem: 'Olá',
      link_texto: null,
    })
  })

  it('saveTextos faz upsert de array com onConflict=key', async () => {
    queueResult({ data: null, error: null })

    await saveTextos({ homeTitulo: 'Novo', extraKey: 'X' })

    expect(lastBuilder.table).toBe('cms_textos')
    expect(lastBuilder.upsert).toEqual([
      { key: 'homeTitulo', value: 'Novo' },
      { key: 'extraKey', value: 'X' },
    ])
    expect(lastBuilder.upsertOptions).toEqual({ onConflict: 'key' })
  })

  it('createBanner chama insert com payload mapeado pra snake_case', async () => {
    queueResult({
      data: {
        id: 'new-1',
        title: 'Novo',
        subtitle: null,
        image_url: 'https://img.test/x.jpg',
        button_text: null,
        link: null,
        sort_order: 0,
      },
      error: null,
    })

    const out = await createBanner({
      title: 'Novo',
      subtitle: null,
      imageUrl: 'https://img.test/x.jpg',
      buttonText: null,
      link: null,
      sortOrder: 0,
    })

    expect(lastBuilder.insert).toMatchObject({
      title: 'Novo',
      image_url: 'https://img.test/x.jpg',
      sort_order: 0,
    })
    expect(out.id).toBe('new-1')
    expect(out.imageUrl).toBe('https://img.test/x.jpg')
  })

  it('deleteBanner chama delete().eq(id, ...)', async () => {
    queueResult({ data: null, error: null })

    await deleteBanner('abc-123')

    expect(lastBuilder.delete).toBe(true)
    expect(lastBuilder.eqFilters).toContainEqual(['id', 'abc-123'])
  })

  it('writers lançam quando cliente Supabase é null', async () => {
    returnNull = true
    await expect(
      saveAviso({ ativo: false, severidade: 'info', mensagem: '', link: null, linkTexto: null })
    ).rejects.toThrow(/Supabase indisponível/)
  })
})

// ============================================================
// Image upload
// ============================================================

describe('uploadImage', () => {
  it('faz upload no bucket public-images e retorna a URL pública', async () => {
    mockStorageUpload.mockResolvedValue({ data: { path: 'cms/123-foo.png' }, error: null })
    mockGetPublicUrl.mockReturnValue({
      data: {
        publicUrl:
          'https://x.supabase.co/storage/v1/object/public/public-images/cms/123-foo.png',
      },
    })

    const file = new File(['x'], 'My Photo.PNG', { type: 'image/png' })
    const url = await uploadImage(file)

    expect(mockClient.storage.from).toHaveBeenCalledWith('public-images')
    expect(mockStorageUpload).toHaveBeenCalledTimes(1)
    const [path, uploadedFile, opts] = mockStorageUpload.mock.calls[0]
    expect(path).toMatch(/^cms\/\d+-my-photo\.png$/)
    expect(uploadedFile).toBe(file)
    expect(opts).toMatchObject({ contentType: 'image/png', upsert: false })
    expect(url).toContain('public-images/cms/')
  })

  it('propaga erro se upload falhar', async () => {
    mockStorageUpload.mockResolvedValue({ data: null, error: { message: 'quota' } })
    const file = new File(['x'], 'x.png', { type: 'image/png' })
    await expect(uploadImage(file)).rejects.toMatchObject({ message: 'quota' })
  })
})

// ============================================================
// HISTORIA — readers + writers (Phase 9)
// ============================================================

describe('cms historia', () => {
  it('getHistoria cai pro default se tabela vazia', async () => {
    queueResult({ data: [], error: null })
    const result = await getHistoria()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].year).toBe('1970')
  })

  it('getHistoria traduz snake_case → camelCase + ordena por sort_order', async () => {
    queueResult({
      data: [
        {
          id: 'h-1',
          year: '1972',
          title: 'Marco 1',
          description: 'Descrição',
          image_url: 'https://img.test/h.jpg',
          sort_order: 0,
        },
      ],
      error: null,
    })
    const result = await getHistoria()
    expect(result).toEqual([
      {
        id: 'h-1',
        year: '1972',
        title: 'Marco 1',
        description: 'Descrição',
        imageUrl: 'https://img.test/h.jpg',
        sortOrder: 0,
      },
    ])
    expect(lastBuilder.order?.column).toBe('sort_order')
  })

  it('createHistoria converte camelCase pra snake_case no insert', async () => {
    queueResult({
      data: {
        id: 'new-h',
        year: '2020',
        title: 'Novo',
        description: '',
        image_url: null,
        sort_order: 5,
      },
      error: null,
    })
    const out = await createHistoria({
      year: '2020',
      title: 'Novo',
      description: '',
      imageUrl: null,
      sortOrder: 5,
    })
    expect(lastBuilder.insert).toMatchObject({
      year: '2020',
      title: 'Novo',
      sort_order: 5,
    })
    expect(out.id).toBe('new-h')
  })

  it('upsertHistoria com id default usa insert (porque seed não tem UUID válido)', async () => {
    queueResult({
      data: { id: 'real-uuid', year: '2020', title: 'X', description: '', image_url: null, sort_order: 0 },
      error: null,
    })
    await upsertHistoria({
      id: 'default-3',
      year: '2020',
      title: 'X',
      description: '',
      imageUrl: null,
      sortOrder: 0,
    })
    expect(lastBuilder.insert).toBeDefined()
    expect(lastBuilder.update).toBeUndefined()
  })

  it('upsertHistoria com UUID válido usa update', async () => {
    queueResult({
      data: {
        id: '11111111-2222-3333-4444-555555555555',
        year: '2020',
        title: 'X',
        description: '',
        image_url: null,
        sort_order: 0,
      },
      error: null,
    })
    await upsertHistoria({
      id: '11111111-2222-3333-4444-555555555555',
      year: '2020',
      title: 'X',
      description: '',
      imageUrl: null,
      sortOrder: 0,
    })
    expect(lastBuilder.update).toBeDefined()
    expect(lastBuilder.insert).toBeUndefined()
    expect(lastBuilder.eqFilters).toContainEqual([
      'id',
      '11111111-2222-3333-4444-555555555555',
    ])
  })

  it('deleteHistoria chama delete().eq(id, ...)', async () => {
    queueResult({ data: null, error: null })
    await deleteHistoria('abc-123')
    expect(lastBuilder.delete).toBe(true)
    expect(lastBuilder.eqFilters).toContainEqual(['id', 'abc-123'])
  })
})

// ============================================================
// CHURCH EFFECTIVE — merger de cms_textos sobre data/church.json
// ============================================================

describe('getChurchEffective', () => {
  it('retorna defaults do JSON quando textos KV está vazio', async () => {
    queueResult({ data: [], error: null }) // cms_textos vazio
    const c = await getChurchEffective()
    // Vem do data/church.json (depende dos dados reais, mas algumas
    // afirmações são estáveis):
    expect(c.nome).toBeTruthy()
    expect(c.endereco.cidade).toBeTruthy()
    expect(c.pastor.nome).toBeTruthy()
    expect(Array.isArray(c.pastor.bio)).toBe(true)
  })

  it('aplica overrides do KV em cima dos defaults', async () => {
    queueResult({
      data: [
        { key: 'igrejaNome', value: 'Igreja Teste Sobrescrita' },
        { key: 'pastorNome', value: 'João Custom' },
        { key: 'pastorBio', value: 'Parágrafo um.\n\nParágrafo dois.' },
        { key: 'enderecoCidade', value: 'Cidade Nova' },
      ],
      error: null,
    })
    const c = await getChurchEffective()
    expect(c.nome).toBe('Igreja Teste Sobrescrita')
    expect(c.pastor.nome).toBe('João Custom')
    expect(c.pastor.bio).toEqual(['Parágrafo um.', 'Parágrafo dois.'])
    expect(c.endereco.cidade).toBe('Cidade Nova')
  })

  it('valor vazio cai pro default (não substitui)', async () => {
    queueResult({
      data: [{ key: 'igrejaNome', value: '   ' }], // whitespace only
      error: null,
    })
    const c = await getChurchEffective()
    // Não foi sobrescrito por whitespace
    expect(c.nome).not.toBe('   ')
    expect(c.nome.length).toBeGreaterThan(3)
  })

  it('campos nullable com valor "null" literal viram null', async () => {
    queueResult({
      data: [
        { key: 'contatoTelefone', value: '' },
        { key: 'socialFacebook', value: '   null  ' },
      ],
      error: null,
    })
    const c = await getChurchEffective()
    // contatoTelefone: '' deve manter o default (null no church.json)
    expect(c.contato.telefone).toBeNull()
    // socialFacebook: 'null' literal explicitamente vira null
    expect(c.social.facebook).toBeNull()
  })
})
