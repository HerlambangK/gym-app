import Link from "next/link"
import { ArrowLeft, Frown } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Frown size={28} className="text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-center text-lg text-muted-foreground">
        Halaman tidak ditemukan.
      </p>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
        Mungkin tautan sudah kedaluwarsa, atau alamat yang Anda masukkan salah.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>
    </div>
  )
}
