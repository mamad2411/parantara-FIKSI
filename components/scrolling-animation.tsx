"use client"

import { useRef, useState, useEffect } from "react"
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion"

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })

  const animationProgress = useTransform(scrollYProgress, [0, 1], [0, 1])
  
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

  // Expand radius responsif berdasarkan ukuran layar
  const maxRadiusMobile = 120
  const maxRadiusTablet = 180
  const maxRadiusDesktop = 300

  const [progress, setProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v))
  
  const getMaxRadius = () => {
    switch (screenSize) {
      case 'mobile': return maxRadiusMobile
      case 'tablet': return maxRadiusTablet
      default: return maxRadiusDesktop
    }
  }
  
  const expandRadius = progress * getMaxRadius()

  return (
    <div ref={containerRef} className="h-[200vh] bg-background">
      <div className="h-screen flex flex-col items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 sticky top-0 px-4">
        {/* Horizonta with Strip Animation - Top */}
        <div 
          className="overflow-visible relative w-full max-w-[85vw] sm:max-w-[75vw] md:max-w-[65vw] lg:max-w-[60vw] flex justify-center"
          style={{
            opacity: progress > 0.2 ? 1 : 0,
            transform: `scale(${progress > 0.2 ? 1 : 0.8})`,
            transition: 'all 0.8s ease-out',
          }}
        >
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-3xl pointer-events-none z-20"></div>
            
            {/* Animated Strip Background - Kuning solid */}
            <div 
              className="absolute inset-0 bg-yellow-400 rounded-3xl"
              style={{
                transform: `scaleX(${Math.min(progress * 2.5, 1)})`,
                transformOrigin: 'left',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            ></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 block">
              TRANSPARAN
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] lg:max-w-[600px]">
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
                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(0)}px, ${expandRadius * Math.sin(0)}px) scale(${progress > 0.1 ? 1 : 0})`,
                      opacity: progress > 0.1 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 1"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 4)}px, ${expandRadius * Math.sin(Math.PI / 4)}px) scale(${progress > 0.15 ? 1 : 0})`,
                      opacity: progress > 0.15 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 2"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 2)}px, ${expandRadius * Math.sin(Math.PI / 2)}px) scale(${progress > 0.2 ? 1 : 0})`,
                      opacity: progress > 0.2 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 3"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 4)}px, ${expandRadius * Math.sin((3 * Math.PI) / 4)}px) scale(${progress > 0.25 ? 1 : 0})`,
                      opacity: progress > 0.25 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 4"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI)}px, ${expandRadius * Math.sin(Math.PI)}px) scale(${progress > 0.3 ? 1 : 0})`,
                      opacity: progress > 0.3 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 5"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((5 * Math.PI) / 4)}px, ${expandRadius * Math.sin((5 * Math.PI) / 4)}px) scale(${progress > 0.35 ? 1 : 0})`,
                      opacity: progress > 0.35 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 6"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 2)}px, ${expandRadius * Math.sin((3 * Math.PI) / 2)}px) scale(${progress > 0.4 ? 1 : 0})`,
                      opacity: progress > 0.4 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 7"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-500 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((7 * Math.PI) / 4)}px, ${expandRadius * Math.sin((7 * Math.PI) / 4)}px) scale(${progress > 0.45 ? 1 : 0})`,
                      opacity: progress > 0.45 ? 1 : 0,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 8"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className={`flex flex-col items-center justify-center relative z-20 transition-opacity duration-500 px-4 ${
                      progress > 0.5 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <h1 
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center mb-1"
                      style={{
                        transform: `translateY(${progress > 0.6 ? 0 : 20}px)`,
                        opacity: progress > 0.6 ? 1 : 0,
                        transition: 'all 0.6s ease-out',
                      }}
                    >
                      Transparan
                    </h1>
                    <h1 
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center mb-2 sm:mb-3"
                      style={{
                        transform: `translateY(${progress > 0.65 ? 0 : 20}px)`,
                        opacity: progress > 0.65 ? 1 : 0,
                        transition: 'all 0.6s ease-out 0.1s',
                      }}
                    >
                      Untuk Semua Jamaah
                    </h1>

                    <p 
                      className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center max-w-[180px] sm:max-w-[240px] md:max-w-xs"
                      style={{
                        transform: `translateY(${progress > 0.7 ? 0 : 20}px)`,
                        opacity: progress > 0.7 ? 1 : 0,
                        transition: 'all 0.6s ease-out 0.2s',
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

        {/* Bottom with Strip Animation */}
        <div 
          className="overflow-visible relative w-full max-w-[85vw] sm:max-w-[75vw] md:max-w-[65vw] lg:max-w-[60vw] flex justify-center"
          style={{
            opacity: progress > 0.3 ? 1 : 0,
            transform: `scale(${progress > 0.3 ? 1 : 0.8})`,
            transition: 'all 0.8s ease-out 0.2s',
          }}
        >
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-3xl pointer-events-none z-20"></div>
            
            {/* Animated Strip Background - Biru solid (sama dengan features section) */}
            <div 
              className="absolute inset-0 bg-blue-500 rounded-3xl"
              style={{
                transform: `scaleX(${Math.min((progress - 0.2) * 2.5, 1)})`,
                transformOrigin: 'right',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            ></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 block">
              JUJUR
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
