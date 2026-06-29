import { SiteHeader } from "@/components/public/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBlogPosts } from "@/lib/db/blog"

export const dynamic = "force-dynamic"

export default async function Page() {
  const posts = await getBlogPosts("PUBLIC")

  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Blog</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Artikel dan pembaruan.</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Belum ada artikel.
            </div>
          ) : (
            posts.map((post: Record<string, unknown>) => {
              const p = post as {
                title: string; slug: string; access_type: string;
                excerpt: string; published_at: string
              }
              return (
                <Card key={p.slug}>
                  <CardHeader>
                    <Badge variant={p.access_type === "PUBLIC" ? "outline" : "warning"}>
                      {p.access_type === "PUBLIC" ? "Publik" : "Khusus Member"}
                    </Badge>
                    <CardTitle>{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {p.excerpt || "Baca selengkapnya..."}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}
