"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MapPin, RotateCcw, Timer, Wifi } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BranchMapView } from "@/components/location/branch-map-view"
import { getDistanceMeters } from "@/lib/haversine"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function CheckInPanel({
  branch,
  context = "member",
  initialActiveSession = null,
}: {
  branch: {
    name: string
    address: string
    latitude: number
    longitude: number
    radiusMeters: number
  } | null
  context?: "member" | "admin"
  initialActiveSession?: { check_in_time: string } | null
}) {
  const isAdminMode = context === "admin"
  const [active, setActive] = useState(Boolean(initialActiveSession))
  const [status, setStatus] = useState(
    initialActiveSession
      ? "Sesi latihan aktif. Selesaikan latihan saat sudah selesai, lokasi gym tidak wajib untuk menutup sesi."
      : isAdminMode
        ? "Mode admin memakai titik cabang sebagai referensi."
        : "Ready for check-in",
  )
  const startTimeRef = useRef<number>(
    initialActiveSession ? new Date(initialActiveSession.check_in_time).getTime() : 0,
  )
  const [durationSec, setDurationSec] = useState(0)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [location, setLocation] = useState<Pick<GeolocationCoordinates, "latitude" | "longitude" | "accuracy"> | null>(
    isAdminMode && branch ? { latitude: branch.latitude, longitude: branch.longitude, accuracy: 0 } : null,
  )
  const [locationError, setLocationError] = useState<string | null>(null)
  const [addressInfo, setAddressInfo] = useState<{ displayName: string; road: string; city: string } | null>(null)
  const [locationAttempted, setLocationAttempted] = useState(isAdminMode)
  const [permissionState, setPermissionState] = useState<PermissionState | "unavailable">("unavailable")
  const [permissionInitialized, setPermissionInitialized] = useState(
    isAdminMode || typeof navigator === "undefined" || !("permissions" in navigator),
  )

  const requestLocationRef = useRef<((useHighAccuracy?: boolean, attempt?: number) => void) | null>(null)

  const requestLocation = useCallback((useHighAccuracy = true, attempt = 0) => {
    if (!("geolocation" in navigator)) {
      setStatus("GPS tidak tersedia di perangkat ini.")
      return
    }

    setGpsLoading(true)
    setLocationError(null)
    setStatus(useHighAccuracy ? "Mengambil lokasi GPS..." : "Mencari lokasi (mode indoor)...")

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation(pos.coords)
        setGpsLoading(false)
        setStatus("Lokasi ditemukan. Silakan check-in.")
        setLocationAttempted(true)
        try {
          const res = await fetch(`/api/geo/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          if (res.ok) {
            const data = await res.json()
            if (data.display_name) {
              setAddressInfo({
                ...(data.address || {}),
                displayName: data.display_name,
              })
            }
          }
        } catch {
          // ignore
        }
      },
      (err) => {
        setGpsLoading(false)
        const pErr = err as { code: number; message: string }
        if (pErr.code === 1) {
          setLocationError("Akses lokasi ditolak. Aktifkan izin lokasi di pengaturan browser untuk check-in.")
          setStatus("Akses lokasi ditolak")
        } else if (pErr.code === 2) {
          if (useHighAccuracy && attempt < 2) {
            setTimeout(() => requestLocationRef.current?.(true, attempt + 1), [1000, 3000, 5000][attempt])
            setStatus(`Mencoba ulang GPS... (${attempt + 1}/3)`)
          } else if (useHighAccuracy && attempt >= 2) {
            setStatus("GPS akurat tidak tersedia. Mencoba mode indoor...")
            setTimeout(() => requestLocationRef.current?.(false, 0), 500)
          } else {
            setLocationError("Izin lokasi sudah aktif, tetapi browser belum bisa menghitung koordinat perangkat. Coba aktifkan layanan lokasi OS, WiFi, atau uji lagi dari area terbuka.")
            setStatus("Lokasi tidak tersedia")
          }
        } else if (pErr.code === 3) {
          if (attempt < 2) {
            setTimeout(() => requestLocationRef.current?.(useHighAccuracy, attempt + 1), 1000)
            setStatus(`Waktu habis, mencoba lagi... (${attempt + 1}/3)`)
          } else {
            setLocationError("Waktu habis. Periksa koneksi dan coba lagi.")
            setStatus("Waktu habis")
          }
        } else {
          setLocationError("Error GPS tidak dikenal. Coba lagi.")
          setStatus("Error GPS")
        }
      },
      { enableHighAccuracy: useHighAccuracy, timeout: 10000, maximumAge: 30000 },
    )
  }, [])

  useEffect(() => {
    requestLocationRef.current = requestLocation
  }, [requestLocation])

  useEffect(() => {
    if (!active) return
    const tick = () => {
      setDurationSec(Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [active])

  useEffect(() => {
    if (isAdminMode || !("permissions" in navigator)) {
      return
    }
    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      setPermissionState(status.state)
      if (status.state === "granted") {
        setLocationAttempted(true)
        requestLocationRef.current?.(true, 0)
      }
      setPermissionInitialized(true)
      status.onchange = () => {
        setPermissionState(status.state)
        if (status.state === "granted") {
          setLocationAttempted(true)
          requestLocationRef.current?.(true, 0)
        } else if (status.state === "denied") {
          setLocationError("Akses lokasi ditolak. Aktifkan melalui pengaturan browser.")
          setStatus("Akses lokasi ditolak")
        }
      }
    }).catch(() => {
      setPermissionState("unavailable")
      setPermissionInitialized(true)
    })
  }, [isAdminMode])

  async function handleCheckIn() {
    if (!location) {
      toast.error("Lokasi belum tersedia. Coba ulang GPS.")
      return
    }

    setLoading(true)
    setStatus("Memvalidasi GPS, membership, dan pembayaran...")

    try {
      const res = await fetch("/api/member/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setActive(true)
        startTimeRef.current = Date.now()
        setDurationSec(0)
        setStatus(`Check-in berhasil. Jarak dari cabang: ${data.distance}m.`)
        toast.success("Check-in aktif")
      } else {
        setStatus(data.error || "Check-in gagal")
        toast.error(data.error || "Check-in gagal")
      }
    } catch {
      setStatus("Gangguan jaringan. Silakan coba lagi.")
      toast.error("Gangguan jaringan")
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    setLoading(true)
    try {
      const res = await fetch("/api/member/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setActive(false)
        setDurationSec(0)
        setStatus(`Latihan selesai. Durasi latihan: ${data.durationMinutes} menit.`)
        toast.success("Latihan selesai")
      } else {
        setStatus(data.error || "Gagal menyelesaikan latihan")
        toast.error(data.error || "Gagal menyelesaikan latihan")
      }
    } catch {
      setStatus("Gangguan jaringan. Silakan coba lagi.")
      toast.error("Gangguan jaringan")
    } finally {
      setLoading(false)
    }
  }

  function formatDuration(totalSeconds: number) {
    if (totalSeconds <= 0) return active ? "0:00" : "-"
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const branchLocation = branch
    ? { latitude: branch.latitude, longitude: branch.longitude }
    : { latitude: 0, longitude: 0 }
  const branchRadius = branch?.radiusMeters ?? 0
  const distance = location && branch
    ? Math.round(getDistanceMeters(branchLocation, {
        latitude: location.latitude,
        longitude: location.longitude,
      }))
    : 0
  const inRange = Boolean(branch && distance <= branchRadius)
  const disabledReason = isAdminMode
    ? "Mode admin tidak memakai tombol check-in member. Gunakan halaman ini untuk memastikan titik cabang dan radius validasi."
    : !branch
    ? "Lokasi cabang belum diset oleh admin"
    : !location
    ? "Lokasi belum tersedia"
    : !inRange
      ? `Anda masih di luar radius ${branchRadius}m dari gym`
      : active
        ? "Sesi latihan sedang aktif"
        : null

  return (
    <>
      {!isAdminMode && !locationAttempted && permissionInitialized && (
        <Dialog open={!locationAttempted} onOpenChange={(open) => { if (!open) setLocationAttempted(true) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MapPin size={18} />
              </div>
              <DialogTitle>
                {permissionState === "denied" ? "Akses Lokasi Dimatikan" : "Akses Lokasi Diperlukan"}
              </DialogTitle>
              <DialogDescription>
                {permissionState === "denied"
                  ? "Akses lokasi untuk situs ini telah ditolak di pengaturan browser. Aktifkan melalui ikon gembok di address bar, lalu nyalakan izin Lokasi."
                  : "Untuk melakukan check-in, kami memerlukan lokasi perangkat Anda. Koordinat check-in disimpan sebagai bukti attendance dan validasi radius gym."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {permissionState === "denied" ? (
                <Button className="h-10" onClick={() => { setLocationAttempted(true); toast.info("Aktifkan lokasi melalui ikon gembok di address bar browser.") }}>
                  Buka Pengaturan Browser
                </Button>
              ) : (
                <Button className="h-10" onClick={() => requestLocation(true, 0)} disabled={gpsLoading}>
                  {gpsLoading ? "Mendapatkan lokasi..." : "Izinkan Akses Lokasi"}
                </Button>
              )}
              {locationError && (
                <p className="text-sm text-destructive">{locationError}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 pb-2 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{isAdminMode ? "Validasi Lokasi Cabang" : active ? "Sesi latihan aktif" : "Mulai latihan"}</CardTitle>
              <CardDescription>{status}</CardDescription>
            </div>
            <Badge variant={active ? "success" : locationError ? "muted" : !location ? "muted" : inRange ? "success" : "warning"}>
              {active ? "AKTIF" : locationError ? "ERROR" : !location ? "NO GPS" : inRange ? "SIAP" : "DI LUAR RADIUS"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="rounded-lg border border-border p-2.5 sm:p-3">
              <MapPin size={16} className="text-primary sm:size-[18px]" />
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Jarak</p>
              <p className="font-semibold">{distance}m / {branchRadius}m</p>
            </div>
            <div className="rounded-lg border border-border p-2.5 sm:p-3">
              <Wifi size={16} className="text-cyan-300 sm:size-[18px]" />
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{isAdminMode ? "Referensi" : "Akurasi GPS"}</p>
              <p className="font-semibold">{isAdminMode ? "Titik cabang" : location ? `${Math.round(location.accuracy)}m` : "-"}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-border p-2.5 sm:col-span-1 sm:p-3">
              <Timer size={16} className="text-emerald-300 sm:size-[18px]" />
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">Durasi</p>
              <p className="font-semibold tabular-nums">{formatDuration(durationSec)}</p>
            </div>
          </div>
          {addressInfo && (
            <div className="rounded-md border border-border p-2.5 sm:p-3">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">Lokasi Anda</p>
              <p className="mt-1 text-sm font-semibold">{addressInfo.displayName}</p>
            </div>
          )}
          <Progress value={active ? 100 : inRange ? 50 : 10} />
          {locationError ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {locationError}
            </p>
          ) : null}
          {disabledReason ? (
            <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          ) : null}
          {isAdminMode ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Button className="h-10" variant="outline" onClick={() => requestLocation(false, 0)} disabled={gpsLoading || loading}>
                {gpsLoading ? "Menguji GPS..." : "Uji GPS Perangkat"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!branch) return
                  setLocation({ latitude: branch.latitude, longitude: branch.longitude, accuracy: 0 })
                  setLocationError(null)
                  setStatus("Titik cabang dipakai sebagai referensi manual.")
                }}
                disabled={!branch}
                className="h-10 gap-2"
              >
                <RotateCcw size={15} />
                Pakai Titik Cabang
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <Button className="h-10" onClick={handleCheckIn} disabled={active || loading || !inRange || !location}>
                {loading ? "Memproses..." : "Mulai Latihan"}
              </Button>
              <Button className="h-10" variant="outline" onClick={handleCheckOut} disabled={!active || loading}>
                Selesaikan Latihan
              </Button>
              <Button variant="ghost" onClick={() => requestLocation()} disabled={gpsLoading || loading} className="h-10 gap-2">
                <RotateCcw size={15} />
                {gpsLoading ? "Mencari GPS..." : "Retry GPS"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 pb-2 sm:p-6">
          <CardTitle>Lokasi Gym</CardTitle>
          <CardDescription>
            {branch ? `${branch.name} - ${branch.address}` : "Admin belum mengatur lokasi cabang."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 p-3 pt-0 sm:space-y-3 sm:p-6 sm:pt-0">
          {branch ? (
            <>
              <BranchMapView
                latitude={branch.latitude}
                longitude={branch.longitude}
                radiusMeters={branch.radiusMeters}
              />
              <p className="text-sm leading-5 text-muted-foreground">
                Mulai latihan wajib berada dalam radius {branch.radiusMeters} meter dari titik cabang. Selesaikan latihan bisa dilakukan dari luar area gym.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Lokasi gym akan muncul di sini setelah owner/admin menyimpannya.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  )
}
