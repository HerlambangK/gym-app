import { RegisterCard } from "@/components/public/form-card";
import { SiteHeader } from "@/components/public/site-header";

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-semibold">Registrasi membership.</h1>
          <p className="mt-4 text-muted-foreground">
            Flow MVP: submit data, pilih plan, create invoice, bayar via Midtrans, subscription aktif, lalu check-in.
          </p>
        </div>
        <RegisterCard />
      </section>
    </main>
  );
}

