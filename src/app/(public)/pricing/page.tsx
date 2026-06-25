import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { membershipPlans } from "@/data/gym";
import { rupiah } from "@/lib/format";

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="secondary">Membership</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Pilih paket sesuai akses fitur.</h1>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {membershipPlans.map((plan) => (
            <Card key={plan.code} className={plan.highlighted ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-semibold">{rupiah.format(plan.price)}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => <p key={feature}>{feature}</p>)}
                </div>
                <Link href="/register"><Button className="w-full">Daftar</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

