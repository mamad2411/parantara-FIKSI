"use client"
import { useEffect, useState, useRef } from "react"
import { AnimatedText } from "@/components/animations"
import { OptimizedVideo } from "@/components/ui/optimized-video"
import Image from "next/image"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || videoLoaded) return

    let idleId: number | null = null
    let timeoutId: number | null = null

    const scheduleLoad = () => {
      if (typeof window === "undefined") return
      const w = window as Window &
        typeof globalThis & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
          cancelIdleCallback?: (id: number) => void
        }

      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setVideoLoaded(true), { timeout: 2500 })
      } else {
        timeoutId = window.setTimeout(() => setVideoLoaded(true), 1200)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            scheduleLoad()
            observer.disconnect()
            break
          }
        }
      },
      // Load after user actually sees hero (avoid early network during initial render)
      { threshold: 0.35, rootMargin: "0px" }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (idleId != null) {
        ;(window as Window &
          typeof globalThis & {
            cancelIdleCallback?: (id: number) => void
          }).cancelIdleCallback?.(idleId)
      }
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [videoLoaded])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoLoaded) return

    // Trigger fetch only after we intentionally "enable" video
    video.load()

    const play = () => {
      video.play().catch(() => {
        // ignore autoplay blocks
      })
    }

    if (video.readyState >= 3) play()
    else video.addEventListener("loadeddata", play, { once: true })

    return () => {
      video.pause()
    }
  }, [videoLoaded])

  useEffect(() => {
    let rafId: number
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY
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
      cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section ref={sectionRef} className="pt-32 pb-12 px-6 min-h-screen flex items-center relative overflow-hidden max-w-full">
      <div className="absolute inset-0 top-0 max-w-full" style={{ contain: 'layout style paint' }}>
        <div
          className="w-full overflow-hidden relative"
          style={{
            transform: `scale(${scale}) translate3d(0, 0, 0)`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: 1000,
            WebkitPerspective: 1000,
            aspectRatio: '16/9',
            contain: 'layout style paint',
          }}
        >
          {videoLoaded ? (
            <OptimizedVideo
              src="/vidio/vidio1.mp4"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fbbf24;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f59e0b;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
              className="w-full h-full object-cover"
              autoPlay={false}
              preload="none"
              loading="lazy"
              loop={true}
              muted={true}
              playsInline={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-yellow-50" />
          )}
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
        <span
          className="block font-bold text-[28vw] sm:text-[25vw] md:text-[22vw] lg:text-[20vw] tracking-tighter select-none text-center leading-none bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent max-w-full"
          style={{ 
            marginBottom: "0",
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
            transitionDelay: '200ms',
            contain: 'layout style paint',
          }}
        >
          MASJID
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12 max-w-full">
          <div
            className={`transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
          >
            <h1 className="font-serif text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[6rem] 2xl:text-[7rem] font-normal leading-tight mb-6 w-full px-4 max-w-6xl mx-auto text-center">
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
              className={`relative w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
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
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}