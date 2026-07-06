import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forgefit.studio"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ["", 1],
    ["/tentang-kami", 0.8],
    ["/fasilitas", 0.9],
    ["/alat-gym", 0.9],
    ["/galeri", 0.8],
    ["/pricing", 0.8],
    ["/lokasi", 0.9],
    ["/contact", 0.8],
  ] as const

  return routes.map(([path, priority]) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }))
}
