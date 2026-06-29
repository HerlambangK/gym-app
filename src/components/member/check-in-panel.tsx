"use client"

import { useCallback, useEffect, useState } from "react"
import { MapPin, RotateCcw, Timer, Wifi } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BranchMapView } from "@/components/location/branch-map-view"
import { getDistanceMeters } from "@/lib/haversine"

export function CheckInPanel({
  branch,
}: {
  branch: {
    name: string
    address: string
    latitude: number
    longitude: number
    radiusMeters: number
  } | null
}) {
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState("Ready for check-in")
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)

  const requestLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      setGpsLoading(true)
      setStatus("Mengambil lokasi GPS...")
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(pos.coords)
          setStatus("GPS siap. Pastikan Anda berada di area gym sebelum check-in.")
          setGpsLoading(false)
        },
        () => {
          setStatus("Akses lokasi ditolak. Aktifkan izin lokasi browser lalu coba lagi.")
          setGpsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      window.setTimeout(() => setStatus("GPS tidak tersedia di perangkat ini."), 0)
    }
  }, [])

  useEffect(() => {
    window.setTimeout(requestLocation, 0)
  }, [requestLocation])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (active) {
      const start = Date.now()
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 60000))
      }, 60000)
      window.setTimeout(() => setDuration(0), 0)
    }
    return () => clearInterval(interval)
  }, [active])

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
        setStatus(`Check-out berhasil. Durasi latihan: ${data.durationMinutes} menit.`)
        toast.success("Check-out berhasil")
      } else {
        setStatus(data.error || "Check-out gagal")
        toast.error(data.error || "Check-out gagal")
      }
    } catch {
      setStatus("Gangguan jaringan. Silakan coba lagi.")
      toast.error("Gangguan jaringan")
    } finally {
      setLoading(false)
    }
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
  const disabledReason = !branch
    ? "Lokasi cabang belum diset oleh admin"
    : !location
    ? "Lokasi belum tersedia"
    : !inRange
      ? `Anda masih di luar radius ${branchRadius}m dari gym`
      : active
        ? "Sesi check-in sedang aktif"
        : null

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{active ? "Sesi latihan aktif" : "Check-in"}</CardTitle>
              <CardDescription>{status}</CardDescription>
            </div>
            <Badge variant={active ? "success" : !location ? "muted" : inRange ? "success" : "warning"}>
              {active ? "AKTIF" : !location ? "NO GPS" : inRange ? "SIAP" : "DI LUAR RADIUS"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <MapPin size={18} className="text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Jarak</p>
              <p className="font-semibold">{distance}m / {branchRadius}m</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <Wifi size={18} className="text-cyan-300" />
              <p className="mt-2 text-sm text-muted-foreground">Akurasi GPS</p>
              <p className="font-semibold">{location ? `${Math.round(location.accuracy)}m` : "-"}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <Timer size={18} className="text-emerald-300" />
              <p className="mt-2 text-sm text-muted-foreground">Durasi</p>
              <p className="font-semibold">{duration} min</p>
            </div>
          </div>
          <Progress value={active ? 100 : inRange ? 50 : 10} />
          {disabledReason ? (
            <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCheckIn} disabled={active || loading || !inRange || !location}>
              {loading ? "Memproses..." : "Check-in Sekarang"}
            </Button>
            <Button variant="outline" onClick={handleCheckOut} disabled={!active || loading}>
              Check-out
            </Button>
            <Button variant="ghost" onClick={requestLocation} disabled={gpsLoading || loading} className="gap-2">
              <RotateCcw size={15} />
              {gpsLoading ? "Mencari GPS..." : "Retry GPS"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lokasi Gym</CardTitle>
          <CardDescription>
            {branch ? `${branch.name} - ${branch.address}` : "Admin belum mengatur lokasi cabang."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {branch ? (
            <>
              <BranchMapView
                latitude={branch.latitude}
                longitude={branch.longitude}
                radiusMeters={branch.radiusMeters}
              />
              <p className="text-sm text-muted-foreground">
                Check-in valid saat posisi Anda berada dalam radius {branch.radiusMeters} meter dari titik cabang.
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
  )
}
