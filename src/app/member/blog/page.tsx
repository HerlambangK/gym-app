import { getCurrentUserId } from "@/lib/current-user"
import { getBlogPosts } from "@/lib/db/blog"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page() {
  const userId = await getCurrentUserId()

  const posts = await getBlogPosts()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        status={userId ? "Konten membership" : "Memuat member"}
        title="Blog dan Edukasi"
        description="Baca panduan latihan, nutrisi, dan recovery yang disiapkan untuk member gym."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {posts.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="py-12 text-center text-muted-foreground">
              Belum ada artikel tersedia.
            </CardContent>
          </Card>
        ) : (
          posts.map((post: Record<string, unknown>) => {
            const p = post as {
              title: string; slug: string; access_type: string; excerpt: string;
              content: string; published_at: string
            }
            return (
              <Card key={p.slug}>
                <CardHeader>
                  <Badge variant={p.access_type === "PUBLIC" ? "outline" : "warning"}>
                    {p.access_type}
                  </Badge>
                  <CardTitle>{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {p.excerpt || p.content?.slice(0, 100)}
                  {p.published_at && (
                    <p className="mt-2 text-xs">
                      {new Date(p.published_at).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
