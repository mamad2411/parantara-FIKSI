"use client"

import { usePathname } from "next/navigation"
import { useEffect, useLayoutEffect, useState, useRef, Suspense } from "react"

declare global {
  interface Window {
    __pageLoadingPending?: boolean
    __pageLoadingShow?: () => void
    __pageLoadingHide?: () => void
  }
}

let _Lottie: any = null
let _animData: any = null
let _preloadPromise: Promise<void> | null = null

function preload() {
  if (_Lottie && _animData) return Promise.resolve()
  if (_preloadPromise) return _preloadPromise
  _preloadPromise = Promise.all([
    import("lottie-react"),
    fetch("/lotie-loading.json").then((r) => r.json()),
  ])
    .then(([mod, data]) => {
      _Lottie = mod.default
      _animData = data
    })
    .catch(() => {})
  return _preloadPromise
}

// PathWatcher: only this tiny component needs Suspense (uses usePathname)
function PathWatcher() {
  const pathname = usePathname()
  const prevRef = useRef(pathname)

  useEffect(() => {
    if (prevRef.current !== pathname) {
      prevRef.current = pathname
      if (typeof window.__pageLoadingHide === "function") {
        window.__pageLoadingHide()
      }
    }
  }, [pathname])

  return null
}

function Inner() {
  const [visible, setVisible] = useState(false)
  const [lottieReady, setLottieReady] = useState(false)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimeRef = useRef<number>(0)
  const isShowingRef = useRef(false)

  const showOverlay = () => {
    if (hideRef.current) clearTimeout(hideRef.current)
    if (safetyRef.current) clearTimeout(safetyRef.current)
    isShowingRef.current = true
    showTimeRef.current = Date.now()
    setVisible(true)
    if (!(_Lottie && _animData)) {
      preload().then(() => setLottieReady(true))
    }
    safetyRef.current = setTimeout(() => {
      isShowingRef.current = false
      window.__pageLoadingPending = false
      setVisible(false)
    }, 8000)
  }

  const hideOverlay = () => {
    if (!isShowingRef.current) return
    if (safetyRef.current) clearTimeout(safetyRef.current)
    window.__pageLoadingPending = false
    const elapsed = Date.now() - showTimeRef.current
    const delay = Math.max(0, 600 - elapsed)
    hideRef.current = setTimeout(() => {
      isShowingRef.current = false
      setVisible(false)
    }, delay)
  }

  // Register globals — useLayoutEffect runs synchronously after DOM paint
  // Inner is NOT inside Suspense so it never gets suspended/remounted during navigation
  useLayoutEffect(() => {
    window.__pageLoadingShow = showOverlay
    window.__pageLoadingHide = hideOverlay
    return () => {
      window.__pageLoadingShow = undefined
      window.__pageLoadingHide = undefined
    }
  })

  // Mount: preload lottie + check pending flag
  // Only show overlay if navigation was triggered programmatically (not on initial page load)
  useEffect(() => {
    // Client-only preload
    preload().then(() => setLottieReady(true))
    // Check if this is a real navigation (not initial load)
    // navigation.type === 'navigate' means user typed URL or opened new tab — skip overlay
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type
    if (window.__pageLoadingPending && navType !== "navigate") {
      showOverlay()
    } else {
      // Clear stale pending flag from previous session
      window.__pageLoadingPending = false
    }
  }, []) // eslint-disable-line

  // Fallback event listener
  useEffect(() => {
    const onNavigate = () => showOverlay()
    window.addEventListener("page-navigate", onNavigate)
    return () => window.removeEventListener("page-navigate", onNavigate)
  }, []) // eslint-disable-line

  // Intercept plain <a> clicks
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

  useEffect(
    () => () => {
      if (safetyRef.current) clearTimeout(safetyRef.current)
      if (hideRef.current) clearTimeout(hideRef.current)
    },
    []
  )

  return (
    <>
      {/* PathWatcher wrapped in Suspense — only this part suspends, Inner stays mounted */}
      <Suspense fallback={null}>
        <PathWatcher />
      </Suspense>

      {visible && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px]">
                {lottieReady && _Lottie && _animData ? (
                  <_Lottie
                    animationData={_animData}
                    loop
                    autoplay
                    rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-white text-lg font-semibold drop-shadow-lg">Memuat halaman...</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Inner is NOT wrapped in Suspense — stays mounted throughout navigation
// Only PathWatcher (inside Inner) uses Suspense
export function PageLoadingTransition() {
  return <Inner />
}
