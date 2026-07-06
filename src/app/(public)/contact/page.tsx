import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { ContactCard } from "@/components/public/form-card"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { gymProfile, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Kontak | ${gymProfile.name}`,
  description: `Hubungi ${gymProfile.name} melalui WhatsApp, telepon, Instagram, email, atau datang langsung ke ${gymProfile.address}.`,
}

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap grid gap-8 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Badge variant="outline">Kontak</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Tanya paket, lokasi, atau personal trainer.</h1>
          <p className="mt-4 leading-8 text-muted-foreground">Admin siap membantu calon member memilih paket, menjelaskan fasilitas, dan memberi arahan lokasi.</p>
          <div className="mt-6 grid gap-3">
            <ContactLine icon={MessageCircle} label="WhatsApp" value={gymProfile.whatsapp} />
            <ContactLine icon={Phone} label="Telepon" value={gymProfile.phone} />
            <ContactLine icon={Mail} label="Email" value={gymProfile.email} />
            <ContactLine icon={MapPin} label="Alamat" value={gymProfile.address} />
          </div>
          <Link href={whatsappUrl()} className="mt-6 inline-flex">
            <Button className="gap-2 bg-red-600 text-white hover:bg-red-700"><MessageCircle size={16} /> Hubungi WhatsApp</Button>
          </Link>
        </div>
        <ContactCard />
      </section>
    </main>
  )
}

function ContactLine({ icon: Icon, label, value }: { icon: typeof MessageCircle; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <Icon className="mt-0.5 h-5 w-5 text-red-600" />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}
