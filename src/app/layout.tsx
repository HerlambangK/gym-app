import type { Metadata } from "next";
import { Toaster } from "sonner";
import { FaviconSwitcher } from "@/components/favicon-switcher";
import { getBrandingSettings } from "@/lib/db/branding";
import "./globals.css";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings()

  const title = branding?.brand_name
    ? `${branding.brand_name} | Gym Management`
    : "ForgeFit Studio | Gym Management"

  const description = branding?.tagline
    || "Fullstack gym management system with RBAC, billing, attendance, and premium membership features."

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
