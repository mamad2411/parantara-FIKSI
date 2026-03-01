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
    <div ref={containerRef} className="h-[40vh] bg-background">
      <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 sticky top-0">
        <div className="relative w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[600px]">
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
              <div className="w-[80%] aspect-square rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-600 dark:via-pink-600 dark:to-red-600 p-0.5 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full bg-[#ffffff] dark:bg-black flex items-center justify-center relative">
                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(0)}px, ${expandRadius * Math.sin(0)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 1"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 4)}px, ${expandRadius * Math.sin(Math.PI / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 2"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 2)}px, ${expandRadius * Math.sin(Math.PI / 2)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 3"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 4)}px, ${expandRadius * Math.sin((3 * Math.PI) / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 4"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI)}px, ${expandRadius * Math.sin(Math.PI)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 5"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((5 * Math.PI) / 4)}px, ${expandRadius * Math.sin((5 * Math.PI) / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 6"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 2)}px, ${expandRadius * Math.sin((3 * Math.PI) / 2)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 7"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 md:border-4 border-white dark:border-gray-800 shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((7 * Math.PI) / 4)}px, ${expandRadius * Math.sin((7 * Math.PI) / 4)}px)`,
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
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white text-center mb-1 sm:mb-2">Mudah</h1>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white text-center mb-2 sm:mb-3 md:mb-4">Untuk Semua Donatur</h1>

                    <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 text-center max-w-[200px] sm:max-w-xs md:max-w-sm">
                      Donasi transparan, laporan jelas, dan pengalaman yang menyenangkan di semua perangkat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
