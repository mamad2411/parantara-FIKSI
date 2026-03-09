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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer - only load when visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Load video on all devices with good connection
    const connection = (navigator as any).connection
    const isGoodConnection = !connection || connection.effectiveType === '4g' || connection.effectiveType === '3g'
    
    if (isGoodConnection) {
      // Delay video load slightly to prioritize initial render
      const timer = setTimeout(() => {
        setShouldLoadVideo(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      // On slow connection, still show after longer delay
      const timer = setTimeout(() => {
        setShouldLoadVideo(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

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
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {/* Fallback background - always show poster */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600"
        style={{
          backgroundImage: posterSrc ? `url(${posterSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Video Background - on all devices */}
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
            preload="metadata"
            poster={posterSrc}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              // Hardware acceleration
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
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
    </div>
  )
}

