"use client"

import { useEffect, useRef } from "react"
import type * as Leaflet from "leaflet"

export function BranchMapPicker({
  latitude,
  longitude,
  radiusMeters,
  onChange,
}: {
  latitude: number
  longitude: number
  radiusMeters: number
  onChange: (location: { latitude: number; longitude: number }) => void
}) {
  const leafletRef = useRef<typeof Leaflet | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Leaflet.Map | null>(null)
  const markerRef = useRef<Leaflet.CircleMarker | null>(null)
  const radiusRef = useRef<Leaflet.Circle | null>(null)
  const onChangeRef = useRef(onChange)
  const initialCenterRef = useRef({ latitude, longitude })
  const initialRadiusRef = useRef(radiusMeters)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (mapRef.current) return

    let disposed = false

    async function initMap() {
      const leafletModule = await import("leaflet")
      const leaflet = (leafletModule.default ?? leafletModule) as typeof Leaflet
      if (disposed || mapRef.current || !containerRef.current) return
      leafletRef.current = leaflet

      const map = leaflet.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialCenterRef.current.latitude, initialCenterRef.current.longitude], 15)

      leaflet.control.zoom({ position: "bottomright" }).addTo(map)
      leaflet.control.attribution({ prefix: false }).addTo(map)
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map)

      map.on("click", (event) => {
        onChangeRef.current({
          latitude: Number(event.latlng.lat.toFixed(7)),
          longitude: Number(event.latlng.lng.toFixed(7)),
        })
      })

      mapRef.current = map
      const initialLatLng = leaflet.latLng(
        initialCenterRef.current.latitude,
        initialCenterRef.current.longitude,
      )
      markerRef.current = leaflet.circleMarker(initialLatLng, {
        radius: 8,
        color: "#111827",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 1,
      }).addTo(map)
      radiusRef.current = leaflet.circle(initialLatLng, {
        radius: initialRadiusRef.current,
        color: "#111827",
        weight: 1,
        fillColor: "#22c55e",
        fillOpacity: 0.12,
      }).addTo(map)

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
      markerRef.current = null
      radiusRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const leaflet = leafletRef.current
    if (!map || !leaflet) return

    const latLng = leaflet.latLng(latitude, longitude)
    map.setView(latLng, map.getZoom())

    if (!markerRef.current) {
      markerRef.current = leaflet.circleMarker(latLng, {
        radius: 8,
        color: "#111827",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 1,
      }).addTo(map)
    } else {
      markerRef.current.setLatLng(latLng)
    }

    if (!radiusRef.current) {
      radiusRef.current = leaflet.circle(latLng, {
        radius: radiusMeters,
        color: "#111827",
        weight: 1,
        fillColor: "#22c55e",
        fillOpacity: 0.12,
      }).addTo(map)
    } else {
      radiusRef.current.setLatLng(latLng)
      radiusRef.current.setRadius(radiusMeters)
    }
  }, [latitude, longitude, radiusMeters])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted">
      <div ref={containerRef} className="h-[22rem] w-full sm:h-[28rem]" />
    </div>
  )
}
