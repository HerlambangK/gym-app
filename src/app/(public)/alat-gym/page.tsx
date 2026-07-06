import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Dumbbell } from "lucide-react"
import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { equipmentCategories, gymProfile, whatsappUrl } from "@/data/company-profile"

export const metadata: Metadata = {
  title: `Alat Gym Lengkap | ${gymProfile.name}`,
  description: `Daftar alat gym ${gymProfile.name}: cardio equipment, strength machine, free weight, fungsi alat, dan otot yang dilatih.`,
}

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Alat Gym</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Kenali alat, fungsi, dan otot yang dilatih.</h1>
            <p className="mt-4 leading-8 text-muted-foreground">Daftar ini membantu calon member tahu apakah alat yang dibutuhkan tersedia sebelum datang langsung.</p>
          </div>
          <Link href={whatsappUrl("Halo, saya ingin bertanya alat gym yang tersedia di ForgeFit Studio.")}>
            <Button className="gap-2 bg-red-600 text-white hover:bg-red-700">Tanya Alat <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </section>
      <section className="section-wrap space-y-10 pb-16">
        {equipmentCategories.map((category) => (
          <div key={category.category}>
            <h2 className="text-2xl font-bold">{category.category}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {category.items.map((item) => (
                <article key={item.name} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <span className="grid size-10 place-items-center rounded-md bg-red-600 text-white">
                    <Dumbbell size={18} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.function}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.muscles.map((muscle) => (
                      <span key={muscle} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
