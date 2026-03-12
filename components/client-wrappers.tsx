"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { SimpleSpinner } from "@/components/ui/simple-spinner"

// Optimize dynamic imports with better chunking
const MarqueeLazy = dynamic(() => import("@/components/marquee"), {
  ssr: false,
  loading: () => <SimpleSpinner className="h-screen bg-white" />
})

const ScrollingAnimationLazy = dynamic(
  () => import("@/components/scrolling-animation").then(mod => ({ default: mod.HomePage })), 
  {
    ssr: false,
    loading: () => <SimpleSpinner className="min-h-screen bg-white" />
  }
)

export function Marquee() {
  return (
    <Suspense fallback={<SimpleSpinner className="h-screen bg-white" />}>
      <MarqueeLazy />
    </Suspense>
  )
}

export function ScrollingAnimation() {
  return (
    <Suspense fallback={<SimpleSpinner className="min-h-screen bg-white" />}>
      <ScrollingAnimationLazy />
    </Suspense>
  )
}
