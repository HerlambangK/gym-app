import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { facilities, gymProfile, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Fasilitas Gym | ${gymProfile.name}`,
  description: `Lihat fasilitas ${gymProfile.name}: area weight training, cardio, personal trainer, ruang ganti, loker, dan parkir.`,
}

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Fasilitas Gym</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Fasilitas lengkap untuk latihan nyaman.</h1>
            <p className="mt-4 leading-8 text-muted-foreground">Setiap fasilitas dibuat untuk menjawab kebutuhan calon member: alat lengkap, tempat bersih, area mudah dipahami, dan dukungan staff saat dibutuhkan.</p>
          </div>
          <Link href={whatsappUrl("Halo, saya ingin bertanya fasilitas ForgeFit Studio.")}>
            <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">Tanya Fasilitas <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </section>
      <section className="section-wrap grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <article key={facility.name} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="relative aspect-[16/10]">
              <Image src={facility.image} alt={facility.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="p-5">
              <facility.icon className="mb-4 h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">{facility.name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{facility.description}</p>
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm font-medium">{facility.benefit}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
