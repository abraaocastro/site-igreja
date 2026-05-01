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
  Building2,
  UserCircle2,
  History,
  Shield,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { type ChurchAviso, type AvisoSeveridade } from '@/lib/site-data'
import {
  getBanners,
  getMinisterios,
  getEventos,
  getTextos,
  getAviso,
  getHistoria,
  getPlanoLeitura,
  upsertBanner,
  createBanner,
  deleteBanner,
  upsertMinisterio,
  createMinisterio,
  deleteMinisterio,
  upsertEvento,
  createEvento,
  deleteEvento,
  upsertHistoria,
  createHistoria,
  deleteHistoria,
  createPlanoLeitura,
  upsertPlanoLeitura,
  deletePlanoLeitura,
  saveTextos,
  saveAviso,
  uploadImage,
  DEFAULT_TEXTOS,
  type CmsBanner,
  type CmsMinisterio,
  type CmsEvento,
  type CmsTextos,
  type CmsHistoriaEntry,
  type CmsPlanoLeituraDay,
} from '@/lib/cms'
import { AvisoBanner } from '@/components/aviso-banner'
import { HelpHint } from '@/components/help-hint'
import { CalendarPreview } from '@/components/admin/calendar-preview'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab =
  | 'overview'
  | 'avisos'
  | 'igreja'
  | 'pastor'
  | 'historia'
  | 'banners'
  | 'ministerios'
  | 'eventos'
  | 'textos'
  | 'plano'
  | 'usuarios'

