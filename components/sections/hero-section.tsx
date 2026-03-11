"use client"
import { useEffect, useState, useRef } from "react"
import { AnimatedText } from "@/components/animations"
import Image from "next/image"
import { LazyVideo } from "@/components/ui/lazy-video"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Do not load the large hero MP4 in the critical path (Lighthouse).
    // Defer until after first render + idle time, and skip on save-data / 2g.
    const conn = (navigator as any).connection
    const saveData = Boolean(conn?.saveData)
    const slow = typeof conn?.effectiveType === "string" && /(^2g$|slow-2g)/.test(conn.effectiveType)
    if (saveData || slow) return

    const timeoutId = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        ;(window as any).requestIdleCallback(() => setShouldLoadVideo(true), { timeout: 3000 })
      } else {
        setShouldLoadVideo(true)
      }
    }, 1500)

    return () => window.clearTimeout(timeoutId)
  }, [])

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

  return (
    <section ref={sectionRef} className="pt-32 pb-12 px-6 min-h-screen flex items-center relative overflow-hidden max-w-full">
      <div className="absolute inset-0 top-0 max-w-full" style={{ contain: 'layout style paint' }}>
        <div
          className="w-full overflow-hidden relative"
          style={{
            transform: `scale(${scale}) translate3d(0, 0, 0)`,
            borderRadius: `${borderRadius}px`,
            height: "100vh",
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: 1000,
            WebkitPerspective: 1000,
            aspectRatio: '16/9',
            contain: 'layout style paint',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-yellow-50" />
          {shouldLoadVideo ? (
            <LazyVideo
              src="/vidio/vidio1.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : null}
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
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}