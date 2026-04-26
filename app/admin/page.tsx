'use client'

/**
 * /admin — painel de conteúdo persistido no Supabase (Phase 8).
 *
 * Diferente do anterior (localStorage), tudo que é editado aqui é gravado
 * no banco e fica visível pra todo mundo, em qualquer dispositivo. Imagens
 * sobem pro bucket Storage `public-images`.
 *
 * Fluxo de uma edição:
 *   1. usuário clica em editar/criar/deletar
 *   2. chamamos lib/cms (writer correspondente)
 *   3. RLS no Supabase garante que só admin/conteudista escreve
 *   4. on success → toast + atualiza estado local com a row de volta
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  Calendar,
  Users,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  LogOut,
  Upload,
  Loader2,
  Megaphone,
  Info,
  AlertTriangle,
  AlertOctagon,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { type ChurchAviso, type AvisoSeveridade } from '@/lib/site-data'
import {
  getBanners,
  getMinisterios,
  getEventos,
  getTextos,
  getAviso,
  upsertBanner,
  createBanner,
  deleteBanner,
  upsertMinisterio,
  createMinisterio,
  deleteMinisterio,
  upsertEvento,
  createEvento,
  deleteEvento,
  saveTextos,
  saveAviso,
  uploadImage,
  DEFAULT_TEXTOS,
  type CmsBanner,
  type CmsMinisterio,
  type CmsEvento,
  type CmsTextos,
} from '@/lib/cms'
import { AvisoBanner } from '@/components/aviso-banner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'banners' | 'ministerios' | 'eventos' | 'textos' | 'avisos'

export default function AdminPage() {
  const { user, profile, logout, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  // Estado vindo do banco — começa vazio, hidrata via useEffect.
  const [banners, setBanners] = useState<CmsBanner[]>([])
  const [ministerios, setMinisterios] = useState<CmsMinisterio[]>([])
  const [eventos, setEventos] = useState<CmsEvento[]>([])
  const [textos, setTextos] = useState<CmsTextos>(DEFAULT_TEXTOS)
  const [aviso, setAviso] = useState<ChurchAviso>({
    ativo: false,
    severidade: 'info',
    mensagem: '',
    link: null,
    linkTexto: null,
  })
  const [hydrated, setHydrated] = useState(false)

  const reloadAll = useCallback(async () => {
    const [b, m, e, t, a] = await Promise.all([
      getBanners(),
      getMinisterios(),
      getEventos(),
      getTextos(),
      getAviso(),
    ])
    setBanners(b)
    setMinisterios(m)
    setEventos(e)
    setTextos(t)
    setAviso(a)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) reloadAll()
  }, [user, reloadAll])

  if (loading || !user || !hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'avisos', label: 'Avisos', icon: Megaphone },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'ministerios', label: 'Ministérios', icon: Users },
    { id: 'eventos', label: 'Eventos e Datas', icon: Calendar },
    { id: 'textos', label: 'Textos do Site', icon: FileText },
  ]

  const stats = [
    { label: 'Banners ativos', value: banners.length, color: 'bg-primary' },
    { label: 'Ministérios', value: ministerios.length, color: 'bg-accent' },
    { label: 'Eventos agendados', value: eventos.length, color: 'bg-brand-blue' },
    {
      label: 'Próximo evento',
      value: eventos.length > 0 ? new Date(eventos[0].date).toLocaleDateString('pt-BR') : '—',
      color: 'bg-destructive',
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="bg-brand-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Painel de Conteúdo</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">
                Olá, {(profile?.nome || user.email?.split('@')[0] || 'admin').split(' ')[0]} 👋
              </h1>
              <p className="opacity-80 mt-1 text-sm">
                Tudo que você editar aqui é salvo no banco e fica visível pra todos os visitantes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reloadAll}
                title="Recarregar do banco"
                className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </button>
              <Link
                href="/"
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition"
              >
                Ver site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive/90 hover:bg-destructive text-white text-sm font-medium transition"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-card border border-border rounded-lg p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition',
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-lg p-5 border border-border shadow-sm">
                  <div className={cn('h-1.5 w-10 rounded-full mb-3', s.color)} />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-medium mb-1">💡 Como funciona agora</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Tudo que você edita aqui é gravado direto no banco do Supabase
                e aparece pros visitantes na hora seguinte (Vercel re-renderiza
                ao primeiro acesso). Imagens sobem pro armazenamento público.
                Não tem mais &quot;preview local&quot; — quando você salva, está no ar.
              </p>
            </div>
          </div>
        )}

        {tab === 'avisos' && (
          <AvisosEditor
            value={aviso}
            onSaved={(saved) => {
              setAviso(saved)
              toast.success(saved.ativo ? 'Aviso publicado.' : 'Aviso salvo (desativado).')
            }}
          />
        )}

        {tab === 'banners' && (
          <BannersEditor
            items={banners}
            onCreate={async (b) => {
              const created = await createBanner(b)
              setBanners((prev) => [...prev, created])
              toast.success('Banner criado.')
            }}
            onUpdate={async (b) => {
              const saved = await upsertBanner(b)
              setBanners((prev) =>
                prev.some((x) => x.id === b.id)
                  ? prev.map((x) => (x.id === b.id ? saved : x))
                  : [...prev.filter((x) => x.id !== b.id), saved]
              )
              toast.success('Banner salvo.')
            }}
            onDelete={async (id) => {
              await deleteBanner(id)
              setBanners((prev) => prev.filter((x) => x.id !== id))
              toast.success('Banner removido.')
            }}
          />
        )}

        {tab === 'ministerios' && (
          <MinisteriosEditor
            items={ministerios}
            onCreate={async (m) => {
              const created = await createMinisterio(m)
              setMinisterios((prev) => [...prev, created])
              toast.success('Ministério criado.')
            }}
            onUpdate={async (m) => {
              const saved = await upsertMinisterio(m)
              setMinisterios((prev) =>
                prev.some((x) => x.id === m.id)
                  ? prev.map((x) => (x.id === m.id ? saved : x))
                  : [...prev.filter((x) => x.id !== m.id), saved]
              )
              toast.success('Ministério salvo.')
            }}
            onDelete={async (id) => {
              await deleteMinisterio(id)
              setMinisterios((prev) => prev.filter((x) => x.id !== id))
              toast.success('Ministério removido.')
            }}
          />
        )}

        {tab === 'eventos' && (
          <EventosEditor
            items={eventos}
            onCreate={async (e) => {
              const created = await createEvento(e)
              setEventos((prev) => [...prev, created])
              toast.success('Evento criado.')
            }}
            onUpdate={async (e) => {
              const saved = await upsertEvento(e)
              setEventos((prev) =>
                prev.some((x) => x.id === e.id)
                  ? prev.map((x) => (x.id === e.id ? saved : x))
                  : [...prev.filter((x) => x.id !== e.id), saved]
              )
              toast.success('Evento salvo.')
            }}
            onDelete={async (id) => {
              await deleteEvento(id)
              setEventos((prev) => prev.filter((x) => x.id !== id))
              toast.success('Evento removido.')
            }}
          />
        )}

        {tab === 'textos' && (
          <TextosEditor
            value={textos}
            onSave={async (next) => {
              await saveTextos(next)
              setTextos(next)
              toast.success('Textos atualizados.')
            }}
          />
        )}
      </div>
    </div>
  )
}

// ======================== Image upload helper ========================

function ImageField({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string) => void
}) {
  const [busy, setBusy] = useState(false)

  const handleFile = async (file: File) => {
    setBusy(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
      toast.success('Imagem enviada.')
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Erro ao enviar imagem.'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {value && (
        <div
          className="h-24 rounded border border-border bg-cover bg-center"
          style={{ backgroundImage: `url(${value})` }}
        />
      )}
      <label
        className={cn(
          'flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 border border-dashed border-border cursor-pointer text-xs text-muted-foreground',
          busy && 'opacity-50 cursor-wait'
        )}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? 'Enviando…' : 'Fazer upload'}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </label>
    </div>
  )
}

// ======================== Generic FieldEditor ========================

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'date' | 'time' | 'select'
  options?: string[]
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string | null | undefined
  onChange: (v: string) => void
}) {
  const baseInput =
    'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={baseInput}
        />
      ) : field.type === 'select' ? (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={baseInput}>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === 'image' ? (
        <ImageField value={value ?? null} onChange={onChange} />
      ) : (
        <input
          type={field.type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}
    </div>
  )
}

// ======================== CardsEditor (genérico) ========================

function CardsEditor<T extends { id: string }>({
  items,
  onCreate,
  onUpdate,
  onDelete,
  fields,
  makeNew,
  title,
  description,
  preview,
}: {
  items: T[]
  onCreate: (v: Omit<T, 'id'>) => Promise<void>
  onUpdate: (v: T) => Promise<void>
  onDelete: (id: string) => Promise<void>
  fields: FieldDef[]
  makeNew: () => Omit<T, 'id'>
  title: string
  description: string
  preview: (item: T) => { title: string; subtitle?: string; date?: string; time?: string; imageUrl?: string | null }
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)

  const startEdit = (item: T) => {
    setEditing(item.id)
    setDraft({ ...item })
  }
  const cancelEdit = () => {
    setEditing(null)
    setDraft(null)
  }
  const saveEdit = async () => {
    if (!draft) return
    setBusy(true)
    try {
      await onUpdate(draft)
      cancelEdit()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }
  const remove = async (id: string) => {
    if (!confirm('Deseja mesmo remover este item?')) return
    setBusy(true)
    try {
      await onDelete(id)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao remover.')
    } finally {
      setBusy(false)
    }
  }
  const add = async () => {
    setBusy(true)
    try {
      await onCreate(makeNew())
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao criar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => {
          const p = preview(item)
          return (
            <div
              key={item.id}
              className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {editing === item.id && draft ? (
                <div className="p-4 space-y-3">
                  {fields.map((f) => (
                    <FieldEditor
                      key={f.key}
                      field={f}
                      value={(draft as unknown as Record<string, string | null>)[f.key]}
                      onChange={(v) =>
                        setDraft({ ...draft, [f.key]: v } as T)
                      }
                    />
                  ))}
                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      onClick={cancelEdit}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {p.imageUrl && (
                    <div
                      className="h-32 bg-cover bg-center"
                      style={{ backgroundImage: `url(${p.imageUrl})` }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{p.title}</p>
                        {p.subtitle && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {p.subtitle}
                          </p>
                        )}
                        {p.date && (
                          <p className="text-xs text-primary mt-2 font-medium">
                            {new Date(p.date).toLocaleDateString('pt-BR')}
                            {p.time ? ` · ${p.time}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                          aria-label="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          disabled={busy}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded disabled:opacity-50"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Nenhum item. Clique em &quot;Adicionar&quot;.</p>
        </div>
      )}
    </div>
  )
}

// ======================== Editores específicos ========================

function BannersEditor({
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: CmsBanner[]
  onCreate: (b: Omit<CmsBanner, 'id'>) => Promise<void>
  onUpdate: (b: CmsBanner) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <CardsEditor<CmsBanner>
      items={items}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      fields={[
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
        { key: 'imageUrl', label: 'Imagem', type: 'image' },
        { key: 'buttonText', label: 'Texto do botão', type: 'text' },
        { key: 'link', label: 'Link', type: 'text' },
      ]}
      makeNew={() => ({
        title: 'Novo banner',
        subtitle: '',
        imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80',
        buttonText: 'Saiba mais',
        link: '/',
        sortOrder: items.length,
      })}
      title="Banners do Carrossel"
      description="Edite títulos, imagens e chamadas dos banners da página inicial."
      preview={(b) => ({ title: b.title, subtitle: b.subtitle ?? undefined, imageUrl: b.imageUrl })}
    />
  )
}

function MinisteriosEditor({
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: CmsMinisterio[]
  onCreate: (m: Omit<CmsMinisterio, 'id'>) => Promise<void>
  onUpdate: (m: CmsMinisterio) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <CardsEditor<CmsMinisterio>
      items={items}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      fields={[
        { key: 'name', label: 'Nome', type: 'text' },
        { key: 'leader', label: 'Líder', type: 'text' },
        { key: 'leaderInstagram', label: 'Instagram do líder (URL)', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'imageUrl', label: 'Imagem', type: 'image' },
      ]}
      makeNew={() => ({
        name: 'Novo ministério',
        leader: '',
        leaderInstagram: null,
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
        sortOrder: items.length,
      })}
      title="Ministérios"
      description="Atualize imagens, líderes e descrições dos cards de ministérios."
      preview={(m) => ({ title: m.name, subtitle: m.description, imageUrl: m.imageUrl })}
    />
  )
}

function EventosEditor({
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: CmsEvento[]
  onCreate: (e: Omit<CmsEvento, 'id'>) => Promise<void>
  onUpdate: (e: CmsEvento) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <CardsEditor<CmsEvento>
      items={items}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      fields={[
        { key: 'title', label: 'Título', type: 'text' },
        { key: 'description', label: 'Descrição', type: 'textarea' },
        { key: 'date', label: 'Data', type: 'date' },
        { key: 'time', label: 'Horário', type: 'time' },
        { key: 'location', label: 'Local', type: 'text' },
        {
          key: 'category',
          label: 'Categoria',
          type: 'select',
          options: ['culto', 'estudo', 'batismo', 'encontro', 'escola', 'evento'],
        },
        { key: 'imageUrl', label: 'Imagem', type: 'image' },
      ]}
      makeNew={() => ({
        title: 'Novo evento',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        time: '19:00',
        location: 'Templo Principal',
        category: 'evento',
        imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80',
      })}
      title="Eventos e Marcações de Datas"
      description="Controle o calendário interativo. As datas marcadas aqui aparecem no calendário público."
      preview={(e) => ({
        title: e.title,
        subtitle: e.description,
        date: e.date,
        time: e.time,
        imageUrl: e.imageUrl,
      })}
    />
  )
}

// ======================== AvisosEditor ========================

const SEVERIDADES: Array<{
  id: AvisoSeveridade
  label: string
  description: string
  icon: typeof Info
  classes: string
}> = [
  {
    id: 'info',
    label: 'Informação',
    description: 'Avisos neutros, comunicados gerais.',
    icon: Info,
    classes: 'bg-accent/10 border-accent text-foreground',
  },
  {
    id: 'atencao',
    label: 'Atenção',
    description: 'Mudança de horário, ajustes de agenda.',
    icon: AlertTriangle,
    classes:
      'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-100',
  },
  {
    id: 'urgente',
    label: 'Urgente',
    description: 'Cancelamento, emergência, comunicado crítico.',
    icon: AlertOctagon,
    classes: 'bg-destructive/10 border-destructive text-foreground',
  },
]

function AvisosEditor({
  value,
  onSaved,
}: {
  value: ChurchAviso
  onSaved: (saved: ChurchAviso) => void
}) {
  const [draft, setDraft] = useState<ChurchAviso>(value)
  const [busy, setBusy] = useState(false)
  useEffect(() => setDraft(value), [value])

  const dirty = JSON.stringify(draft) !== JSON.stringify(value)

  const save = async () => {
    setBusy(true)
    try {
      await saveAviso(draft)
      onSaved(draft)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar aviso.')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setDraft(value)
    toast.info('Mudanças descartadas.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Avisos globais
        </h2>
        <p className="text-sm text-muted-foreground">
          Banner exibido no topo de todas as páginas. Salvo no banco — visível
          pra todos os visitantes assim que você publicar.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 flex items-start gap-4">
        <button
          type="button"
          onClick={() => setDraft({ ...draft, ativo: !draft.ativo })}
          aria-pressed={draft.ativo}
          aria-label={draft.ativo ? 'Desativar aviso' : 'Ativar aviso'}
          className={cn(
            'relative w-12 h-7 rounded-full transition-colors shrink-0 mt-0.5',
            draft.ativo ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
              draft.ativo && 'translate-x-5'
            )}
          />
        </button>
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {draft.ativo ? 'Banner ativo' : 'Banner desativado'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {draft.ativo
              ? 'Aparecerá no topo de todas as páginas após salvar.'
              : 'Ative para mostrar o banner em todo o site.'}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 space-y-3">
        <p className="font-medium text-foreground">Severidade</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {SEVERIDADES.map((s) => {
            const SIcon = s.icon
            const active = draft.severidade === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setDraft({ ...draft, severidade: s.id })}
                className={cn(
                  'text-left p-4 rounded-lg border-2 transition-all',
                  active ? s.classes : 'bg-background border-border hover:border-foreground/40'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <SIcon className="h-4 w-4" />
                  <span className="font-medium text-sm">{s.label}</span>
                  {active && <Check className="h-4 w-4 ml-auto" />}
                </div>
                <p className="text-xs opacity-80">{s.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Mensagem</label>
          <textarea
            value={draft.mensagem}
            onChange={(e) => setDraft({ ...draft, mensagem: e.target.value })}
            placeholder="Ex: O culto de domingo será às 18h por conta da chuva."
            rows={3}
            maxLength={240}
            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {draft.mensagem.length}/240 caracteres.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Link (opcional)
            </label>
            <input
              type="text"
              value={draft.link ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, link: e.target.value.trim() || null })
              }
              placeholder="/eventos ou https://..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Texto do link (opcional)
            </label>
            <input
              type="text"
              value={draft.linkTexto ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, linkTexto: e.target.value || null })
              }
              placeholder="Saiba mais"
              disabled={!draft.link}
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Pré-visualização</span>
        </div>
        {draft.mensagem.trim() ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <AvisoBanner aviso={{ ...draft, ativo: true }} forceOpen />
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Escreva uma mensagem acima para ver o preview.
          </div>
        )}
      </div>

      <div className="sticky bottom-4 z-10">
        <div
          className={cn(
            'rounded-lg border shadow-lg backdrop-blur p-3 flex items-center justify-between gap-3 transition',
            dirty ? 'bg-card/95 border-primary/30' : 'bg-card/80 border-border'
          )}
        >
          <p className="text-xs text-muted-foreground">
            {dirty ? '💾 Você tem alterações não salvas.' : '✓ Tudo salvo.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={reset}
              disabled={!dirty || busy}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Descartar
            </button>
            <button
              onClick={save}
              disabled={!dirty || busy}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Publicar aviso
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ======================== TextosEditor ========================

function TextosEditor({
  value,
  onSave,
}: {
  value: CmsTextos
  onSave: (next: CmsTextos) => Promise<void>
}) {
  const [draft, setDraft] = useState<CmsTextos>(value)
  const [busy, setBusy] = useState(false)
  useEffect(() => setDraft(value), [value])

  const fields: Array<{ key: string; label: string; textarea?: boolean }> = [
    { key: 'homeTitulo', label: 'Título de boas-vindas' },
    { key: 'homeSubtitulo', label: 'Subtítulo de boas-vindas' },
    { key: 'versiculoDestaque', label: 'Versículo em destaque', textarea: true },
    { key: 'versiculoReferencia', label: 'Referência do versículo' },
  ]

  const save = async () => {
    setBusy(true)
    try {
      await onSave(draft)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar textos.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Textos do Site</h2>
        <p className="text-sm text-muted-foreground">
          Edite os principais blocos de texto da página inicial.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                type="text"
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
