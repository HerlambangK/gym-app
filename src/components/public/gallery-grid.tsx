"use client"

import Image from "next/image"
import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type GalleryItem = {
  title: string
  category: string
  image: string
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActive(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border text-left shadow-sm"
          >
            <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/70">{item.category}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/82 p-4" role="dialog" aria-modal="true" aria-label={active.title}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-background">
            <div className="relative aspect-[16/10]">
              <Image src={active.image} alt={active.title} fill sizes="100vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{active.category}</p>
                <p className="font-semibold">{active.title}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => setActive(null)} aria-label="Tutup galeri">
                <X size={18} />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
