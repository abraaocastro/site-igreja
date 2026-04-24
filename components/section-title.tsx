import { cn } from '@/lib/utils'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

/**
 * Título de seção — versão redesign.
 * - Eyebrow mono em caps, minimal
 * - Display serif com tracking negativo
 * - Sem "divisor" colorido abaixo (respiro ao invés de enfeite)
 */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className,
  as = 'h2',
}: SectionTitleProps) {
  const H = as as 'h1' | 'h2' | 'h3'
  return (
    <div className={cn(centered && 'text-center', 'mb-10 md:mb-14 max-w-3xl', centered && 'mx-auto', className)}>
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <H className="display text-4xl md:text-5xl lg:text-6xl text-foreground text-balance">
        {title}
      </H>
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}
