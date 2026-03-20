"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useCallback, Suspense } from "react"

import { LottieLoading } from "@/components/ui/lottie-loading"

declare global {
  interface Window {
    __pageLoadingPending?: boolean
    __pageLoadingShow?: () => void
    __pageLoadingHide?: () => void
  }
}

function PathWatcher({ onHide }: { onHide: () => void }) {
  const pathname = usePathname()
  const prevRef = useRef(pathname)

  useEffect(() => {
    if (prevRef.current !== pathname) {
      prevRef.current = pathname
      onHide()
    }
  }, [pathname, onHide])

  return null
}

function LottieOverlay({ fading }: { fading: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 300ms ease" : "none",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <LottieLoading className="flex items-center justify-center" />
    </div>
  )
}

function Inner() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const isShowingRef = useRef(false)
  const showStartRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (safetyRef.current) clearTimeout(safetyRef.current)
  }, [])

  const hideOverlay = useCallback(() => {
    if (!isShowingRef.current) return
    clearTimers()
    isShowingRef.current = false
    window.__pageLoadingPending = false

    const elapsed = Date.now() - showStartRef.current
    const remaining = Math.max(0, 400 - elapsed)

    timerRef.current = setTimeout(() => {
      setFading(true)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setFading(false)
      }, 300)
    }, remaining)
  }, [clearTimers])

  const showOverlay = useCallback(() => {
    clearTimers()
    isShowingRef.current = true
    showStartRef.current = Date.now()
    setFading(false)
    setVisible(true)
    safetyRef.current = setTimeout(() => hideOverlay(), 5000)
  }, [clearTimers, hideOverlay])

  useEffect(() => {
    window.__pageLoadingShow = showOverlay
    window.__pageLoadingHide = hideOverlay
  }, [showOverlay, hideOverlay])

  useEffect(() => {
    if (window.__pageLoadingPending) {
      showOverlay()
    } else {
      window.__pageLoadingPending = false
    }

    const onNavigate = () => showOverlay()
    window.addEventListener("page-navigate", onNavigate)

    return () => {
      clearTimers()
      window.removeEventListener("page-navigate", onNavigate)
      window.__pageLoadingShow = undefined
      window.__pageLoadingHide = undefined
    }
  }, [showOverlay, clearTimers])

  // Intercept <a> clicks
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
  }, [showOverlay])

  return (
    <>
      <Suspense fallback={null}>
        <PathWatcher onHide={hideOverlay} />
      </Suspense>
      {visible && <LottieOverlay fading={fading} />}
    </>
  )
}

export function PageLoadingTransition() {
  return <Inner />
}
