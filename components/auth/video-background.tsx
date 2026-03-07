"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface VideoBackgroundProps {
  videoSrc: string
  posterSrc?: string
  className?: string
}

export function VideoBackground({ videoSrc, posterSrc, className = '' }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    // Only load video on desktop and good connection
    const isDesktop = window.innerWidth >= 1024
    const connection = (navigator as any).connection
    const isGoodConnection = !connection || connection.effectiveType === '4g'
    
    if (isDesktop && isGoodConnection) {
      // Delay video load to prioritize LCP
      const timer = setTimeout(() => {
        setShouldLoadVideo(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!shouldLoadVideo) return
    
    const video = videoRef.current
    if (!video) return

    // Force play on mount
    const playVideo = async () => {
      try {
        // Set video properties for better performance
        video.playbackRate = 1
        video.defaultPlaybackRate = 1
        
        // Try to play
        await video.play()
        setIsLoaded(true)
      } catch (error) {
        console.warn('Video autoplay failed:', error)
        setHasError(true)
      }
    }

    // Wait for video to be ready
    if (video.readyState >= 3) {
      playVideo()
    } else {
      video.addEventListener('canplay', playVideo, { once: true })
    }

    // Handle errors
    const handleError = () => {
      console.error('Video loading error')
      setHasError(true)
    }
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('error', handleError)
    }
  }, [shouldLoadVideo])

  return (
    <>
      {/* Fallback background - always show poster */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600"
        style={{
          backgroundImage: posterSrc ? `url(${posterSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Video Background - only on desktop with good connection */}
      {shouldLoadVideo && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`absolute inset-0 w-full h-full ${className}`}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster={posterSrc}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </motion.div>
      )}

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-sky-900/30 to-cyan-900/40 backdrop-blur-[2px]"
      />
    </>
  )
}

