import Link from "next/link";
import { Activity, ArrowRight, MapPin, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/public/site-header";
import { brand, blogPosts, membershipPlans } from "@/data/gym";
import { rupiah } from "@/lib/format";

const benefits = [
  { icon: ShieldCheck, title: "RBAC operasional", text: "Owner, admin, trainer, dan member punya akses berbeda." },
  { icon: WalletCards, title: "Billing Midtrans", text: "Invoice pending sampai paid, lalu subscription aktif otomatis." },
  { icon: MapPin, title: "Check-in lokasi", text: "Validasi radius cabang, akurasi GPS, dan sesi aktif." },
  { icon: Sparkles, title: "Premium gating", text: "Nutrition, blog premium, dan workout progress mengikuti paket." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-media min-h-[720px]">
        <div className="section-wrap flex min-h-[656px] items-center">
          <div className="max-w-3xl py-24">
            <Badge variant="warning">Premium Dark MVP</Badge>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              {brand.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-200">
              {brand.tagline} Member daftar, bayar, aktif otomatis, lalu check-in berbasis lokasi. Owner melihat revenue, expense, profit, attendance, dan performa paket.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register"><Button size="lg">Daftar Member <ArrowRight size={18} /></Button></Link>
              <Link href="/owner/dashboard"><Button size="lg" variant="outline">Lihat Dashboard</Button></Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-4">
              {[
                ["742", "Active member"],
                ["4.9", "Rating"],
                ["12", "Trainer"],
                ["186", "Check-in hari ini"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="text-sm text-zinc-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap py-20" id="facilities">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge variant="outline">Gym SaaS Platform</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Semua alur gym dari marketing sampai financial.</h2>
            <p className="mt-3 text-muted-foreground">
              Dibangun untuk owner yang butuh kontrol bisnis, admin yang butuh operasi cepat, dan member yang ingin pengalaman digital.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <benefit.icon className="text-primary" size={24} />
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription>{benefit.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/40 py-20">
        <div className="section-wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge variant="secondary">Membership Pricing</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Paket harian sampai Pro.</h2>
            </div>
            <Link href="/pricing"><Button variant="outline">Semua Paket</Button></Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {membershipPlans.map((plan) => (
              <Card key={plan.code} className={plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted ? <Badge>Popular</Badge> : null}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{rupiah.format(plan.price)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.durationDays} hari</p>
                  <Progress value={plan.tier === "PRO" ? 100 : plan.tier === "PLUS" ? 75 : plan.tier === "BASIC" ? 52 : 24} className="mt-5" />
                  <Button className="mt-5 w-full" variant={plan.highlighted ? "default" : "outline"}>Pilih Paket</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap grid gap-8 py-20 lg:grid-cols-3" id="trainers">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trainer, facility, dan member flow</CardTitle>
            <CardDescription>Strength area, functional zone, studio class, dan check-in digital.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Strength Zone", "Functional Class", "Recovery Corner"].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-muted/40 p-4">
                  <Activity className="text-cyan-300" size={20} />
                  <p className="mt-4 font-semibold">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Operasional terhubung dengan attendance dan laporan.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blog Preview</CardTitle>
            <CardDescription>Public dan subscriber-only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blogPosts.map((post) => (
              <div key={post.title} className="rounded-md border border-border p-3">
                <Badge variant={post.access === "PUBLIC" ? "outline" : "warning"}>{post.access}</Badge>
                <p className="mt-2 font-medium">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.minutes} menit baca</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border py-8">
        <div className="section-wrap flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>{brand.name} - {brand.address}</p>
          <p>{brand.whatsapp} / {brand.instagram}</p>
        </div>
      </footer>
    </main>
  );
}
