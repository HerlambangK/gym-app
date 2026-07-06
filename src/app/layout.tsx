import type { Metadata } from "next";
import { Toaster } from "sonner";
import { FaviconSwitcher } from "@/components/favicon-switcher";
import { getBrandingSettings } from "@/lib/db/branding";
import { gymProfile } from "@/data/company-profile";
import "./globals.css";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings().catch(() => null)

  const title = branding?.brand_name
    ? `${branding.brand_name} | Gym Lengkap dan Nyaman di ${gymProfile.city}`
    : `${gymProfile.name} | Gym Lengkap dan Nyaman di ${gymProfile.city}`

  const description = branding?.tagline
    || `${gymProfile.name} adalah tempat fitness modern dengan alat gym lengkap, fasilitas nyaman, dan lokasi strategis di ${gymProfile.city}.`

  const icons: Metadata["icons"] = branding?.favicon_url
    ? { icon: [{ url: branding.favicon_url, sizes: "any" }] }
    : {
        icon: [
          { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
          { url: "/favicon.ico", sizes: "32x32" },
        ],
      }

  return { title, description, icons }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-full antialiased", "font-sans")}>
      <body className="min-h-full">
        {children}
        <FaviconSwitcher />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
