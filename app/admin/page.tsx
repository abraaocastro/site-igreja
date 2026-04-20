'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { ministerios as defaultMinisterios, eventos as defaultEventos, heroBanners as defaultHero } from '@/lib/data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'banners' | 'ministerios' | 'eventos' | 'textos'

const STORAGE_PREFIX = 'pibac-cms-'

function useCMSState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key)
      if (stored) setValue(JSON.parse(stored))
    } catch {}
    setReady(true)
  }, [key])

  const update = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next))
    } catch {}
  }

  return [value, update, ready] as const
}

export default function AdminPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  const [banners, setBanners] = useCMSState('banners', defaultHero)
  const [ministerios, setMinisterios] = useCMSState('ministerios', defaultMinisterios)
  const [eventos, setEventos] = useCMSState('eventos', defaultEventos)
  const [textos, setTextos] = useCMSState('textos', {
    homeTitulo: 'Bem-vindo à Nossa Igreja',
    homeSubtitulo: 'Somos uma comunidade de fé comprometida em amar a Deus e ao próximo',
    versiculoDestaque:
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    versiculoReferencia: 'João 3:16',
    endereco: 'Rua Principal, 123 - Centro, Capim Grosso - BA',
    telefone: '(74) 99999-9999',
    email: 'contato@pibcapimgrosso.com.br',
  })

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
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
                Olá, {user.name.split(' ')[0]} 👋
              </h1>
              <p className="opacity-80 mt-1 text-sm">
                Gerencie imagens, textos e datas do site PIBAC.
              </p>
            </div>
            <div className="flex items-center gap-2">
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

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Próximos eventos
                </h3>
                <ul className="space-y-3">
                  {eventos.slice(0, 4).map((e) => (
                    <li key={e.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-accent/15 text-primary text-xs font-bold">
                        <span>{new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
                        <span className="uppercase">{new Date(e.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.time} · {e.location}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Atalhos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTab('banners')}
                    className="flex flex-col items-start gap-1 p-4 rounded-lg bg-muted hover:bg-accent/10 border border-border transition text-left"
                  >
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Editar banners</span>
                    <span className="text-xs text-muted-foreground">Carrossel da home</span>
                  </button>
                  <button
                    onClick={() => setTab('eventos')}
                    className="flex flex-col items-start gap-1 p-4 rounded-lg bg-muted hover:bg-accent/10 border border-border transition text-left"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Marcar datas</span>
                    <span className="text-xs text-muted-foreground">Calendário</span>
                  </button>
                  <button
                    onClick={() => setTab('ministerios')}
                    className="flex flex-col items-start gap-1 p-4 rounded-lg bg-muted hover:bg-accent/10 border border-border transition text-left"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Cards de ministérios</span>
                    <span className="text-xs text-muted-foreground">Imagens e descrições</span>
                  </button>
                  <button
                    onClick={() => setTab('textos')}
                    className="flex flex-col items-start gap-1 p-4 rounded-lg bg-muted hover:bg-accent/10 border border-border transition text-left"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Textos da home</span>
                    <span className="text-xs text-muted-foreground">Títulos e versículo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'banners' && (
          <CardsEditor
            items={banners}
            onChange={setBanners}
            fields={[
              { key: 'title', label: 'Título', type: 'text' },
              { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
              { key: 'imageUrl', label: 'Imagem (URL)', type: 'image' },
              { key: 'buttonText', label: 'Texto do botão', type: 'text' },
              { key: 'link', label: 'Link', type: 'text' },
            ]}
            makeNew={() => ({
              id: crypto.randomUUID(),
              title: 'Novo banner',
              subtitle: '',
              imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80',
              buttonText: 'Saiba mais',
              link: '/',
            })}
            title="Banners do Carrossel"
            description="Edite títulos, imagens e chamadas dos banners da página inicial."
          />
        )}

        {tab === 'ministerios' && (
          <CardsEditor
            items={ministerios}
            onChange={setMinisterios}
            fields={[
              { key: 'name', label: 'Nome', type: 'text' },
              { key: 'leader', label: 'Líder', type: 'text' },
              { key: 'description', label: 'Descrição', type: 'textarea' },
              { key: 'imageUrl', label: 'Imagem (URL)', type: 'image' },
            ]}
            makeNew={() => ({
              id: crypto.randomUUID(),
              name: 'Novo ministério',
              leader: '',
              description: '',
              imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
            })}
            title="Ministérios"
            description="Atualize imagens, líderes e descrições dos cards de ministérios."
          />
        )}

        {tab === 'eventos' && (
          <CardsEditor
            items={eventos}
            onChange={setEventos}
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
              { key: 'imageUrl', label: 'Imagem (URL)', type: 'image' },
            ]}
            makeNew={() => ({
              id: crypto.randomUUID(),
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
          />
        )}

        {tab === 'textos' && (
          <TextosEditor value={textos} onChange={setTextos} />
        )}
      </div>
    </div>
  )
}

// ======================== Components ========================

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'date' | 'time' | 'select'
  options?: string[]
}

function CardsEditor<T extends { id: string } & Record<string, any>>({
  items,
  onChange,
  fields,
  makeNew,
  title,
  description,
}: {
  items: T[]
  onChange: (v: T[]) => void
  fields: FieldDef[]
  makeNew: () => T
  title: string
  description: string
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<T | null>(null)

  const startEdit = (item: T) => {
    setEditing(item.id)
    setDraft({ ...item })
  }
  const cancelEdit = () => {
    setEditing(null)
    setDraft(null)
  }
  const saveEdit = () => {
    if (!draft) return
    onChange(items.map((it) => (it.id === draft.id ? draft : it)))
    toast.success('Alterações salvas!')
    cancelEdit()
  }
  const remove = (id: string) => {
    if (confirm('Deseja mesmo remover este item?')) {
      onChange(items.filter((it) => it.id !== id))
      toast.success('Item removido.')
    }
  }
  const add = () => {
    const next = makeNew()
    onChange([next, ...items])
    startEdit(next)
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
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
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
                    value={(draft as any)[f.key]}
                    onChange={(v) => setDraft({ ...draft, [f.key]: v })}
                  />
                ))}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {item.imageUrl && (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {item.title || item.name}
                      </p>
                      {(item.subtitle || item.description) && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.subtitle || item.description}
                        </p>
                      )}
                      {item.date && (
                        <p className="text-xs text-primary mt-2 font-medium">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                          {item.time ? ` · ${item.time}` : ''}
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
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded"
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
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Nenhum item. Clique em &quot;Adicionar&quot;.</p>
        </div>
      )}
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: any
  onChange: (v: any) => void
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
        <div className="space-y-2">
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className={baseInput}
          />
          {value && (
            <div
              className="h-24 rounded border border-border bg-cover bg-center"
              style={{ backgroundImage: `url(${value})` }}
            />
          )}
          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 border border-dashed border-border cursor-pointer text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5" />
            Fazer upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => onChange(reader.result as string)
                reader.readAsDataURL(file)
              }}
            />
          </label>
        </div>
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

function TextosEditor<T extends Record<string, string>>({
  value,
  onChange,
}: {
  value: T
  onChange: (v: T) => void
}) {
  const [draft, setDraft] = useState<T>(value)
  useEffect(() => setDraft(value), [value])

  const fields: Array<{ key: string; label: string; textarea?: boolean }> = [
    { key: 'homeTitulo', label: 'Título de boas-vindas' },
    { key: 'homeSubtitulo', label: 'Subtítulo de boas-vindas' },
    { key: 'versiculoDestaque', label: 'Versículo em destaque', textarea: true },
    { key: 'versiculoReferencia', label: 'Referência do versículo' },
    { key: 'endereco', label: 'Endereço' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'email', label: 'E-mail de contato' },
  ]

  const save = () => {
    onChange(draft)
    toast.success('Textos atualizados!')
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
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as T)}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                type="text"
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value } as T)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm text-foreground">
        <p className="font-medium mb-1">💡 Como funciona</p>
        <p className="text-muted-foreground">
          As alterações são salvas localmente no navegador (demo). Na produção, elas serão
          sincronizadas automaticamente com o servidor e ficarão visíveis para todos os visitantes.
        </p>
      </div>
    </div>
  )
}
