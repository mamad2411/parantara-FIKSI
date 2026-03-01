"use client"
import { useEffect, useState, useRef } from "react"
import { AnimatedText } from "@/components/animations"
import { motion } from "framer-motion"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

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
    
    // Optimize video loading
    video.preload = 'auto'
    video.playsInline = true
    
    // Ensure video starts from beginning
    video.currentTime = 0
    
    // Play video immediately when loaded
    const playVideo = () => {
      video.play().catch(err => console.log('Video autoplay prevented:', err))
    }
    
    if (video.readyState >= 3) {
      playVideo()
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true })
    }

    // Simple loop without reverse (much smoother)
    const handleEnded = () => {
      video.currentTime = 0
      video.play()
    }

    video.addEventListener('ended', handleEnded)
    
    return () => {
      video.removeEventListener('ended', handleEnded)
    }
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
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section className="pt-32 pb-12 px-6 min-h-screen flex items-center relative overflow-hidden max-w-full">
      <div className="absolute inset-0 top-0 max-w-full">
        <div
          className="w-full overflow-hidden"
          style={{
            transform: `scale(${scale}) translate3d(0, 0, 0)`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: 1000,
            WebkitPerspective: 1000,
          }}
        >
          <video 
            ref={videoRef}
            autoPlay 
            loop
            muted 
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
              backfaceVisibility: 'hidden',
            }}
          >
            <source src="/vidio/vidio1.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-[5] flex items-end justify-center max-w-full"
        style={{
          transform: `translateY(${scrollProgress * 150}px)`,
          opacity: 1 - scrollProgress * 0.8,
          height: "100%",
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
          style={{ marginBottom: "0" }}
        >
          MASJID
        </motion.span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12 max-w-full">
          <div
            className={`transition-all duration-1000 delay-[800ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <h1 className="font-serif text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] xl:text-[7.5rem] 2xl:text-[8.5rem] font-normal leading-[1.25] sm:leading-tight mb-6 w-full px-6 max-w-6xl mx-auto text-center">
              <AnimatedText text="Transparansi Keuangan Masjid" delay={0.3} />
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div
              className={`relative w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] will-change-transform transition-all duration-[1500ms] ease-out delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
              }`}
            >
              <img src="/images/iphone.webp" alt="DanaMasjid Mobile App" className="w-full h-auto relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}