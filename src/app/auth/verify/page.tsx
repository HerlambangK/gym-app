import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
            <Mail size={32} className="text-primary" />
          </div>
          <CardTitle>Cek Email Anda</CardTitle>
          <CardDescription>
            Kami telah mengirim tautan verifikasi ke email Anda.
            Klik tautan tersebut untuk mengaktifkan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tidak menerima email? Periksa folder spam atau coba lagi.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" disabled>
              Kirim Ulang Email
            </Button>
            <Link href="/?action=login">
              <Button variant="ghost" className="w-full">
                Kembali ke Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
