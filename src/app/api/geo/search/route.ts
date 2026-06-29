import { NextResponse } from "next/server"

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  class?: string
  type?: string
  importance?: number
  namedetails?: Record<string, string>
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchNominatim(query)
  const fallbackResults = results.length ? [] : await searchNominatim(`${query}, Indonesia`)
  const merged = dedupeResults([...results, ...fallbackResults])

  return NextResponse.json({
    results: merged.slice(0, 8),
  })
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "8",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
    dedupe: "1",
    countrycodes: "id",
    "accept-language": "id,en",
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ForgeFit-Gym-App/1.0 (location search)",
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data) ? data : []
}

function dedupeResults(results: NominatimResult[]) {
  const seen = new Set<string>()
  return results
    .filter((result) => result.lat && result.lon && result.display_name)
    .sort((a, b) => Number(b.importance ?? 0) - Number(a.importance ?? 0))
    .filter((result) => {
      const key = `${Number(result.lat).toFixed(6)},${Number(result.lon).toFixed(6)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
