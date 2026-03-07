'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  poster?: string
}

export function LazyVideo({ src, poster, className, ...props }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            if (src) {
              video.src = src as string
              video.load()
              setIsLoaded(true)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [src, isLoaded])

  return (
    <video
      ref={videoRef}
      poster={poster}
      className={className}
      preload="none"
      {...props}
    />
  )
}
