import { cn } from '@/lib/utils'

/**
 * Skeleton base — pulse animation sobre um bloco cinza.
 */
function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />
}

/**
 * Skeleton de card de ministério (imagem 4:3 + título + descrição).
 */
export function SkeletonMinisterioCard() {
  return (
    <div className="rounded-[22px] border border-border bg-surface overflow-hidden">
      <Bone className="aspect-[4/3] rounded-none" />
      <div className="p-[22px] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Bone className="h-7 w-3/4" />
          <Bone className="h-9 w-9 rounded-full shrink-0" />
        </div>
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/**
 * Skeleton de linha de evento editorial (data + título + meta).
 */
export function SkeletonEventoRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_200px_50px] gap-4 md:gap-6 py-7 border-b border-white/[.12] items-center">
      <div className="flex items-baseline gap-2">
        <Bone className="h-14 w-14 bg-white/10" />
        <div className="space-y-1">
          <Bone className="h-3 w-8 bg-white/10" />
          <Bone className="h-3 w-10 bg-white/10" />
        </div>
      </div>
      <div className="space-y-2">
        <Bone className="h-6 w-3/4 bg-white/10" />
        <Bone className="h-4 w-full bg-white/10" />
      </div>
      <div className="hidden md:flex flex-col gap-2">
        <Bone className="h-3.5 w-24 bg-white/10" />
        <Bone className="h-3.5 w-28 bg-white/10" />
      </div>
      <Bone className="hidden md:block h-11 w-11 rounded-full bg-white/10" />
    </div>
  )
}

/**
 * Skeleton de pilar/valor (numeração + título + texto).
 */
export function SkeletonPilarCard() {
  return (
    <div className="p-5 rounded-[18px] border border-border bg-surface">
      <Bone className="h-3 w-8 mb-3" />
      <Bone className="h-6 w-1/2 mb-2" />
      <Bone className="h-3.5 w-full mb-1" />
      <Bone className="h-3.5 w-3/4" />
    </div>
  )
}

/**
 * Skeleton do countdown card (hero).
 */
export function SkeletonCountdownCard() {
  return (
    <div className="relative rounded-[18px] sm:rounded-[22px] lg:rounded-[28px] overflow-hidden bg-brand-gradient text-white min-h-[440px] sm:min-h-[460px] lg:min-h-[560px] p-5 sm:p-6 lg:p-7 flex flex-col">
      <Bone className="h-4 w-24 bg-white/10 mb-auto" />
      <div className="mt-auto pt-6 space-y-4">
        <Bone className="h-4 w-32 bg-white/10" />
        <Bone className="h-10 w-3/4 bg-white/10" />
        <Bone className="h-3 w-48 bg-white/10" />
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3.5 mt-4">
          {[...Array(4)].map((_, i) => (
            <Bone key={i} className="h-20 sm:h-24 lg:h-28 bg-white/[.06] rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Bone className="flex-1 h-10 sm:h-11 rounded-full bg-white/10" />
          <Bone className="flex-1 h-10 sm:h-11 rounded-full bg-white/[.06]" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton de card genérico (plano leitura dia, contribuição, etc).
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[16px] border border-border bg-surface p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <Bone className="h-3 w-12" />
        <Bone className="h-5 w-5 rounded-full" />
      </div>
      <Bone className="h-4 w-3/4 mb-1.5" />
      <Bone className="h-3 w-1/2" />
    </div>
  )
}

/**
 * Skeleton de timeline item (história).
 */
export function SkeletonTimelineItem() {
  return (
    <div className="ml-12 md:ml-0">
      <div className="rounded-[18px] border border-border bg-surface overflow-hidden">
        <Bone className="aspect-[16/9] rounded-none" />
        <div className="p-6 space-y-2">
          <Bone className="h-8 w-16" />
          <Bone className="h-5 w-3/4" />
          <Bone className="h-3.5 w-full" />
          <Bone className="h-3.5 w-2/3" />
        </div>
      </div>
    </div>
  )
}

/**
 * Grid de N skeletons de ministério.
 */
export function SkeletonMinisteriosGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      {[...Array(count)].map((_, i) => <SkeletonMinisterioCard key={i} />)}
    </div>
  )
}

/**
 * Lista de N skeletons de evento.
 */
export function SkeletonEventosList({ count = 3 }: { count?: number }) {
  return (
    <div className="border-t border-white/[.12]">
      {[...Array(count)].map((_, i) => <SkeletonEventoRow key={i} />)}
    </div>
  )
}
