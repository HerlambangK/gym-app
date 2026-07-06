"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Copy, Landmark, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PaymentMethod = "bca_va" | "bni_va" | "bri_va" | "permata_va" | "qris"

type ChargeAction = {
  name?: string
  method?: string
  url?: string
}

type ChargeResponse = {
  order_id?: string
  transaction_id?: string
  transaction_status?: string
  payment_type?: string
  gross_amount?: string
  expiry_time?: string
  va_numbers?: Array<{ bank?: string; va_number?: string }>
  permata_va_number?: string
  actions?: ChargeAction[]
}

export type NativePaymentResult = {
  invoiceNumber: string
  paymentMethod: PaymentMethod
  charge: ChargeResponse
  status?: {
    paymentStatus?: string
    invoiceStatus?: string
    subscriptionStatus?: string
    transactionStatus?: string
  }
}

const paymentMethods: Array<{
  value: PaymentMethod
  title: string
  description: string
  icon: typeof Landmark
}> = [
  { value: "bca_va", title: "BCA Virtual Account", description: "Nomor VA BCA dari Midtrans Core API.", icon: Landmark },
  { value: "bni_va", title: "BNI Virtual Account", description: "Nomor VA BNI untuk transfer bank.", icon: Landmark },
  { value: "bri_va", title: "BRI Virtual Account", description: "Nomor VA BRI untuk pembayaran member.", icon: Landmark },
  { value: "permata_va", title: "Permata Virtual Account", description: "Nomor VA Permata dari charge API.", icon: Landmark },
  { value: "qris", title: "QRIS", description: "Tampilkan QR code langsung di halaman ini.", icon: QrCode },
]

function getVaNumber(charge: ChargeResponse) {
  return charge.va_numbers?.[0]?.va_number || charge.permata_va_number || ""
}

function getQrUrl(charge: ChargeResponse) {
  return charge.actions?.find((action) => action.name === "generate-qr-code")?.url || ""
}

