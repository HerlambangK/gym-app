import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { gymProfile, gymValues, profileHighlights, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Tentang Kami | ${gymProfile.name}`,
  description: `Profil ${gymProfile.name}, gym nyaman dengan alat lengkap dan lingkungan ramah pemula di ${gymProfile.city}.`,
}

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap grid items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="outline">Tentang Kami</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Gym modern untuk pemula, rutin fitness, dan progres jangka panjang.</h1>
          <p className="mt-5 leading-8 text-muted-foreground">
            {gymProfile.name} hadir sebagai tempat latihan yang bersih, nyaman, dan mudah dipahami. Kami percaya member bisa berkembang lebih konsisten ketika alat lengkap, lingkungan mendukung, dan staff mudah diajak bertanya.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={whatsappUrl()}>
              <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">Hubungi Admin <ArrowRight size={16} /></Button>
            </Link>
            <Link href="/fasilitas">
              <Button variant="outline">Lihat Fasilitas</Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1200&q=85"
            alt={`Area latihan ${gymProfile.name}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 py-16">
        <div className="section-wrap grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Visi</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Menjadi gym lokal yang dipercaya karena alat lengkap, suasana nyaman, dan layanan yang membantu member berlatih lebih konsisten.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Misi</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Menyediakan tempat latihan bersih, alat terawat, edukasi dasar yang mudah dipahami, dan akses informasi yang jelas bagi calon member.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Cocok Untuk</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Pemula, pekerja aktif, member rutin, hingga lifter yang membutuhkan area strength, cardio, dan free weight dalam satu tempat.</p>
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge variant="outline">Nilai Utama</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Latihan harus terasa aman, jelas, dan menyenangkan.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {gymValues.map((value) => (
              <div key={value.title} className="rounded-lg border border-border bg-card p-5">
                <value.icon className="mb-3 h-5 w-5 text-red-600" />
                <h3 className="font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profileHighlights.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-red-600" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
