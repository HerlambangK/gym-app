import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getBlogPosts } from "@/lib/db/blog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const posts = await getBlogPosts()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {posts.length === 0 ? (
        <div className="col-span-3 text-center py-12 text-muted-foreground">
          No blog posts available yet.
        </div>
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
  )
}
