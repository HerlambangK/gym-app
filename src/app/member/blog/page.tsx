import { blogPosts } from "@/data/gym";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {blogPosts.map((post) => (
        <Card key={post.title}>
          <CardHeader>
            <Badge variant={post.access === "PUBLIC" ? "outline" : "warning"}>{post.access}</Badge>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{post.minutes} menit baca.</CardContent>
        </Card>
      ))}
    </div>
  );
}

