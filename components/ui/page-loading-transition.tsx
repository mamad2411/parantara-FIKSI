"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useCallback, Suspense, lazy } from "react"
import { markPageLoadingDone } from "@/lib/page-loading-done"

// Lazy load Lottie only when needed
const LottieLoading = lazy(() => 
  import("@/components/ui/lottie-loading").then(mod => ({ default: mod.LottieLoading }))
)

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
      // Don't show loading for dashboard-admin routes
      if (!pathname.startsWith("/dashboard-admin")) {
        onHide()
      }
    }
  }, [pathname, onHide])

  return null
}

// Beautiful optimized spinner with mosque theme - Golden version
function SimpleSpinner() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Outer rotating ring */}
      <div className="relative w-24 h-24">
        {/* Outer golden ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-spin" 
             style={{ 
               borderTopColor: '#F59E0B',
               borderRightColor: '#FBBF24',
               animationDuration: '1.2s'
             }}>
        </div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 animate-pulse"
             style={{ animationDuration: '1.5s' }}>
        </div>
        
        {/* Center mosque image - smaller */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <img 
            src="/images/loading/mosque.webp" 
            alt="Mosque"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      </div>
      
      {/* Loading text with gradient */}
      <div className="text-center space-y-1">
        <div className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Memuat...
        </div>
        <div className="text-sm text-gray-500 animate-pulse">
          Mohon tunggu sebentar
        </div>
      </div>
    </div>
  )
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
        transition: fading ? "opacity 300ms ease" : "none", // Changed from 100ms to 300ms
        pointerEvents: fading ? "none" : "all",
        willChange: fading ? "opacity" : "auto",
      }}
    >
      {/* Lottie with optimized spinner fallback */}
      <Suspense fallback={<SimpleSpinner />}>
        <LottieLoading className="flex flex-col items-center gap-3" />
      </Suspense>
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
    // Minimal display time - ensure loading animation is visible
    const remaining = Math.max(0, 800 - elapsed) // Changed from 100ms to 800ms

    timerRef.current = setTimeout(() => {
      setFading(true)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setFading(false)
        markPageLoadingDone()
      }, 300) // Changed from 100ms to 300ms for smoother fade
    }, remaining)
  }, [clearTimers])

  const showOverlay = useCallback(() => {
    clearTimers()
    
    // Reset loading done state when showing overlay
    if (typeof window !== "undefined") {
      window.__pageLoadingDone = false
    }
    
    isShowingRef.current = true
    showStartRef.current = Date.now()
    setFading(false)
    setVisible(true)
    // Safety timeout - ensure loading doesn't hang
    safetyRef.current = setTimeout(() => hideOverlay(), 3000) // Changed from 1500ms to 3000ms
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

  // Intercept <a> clicks - exclude dashboard-admin routes
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (!href || !href.startsWith("/") || href.startsWith("/#") || href.startsWith("/api")) return
      if (href === window.location.pathname) return
      // Skip loading animation for dashboard-admin routes
      if (href.startsWith("/dashboard-admin")) return
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
