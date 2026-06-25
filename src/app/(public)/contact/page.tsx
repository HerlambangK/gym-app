import { ContactCard } from "@/components/public/form-card";
import { SiteHeader } from "@/components/public/site-header";
import { brand } from "@/data/gym";

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-semibold">Kontak dan lokasi.</h1>
          <p className="mt-4 text-muted-foreground">{brand.address}</p>
          <p className="mt-2 text-muted-foreground">{brand.whatsapp}</p>
        </div>
        <ContactCard />
      </section>
    </main>
  );
}

