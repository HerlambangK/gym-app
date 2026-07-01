"use client"

import { useEffect } from "react"

const defaultIcon = "/icon.svg"
const premiumIcon = "/favicon-premium.svg"
const accountUpdatedEvent = "forgefit:account-updated"

function setFavicon(href: string) {
  const icon = document.querySelector<HTMLLinkElement>("link[data-forgefit-dynamic-icon='true']") ?? document.createElement("link")

  icon.rel = "icon"
  icon.type = "image/svg+xml"
  icon.sizes = "any"
  icon.href = href
  icon.dataset.forgefitDynamicIcon = "true"

  if (!icon.parentNode) document.head.appendChild(icon)
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