function formatExpiry(expiryTime?: string) {
  if (!expiryTime) return "-"
  const date = new Date(expiryTime.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return expiryTime
  return date.toLocaleString("id-ID")
}

export function SubscribeButton({
  planCode,
  label = "Beli Paket",
  initialPaymentResult = null,
  activeSubEndDate = null,
  planName = "",
  remainingDays = 0,
}: {
  planCode: string
  label?: string
  initialPaymentResult?: NativePaymentResult | null
  activeSubEndDate?: string | null
  planName?: string
  remainingDays?: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentResult?.paymentMethod ?? "bca_va")
  const [paymentResult, setPaymentResult] = useState<NativePaymentResult | null>(initialPaymentResult)
  const [step, setStep] = useState<"method" | "instruction">(initialPaymentResult ? "instruction" : "method")
  const [successOpen, setSuccessOpen] = useState(false)
  const notifiedRef = useRef(false)

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.value === paymentMethod) ?? paymentMethods[0],
    [paymentMethod],
  )

  const checkPaymentStatus = useCallback(async (orderId = paymentResult?.invoiceNumber, options?: { silent?: boolean }) => {
    if (!orderId) return
    if (!options?.silent) setCheckingStatus(true)
    try {
      const res = await fetch("/api/midtrans/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (!options?.silent) toast.error("Belum bisa mengecek status pembayaran")
        return
      }
      setPaymentResult((current) => current ? {
        ...current,
        status: {
          paymentStatus: data.paymentStatus,
          invoiceStatus: data.invoiceStatus,
          subscriptionStatus: data.subscriptionStatus,
          transactionStatus: data.transactionStatus,
        },
      } : current)

      if (data.paymentStatus === "PAID") {
        if (!notifiedRef.current) {
          notifiedRef.current = true
          setSuccessOpen(true)
        }
        toast.success("Pembayaran berhasil. Subscription aktif.")
        window.dispatchEvent(new Event("forgefit:account-updated"))
        router.refresh()
      } else if (!options?.silent) {
        toast.info("Pembayaran belum lunas. Coba cek lagi setelah transfer selesai.")
      }
    } catch {
      if (!options?.silent) toast.error("Gagal mengecek status pembayaran")
    } finally {
      if (!options?.silent) setCheckingStatus(false)
    }
  }, [paymentResult?.invoiceNumber, router])

  async function handleCreatePayment() {
    if (paymentResult && paymentResult.status?.paymentStatus !== "PAID" && paymentResult.status?.paymentStatus !== "FAILED") {
      toast.info("Batalkan invoice pending terlebih dahulu untuk mengganti metode pembayaran.")
      return
    }

    setLoading(true)
    setPaymentResult(null)
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Gagal membuat pembayaran")
        return
      }
      if (!data.charge) {
        toast.error("Response pembayaran Midtrans tidak lengkap")
        return
      }
      const nextPayment = data as NativePaymentResult
      setPaymentResult(nextPayment)
      setStep("instruction")
      toast.success("Instruksi pembayaran dibuat")
      await checkPaymentStatus(nextPayment.invoiceNumber, { silent: true })
    } catch {
      toast.error("Gagal menghubungi Midtrans")
    } finally {
      setLoading(false)
    }
  }

  const isPaymentFinal = paymentResult?.status?.paymentStatus === "PAID" || paymentResult?.status?.paymentStatus === "FAILED"
  const hasActiveInstruction = Boolean(paymentResult && !isPaymentFinal)

  async function handleCancelPayment() {
    const orderId = paymentResult?.invoiceNumber
    if (!orderId) return

    setCanceling(true)
    try {
      const res = await fetch("/api/midtrans/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Gagal membatalkan pembayaran")
        return
      }

      toast.success("Pembayaran dibatalkan. Silakan pilih metode baru.")
      setPaymentResult(null)
      setStep("method")
      router.refresh()
    } catch {
      toast.error("Gagal membatalkan pembayaran")
    } finally {
      setCanceling(false)
    }
  }

  useEffect(() => {
    if (!open || !paymentResult || isPaymentFinal) return

    const timer = window.setInterval(() => {
      void checkPaymentStatus(paymentResult.invoiceNumber, { silent: true })
    }, 5000)

    return () => window.clearInterval(timer)
  }, [checkPaymentStatus, isPaymentFinal, open, paymentResult])

  useEffect(() => {
    if (!open || !paymentResult || isPaymentFinal) return

    function handleFocus() {
      void checkPaymentStatus(paymentResult?.invoiceNumber, { silent: true })
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [checkPaymentStatus, isPaymentFinal, open, paymentResult])

  async function copyValue(value: string, labelText: string) {
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success(`${labelText} disalin`)
  }

  const vaNumber = paymentResult ? getVaNumber(paymentResult.charge) : ""
  const qrUrl = paymentResult ? getQrUrl(paymentResult.charge) : ""

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 pr-8">
              {step === "instruction" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setStep("method")}
                  aria-label="Kembali ke pilihan metode"
                >
                  <ArrowLeft size={16} />
                </Button>
              ) : null}
              <DialogTitle>{step === "instruction" ? "Cara Bayar" : "Pilih Pembayaran"}</DialogTitle>
            </div>
            <DialogDescription>
              {step === "instruction"
                ? "Selesaikan pembayaran dari instruksi yang sudah dibuat."
                : "Pilih VA atau QRIS. Instruksi pembayaran akan tampil di langkah berikutnya."}
            </DialogDescription>
          </DialogHeader>

          {step === "method" ? (
            <>
              {activeSubEndDate && !hasActiveInstruction ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-800 dark:text-sky-100 space-y-1">
                  <p className="font-semibold">Subscription aktif terdeteksi</p>
                  <p>
                    Anda memiliki subscription aktif sampai{" "}
                    <span className="font-medium">{new Date(activeSubEndDate).toLocaleDateString("id-ID")}</span>{" "}
                    ({remainingDays} hari lagi).
                  </p>
                  <p>
                    Jika membeli <span className="font-medium">{planName}</span>, subscription baru akan
                    otomatis melanjutkan setelah masa aktif saat ini berakhir — masa aktif Anda tidak akan
                    terputus.
                  </p>
                </div>
              ) : null}
              {hasActiveInstruction ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-100">
                  Invoice pending masih aktif. Lanjutkan pembayaran lama atau batalkan dulu untuk memilih metode lain.
                </div>
              ) : null}
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const active = paymentMethod === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      className={cn(
                        "rounded-xl border border-border p-4 text-left transition hover:border-foreground/30 hover:bg-muted/40",
                        active && "border-primary bg-muted",
                        hasActiveInstruction && "opacity-60",
                      )}
                      onClick={() => {
                        if (hasActiveInstruction) {
                          toast.info("Batalkan invoice pending terlebih dahulu untuk mengganti metode pembayaran.")
                          return
                        }
                        setPaymentMethod(method.value)
                        setPaymentResult(null)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{method.title}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="grid gap-2">
                <Button className="h-10" onClick={handleCreatePayment} disabled={loading || hasActiveInstruction}>
                  {loading ? "Membuat instruksi..." : `Lanjut dengan ${selectedMethod.title}`}
                </Button>
                {hasActiveInstruction ? (
                  <Button type="button" variant="outline" className="h-10" onClick={() => setStep("instruction")}>
                    Lanjutkan Pembayaran Pending
                  </Button>
                ) : null}
              </div>
            </>
          ) : paymentResult ? (
            <div className="rounded-xl border border-border bg-muted/35 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Instruksi Pembayaran</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invoice {paymentResult.invoiceNumber}
                  </p>
                </div>
                <Badge variant={paymentResult.status?.paymentStatus === "PAID" ? "success" : "warning"}>
                  {paymentResult.status?.paymentStatus || paymentResult.charge.transaction_status || "PENDING"}
                </Badge>
              </div>

              {paymentResult.status?.subscriptionStatus === "ACTIVE" ? (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
                  Pembayaran berhasil. Akun membership Anda sudah aktif.
                </div>
              ) : null}

              {paymentResult.paymentMethod === "qris" ? (
                <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
                  <div className="rounded-xl border border-border bg-background p-3">
                    {qrUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrUrl} alt="QRIS pembayaran" className="aspect-square w-full rounded-lg object-contain" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                        QR belum tersedia
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Scan QRIS ini dari aplikasi bank atau e-wallet. Status invoice akan berubah setelah callback Midtrans diterima.
                    </p>
                    <PaymentMeta label="Order ID" value={paymentResult.charge.order_id || paymentResult.invoiceNumber} onCopy={copyValue} />
                    <PaymentMeta label="Expired" value={formatExpiry(paymentResult.charge.expiry_time)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <PaymentMeta label="Virtual Account" value={vaNumber || "-"} onCopy={copyValue} prominent />
                  <PaymentMeta label="Bank" value={paymentResult.charge.va_numbers?.[0]?.bank?.toUpperCase() || selectedMethod.title} />
                  <PaymentMeta label="Order ID" value={paymentResult.charge.order_id || paymentResult.invoiceNumber} onCopy={copyValue} />
                  <PaymentMeta label="Expired" value={formatExpiry(paymentResult.charge.expiry_time)} />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 w-full"
                onClick={() => checkPaymentStatus()}
                disabled={checkingStatus}
              >
                {checkingStatus ? "Mengecek status..." : "Cek Status Pembayaran"}
              </Button>
              {hasActiveInstruction ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-2 h-10 w-full"
                  onClick={handleCancelPayment}
                  disabled={canceling}
                >
                  {canceling ? "Membatalkan..." : "Batalkan untuk Ganti Metode"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={28} />
            </div>
            <DialogTitle className="text-center">Pembayaran Berhasil</DialogTitle>
            <DialogDescription className="text-center">
              Subscription aktif. Semua fitur member sudah bisa digunakan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={() => { setSuccessOpen(false); router.refresh(); }}>
              Lanjut ke Dashboard
            </Button>
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PaymentMeta({
  label,
  value,
  onCopy,
  prominent = false,
}: {
  label: string
  value: string
  onCopy?: (value: string, label: string) => void
  prominent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("truncate font-medium", prominent && "font-mono text-lg")}>{value}</p>
      </div>
      {onCopy && value !== "-" ? (
        <Button type="button" variant="outline" size="icon-sm" onClick={() => onCopy(value, label)} aria-label={`Salin ${label}`}>
          <Copy size={14} />
        </Button>
      ) : null}
    </div>
  )
}
