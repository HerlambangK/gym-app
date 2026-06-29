"use client"

import { useEffect, useState } from "react"
import { MapPin, Timer, Wifi } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getDistanceMeters } from "@/lib/haversine"

const branchLocation = { latitude: -6.2279, longitude: 106.8099 }
const branchRadius = 100

export function CheckInPanel() {
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState("Ready for check-in")
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        () => setStatus("Location access denied. Check-in requires location."),
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      setStatus("Geolocation not available on this device")
    }
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (active) {
      const start = Date.now()
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 60000))
      }, 60000)
      setDuration(0)
    }
    return () => clearInterval(interval)
  }, [active])

  async function handleCheckIn() {
    if (!location) {
      toast.error("Unable to get your location")
      return
    }

    setLoading(true)
    setStatus("Validating GPS, membership, payment...")

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
        setStatus(`Check-in successful. Distance: ${data.distance}m from branch.`)
        toast.success("Check-in active")
      } else {
        setStatus(data.error || "Check-in failed")
        toast.error(data.error || "Check-in failed")
      }
    } catch {
      setStatus("Network error. Please try again.")
      toast.error("Network error")
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
        setStatus(`Check-out successful. Duration: ${data.durationMinutes} minutes.`)
        toast.success("Check-out successful")
      } else {
        setStatus(data.error || "Check-out failed")
        toast.error(data.error || "Check-out failed")
      }
    } catch {
      setStatus("Network error. Please try again.")
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const distance = location
    ? Math.round(getDistanceMeters(branchLocation, {
        latitude: location.latitude,
        longitude: location.longitude,
      }))
    : 0

  const inRange = distance <= branchRadius

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{active ? "You are working out" : "Check-in"}</CardTitle>
            <CardDescription>{status}</CardDescription>
          </div>
          <Badge variant={active ? "success" : !location ? "muted" : "warning"}>
            {active ? "ACTIVE" : !location ? "NO GPS" : "READY"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border p-3">
            <MapPin size={18} className="text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Distance</p>
            <p className="font-semibold">{distance}m / {branchRadius}m</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <Wifi size={18} className="text-cyan-300" />
            <p className="mt-2 text-sm text-muted-foreground">GPS accuracy</p>
            <p className="font-semibold">{location ? `${Math.round(location.accuracy)}m` : "-"}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <Timer size={18} className="text-emerald-300" />
            <p className="mt-2 text-sm text-muted-foreground">Duration</p>
            <p className="font-semibold">{duration} min</p>
          </div>
        </div>
        <Progress value={active ? 100 : inRange ? 50 : 10} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCheckIn} disabled={active || loading || !inRange}>
            {loading ? "Processing..." : "Check-in Now"}
          </Button>
          <Button variant="outline" onClick={handleCheckOut} disabled={!active || loading}>
            Check-out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
