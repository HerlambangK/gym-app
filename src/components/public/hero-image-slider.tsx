"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type HeroSlide = {
  image: string
  title: string
  caption: string
}

export function HeroImageSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 4800)
    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <div className="absolute inset-0">
      {slides.map((slide, index) => (
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.title}
          fill
          priority={index === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 ease-out",
            index === active ? "opacity-65" : "opacity-0",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/74 to-black/20" />
      <div className="absolute bottom-5 right-5 hidden max-w-xs rounded-lg border border-white/15 bg-black/34 p-4 text-white shadow-2xl backdrop-blur md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">ForgeFit View</p>
        <p className="mt-2 font-semibold">{slides[active]?.title}</p>
        <p className="mt-1 text-sm leading-6 text-white/70">{slides[active]?.caption}</p>
        <div className="mt-3 flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Tampilkan slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === active ? "w-8 bg-red-500" : "w-3 bg-white/35",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