export default function AdminPage() {
  const { user, profile, logout, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  // Estado vindo do banco — começa vazio, hidrata via useEffect.
  const [banners, setBanners] = useState<CmsBanner[]>([])
  const [ministerios, setMinisterios] = useState<CmsMinisterio[]>([])
  const [eventos, setEventos] = useState<CmsEvento[]>([])
  const [historia, setHistoria] = useState<CmsHistoriaEntry[]>([])
  const [plano, setPlano] = useState<CmsPlanoLeituraDay[]>([])
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
    const [b, m, e, t, a, h, pl] = await Promise.all([
      getBanners(),
      getMinisterios(),
      getEventos(),
      getTextos(),
      getAviso(),
      getHistoria(),
      getPlanoLeitura(),
    ])
    setBanners(b)
    setMinisterios(m)
    setEventos(e)
    setTextos(t)
    setAviso(a)
    setHistoria(h)
    setPlano(pl)
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
    { id: 'igreja', label: 'Igreja', icon: Building2 },
    { id: 'pastor', label: 'Pastor', icon: UserCircle2 },
    { id: 'historia', label: 'História', icon: History },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'ministerios', label: 'Ministérios', icon: Users },
    { id: 'eventos', label: 'Eventos e Datas', icon: Calendar },
    { id: 'textos', label: 'Textos do Site', icon: FileText },
    { id: 'plano', label: 'Plano de Leitura', icon: BookOpen },
    // Aba exclusiva do admin — conteudista não vê
    ...(profile?.role === 'admin'
      ? [{ id: 'usuarios' as Tab, label: 'Usuários', icon: Shield }]
      : []),
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
                Olá, {(profile?.nome || user.email?.split('@')[0] || 'admin').split(' ')[0]}
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

        {tab === 'igreja' && (
          <IgrejaEditor
            textos={textos}
            onSaved={(updated) => {
              setTextos((prev) => ({ ...prev, ...updated }))
              toast.success('Dados da igreja atualizados.')
            }}
          />
        )}

        {tab === 'pastor' && (
          <PastorEditor
            textos={textos}
            onSaved={(updated) => {
              setTextos((prev) => ({ ...prev, ...updated }))
              toast.success('Dados do pastor atualizados.')
            }}
          />
        )}

        {tab === 'historia' && (
          <HistoriaEditor
            items={historia}
            textos={textos}
            onCreate={async (h) => {
              const created = await createHistoria(h)
              setHistoria((prev) => [...prev, created])
              toast.success('Marco histórico criado.')
            }}
            onUpdate={async (h) => {
              const saved = await upsertHistoria(h)
              setHistoria((prev) =>
                prev.some((x) => x.id === h.id)
                  ? prev.map((x) => (x.id === h.id ? saved : x))
                  : [...prev.filter((x) => x.id !== h.id), saved]
              )
              toast.success('Marco salvo.')
            }}
            onDelete={async (id) => {
              await deleteHistoria(id)
              setHistoria((prev) => prev.filter((x) => x.id !== id))
              toast.success('Marco removido.')
            }}
            onSaveTextos={(updated) => {
              setTextos((prev) => ({ ...prev, ...updated }))
              toast.success('Textos da página /história atualizados.')
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

        {tab === 'plano' && (
          <PlanoLeituraEditor
            items={plano}
            onCreate={async (p) => {
              const created = await createPlanoLeitura(p)
              setPlano((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder))
              toast.success('Dia adicionado ao plano.')
            }}
            onUpdate={async (p) => {
              const saved = await upsertPlanoLeitura(p)
              setPlano((prev) =>
                prev.some((x) => x.id === p.id)
                  ? prev.map((x) => (x.id === p.id ? saved : x))
                  : [...prev.filter((x) => x.id !== p.id), saved]
              )
              toast.success('Dia salvo.')
            }}
            onDelete={async (id) => {
              await deletePlanoLeitura(id)
              setPlano((prev) => prev.filter((x) => x.id !== id))
              toast.success('Dia removido.')
            }}
          />
        )}

        {tab === 'usuarios' && profile?.role === 'admin' && (
          <UsuariosEditor currentUserId={user.id} />
        )}
      </div>
    </div>
  )
}

// ======================== Image upload helper ========================

/**
 * Hints padrão por tipo de imagem. Cada caso de uso passa o `hint` apropriado
 * pra orientar o admin sobre dimensões e formato. Mantemos como constantes
 * exportáveis pra reuso em forms diferentes (Pastor, Igreja/Logo, etc.).
 */
const IMAGE_HINTS = {
  generic: 'Dica: imagens em PNG ou JPG. Mínimo 800px no lado maior.',
  logo: 'PNG sem fundo (transparente). Quadrado, mínimo 256×256px. O ideal é 512×512px.',
  banner: 'Imagem horizontal de alta resolução. Recomendado 1920×1080px (16:9). Mínimo 1280×720px.',
  pastorFoto: 'Foto quadrada (1:1) com pessoa centralizada. Recomendado 1080×1080px. Aparece em formato circular.',
  ministerio: 'Imagem horizontal (4:3 ou 16:9). Recomendado 1200×800px. Mínimo 800×600px.',
  evento: 'Imagem horizontal (16:9 funciona melhor). Recomendado 1200×675px.',
  historia: 'Imagem horizontal de contexto histórico. Recomendado 1200×800px.',
} as const

function ImageField({
  value,
  onChange,
  hint = IMAGE_HINTS.generic,
}: {
  value: string | null
  onChange: (v: string) => void
  hint?: string
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
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-relaxed pl-1">
          {hint}
        </p>
      )}
    </div>
  )
}

// ======================== Generic FieldEditor ========================

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'date' | 'time' | 'select'
  options?: string[]
  /** Texto de orientação exibido abaixo do upload (apenas para type='image'). */
  hint?: string
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
        <ImageField value={value ?? null} onChange={onChange} hint={field.hint} />
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
  help,
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
  /** Conteúdo opcional pro popover de ajuda (?) ao lado do título. */
  help?: { label: string; body: React.ReactNode }
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
          {title && (
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              {title}
              {help && (
                <HelpHint label={help.label} side="bottom">
                  {help.body}
                </HelpHint>
              )}
            </h2>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
        { key: 'imageUrl', label: 'Imagem do banner', type: 'image', hint: IMAGE_HINTS.banner },
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
        { key: 'imageUrl', label: 'Imagem do ministério', type: 'image', hint: IMAGE_HINTS.ministerio },
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
  const [filterDate, setFilterDate] = useState<string | null>(null)

  // Quando há filtro de data, mostrar apenas eventos daquele dia
  const filteredItems = filterDate
    ? items.filter((e) => e.date === filterDate)
    : items

  return (
    <div className="space-y-4">
      <CalendarPreview
        events={items}
        selectedDate={filterDate}
        onSelectDate={setFilterDate}
      />
      <CardsEditor<CmsEvento>
        items={filteredItems}
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
          { key: 'imageUrl', label: 'Imagem do evento', type: 'image', hint: IMAGE_HINTS.evento },
        ]}
        makeNew={() => ({
          title: 'Novo evento',
          description: '',
          date: filterDate || new Date().toISOString().slice(0, 10),
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
    </div>
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
            {dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}
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

// ======================== IgrejaEditor ========================
//
// Edita dados institucionais da igreja: endereço, contato, redes sociais e
// chave PIX. Tudo é gravado em `cms_textos` (KV) com chaves prefixadas. As
// páginas públicas mesclam esses valores com os defaults de data/church.json
// via `getChurchEffective()`.

const IGREJA_FIELDS: Array<{
  key: string
  label: string
  placeholder?: string
  group: 'marca' | 'identidade' | 'endereco' | 'contato' | 'social' | 'pix'
  type?: 'text' | 'textarea' | 'image'
  hint?: string
}> = [
  // Marca (logo + texto exibido no header/footer)
  { group: 'marca', key: 'marcaLogo', label: 'Logotipo', type: 'image', hint: IMAGE_HINTS.logo },
  { group: 'marca', key: 'marcaTituloPrincipal', label: 'Texto principal (header e footer)', placeholder: 'PIB Capim Grosso' },
  { group: 'marca', key: 'marcaSubtitulo', label: 'Texto secundário (linha de baixo)', placeholder: 'Desde 1978 · Bahia' },
  // Identidade
  { group: 'identidade', key: 'igrejaNome', label: 'Nome completo', placeholder: 'Primeira Igreja Batista de Capim Grosso' },
  { group: 'identidade', key: 'igrejaNomeCurto', label: 'Nome curto', placeholder: 'PIBAC' },
  { group: 'identidade', key: 'igrejaSlogan', label: 'Slogan', placeholder: 'Uma comunidade de fé...' },
  // Endereço
  { group: 'endereco', key: 'enderecoRua', label: 'Rua' },
  { group: 'endereco', key: 'enderecoNumero', label: 'Número' },
  { group: 'endereco', key: 'enderecoBairro', label: 'Bairro' },
  { group: 'endereco', key: 'enderecoCidade', label: 'Cidade' },
  { group: 'endereco', key: 'enderecoEstado', label: 'Estado (sigla)', placeholder: 'BA' },
  { group: 'endereco', key: 'enderecoCep', label: 'CEP', placeholder: '44695-000' },
  // Contato
  { group: 'contato', key: 'contatoTelefone', label: 'Telefone fixo (opcional)', placeholder: '+5574...' },
  { group: 'contato', key: 'contatoWhatsapp', label: 'WhatsApp', placeholder: '+5574...' },
  { group: 'contato', key: 'contatoEmail', label: 'E-mail oficial', placeholder: 'contato@pibac.com.br' },
  // Social
  { group: 'social', key: 'socialInstagram', label: 'Instagram da igreja (URL)' },
  { group: 'social', key: 'socialInstagramPastor', label: 'Instagram do pastor (URL)' },
  { group: 'social', key: 'socialInstagramJovens', label: 'Instagram dos jovens (URL)' },
  { group: 'social', key: 'socialFacebook', label: 'Facebook (URL, opcional)' },
  { group: 'social', key: 'socialYoutube', label: 'YouTube (URL, opcional)' },
  // PIX
  { group: 'pix', key: 'pixChave', label: 'Chave PIX' },
  { group: 'pix', key: 'pixTipo', label: 'Tipo (email/cpf/cnpj/telefone/aleatoria)', placeholder: 'email' },
  { group: 'pix', key: 'pixTitular', label: 'Titular da conta' },
]

const IGREJA_GROUPS: Array<{ id: 'marca' | 'identidade' | 'endereco' | 'contato' | 'social' | 'pix'; title: string; description: string }> = [
  { id: 'marca', title: 'Logotipo e marca', description: 'Logo (PNG sem fundo recomendado) e textos do cabeçalho/rodapé.' },
  { id: 'identidade', title: 'Identidade', description: 'Como a igreja se chama e se apresenta.' },
  { id: 'endereco', title: 'Endereço', description: 'Onde fica fisicamente.' },
  { id: 'contato', title: 'Contato', description: 'Telefone, WhatsApp e e-mail oficial.' },
  { id: 'social', title: 'Redes sociais', description: 'Links das contas oficiais.' },
  { id: 'pix', title: 'PIX', description: 'Chave PIX para contribuições. Aparece em /contribua.' },
]

function IgrejaEditor({
  textos,
  onSaved,
}: {
  textos: CmsTextos
  onSaved: (updated: CmsTextos) => void
}) {
  // Inicializa com o que já está salvo + placeholders vazios pras chaves novas
  const initial: CmsTextos = {}
  IGREJA_FIELDS.forEach((f) => {
    initial[f.key] = textos[f.key] ?? ''
  })
  const [draft, setDraft] = useState<CmsTextos>(initial)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const next: CmsTextos = {}
    IGREJA_FIELDS.forEach((f) => {
      next[f.key] = textos[f.key] ?? ''
    })
    setDraft(next)
  }, [textos])

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const save = async () => {
    setBusy(true)
    try {
      // Pega só as chaves do form Igreja (não bagunça outros textos)
      const subset: CmsTextos = {}
      IGREJA_FIELDS.forEach((f) => {
        subset[f.key] = draft[f.key] ?? ''
      })
      await saveTextos(subset)
      onSaved(subset)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Dados da Igreja
        </h2>
        <p className="text-sm text-muted-foreground">
          Endereço, contatos, redes sociais e PIX. Tudo aqui aparece nas páginas <code>/contato</code>,{' '}
          <code>/contribua</code>, no rodapé e nos cards de pastor/visão.
        </p>
      </div>

      {IGREJA_GROUPS.map((g) => {
        const fields = IGREJA_FIELDS.filter((f) => f.group === g.id)
        return (
          <div key={g.id} className="bg-card rounded-lg border border-border p-5 space-y-3">
            <div>
              <p className="font-medium text-foreground">{g.title}</p>
              <p className="text-xs text-muted-foreground">{g.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {fields.map((f) => (
                <div
                  key={f.key}
                  className={
                    f.type === 'image' || fields.length === 1 ? 'sm:col-span-2' : ''
                  }
                >
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  {f.type === 'image' ? (
                    <ImageField
                      value={draft[f.key] ?? ''}
                      onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                      hint={f.hint}
                    />
                  ) : (
                    <input
                      type="text"
                      value={draft[f.key] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="sticky bottom-4 z-10">
        <div
          className={cn(
            'rounded-lg border shadow-lg backdrop-blur p-3 flex items-center justify-between gap-3 transition',
            dirty ? 'bg-card/95 border-primary/30' : 'bg-card/80 border-border'
          )}
        >
          <p className="text-xs text-muted-foreground">
            {dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}
          </p>
          <button
            onClick={save}
            disabled={!dirty || busy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Publicar mudanças
          </button>
        </div>
      </div>

    </div>
  )
}

// ======================== PastorEditor ========================

const PASTOR_FIELDS: Array<{ key: string; label: string; placeholder?: string }> = [
  { key: 'pastorNome', label: 'Nome', placeholder: 'Silas Barreto' },
  { key: 'pastorTitulo', label: 'Título', placeholder: 'Pastor Presidente' },
  { key: 'pastorInstagram', label: 'Instagram (URL)', placeholder: 'https://www.instagram.com/...' },
]

function PastorEditor({
  textos,
  onSaved,
}: {
  textos: CmsTextos
  onSaved: (updated: CmsTextos) => void
}) {
  const initial: CmsTextos = {
    pastorNome: textos.pastorNome ?? '',
    pastorTitulo: textos.pastorTitulo ?? '',
    pastorBio: textos.pastorBio ?? '',
    pastorFoto: textos.pastorFoto ?? '',
    pastorInstagram: textos.pastorInstagram ?? '',
  }
  const [draft, setDraft] = useState<CmsTextos>(initial)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setDraft({
      pastorNome: textos.pastorNome ?? '',
      pastorTitulo: textos.pastorTitulo ?? '',
      pastorBio: textos.pastorBio ?? '',
      pastorFoto: textos.pastorFoto ?? '',
      pastorInstagram: textos.pastorInstagram ?? '',
    })
  }, [textos])

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const save = async () => {
    setBusy(true)
    try {
      await saveTextos(draft)
      onSaved(draft)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UserCircle2 className="h-5 w-5 text-primary" />
          Pastor
        </h2>
        <p className="text-sm text-muted-foreground">
          Dados que aparecem na página <code>/pastor</code> e nos cards do site.
        </p>
      </div>

      {/* Foto */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-3">
        <p className="font-medium text-foreground">Foto</p>
        <ImageField
          value={draft.pastorFoto ?? ''}
          onChange={(v) => setDraft((d) => ({ ...d, pastorFoto: v }))}
          hint={IMAGE_HINTS.pastorFoto}
        />
      </div>

      {/* Identificação */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-3">
        <p className="font-medium text-foreground">Identificação</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {PASTOR_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
              <input
                type="text"
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-3">
        <p className="font-medium text-foreground">Biografia</p>
        <textarea
          value={draft.pastorBio ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, pastorBio: e.target.value }))}
          placeholder="Escreva a bio do pastor. Use uma linha em branco entre parágrafos pra separá-los no site."
          rows={8}
          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {(draft.pastorBio ?? '').length} caracteres ·{' '}
          {(draft.pastorBio ?? '').split(/\n{2,}/).filter(Boolean).length} parágrafo(s)
        </p>
      </div>

      <div className="sticky bottom-4 z-10">
        <div
          className={cn(
            'rounded-lg border shadow-lg backdrop-blur p-3 flex items-center justify-between gap-3 transition',
            dirty ? 'bg-card/95 border-primary/30' : 'bg-card/80 border-border'
          )}
        >
          <p className="text-xs text-muted-foreground">
            {dirty ? 'Você tem alterações não salvas.' : 'Tudo salvo.'}
          </p>
          <button
            onClick={save}
            disabled={!dirty || busy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Publicar mudanças
          </button>
        </div>
      </div>
    </div>
  )
}

// ======================== HistoriaEditor ========================
//
// Combina:
//   - Form pros textos da página /historia (intro + citação) → cms_textos
//   - CRUD da timeline → cms_historia (reusa CardsEditor)

const HISTORIA_TEXTOS_FIELDS: Array<{ key: string; label: string; textarea?: boolean }> = [
  { key: 'historiaIntroTitulo', label: 'Título da introdução' },
  { key: 'historiaIntroSubtitulo', label: 'Subtítulo da introdução' },
  { key: 'historiaIntroTexto', label: 'Texto da introdução', textarea: true },
  { key: 'historiaCitacao', label: 'Citação bíblica' },
  { key: 'historiaCitacaoRef', label: 'Referência da citação', },
  { key: 'historiaCitacaoTexto', label: 'Comentário da citação', textarea: true },
]

function HistoriaEditor({
  items,
  textos,
  onCreate,
  onUpdate,
  onDelete,
  onSaveTextos,
}: {
  items: CmsHistoriaEntry[]
  textos: CmsTextos
  onCreate: (h: Omit<CmsHistoriaEntry, 'id'>) => Promise<void>
  onUpdate: (h: CmsHistoriaEntry) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSaveTextos: (updated: CmsTextos) => void
}) {
  // Como `sortOrder` virá do FieldEditor como string (input type=text),
  // coercemos pra int no momento de salvar pra bater com a coluna do DB.
  const coerce = <T extends { sortOrder: number | string }>(h: T): T => ({
    ...h,
    sortOrder: typeof h.sortOrder === 'number' ? h.sortOrder : parseInt(String(h.sortOrder || '0'), 10) || 0,
  })
  const wrappedCreate = (h: Omit<CmsHistoriaEntry, 'id'>) => onCreate(coerce(h))
  const wrappedUpdate = (h: CmsHistoriaEntry) => onUpdate(coerce(h))
  const initial: CmsTextos = {}
  HISTORIA_TEXTOS_FIELDS.forEach((f) => {
    initial[f.key] = textos[f.key] ?? ''
  })
  const [draft, setDraft] = useState<CmsTextos>(initial)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const next: CmsTextos = {}
    HISTORIA_TEXTOS_FIELDS.forEach((f) => {
      next[f.key] = textos[f.key] ?? ''
    })
    setDraft(next)
  }, [textos])

  const textosDirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const saveTextosOnly = async () => {
    setBusy(true)
    try {
      const subset: CmsTextos = {}
      HISTORIA_TEXTOS_FIELDS.forEach((f) => {
        subset[f.key] = draft[f.key] ?? ''
      })
      await saveTextos(subset)
      onSaveTextos(subset)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Página /história
        </h2>
        <p className="text-sm text-muted-foreground">
          Edita os textos da introdução, da citação bíblica e a linha do tempo da igreja.
        </p>
      </div>

      {/* Textos da página */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-4">
        <p className="font-medium text-foreground">Textos da página</p>
        {HISTORIA_TEXTOS_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            ) : (
              <input
                type="text"
                value={draft[f.key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={saveTextosOnly}
            disabled={!textosDirty || busy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar textos
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-3">
        <p className="font-medium text-foreground mb-1">Linha do tempo</p>
        <p className="text-xs text-muted-foreground mb-4">
          Cada marco vira um card na seção timeline da página /história. Use{' '}
          <strong>ordem</strong> pra controlar a sequência (menor primeiro). O ano pode ser texto
          livre — &quot;1970&quot;, &quot;Hoje&quot;, &quot;Década de 90&quot;.
        </p>
        <CardsEditor<CmsHistoriaEntry>
          items={items}
          onCreate={wrappedCreate}
          onUpdate={wrappedUpdate}
          onDelete={onDelete}
          fields={[
            { key: 'year', label: 'Ano (texto)', type: 'text' },
            { key: 'title', label: 'Título', type: 'text' },
            { key: 'description', label: 'Descrição', type: 'textarea' },
            { key: 'imageUrl', label: 'Imagem do marco', type: 'image', hint: IMAGE_HINTS.historia },
            { key: 'sortOrder', label: 'Ordem (número, menor primeiro)', type: 'text' },
          ]}
          makeNew={() => ({
            year: 'Ano',
            title: 'Novo marco',
            description: '',
            imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80',
            sortOrder: items.length,
          })}
          title=""
          description=""
          preview={(h) => ({
            title: `${h.year} — ${h.title}`,
            subtitle: h.description,
            imageUrl: h.imageUrl,
          })}
        />
      </div>
    </div>
  )
}

// ======================== PlanoLeituraEditor ========================

function PlanoLeituraEditor({
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: CmsPlanoLeituraDay[]
  onCreate: (p: Omit<CmsPlanoLeituraDay, 'id'>) => Promise<void>
  onUpdate: (p: CmsPlanoLeituraDay) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  // Coerce sortOrder e dia pra int (CardsEditor retorna strings de inputs)
  const coerce = <T extends { sortOrder: number | string; dia: number | string }>(p: T): T => ({
    ...p,
    sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : parseInt(String(p.sortOrder || '0'), 10) || 0,
    dia: typeof p.dia === 'number' ? p.dia : parseInt(String(p.dia || '0'), 10) || 0,
  })
  const wrappedCreate = (p: Omit<CmsPlanoLeituraDay, 'id'>) => onCreate(coerce(p))
  const wrappedUpdate = (p: CmsPlanoLeituraDay) => onUpdate(coerce(p))

  return (
    <CardsEditor<CmsPlanoLeituraDay>
      items={items}
      onCreate={wrappedCreate}
      onUpdate={wrappedUpdate}
      onDelete={onDelete}
      fields={[
        { key: 'dia', label: 'Dia (número)', type: 'text' },
        { key: 'livro', label: 'Livro', type: 'text' },
        { key: 'capitulos', label: 'Capítulos', type: 'text' },
        { key: 'tema', label: 'Tema', type: 'text' },
        { key: 'sortOrder', label: 'Ordem (número, menor primeiro)', type: 'text' },
      ]}
      makeNew={() => ({
        dia: items.length + 1,
        livro: 'Livro',
        capitulos: '1-3',
        tema: 'Novo tema',
        sortOrder: items.length + 1,
      })}
      title="Plano de Leitura Bíblica"
      description="Edite os dias do plano de leitura. Cada dia aparece como um card na página pública /plano-leitura."
      preview={(p) => ({
        title: `Dia ${p.dia} — ${p.tema}`,
        subtitle: `${p.livro} ${p.capitulos}`,
      })}
    />
  )
}

// ======================== UsuariosEditor ========================

interface AdminUser {
  id: string
  email: string
  nome: string | null
  role: string
  createdAt: string
  lastSignIn: string | null
}

function UsuariosEditor({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNome, setInviteNome] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Resultado do convite — mostra senha gerada uma única vez
  const [inviteResult, setInviteResult] = useState<{
    email: string
    nome: string
    password: string
  } | null>(null)

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Erro ao carregar usuários.')
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar usuários.')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteNome.trim()) {
      toast.error('Preencha o e-mail e o nome.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), nome: inviteNome.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao convidar.')
        return
      }
      setInviteResult({
        email: inviteEmail.trim().toLowerCase(),
        nome: inviteNome.trim(),
        password: data.generatedPassword,
      })
      setInviteEmail('')
      setInviteNome('')
      loadUsers()
      toast.success('Conteudista convidado com sucesso.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao convidar.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (userId: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao revogar acesso.')
        return
      }
      setDeleteConfirm(null)
      loadUsers()
      toast.success('Acesso revogado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao revogar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Gerenciar Usuários
          <HelpHint label="Sobre esta aba">
            Convide pessoas da equipe para ajudar a atualizar o conteúdo do site. Conteudistas podem editar tudo exceto esta aba de usuários.
          </HelpHint>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Convide conteudistas e gerencie quem tem acesso ao painel.
        </p>
      </div>

      {/* Formulário de convite */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-4">
        <p className="font-medium text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Convidar novo conteudista
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Nome</label>
            <input
              type="text"
              value={inviteNome}
              onChange={(e) => setInviteNome(e.target.value)}
              placeholder="Nome completo"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">E-mail</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleInvite}
            disabled={busy || !inviteEmail.trim() || !inviteNome.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Convidar
          </button>
        </div>
      </div>

      {/* Resultado do convite — senha gerada (exibida 1×) */}
      {inviteResult && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-800 dark:text-green-200">Convite criado com sucesso!</p>
          </div>
          <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
            <p><strong>Nome:</strong> {inviteResult.nome}</p>
            <p><strong>E-mail:</strong> {inviteResult.email}</p>
            <p><strong>Senha temporária:</strong></p>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded text-sm font-mono select-all">
                {inviteResult.password}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteResult.password)
                  toast.success('Senha copiada!')
                }}
                className="px-2 py-1.5 text-xs rounded bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 transition"
              >
                Copiar
              </button>
            </div>
          </div>
          <div className="bg-green-100 dark:bg-green-900/50 rounded p-3 text-xs text-green-800 dark:text-green-300">
            <p className="font-medium mb-1">⚠ Atenção:</p>
            <p>Esta senha é exibida apenas uma vez. Copie e envie ao conteudista.</p>
            <p>No primeiro login, ele será obrigado a escolher uma nova senha forte.</p>
          </div>
          <button
            onClick={() => setInviteResult(null)}
            className="text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            Fechar aviso
          </button>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Equipe ({users.length})
          </p>
          <button
            onClick={loadUsers}
            disabled={loadingUsers}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loadingUsers && 'animate-spin')} />
            Atualizar
          </button>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.nome ?? u.email.split('@')[0]}
                    </p>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider',
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent/10 text-accent-foreground'
                      )}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {u.lastSignIn
                      ? `Último login: ${new Date(u.lastSignIn).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                      : 'Nunca logou'}
                  </p>
                </div>

                {/* Ações — só mostra pra conteudistas (nunca pro próprio admin nem pra outros admins) */}
                {u.role !== 'admin' && u.id !== currentUserId && (
                  <div className="flex-shrink-0">
                    {deleteConfirm === u.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive">Confirmar?</span>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80"
                        >
                          <X className="h-3 w-3" />
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(u.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        Revogar acesso
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
