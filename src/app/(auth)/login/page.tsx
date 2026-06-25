import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Auth siap dihubungkan ke Supabase Auth.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button>Masuk</Button>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/owner/dashboard">Demo Owner</Link>
            <Link href="/admin/dashboard">Demo Admin</Link>
            <Link href="/member/dashboard">Demo Member</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

