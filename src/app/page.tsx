import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ChevronRight, Dumbbell, MapPin, MessageCircle, Star } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { HomeAuthDialogs } from "@/components/public/home-auth-dialogs"
import { HeroImageSlider } from "@/components/public/hero-image-slider"
import { MarketingPlanCard } from "@/components/public/marketing-plan-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { membershipPlans } from "@/data/gym"
import {
  equipmentCategories,
  facilities,
  faqItems,
  galleryItems,
  gymProfile,
  gymValues,
  heroSlides,
  profileHighlights,
  testimonials,
  whatsappUrl,
} from "@/data/company-profile"

export const metadata: Metadata = {
  title: `${gymProfile.name} | Gym Lengkap dan Nyaman di ${gymProfile.city}`,
  description: `${gymProfile.name} adalah tempat fitness modern dengan alat gym lengkap, fasilitas nyaman, dan lokasi strategis di ${gymProfile.city}. Hubungi kami untuk informasi membership.`,
  openGraph: {
    title: `${gymProfile.name} | Gym Lengkap di ${gymProfile.city}`,
    description: gymProfile.description,
    images: [{ url: gymProfile.heroImage }],
  },
}

export default function Home() {
  const featuredEquipment = equipmentCategories.flatMap((category) =>
    category.items.slice(0, 2).map((item) => ({ ...item, category: category.category })),
  )

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <HomeAuthDialogs />
      <WhatsAppFloatingButton />

      <section className="relative overflow-hidden border-b border-border/70 bg-neutral-950 text-white">
        <HeroImageSlider slides={heroSlides} />
        <div className="relative section-wrap flex min-h-[calc(100svh-4rem)] items-center py-16 sm:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-5 border-white/25 bg-white/12 text-white hover:bg-white/12">Gym Company Profile</Badge>
            <h1 className="text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              Gym nyaman dengan alat lengkap untuk latihan lebih maksimal
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              {gymProfile.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={whatsappUrl()}>
                <Button size="lg" className="h-11 gap-2 bg-red-600 px-6 text-white hover:bg-red-700">
                  Hubungi WhatsApp <MessageCircle size={17} />
                </Button>
              </Link>
              <Link href="/lokasi">
                <Button size="lg" variant="outline" className="h-11 gap-2 border-white/35 bg-white/10 px-6 text-white hover:bg-white/18">
                  Lihat Lokasi <MapPin size={17} />
                </Button>
              </Link>
              <Link href="/fasilitas">
                <Button size="lg" variant="outline" className="h-11 gap-2 border-white/35 bg-white/10 px-6 text-white hover:bg-white/18">
                  Lihat Fasilitas <ChevronRight size={17} />
                </Button>
              </Link>
            </div>
            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {profileHighlights.slice(0, 3).map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur">
                  <Check size={14} className="text-red-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["06.00 - 22.00", "Jam operasional setiap hari"],
            ["3 Zona", "Strength, cardio, free weight"],
            ["PT", "Personal trainer tersedia"],
            ["Strategis", gymProfile.city],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap grid items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="outline">Tentang Kami</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Tempat latihan yang bersih, ramah pemula, dan serius soal progres.</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            {gymProfile.name} dibangun untuk member yang ingin latihan rutin tanpa merasa canggung. Area latihan dibuat jelas, alat dirawat, dan staff siap membantu kebutuhan dasar dari pemula sampai member berpengalaman.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {gymValues.map((value) => (
              <div key={value.title} className="rounded-lg border border-border bg-card p-4">
                <value.icon className="mb-3 h-5 w-5 text-red-600" />
                <p className="font-semibold">{value.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>
          <Link href="/tentang-kami" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">
            Baca profil lengkap <ArrowRight size={15} />
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=85"
            alt="Area latihan ForgeFit Studio"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 py-16">
        <div className="section-wrap">
          <SectionIntro
            eyebrow="Fasilitas Gym"
            title="Fasilitas utama untuk latihan nyaman setiap hari"
            description="Preview fasilitas yang paling sering dicari calon member sebelum datang langsung."
            href="/fasilitas"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.slice(0, 6).map((facility) => (
              <Card key={facility.name} className="overflow-hidden rounded-lg">
                <div className="relative aspect-[16/10]">
                  <Image src={facility.image} alt={facility.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                </div>
                <CardHeader>
                  <facility.icon className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-6 text-muted-foreground">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <SectionIntro
          eyebrow="Alat Gym"
          title="Daftar alat jelas: fungsi dan otot yang dilatih"
          description="Website menonjolkan alat karena ini salah satu pertanyaan paling penting dari calon member."
          href="/alat-gym"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredEquipment.map((item) => (
            <div key={`${item.category}-${item.name}`} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">{item.category}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-red-600 text-white">
                  <Dumbbell size={18} />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.function}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.muscles.map((muscle) => (
                  <span key={muscle} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 py-16 text-white">
        <div className="section-wrap">
          <SectionIntro
            eyebrow="Galeri"
            title="Lihat suasana gym sebelum datang"
            description="Foto area latihan, alat, dan fasilitas untuk membangun kepercayaan calon member."
            href="/galeri"
            dark
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.slice(0, 6).map((item) => (
              <Link key={item.title} href="/galeri" className="group relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70">{item.category}</p>
                  <p className="mt-1 font-semibold">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <SectionIntro
          eyebrow="Paket Member"
          title="Pilih ritme latihan yang paling cocok untuk targetmu"
          description="Mulai dari trial satu hari, lalu lanjutkan ke paket bulanan saat kamu sudah siap membangun rutinitas."
          href="/pricing"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {membershipPlans.map((plan) => (
            <MarketingPlanCard
              key={plan.code}
              plan={{
                name: plan.name,
                code: plan.code,
                description: plan.description,
                price: plan.price,
                durationDays: plan.durationDays,
                highlighted: plan.highlighted,
              }}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 py-16">
        <div className="section-wrap grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="outline">Lokasi</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Mudah ditemukan, siap dikunjungi.</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p><span className="font-semibold text-foreground">Alamat:</span> {gymProfile.address}</p>
              <p><span className="font-semibold text-foreground">Patokan:</span> {gymProfile.landmark}</p>
              <p><span className="font-semibold text-foreground">Jam:</span> {gymProfile.hours}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={gymProfile.mapsUrl}>
                <Button className="gap-2 bg-red-600 text-white hover:bg-red-700"><MapPin size={16} /> Buka Google Maps</Button>
              </Link>
              <Link href={whatsappUrl("Halo, saya ingin tanya lokasi ForgeFit Studio.")}>
                <Button variant="outline" className="gap-2"><MessageCircle size={16} /> Tanya Lokasi</Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <iframe
              title={`Lokasi ${gymProfile.name}`}
              src={gymProfile.mapsEmbedUrl}
              className="h-[22rem] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="section-wrap py-16">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="outline">Testimoni & FAQ</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Jawaban cepat untuk calon member.</h2>
            <div className="mt-6 grid gap-4">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-3 flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">&ldquo;{item.text}&rdquo;</p>
                  <p className="mt-3 font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap pb-16">
        <div className="rounded-lg bg-neutral-950 p-8 text-white sm:p-12">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">Mulai Latihan</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Siap datang dan lihat tempat langsung?</h2>
              <p className="mt-3 max-w-2xl text-white/70">Hubungi admin untuk tanya paket, lokasi, personal trainer, atau jadwal terbaik untuk trial.</p>
            </div>
            <Link href={whatsappUrl()}>
              <Button size="lg" className="h-11 gap-2 bg-red-600 px-7 text-white hover:bg-red-700">
                Hubungi WhatsApp <MessageCircle size={17} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
  href,
  dark = false,
}: {
  eyebrow: string
  title: string
  description: string
  href: string
  dark?: boolean
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Badge variant={dark ? "secondary" : "outline"}>{eyebrow}</Badge>
        <h2 className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${dark ? "text-white" : ""}`}>{title}</h2>
        <p className={`mt-3 leading-7 ${dark ? "text-white/68" : "text-muted-foreground"}`}>{description}</p>
      </div>
      <Link href={href} className={`inline-flex items-center gap-2 text-sm font-semibold ${dark ? "text-red-300" : "text-red-600"} hover:underline`}>
        Lihat lengkap <ArrowRight size={15} />
      </Link>
    </div>
  )
}

function WhatsAppFloatingButton() {
  return (
    <Link
      href={whatsappUrl()}
      className="fixed bottom-5 right-5 z-40 inline-flex size-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-950/25 transition hover:scale-105 hover:bg-red-700"
      aria-label="Hubungi WhatsApp"
    >
      <MessageCircle size={22} />
    </Link>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="section-wrap grid gap-8 md:grid-cols-[1fr_auto_auto]">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-red-600 text-white">
              <Dumbbell size={18} />
            </span>
            {gymProfile.name}
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{gymProfile.description}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Kontak</p>
          <p className="mt-2 text-muted-foreground">{gymProfile.whatsapp}</p>
          <p className="text-muted-foreground">{gymProfile.instagram}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Alamat</p>
          <p className="mt-2 max-w-xs text-muted-foreground">{gymProfile.address}</p>
          <p className="text-muted-foreground">{gymProfile.hours}</p>
        </div>
      </div>
    </footer>
  )
}
