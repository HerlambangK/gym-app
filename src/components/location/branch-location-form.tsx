"use client"

import { useActionState, useCallback, useState, type ReactNode } from "react"
import { Building2, LocateFixed, MapPin, Navigation, Save, Search } from "lucide-react"
import { saveBranchLocation, type BranchLocationState } from "@/app/actions/branches"
import { BranchMapPicker } from "@/components/location/branch-map-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type BranchLocation = {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius_meters: number
  phone?: string | null
  email?: string | null
}

type LocationSearchResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  class?: string
  type?: string
}

const initialState: BranchLocationState = {
  ok: false,
  message: "",
}

export function BranchLocationForm({ branch }: { branch: BranchLocation | null }) {
  const fallback = {
    latitude: -6.2279,
    longitude: 106.8099,
    radius_meters: 100,
  }
  const [location, setLocation] = useState({
    latitude: Number(branch?.latitude ?? fallback.latitude),
    longitude: Number(branch?.longitude ?? fallback.longitude),
  })
  const [radiusMeters, setRadiusMeters] = useState(Number(branch?.radius_meters ?? fallback.radius_meters))
  const [branchName, setBranchName] = useState(branch?.name ?? "ForgeFit Studio")
  const [address, setAddress] = useState(branch?.address ?? "Jakarta Selatan")
  const [searchQuery, setSearchQuery] = useState(branch?.address ?? "")
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [state, action, pending] = useActionState(saveBranchLocation, initialState)

  const handleMapChange = useCallback((next: { latitude: number; longitude: number }) => {
    setLocation(next)
  }, [])

  function useCurrentPosition() {
    if (!("geolocation" in navigator)) {
      setSearchError("Browser tidak mendukung GPS.")
      return
    }

    setSearchError("")
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(7))
        const lng = Number(position.coords.longitude.toFixed(7))
        setLocation({ latitude: lat, longitude: lng })
        try {
          const res = await fetch(`/api/geo/reverse?lat=${lat}&lon=${lng}`)
          if (res.ok) {
            const data = await res.json()
            if (data.concise) {
              setAddress(data.concise)
              setSearchQuery(data.concise)
            }
          }
        } catch { /* ignore */ }
      },
      () => setSearchError("Tidak bisa mengambil lokasi perangkat. Aktifkan izin lokasi browser."),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleSearch() {
    const query = searchQuery.trim()
    if (!query) {
      setSearchError("Masukkan nama lokasi atau alamat.")
      return
    }

    setSearchLoading(true)
    setSearchError("")

    try {
      const params = new URLSearchParams({
        q: query,
      })
      const response = await fetch(`/api/geo/search?${params.toString()}`)
      const data = await response.json()
      const results = Array.isArray(data.results) ? data.results : []
      setSearchResults(results)
      if (results.length === 0) {
        setSearchError("Lokasi tidak ditemukan. Coba nama tempat lengkap, gedung, jalan, atau kota.")
      }
    } catch {
      setSearchError("Gagal mencari lokasi. Periksa koneksi internet lalu coba lagi.")
    } finally {
      setSearchLoading(false)
    }
  }

  function selectSearchResult(result: LocationSearchResult) {
    const nextLocation = {
      latitude: Number(Number(result.lat).toFixed(7)),
      longitude: Number(Number(result.lon).toFixed(7)),
    }

    setLocation(nextLocation)
    setAddress(result.display_name)
    setSearchQuery(result.display_name)
    setSearchResults([])
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(28rem,0.55fr)]">
      <div className="min-w-0 space-y-5">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant={branch ? "success" : "warning"}>{branch ? "Lokasi aktif" : "Belum diset"}</Badge>
                <Badge variant="outline">OpenStreetMap</Badge>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Pin Lokasi Cabang</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Cari nama tempat, pilih hasil yang paling tepat, atau klik langsung di peta untuk mengatur titik check-in.
              </p>
            </div>
            <Button type="button" variant="outline" className="w-full gap-2 sm:w-fit" onClick={useCurrentPosition}>
              <LocateFixed size={16} />
              Pakai GPS Saya
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-sm sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      handleSearch()
                    }
                  }}
                  className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                  placeholder="Cari tempat, gedung, jalan, atau kota"
                />
              </div>
              <Button type="button" className="h-11 gap-2 px-5" onClick={handleSearch} disabled={searchLoading}>
                <Search size={16} />
                {searchLoading ? "Mencari..." : "Cari Lokasi"}
              </Button>
            </div>
            {searchError ? <p className="text-sm text-destructive">{searchError}</p> : null}
            {searchResults.length ? (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-sm">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    className="w-full rounded-lg p-3 text-left text-sm transition hover:bg-muted"
                    onClick={() => selectSearchResult(result)}
                  >
                    <span className="flex flex-wrap items-center gap-2 font-medium">
                      Pilih titik ini
                      {result.type ? (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal uppercase text-muted-foreground">
                          {result.class}/{result.type}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block leading-5 text-muted-foreground">{result.display_name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <BranchMapPicker
            latitude={location.latitude}
            longitude={location.longitude}
            radiusMeters={radiusMeters}
            onChange={handleMapChange}
          />
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<MapPin size={18} />}
            label="Titik pin"
            value={`${location.latitude}, ${location.longitude}`}
          />
          <InfoTile
            icon={<Navigation size={18} />}
            label="Radius check-in"
            value={`${radiusMeters} meter`}
          />
          <InfoTile
            icon={<Building2 size={18} />}
            label="Status"
            value={branch ? "Siap dipakai member" : "Menunggu simpan"}
          />
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm xl:sticky xl:top-24">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Detail Lokasi</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Data ini dipakai untuk validasi GPS check-in member.
            </p>
          </div>
          <Badge variant="secondary">Admin/Owner</Badge>
        </div>
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={branch?.id ?? ""} />
            <input type="hidden" name="latitude" value={location.latitude} />
            <input type="hidden" name="longitude" value={location.longitude} />

            <div className="grid gap-2">
              <label htmlFor="branch-name" className="text-sm font-medium">Nama cabang</label>
              <Input
                id="branch-name"
                name="name"
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="branch-address" className="text-sm font-medium">Alamat</label>
              <Input
                id="branch-address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="branch-latitude" className="text-sm font-medium">Latitude</label>
                <Input
                  id="branch-latitude"
                  inputMode="decimal"
                  className="font-mono text-sm"
                  value={location.latitude}
                  onChange={(event) => setLocation((current) => ({
                    ...current,
                    latitude: Number(event.target.value) || 0,
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="branch-longitude" className="text-sm font-medium">Longitude</label>
                <Input
                  id="branch-longitude"
                  inputMode="decimal"
                  className="font-mono text-sm"
                  value={location.longitude}
                  onChange={(event) => setLocation((current) => ({
                    ...current,
                    longitude: Number(event.target.value) || 0,
                  }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="branch-radius" className="text-sm font-medium">Radius check-in</label>
              <div className="flex items-center gap-2">
                <Input
                  id="branch-radius"
                  type="number"
                  inputMode="numeric"
                  min={20}
                  max={2000}
                  step={10}
                  value={radiusMeters}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    if (!Number.isNaN(parsed)) {
                      setRadiusMeters(Math.min(2000, Math.max(20, parsed)))
                    }
                  }}
                  className="max-w-36"
                />
                <span className="text-sm text-muted-foreground">meter</span>
              </div>
              <input type="hidden" name="radiusMeters" value={radiusMeters} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="branch-phone" className="text-sm font-medium">Telepon</label>
                <Input id="branch-phone" name="phone" defaultValue={branch?.phone ?? ""} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="branch-email" className="text-sm font-medium">Email</label>
                <Input id="branch-email" name="email" type="email" defaultValue={branch?.email ?? ""} />
              </div>
            </div>

            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            {state.fieldErrors ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {Object.entries(state.fieldErrors).map(([field, errors]) => (
                  errors?.length ? <p key={field}>{field}: {errors.join(", ")}</p> : null
                ))}
              </div>
            ) : null}

            <Button type="submit" disabled={pending} className="w-full gap-2 sm:w-auto">
              <Save size={16} />
              {pending ? "Menyimpan..." : "Simpan Lokasi"}
            </Button>
          </form>
      </aside>
    </div>
  )
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
