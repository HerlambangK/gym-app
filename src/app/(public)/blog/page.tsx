import { SiteHeader } from "@/components/public/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blogPosts } from "@/data/gym";

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Blog</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Artikel public dan premium.</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.title}>
              <CardHeader>
                <Badge variant={post.access === "PUBLIC" ? "outline" : "warning"}>{post.access}</Badge>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {post.minutes} menit baca. Premium content mengikuti feature gating.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

