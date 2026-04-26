'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  link?: string | null
  buttonText?: string | null
}

interface BannerCarouselProps {
  banners: Banner[]
  variant?: 'hero' | 'inline'
  autoplayDelay?: number
}

/**
 * BannerCarousel — redesign
 * - Imagem à direita, conteúdo à esquerda com display serif editorial
 * - Progress bar por slide + contador 01/04 (mono)
 * - Setas minimais no canto inferior direito
 */
export function BannerCarousel({ banners, variant = 'hero', autoplayDelay = 5000 }: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false }, [
    Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  const isHero = variant === 'hero'

  return (
    <div className={cn(
      'relative overflow-hidden select-none bg-background',
      isHero ? 'h-[640px] md:h-[720px]' : 'h-[220px] md:h-[260px] rounded-2xl border border-border'
    )}>
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {isHero ? (
                <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.1fr_1fr] gap-8 items-center">
                  {/* Text */}
                  <div className="relative z-10 py-10">
                    <div className="eyebrow mb-4">
                      {String(idx + 1).padStart(2, '0')} · {banner.id.toUpperCase()}
                    </div>
                    <h1 className="display text-5xl md:text-6xl lg:text-7xl text-foreground text-balance mb-6">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.link && banner.buttonText && (
                      <a href={banner.link} className="btn-primary">
                        {banner.buttonText} <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {/* Image */}
                  <div className="relative h-[260px] md:h-[520px] rounded-3xl overflow-hidden border border-border">
                    <div className="absolute inset-0 bg-cover bg-center"
                         style={{ backgroundImage: `url(${banner.imageUrl})` }} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white/90 text-xs font-mono uppercase tracking-wider opacity-80">
                      {String(idx + 1).padStart(2,'0')}/{String(banners.length).padStart(2,'0')}
                    </div>
                  </div>
                </div>
              ) : (
                // inline variant
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.imageUrl})` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
                  <div className="relative h-full flex items-center px-6 md:px-10 text-white max-w-2xl">
                    <div>
                      <h3 className="display text-2xl md:text-3xl mb-1">{banner.title}</h3>
                      {banner.subtitle && <p className="text-sm opacity-90">{banner.subtitle}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {isHero && (
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* progress dashes */}
          <div className="flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => emblaApi?.scrollTo(i)}
                className={cn('h-[3px] rounded-full transition-all',
                  i === selectedIndex ? 'w-10 bg-foreground' : 'w-6 bg-border hover:bg-muted-foreground')}
                aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {String(selectedIndex + 1).padStart(2,'0')} / {String(banners.length).padStart(2,'0')}
            </span>
            <button onClick={() => emblaApi?.scrollPrev()}
              className="h-9 w-9 rounded-full border border-border bg-surface hover:bg-surface-2 grid place-items-center transition-colors"
              aria-label="Anterior"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => emblaApi?.scrollNext()}
              className="h-9 w-9 rounded-full border border-border bg-surface hover:bg-surface-2 grid place-items-center transition-colors"
              aria-label="Próximo"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {!isHero && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              className={cn('h-1.5 rounded-full transition-all',
                i === selectedIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50')} />
          ))}
        </div>
      )}
    </div>
  )
}
