"use client"

import { useEffect, useRef } from "react"
import type * as Leaflet from "leaflet"

export function BranchMapView({
  latitude,
  longitude,
  radiusMeters,
}: {
  latitude: number
  longitude: number
  radiusMeters: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Leaflet.Map | null>(null)
  const initialRef = useRef({ latitude, longitude, radiusMeters })

  useEffect(() => {
    if (mapRef.current) return

    let disposed = false

    async function initMap() {
      const leafletModule = await import("leaflet")
      const leaflet = (leafletModule.default ?? leafletModule) as typeof Leaflet
      if (disposed || mapRef.current || !containerRef.current) return

      const map = leaflet.map(containerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([initialRef.current.latitude, initialRef.current.longitude], 15)

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map)

      leaflet.circle([initialRef.current.latitude, initialRef.current.longitude], {
        radius: initialRef.current.radiusMeters,
        color: "#111827",
        weight: 1,
        fillColor: "#22c55e",
        fillOpacity: 0.14,
      }).addTo(map)

      leaflet.circleMarker([initialRef.current.latitude, initialRef.current.longitude], {
        radius: 8,
        color: "#111827",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 1,
      }).addTo(map)

      mapRef.current = map
      window.setTimeout(() => map.invalidateSize(), 0)
      const resizeObserver = new ResizeObserver(() => map.invalidateSize())
      resizeObserver.observe(containerRef.current)
      map.once("unload", () => resizeObserver.disconnect())
    }

    initMap()

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border bg-muted">
      <div ref={containerRef} className="h-44 w-full sm:h-64" />
    </div>
  )
}
