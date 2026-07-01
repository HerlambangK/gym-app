import type { Metadata } from "next";
import { Toaster } from "sonner";
import { FaviconSwitcher } from "@/components/favicon-switcher";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ForgeFit Studio | Gym Management",
  description:
    "Fullstack gym management system with RBAC, billing, attendance, and premium membership features.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

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
