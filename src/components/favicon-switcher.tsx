"use client"

import { useEffect } from "react"

const defaultIcon = "/icon.svg"
const premiumIcon = "/favicon-premium.svg"
const accountUpdatedEvent = "forgefit:account-updated"

function setFavicon(href: string, type?: string) {
  const icon = document.querySelector<HTMLLinkElement>("link[data-forgefit-dynamic-icon='true']") ?? document.createElement("link")

  icon.rel = "icon"
  icon.type = type || "image/svg+xml"
  icon.sizes = "any"
  icon.href = href
  icon.dataset.forgefitDynamicIcon = "true"

  if (!icon.parentNode) document.head.appendChild(icon)
}

function getMimeType(url: string): string {
  const ext = url.split("?").shift()?.split(".").pop()?.toLowerCase()
  if (ext === "png") return "image/png"
  if (ext === "ico") return "image/x-icon"
  if (ext === "svg") return "image/svg+xml"
  if (ext === "webp") return "image/webp"
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg"
  return "image/svg+xml"
}

async function syncFavicon() {
  try {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "same-origin",
    })

    if (!response.ok) {
      setFavicon(defaultIcon)
      return
    }

    const data = await response.json()
    const brandingFavicon = data?.branding?.faviconUrl
    if (brandingFavicon) {
      setFavicon(brandingFavicon, getMimeType(brandingFavicon))
      return
    }

    const memberType = data?.user?.memberType
    setFavicon(memberType === "PREMIUM" ? premiumIcon : defaultIcon)
  } catch {
    setFavicon(defaultIcon)
  }
}

export function FaviconSwitcher() {
  useEffect(() => {
    void syncFavicon()

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void syncFavicon()
    }

    window.addEventListener("focus", syncFavicon)
    window.addEventListener(accountUpdatedEvent, syncFavicon)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", syncFavicon)
      window.removeEventListener(accountUpdatedEvent, syncFavicon)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return null
}
