import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { gymProfile, locationFacts, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Lokasi Gym | ${gymProfile.name}`,
  description: `Lokasi ${gymProfile.name}: ${gymProfile.address}. Lihat Google Maps, patokan lokasi, parkir, jam operasional, dan kontak admin.`,
}

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Lokasi</Badge>
        <div className="mt-4 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Lokasi mudah dijangkau di {gymProfile.city}.</h1>
            <p className="mt-4 leading-8 text-muted-foreground">{gymProfile.landmark}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={gymProfile.mapsUrl}>
                <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">Buka Google Maps <ArrowRight size={16} /></Button>
              </Link>
              <Link href={whatsappUrl("Halo, saya ingin tanya rute ke ForgeFit Studio.")}>
                <Button variant="outline" className="gap-2"><MessageCircle size={16} /> Tanya Lokasi</Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <iframe
              title={`Lokasi ${gymProfile.name}`}
              src={gymProfile.mapsEmbedUrl}
              className="h-[26rem] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
      <section className="section-wrap grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {locationFacts.map((fact) => (
          <div key={fact.label} className="rounded-lg border border-border bg-card p-5">
            <fact.icon className="mb-4 h-5 w-5 text-red-600" />
            <p className="font-semibold">{fact.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{fact.value}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
