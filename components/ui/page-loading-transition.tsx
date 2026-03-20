"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, Suspense } from "react"

declare global {
  interface Window {
    __pageLoadingPending?: boolean
    __pageLoadingShow?: () => void
    __pageLoadingHide?: () => void
  }
}

// PathWatcher: detects route change and hides overlay
function PathWatcher() {
  const pathname = usePathname()
  const prevRef = useRef(pathname)

  useEffect(() => {
    if (prevRef.current !== pathname) {
      prevRef.current = pathname
      window.__pageLoadingHide?.()
    }
  }, [pathname])

  return null
}

function Inner() {
  const [opacity, setOpacity] = useState(0)
  const [display, setDisplay] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isShowingRef = useRef(false)

  const clearAll = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (safetyRef.current) clearTimeout(safetyRef.current)
  }

  const showOverlay = () => {
    clearAll()
    isShowingRef.current = true
    setDisplay(true)
    // Small tick to allow display:block before opacity transition
    showTimerRef.current = setTimeout(() => setOpacity(1), 16)
    // Safety: auto-hide after 5s
    safetyRef.current = setTimeout(() => hideOverlay(), 5000)
  }

  const hideOverlay = () => {
    if (!isShowingRef.current) return
    clearAll()
    isShowingRef.current = false
    window.__pageLoadingPending = false
    setOpacity(0)
    // Remove from DOM after fade-out completes (300ms)
    hideTimerRef.current = setTimeout(() => setDisplay(false), 320)
  }

  useEffect(() => {
    window.__pageLoadingShow = showOverlay
    window.__pageLoadingHide = hideOverlay
    return () => {
      window.__pageLoadingShow = undefined
      window.__pageLoadingHide = undefined
    }
  })

  useEffect(() => {
    // Check if navigation was pending before mount
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type
    if (window.__pageLoadingPending && navType !== "navigate") {
      showOverlay()
    } else {
      window.__pageLoadingPending = false
    }
    return () => clearAll()
  }, []) // eslint-disable-line

  // Intercept <a> clicks for internal navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (!href || !href.startsWith("/") || href.startsWith("/#") || href.startsWith("/api")) return
      if (href === window.location.pathname) return
      showOverlay()
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, []) // eslint-disable-line

  // Listen for programmatic navigation events
  useEffect(() => {
    const onNavigate = () => showOverlay()
    window.addEventListener("page-navigate", onNavigate)
    return () => window.removeEventListener("page-navigate", onNavigate)
  }, []) // eslint-disable-line

  if (!display) return (
    <Suspense fallback={null}>
      <PathWatcher />
    </Suspense>
  )

  return (
    <>
      <Suspense fallback={null}>
        <PathWatcher />
      </Suspense>
      {/* Simple fade overlay — no Lottie, no heavy animations */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "white",
          opacity,
          transition: "opacity 280ms ease",
          pointerEvents: opacity > 0 ? "all" : "none",
        }}
      />
    </>
  )
}

export function PageLoadingTransition() {
  return <Inner />
}
