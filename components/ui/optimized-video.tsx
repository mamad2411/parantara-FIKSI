"use client"

import { useState, useRef, useEffect } from "react"

interface OptimizedVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  preload?: "none" | "metadata" | "auto"
  loading?: "lazy" | "eager"
}

export function OptimizedVideo({
  src,
  poster,
  className = "",
  autoPlay = false,
  muted = true,
  loop = false,
  playsInline = true,
  preload = "none",
  loading = "lazy"
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    // Only load video when it's near viewport and loading is lazy
    if (loading === "eager") {
      setShouldLoad(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { rootMargin: "100px" }
    )

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [loading])

  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Loading video...</div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        poster={poster}
        onLoadedData={handleLoadedData}
        preload={preload}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>
    </div>
  )
}