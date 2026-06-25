import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader><CardTitle>Profil Member</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {["Nama: Budi Santoso", "Email: budi@example.com", "Role: MEMBER", "Status: ACTIVE"].map((item) => (
          <div key={item} className="rounded-md border border-border p-3">{item}</div>
        ))}
      </CardContent>
    </Card>
  );
}

