"use client"

import { useEffect, useRef } from "react"
import { AnimatedText } from "@/components/animations"
import Image from "next/image"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const masjidRef = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.style.transform = 'translateZ(0)'
    video.style.backfaceVisibility = 'hidden'
    video.preload = 'none'
    video.playsInline = true

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        video.preload = 'auto'
        video.load()
        video.play().catch(() => {})
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(video)

    const handleEnded = () => { video.currentTime = 0; video.play() }
    video.addEventListener('ended', handleEnded)
    return () => { video.removeEventListener('ended', handleEnded); observer.disconnect() }
  }, [])

  useEffect(() => {
    const masjid = masjidRef.current
    const videoWrap = videoWrapRef.current
    if (!masjid || !videoWrap) return

    const handleScroll = () => {
      const scrollY = window.pageYOffset
      const progress = Math.min(scrollY / 400, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      // Direct DOM mutation — zero React re-renders
      videoWrap.style.borderRadius = `${ease * 48}px`
      masjid.style.transform = `translate3d(0, ${progress * 150}px, 0)`
      masjid.style.opacity = `${1 - progress * 0.8}`
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="pt-32 pb-12 px-6 min-h-screen flex items-center relative max-w-full">
      {/* Video background */}
      <div className="absolute inset-0 top-0 w-full overflow-hidden">
        <div
          ref={videoWrapRef}
          className="w-full overflow-hidden relative"
          style={{ height: '100vh', backfaceVisibility: 'hidden' }}
        >
          <video
            ref={videoRef}
            autoPlay loop muted playsInline preload="none"
            className="w-full h-full object-cover"
            style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
          >
            <source src="/vidio/vidio1.mp4" type="video/mp4" />
            <track kind="captions" srcLang="id" label="Indonesian" />
          </video>
        </div>
      </div>

      {/* MASJID text — CSS animation, no framer-motion */}
      <div
        ref={masjidRef}
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center"
        style={{ height: "100%" }}
      >
        <span
          className="block font-bold text-[28vw] sm:text-[25vw] md:text-[22vw] lg:text-[20vw] tracking-tighter select-none text-center leading-none bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent max-w-full"
          style={{
            animation: "heroMasjidIn 0.8s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          MASJID
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12 max-w-full">
          <div>
            <h1
              className="text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[6rem] 2xl:text-[7rem] font-normal leading-tight mb-6 w-full px-4 max-w-6xl mx-auto text-center"
              style={{ fontFamily: "'ArabicRamadan', serif" }}
            >
              <span className="inline-block whitespace-nowrap">
                <AnimatedText text="Transparansi" delay={0} />
              </span>
              {" "}
              <span className="inline-block">
                <AnimatedText text="Keuangan Masjid" delay={0.1} />
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px]">
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

      <style>{`
        @keyframes heroMasjidIn {
          from { opacity: 0; transform: translateY(60px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  )
}