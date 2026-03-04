"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface BookProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface BookPageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  pageNumber?: number
}

const Book = React.forwardRef<HTMLDivElement, BookProps>(
  ({ className, children, ...props }, ref) => {
    const [currentPage, setCurrentPage] = React.useState(0)
    const [isMobile, setIsMobile] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [direction, setDirection] = React.useState<'next' | 'prev'>('next')
    const pages = React.Children.toArray(children)
    const totalPages = pages.length

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const nextPage = () => {
      if (isAnimating) return
      if (currentPage < totalPages - 1) {
        setDirection('next')
        setIsAnimating(true)
        setCurrentPage(currentPage + 1)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }

    const prevPage = () => {
      if (isAnimating) return
      if (currentPage > 0) {
        setDirection('prev')
        setIsAnimating(true)
        setCurrentPage(currentPage - 1)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }

    // Enhanced page flip animation - more visible paper effect
    const pageFlipVariants = {
      initial: (dir: 'next' | 'prev') => ({
        rotateY: dir === 'next' ? 180 : -180,
        opacity: 0,
        x: dir === 'next' ? 100 : -100,
      }),
      animate: {
        rotateY: 0,
        opacity: 1,
        x: 0,
      },
      exit: (dir: 'next' | 'prev') => ({
        rotateY: dir === 'next' ? -180 : 180,
        opacity: 0,
        x: dir === 'next' ? -100 : 100,
      }),
    }

    const pageTransition = {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    }

    return (
      <div
        ref={ref}
        className={cn("relative w-full max-w-5xl mx-auto", className)}
        style={{ perspective: "2500px" }}
        {...props}
      >
        {/* Logo DanaMasjid - Top Center */}
        <div className="absolute -top-12 sm:-top-14 md:-top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <Image
              src="/images/logo/DanaMasjid.webp"
              alt="DanaMasjid Logo"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-amber-900 drop-shadow-md">
            DanaMasjid
          </span>
        </div>

        <div className="relative bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 rounded-lg md:rounded-2xl overflow-visible border-2 md:border-4 border-amber-900/30"
          style={{
            boxShadow: `
              0 20px 60px -10px rgba(0, 0, 0, 0.3),
              0 10px 30px -5px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `,
            transform: 'rotateX(2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none rounded-lg md:rounded-2xl" />
          
          {/* Book Spine Effect - Hidden on mobile */}
          {!isMobile && (
            <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-transparent z-10 shadow-inner" />
          )}
          
          {/* Pages Container */}
          <div className={cn(
            "relative flex overflow-hidden",
            isMobile ? "min-h-[500px]" : "min-h-[600px] lg:min-h-[700px]"
          )}>
            {/* Mobile: Single Page View with Animation */}
            {isMobile ? (
              <div className="w-full relative" style={{ transformStyle: "preserve-3d" }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentPage}
                    custom={direction}
                    variants={pageFlipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                    className="w-full p-4 sm:p-6 overflow-y-auto absolute inset-0 bg-amber-50/80 backdrop-blur-sm"
                    style={{ 
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {pages[currentPage]}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <>
                {/* Desktop: Two Page Spread with Flip Animation */}
                {/* Left Page */}
                <div className="w-1/2 relative" style={{ transformStyle: "preserve-3d" }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    {currentPage > 0 && (
                      <motion.div
                        key={`left-${currentPage - 1}`}
                        custom={direction}
                        variants={pageFlipVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                        className="p-4 md:p-6 lg:p-8 overflow-y-auto absolute inset-0 bg-amber-50/90 backdrop-blur-sm"
                        style={{ 
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "hidden",
                          transformOrigin: "right center",
                          boxShadow: `
                            -5px 0 15px rgba(0, 0, 0, 0.1),
                            inset 2px 0 5px rgba(0, 0, 0, 0.05)
                          `,
                        }}
                      >
                        {pages[currentPage - 1]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Page */}
                <div className="w-1/2 relative border-l-2 border-amber-900/20" style={{ transformStyle: "preserve-3d" }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={`right-${currentPage}`}
                      custom={direction}
                      variants={pageFlipVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                      className="p-4 md:p-6 lg:p-8 overflow-y-auto absolute inset-0 bg-amber-50/90 backdrop-blur-sm"
                      style={{ 
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        transformOrigin: "left center",
                        boxShadow: `
                          5px 0 15px rgba(0, 0, 0, 0.1),
                          inset -2px 0 5px rgba(0, 0, 0, 0.05)
                        `,
                      }}
                    >
                      {pages[currentPage]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-0 right-0 flex justify-between items-center px-3 sm:px-4 md:px-8 z-20">
            <motion.button
              onClick={prevPage}
              disabled={currentPage === 0 || isAnimating}
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 transition-all touch-manipulation shadow-lg border border-amber-300",
                (currentPage === 0 || isAnimating) && "opacity-30 cursor-not-allowed"
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900" />
            </motion.button>

            <motion.span 
              className="text-xs sm:text-sm text-amber-900 font-bold px-3 py-1.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full shadow-md border border-amber-300"
              key={currentPage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage + 1} / {totalPages}
            </motion.span>

            <motion.button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1 || isAnimating}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 transition-all touch-manipulation shadow-lg border border-amber-300",
                (currentPage === totalPages - 1 || isAnimating) && "opacity-30 cursor-not-allowed"
              )}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900" />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }
)
Book.displayName = "Book"

const BookPage = React.forwardRef<HTMLDivElement, BookPageProps>(
  ({ className, children, pageNumber, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "prose prose-xs sm:prose-sm md:prose max-w-none text-amber-950 h-full relative",
          "[&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:md:text-3xl [&_h1]:lg:text-4xl",
          "[&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl",
          "[&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:md:text-xl",
          "[&_h4]:text-sm [&_h4]:sm:text-base [&_h4]:md:text-lg",
          "[&_p]:text-xs [&_p]:sm:text-sm [&_p]:md:text-base",
          "[&_li]:text-xs [&_li]:sm:text-sm [&_li]:md:text-base",
          "[&_ul]:my-2 [&_ul]:sm:my-3 [&_ul]:md:my-4",
          "[&_p]:my-2 [&_p]:sm:my-3 [&_p]:md:my-4",
          className
        )}
        {...props}
      >
        {/* Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64">
            <Image
              src="/images/logo/DanaMasjid.webp"
              alt="DanaMasjid Watermark"
              fill
              className="object-contain"
              priority={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {pageNumber && (
          <div className="relative z-10 text-center text-[10px] sm:text-xs text-amber-700 mt-4 sm:mt-6 md:mt-8 font-medium">
            {pageNumber}
          </div>
        )}
      </div>
    )
  }
)
BookPage.displayName = "BookPage"

export { Book, BookPage }
