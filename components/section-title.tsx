import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionTitle({ title, subtitle, centered = true, className }: SectionTitleProps) {
  return (
    <div className={cn(centered && 'text-center', 'mb-8 md:mb-12', className)}>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
      <div className={cn('mt-4 flex gap-1', centered ? 'justify-center' : 'justify-start')}>
        <span className="w-8 h-1 bg-primary rounded-full" />
        <span className="w-2 h-1 bg-accent rounded-full" />
      </div>
    </div>
  )
}
