"use client"

import { useActionState, useCallback, useState, type ReactNode } from "react"
import { Building2, LocateFixed, MapPin, Navigation, Save, Search } from "lucide-react"
import { saveBranchLocation, type BranchLocationState } from "@/app/actions/branches"
import { BranchMapPicker } from "@/components/location/branch-map-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      (position) => {
        setLocation({
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        })
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(24rem,0.65fr)]">
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-muted/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant={branch ? "success" : "warning"}>{branch ? "Lokasi aktif" : "Belum diset"}</Badge>
                  <Badge variant="outline">OpenStreetMap</Badge>
                </div>
                <CardTitle>Pin Lokasi Cabang</CardTitle>
                <CardDescription>
                  Cari nama gedung/tempat, pilih hasil, atau klik langsung di peta untuk mengatur titik check-in.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={useCurrentPosition}>
                <LocateFixed size={16} />
                Pakai GPS Saya
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row">
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
                    className="pl-9"
                    placeholder="Cari gedung/tempat: Plaza Senayan, GBK, kantor cabang..."
                  />
                </div>
                <Button type="button" className="gap-2" onClick={handleSearch} disabled={searchLoading}>
                  <Search size={16} />
                  {searchLoading ? "Mencari..." : "Cari Lokasi"}
                </Button>
              </div>
              {searchError ? <p className="mt-3 text-sm text-destructive">{searchError}</p> : null}
              {searchResults.length ? (
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      className="w-full rounded-xl border border-border bg-background p-3 text-left text-sm transition hover:border-foreground/30 hover:bg-muted"
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
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Detail Lokasi</CardTitle>
              <CardDescription>
                Data ini akan dipakai untuk validasi GPS check-in member.
              </CardDescription>
            </div>
            <Badge variant="secondary">Admin/Owner</Badge>
          </div>
        </CardHeader>
        <CardContent>
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
                  value={location.longitude}
                  onChange={(event) => setLocation((current) => ({
                    ...current,
                    longitude: Number(event.target.value) || 0,
                  }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <label htmlFor="branch-radius" className="text-sm font-medium">Radius check-in</label>
                <Input
                  id="branch-radius"
                  name="radiusMeters"
                  type="number"
                  min={20}
                  max={2000}
                  value={radiusMeters}
                  onChange={(event) => setRadiusMeters(Number(event.target.value) || 100)}
                />
              </div>
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
        </CardContent>
      </Card>
    </div>
  )
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
