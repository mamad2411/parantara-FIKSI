"use client"

import { ArrowUpRight, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import { AnimatedSection } from "@/components/animations/animated-section"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Counter hook
function useCountUp(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, hasStarted])

  return { 
    value: hasStarted ? count + suffix : "0" + suffix, 
    start: () => setHasStarted(true), 
    hasStarted 
  }
}

// Lazy load AnimatedRevenueChart karena menggunakan framer-motion
const AnimatedRevenueChart = dynamic(() => import("@/components/charts").then(mod => ({ default: mod.AnimatedRevenueChart })), {
  ssr: false,
  loading: () => <div className="w-full max-w-md mx-auto h-96 bg-gray-100 animate-pulse rounded-3xl" />
})

export function CTASection() {
  const router = useRouter()
  const donatur = useCountUp(50, 2500, "K+")
  const masjid = useCountUp(15, 2800, "K+")
  const laporan = useCountUp(120, 3000, "M+")

  const startCounters = () => {
    setTimeout(() => donatur.start(), 300)
    setTimeout(() => masjid.start(), 500)
    setTimeout(() => laporan.start(), 700)
  }
  return (
    <AnimatedSection animation="slideUp" className="py-16 md:py-32 pt-32 md:pt-48 lg:pt-32 px-6 relative max-w-full">
      <div className="absolute top-4 lg:inset-0 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0 max-w-full overflow-hidden">
        {/* Mobile Version */}
        <div className="lg:hidden text-[18vw] font-bold font-sans tracking-tighter leading-none whitespace-nowrap px-4" suppressHydrationWarning>
          <span className="relative inline-block">
            <span className="relative z-10 text-white px-1">BER</span>
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 -z-0 rounded-lg"
              style={{ transformOrigin: "left" }}
            />
          </span>
          <span className="relative inline-block">
            <span className="relative z-10 text-white px-1">KAH</span>
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 -z-0 rounded-lg"
              style={{ transformOrigin: "left" }}
            />
          </span>
        </div>

        {/* Desktop Version - Improved Design */}
        <div className="hidden lg:flex w-full h-full items-center justify-between px-[8%] max-w-full" suppressHydrationWarning>
          {/* Left Side - BER with blue background */}
          <div className="relative">
            <span className="relative inline-block">
              <span className="relative z-10 text-white text-[18vw] font-bold font-sans tracking-tighter leading-none px-8">
                BER
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 -z-0 rounded-2xl shadow-2xl"
                style={{ transformOrigin: "left" }}
              />
            </span>
          </div>

          {/* Right Side - KAH with yellow background */}
          <div className="relative">
            <span className="relative inline-block">
              <span className="relative z-10 text-white text-[18vw] font-bold font-sans tracking-tighter leading-none px-8">
                KAH
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 -z-0 rounded-2xl shadow-2xl"
                style={{ transformOrigin: "left" }}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50, skewY: 5 }}
            whileInView={{ opacity: 1, y: 0, skewY: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 120 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-normal leading-tight max-w-4xl mx-auto mb-6 font-serif"
          >
            Siap untuk berdonasi dengan amanah?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Bergabunglah dengan ribuan donatur dan pengurus masjid yang mempercayai DanaMasjid untuk transaksi donasi mereka.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 150 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login?redirect=/daftar-masjid&type=daftar-masjid&message=Login+dulu+sebelum+daftarkan+masjid+Anda')}
              className="relative flex items-center justify-center gap-0 bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden"
            >
              <span className="text-sm pr-4">Daftarkan Masjid</span>
              <span className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-foreground" />
              </span>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden"
            >
              <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
              <span className="text-sm text-foreground group-hover:text-background pr-4 relative z-10 transition-colors duration-300">
                Mulai Berdonasi
              </span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight className="w-4 h-4 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
                <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <AnimatedRevenueChart />
        </motion.div>

        <motion.div 
          id="cta-stats"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-16"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            onViewportEnter={() => !donatur.hasStarted && startCounters()}
            className="text-center"
          >
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">{donatur.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Donatur</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">{masjid.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Masjid Terdaftar</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">Rp {laporan.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Laporan Dipublikasikan</p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
