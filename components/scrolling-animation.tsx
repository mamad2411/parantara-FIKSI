"use client"

import { useRef, useState, useEffect } from "react"
import { useScroll, useMotionValueEvent } from "framer-motion"

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })
  
  // Check if device is mobile or tablet - hide component if true
  const [isMobile, setIsMobile] = useState(true) // Default true for SSR
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
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
    <div ref={containerRef} className={`h-[180vh] bg-background ${isMobile ? 'hidden' : ''}`}>
      <div className="h-screen relative sticky top-0 px-4 py-12">
        {/* TRANSPARAN - Pojok Kanan Atas */}
        <div 
          className="absolute top-8 right-8 lg:top-12 lg:right-16 overflow-visible w-[40vw] sm:w-[35vw] md:w-[30vw] lg:w-[25vw]"
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
            <span className="relative z-10 font-bold text-center text-[6vw] sm:text-[5vw] md:text-[4vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 block drop-shadow-lg">
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
                    { angle: 0, threshold: 0.1, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 1" },
                    { angle: Math.PI / 4, threshold: 0.15, src: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 2" },
                    { angle: Math.PI / 2, threshold: 0.2, src: "https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 3" },
                    { angle: 3 * Math.PI / 4, threshold: 0.25, src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 4" },
                    { angle: Math.PI, threshold: 0.3, src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 5" },
                    { angle: 5 * Math.PI / 4, threshold: 0.35, src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 6" },
                    { angle: 3 * Math.PI / 2, threshold: 0.4, src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 7" },
                    { angle: 7 * Math.PI / 4, threshold: 0.45, src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0", alt: "Profile 8" }
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

        {/* JUJUR - Pojok Kiri Bawah */}
        <div 
          className="absolute bottom-8 left-8 lg:bottom-12 lg:left-16 overflow-visible w-[40vw] sm:w-[35vw] md:w-[30vw] lg:w-[25vw]"
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
            <span className="relative z-10 font-bold text-center text-[6vw] sm:text-[5vw] md:text-[4vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3 block drop-shadow-lg">
              JUJUR
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}