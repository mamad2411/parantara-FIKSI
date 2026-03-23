"use client"

// Global flag — set to true once ALL loading overlays have finished
// (both initial page load and nav transitions)

declare global {
  interface Window {
    __pageLoadingDone?: boolean
    __pageLoadingDoneListeners?: Array<() => void>
  }
}

export function markPageLoadingDone(): void {
  if (typeof window === "undefined") return
  window.__pageLoadingDone = true
  const listeners = window.__pageLoadingDoneListeners ?? []
  listeners.forEach((fn) => fn())
  window.__pageLoadingDoneListeners = []
}

export function resetPageLoadingDone(): void {
  if (typeof window === "undefined") return
  window.__pageLoadingDone = false
}

export function onPageLoadingDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  if (window.__pageLoadingDone) {
    cb()
    return () => {}
  }
  if (!window.__pageLoadingDoneListeners) window.__pageLoadingDoneListeners = []
  window.__pageLoadingDoneListeners.push(cb)
  return () => {
    window.__pageLoadingDoneListeners = (window.__pageLoadingDoneListeners ?? []).filter((f) => f !== cb)
  }
}
