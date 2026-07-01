import { NextResponse } from "next/server"

type NominatimReverseResult = {
  display_name: string
  address?: {
    road?: string
    neighbourhood?: string
    suburb?: string
    city_district?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  lat: string
  lon: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")?.trim()
  const lon = searchParams.get("lon")?.trim()

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon parameters required" }, { status: 400 })
  }

  const latNum = Number(lat)
  const lonNum = Number(lon)
  if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      lat,
      lon,
      format: "jsonv2",
      addressdetails: "1",
      "accept-language": "id,en",
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ForgeFit-Gym-App/1.0 (reverse geocode)",
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Nominatim request failed" }, { status: 502 })
    }

    const data = await response.json()

    const result: NominatimReverseResult = {
      display_name: data.display_name || "",
      address: {
        road: data.address?.road,
        neighbourhood: data.address?.neighbourhood,
        suburb: data.address?.suburb,
        city_district: data.address?.city_district,
        city: data.address?.city || data.address?.county,
        state: data.address?.state,
        postcode: data.address?.postcode,
        country: data.address?.country,
      },
      lat: data.lat,
      lon: data.lon,
    }

    const parts: string[] = []
    if (data.address?.road) parts.push(data.address.road)
    if (data.address?.neighbourhood) parts.push(data.address.neighbourhood)
    if (data.address?.suburb) parts.push(data.address.suburb)
    if (data.address?.city_district) parts.push(data.address.city_district)
    if (data.address?.city) parts.push(data.address.city)
    if (data.address?.state) parts.push(data.address.state)

    return NextResponse.json({
      display_name: result.display_name,
      concise: parts.join(", ") || result.display_name,
      address: result.address,
    })
  } catch {
    return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 502 })
  }
}
