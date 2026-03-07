"use client"

import { useRef, useState, useEffect } from "react"
import { useScroll, useMotionValueEvent } from "framer-motion"

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })
  
  // Responsive breakpoints
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Ukuran yang responsif untuk semua elemen
  const getDimensions = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          maxRadius: 120,
          imageSize: 'w-16 h-16',
          containerWidth: 'max-w-[280px]',
          textSize: 'text-lg',
          subTextSize: 'text-xs',
          spacing: 'gap-4'
        }
      case 'tablet':
        return {
          maxRadius: 200,
          imageSize: 'w-20 h-20',
          containerWidth: 'max-w-[380px]',
          textSize: 'text-xl',
          subTextSize: 'text-sm',
          spacing: 'gap-6'
        }
      default:
        return {
          maxRadius: 300,
          imageSize: 'w-24 h-24',
          containerWidth: 'max-w-[600px]',
          textSize: 'text-3xl',
          subTextSize: 'text-base',
          spacing: 'gap-8'
        }
    }
  }

  const dimensions = getDimensions()
  const [progress, setProgress] = useState(0)
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Smooth progression untuk mobile
    setProgress(latest)
  })
  
  const expandRadius = progress * dimensions.maxRadius

  // Fungsi untuk menghitung opacity dan scale berdasarkan progress
  const getTopStripStyle = () => {
    const startProgress = 0
    const endProgress = 0.3
    
    if (progress <= startProgress) {
      return { opacity: 0, scale: 0.8, stripScale: 0 }
    } else if (progress >= endProgress) {
      return { opacity: 1, scale: 1, stripScale: 1 }
    } else {
      const range = endProgress - startProgress
      const progressInRange = (progress - startProgress) / range
      return {
        opacity: progressInRange,
        scale: 0.8 + (progressInRange * 0.2),
        stripScale: Math.min(progressInRange * 3, 1)
      }
    }
  }

  const getBottomStripStyle = () => {
    const startProgress = 0.3
    const endProgress = 0.6
    
    if (progress <= startProgress) {
      return { opacity: 0, scale: 0.8, stripScale: 0 }
    } else if (progress >= endProgress) {
      return { opacity: 1, scale: 1, stripScale: 1 }
    } else {
      const range = endProgress - startProgress
      const progressInRange = (progress - startProgress) / range
      return {
        opacity: progressInRange,
        scale: 0.8 + (progressInRange * 0.2),
        stripScale: Math.min(progressInRange * 3, 1)
      }
    }
  }

  const getImageOpacity = (threshold: number) => {
    return progress > threshold ? 1 : Math.max(0, (progress - threshold + 0.05) * 20)
  }

  const getImageScale = (threshold: number) => {
    return progress > threshold ? 1 : Math.max(0, (progress - threshold + 0.05) * 10)
  }

  const topStyle = getTopStripStyle()
  const bottomStyle = getBottomStripStyle()

  return (
    <div ref={containerRef} className={`relative h-[300vh] bg-background `}>
      <div className="h-screen relative sticky top-0 px-4 py-12 overflow-hidden">
        {/* Wavy Background */}
        <div className="absolute inset-0 -z-10">
          {/* Top Wave */}
          <svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 1440 800" 
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <path 
              d="M0,0 C240,150 480,200 720,180 C960,160 1200,100 1440,150 L1440,0 L0,0 Z" 
              fill="url(#waveGradient)"
              opacity="0.9"
            />
          </svg>
          
          {/* Bottom Wave */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-full" 
            viewBox="0 0 1440 800" 
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FB923C" />
              </linearGradient>
            </defs>
            <path 
              d="M0,800 C240,650 480,600 720,620 C960,640 1200,700 1440,650 L1440,800 L0,800 Z" 
              fill="url(#waveGradient2)"
              opacity="0.9"
            />
          </svg>
        </div>
        {/* TRANSPARAN - Pojok Kanan Atas (Desktop) / Atas dengan jarak (Tablet) / Tengah (Mobile) */}
        <div 
          className="absolute top-8 right-8 lg:top-12 lg:right-16 
                     sm:top-[15%] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
                     md:top-[12%]
                     lg:left-auto lg:translate-x-0
                     overflow-visible w-[50vw] sm:w-[60vw] md:w-[55vw] lg:w-[25vw]"
          style={{
            opacity: topStyle.opacity,
            transform: `scale(${topStyle.scale}) translateX(${progress < 0.2 ? 50 : 0}px) translateY(${progress < 0.2 ? -30 : 0}px)`,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-3 sm:border-4 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl pointer-events-none z-20 shadow-lg"></div>
            
            {/* Animated Strip Background */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-2xl sm:rounded-3xl shadow-xl"
              style={{
                transform: `scaleX(${topStyle.stripScale})`,
                transformOrigin: 'left',
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            ></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 block drop-shadow-lg">
              TRANSPARAN
            </span>
          </div>
        </div>

        {/* Center Circle with Images */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`relative ${dimensions.containerWidth}`}>
          <div
            className={`w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
              progress > 0.6 ? "border-2 border-[#e9e9e9] dark:border-gray-700" : ""
            }`}
          >
            <div
              className={`w-[85%] aspect-square rounded-full flex items-center justify-center relative transition-all duration-300 ${
                progress > 0.2 ? "border-2 border-blue-100 dark:border-blue-800" : ""
              }`}
            >
              <div className="w-[80%] aspect-square rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 dark:from-blue-600 dark:via-cyan-600 dark:to-yellow-600 p-0.5 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full bg-[#ffffff] dark:bg-black flex items-center justify-center relative">
                  {/* Images in circle */}
                  {[
                    { angle: 0, threshold: 0.1, src: "/images/profil/profil1.webp", alt: "Profile 1" },
                    { angle: Math.PI / 4, threshold: 0.15, src: "/images/profil/profil2.webp", alt: "Profile 2" },
                    { angle: Math.PI / 2, threshold: 0.2, src: "/images/profil/profil3.webp", alt: "Profile 3" },
                    { angle: 3 * Math.PI / 4, threshold: 0.25, src: "/images/profil/profil4.webp", alt: "Profile 4" },
                    { angle: Math.PI, threshold: 0.3, src: "/images/profil/profil5.webp", alt: "Profile 5" },
                    { angle: 5 * Math.PI / 4, threshold: 0.35, src: "/images/profil/profil6.webp", alt: "Profile 6" },
                    { angle: 3 * Math.PI / 2, threshold: 0.4, src: "/images/profil/profil7.webp", alt: "Profile 7" },
                    { angle: 7 * Math.PI / 4, threshold: 0.45, src: "/images/profil/profil8.webp", alt: "Profile 8" }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`absolute ${dimensions.imageSize} rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg z-0`}
                      style={{
                        transform: `translate(${expandRadius * Math.cos(item.angle)}px, ${expandRadius * Math.sin(item.angle)}px) scale(${getImageScale(item.threshold)})`,
                        opacity: getImageOpacity(item.threshold),
                        transition: progress === 0 || progress === 1 ? 'all 0.5s ease-out' : 'none',
                      }}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Center Text */}
                  <div
                    className={`flex flex-col items-center justify-center relative z-20 px-4 transition-opacity duration-500 ${
                      progress > 0.5 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <h2 
                      className={`${dimensions.textSize} font-bold text-gray-800 dark:text-white text-center whitespace-nowrap`}
                      style={{
                        transform: `translateY(${progress > 0.6 ? 0 : 20}px)`,
                        opacity: progress > 0.6 ? 1 : Math.max(0, (progress - 0.55) * 20),
                        transition: progress === 0 || progress === 1 ? 'all 0.6s ease-out' : 'none',
                      }}
                    >
                      Transparansi Keuangan Masjid
                    </h2>

                    <p 
                      className={`${dimensions.subTextSize} text-gray-500 dark:text-gray-400 text-center max-w-[180px] sm:max-w-[240px] md:max-w-xs mt-2 sm:mt-3`}
                      style={{
                        transform: `translateY(${progress > 0.7 ? 0 : 20}px)`,
                        opacity: progress > 0.7 ? 1 : Math.max(0, (progress - 0.65) * 20),
                        transition: progress === 0 || progress === 1 ? 'all 0.6s ease-out 0.2s' : 'none',
                      }}
                    >
                      Laporan keuangan real-time, transparansi penuh, dan pengalaman yang menyenangkan di semua perangkat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* JUJUR - Pojok Kiri Bawah (Desktop) / Bawah dengan jarak (Tablet) / Tengah (Mobile) */}
        <div 
          className="absolute bottom-8 left-8 lg:bottom-12 lg:left-16
                     sm:bottom-[15%] sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
                     md:bottom-[12%]
                     lg:left-16 lg:translate-x-0
                     overflow-visible w-[50vw] sm:w-[60vw] md:w-[55vw] lg:w-[25vw]"
          style={{
            opacity: bottomStyle.opacity,
            transform: `scale(${bottomStyle.scale}) translateX(${progress < 0.4 ? -50 : 0}px) translateY(${progress < 0.4 ? 30 : 0}px)`,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-3 sm:border-4 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl pointer-events-none z-20 shadow-lg"></div>
            
            {/* Animated Strip Background */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-2xl sm:rounded-3xl shadow-xl"
              style={{
                transform: `scaleX(${bottomStyle.stripScale})`,
                transformOrigin: 'right',
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            ></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 block drop-shadow-lg">
              JUJUR
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}