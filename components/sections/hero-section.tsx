"use client"

import { useEffect, useState, useRef } from "react"
import { AnimatedText } from "@/components/animations"
import { motion } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Force hardware acceleration
    video.style.transform = 'translateZ(0)'
    video.style.backfaceVisibility = 'hidden'

    // Defer video loading - only load when in viewport
    video.preload = 'none'
    video.playsInline = true

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.preload = 'auto'
          video.load()
          video.play().catch(err => console.log('Video autoplay prevented:', err))
          observer.disconnect()
        }
      })
    }, { threshold: 0.1 })

    observer.observe(video)

    // Simple loop
    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }

    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('ended', handleEnded)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    let rafId: number
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop
          const maxScroll = 400
          const progress = Math.min(scrollY / maxScroll, 1)
          setScrollProgress(progress)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  // Use only composited properties (transform + opacity) to avoid layout/paint
  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  // Replace height animation with scaleY (composited) + transform-origin top
  const scaleY = 1 - easeOutQuad(scrollProgress) * 0.375

  return (
    <section ref={sectionRef} className="pt-32 pb-12 px-6 min-h-screen flex items-center relative max-w-full">
      <div className="absolute inset-0 top-0 w-full overflow-hidden" style={{ contain: 'layout style paint' }}>
        <div
          className="w-full overflow-hidden relative"
          style={{
            // Only transform is composited - no height/borderRadius changes
            transform: `scale(${scale}) scaleY(${scaleY}) translate3d(0, 0, 0)`,
            borderRadius: `${borderRadius}px`,
            height: '100vh',
            transformOrigin: 'top center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          <video 
            ref={videoRef}
            autoPlay 
            loop
            muted 
            playsInline
            preload="none"
            className="w-full h-full object-cover"
            style={{
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
            }}
          >
            <source src="/vidio/vidio1.mp4" type="video/mp4" />
            <track kind="captions" srcLang="id" label="Indonesian" />
          </video>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center max-w-full"
        style={{
          transform: `translate3d(0, ${scrollProgress * 150}px, 0)`,
          opacity: 1 - scrollProgress * 0.8,
          height: "100%",
          willChange: 'transform, opacity',
          contain: 'layout style paint',
        }}
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
            scale: {
              type: "spring",
              damping: 15,
              stiffness: 100,
            }
          }}
          className="block font-bold text-[28vw] sm:text-[25vw] md:text-[22vw] lg:text-[20vw] tracking-tighter select-none text-center leading-none bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent max-w-full"
          style={{ marginBottom: "0", contain: 'layout style paint' }}
        >
          MASJID
        </motion.span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12 max-w-full">
          <div
            className={`transition-all duration-1000 delay-[800ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <h1 className="text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[6rem] 2xl:text-[7rem] font-normal leading-tight mb-6 w-full px-4 max-w-6xl mx-auto text-center" style={{ fontFamily: "'ArabicRamadan', serif" }}>
              <span className="inline-block whitespace-nowrap">
                <AnimatedText text="Transparansi" delay={0.3} />
              </span>
              {" "}
              <span className="inline-block">
                <AnimatedText text="Keuangan Masjid" delay={0.4} />
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div
              className={`relative w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] transition-opacity duration-1000 ease-out delay-500 opacity-100`}
            >
              <Image 
                src="/images/iphone.webp" 
                alt="DanaMasjid Mobile App" 
                width={350}
                height={688}
                sizes="(max-width: 768px) 200px, (max-width: 1024px) 250px, 350px"
                className="w-full h-auto relative z-10"
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}