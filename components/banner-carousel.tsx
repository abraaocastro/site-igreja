'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  link?: string
  buttonText?: string
}

interface BannerCarouselProps {
  banners: Banner[]
  variant?: 'hero' | 'inline'
  autoplayDelay?: number
}

export function BannerCarousel({ banners, variant = 'hero', autoplayDelay = 5000 }: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: autoplayDelay, stopOnInteraction: false })
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const isHero = variant === 'hero'

  return (
    <div className={cn(
      'relative overflow-hidden',
      isHero ? 'h-[500px] md:h-[600px]' : 'h-[200px] md:h-[250px] rounded-lg'
    )}>
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative flex-[0_0_100%] min-w-0 h-full"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${banner.imageUrl})` }}
              >
                <div className={cn(
                  'absolute inset-0',
                  isHero ? 'bg-gradient-to-r from-primary/90 via-primary/70 to-transparent' : 'bg-primary/60'
                )} />
              </div>
              <div className={cn(
                'relative h-full flex items-center',
                isHero ? 'px-6 md:px-12 lg:px-20' : 'px-4 md:px-8'
              )}>
                <div className={cn(
                  'text-primary-foreground',
                  isHero ? 'max-w-2xl' : 'max-w-full text-center w-full'
                )}>
                  <h2 className={cn(
                    'font-serif font-bold text-balance',
                    isHero ? 'text-3xl md:text-5xl lg:text-6xl mb-4' : 'text-xl md:text-2xl mb-2'
                  )}>
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className={cn(
                      'text-pretty opacity-90',
                      isHero ? 'text-lg md:text-xl mb-6' : 'text-sm md:text-base mb-3'
                    )}>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link && banner.buttonText && (
                    <a
                      href={banner.link}
                      className={cn(
                        'inline-block bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 transition-colors',
                        isHero ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
                      )}
                    >
                      {banner.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground rounded-full shadow-lg transition-all',
          isHero ? 'p-3' : 'p-2'
        )}
        aria-label="Banner anterior"
      >
        <ChevronLeft className={isHero ? 'h-6 w-6' : 'h-4 w-4'} />
      </button>
      <button
        onClick={scrollNext}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card text-foreground rounded-full shadow-lg transition-all',
          isHero ? 'p-3' : 'p-2'
        )}
        aria-label="Próximo banner"
      >
        <ChevronRight className={isHero ? 'h-6 w-6' : 'h-4 w-4'} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              'rounded-full transition-all',
              isHero ? 'w-3 h-3' : 'w-2 h-2',
              index === selectedIndex
                ? 'bg-primary-foreground'
                : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
            )}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
