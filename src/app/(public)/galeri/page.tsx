import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { GalleryGrid } from "@/components/public/gallery-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { galleryItems, gymProfile, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Galeri Gym | ${gymProfile.name}`,
  description: `Galeri foto ${gymProfile.name}: area gym, alat gym, suasana latihan, trainer, dan fasilitas pendukung.`,
}

export default function Page() {
  const categories = Array.from(new Set(galleryItems.map((item) => item.category)))

  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Galeri</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Suasana gym yang bisa kamu lihat sebelum datang.</h1>
            <p className="mt-4 leading-8 text-muted-foreground">Klik foto untuk melihat preview lebih besar. Galeri dibagi dari area gym, alat, suasana latihan, dan fasilitas.</p>
          </div>
          <Link href={whatsappUrl("Halo, saya ingin datang melihat ForgeFit Studio.")}>
            <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">Jadwalkan Kunjungan <ArrowRight size={16} /></Button>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">{category}</span>
          ))}
        </div>
      </section>
      <section className="section-wrap pb-16">
        <GalleryGrid items={galleryItems} />
      </section>
    </main>
  )
}
