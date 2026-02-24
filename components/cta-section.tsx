"use client"

import { ArrowUpRight, ArrowRight } from "lucide-react"
import { AnimatedRevenueChart } from "./animated-revenue-chart"
import { motion } from "framer-motion"

export function CTASection() {
  return (
    <section className="py-16 md:py-32 pt-32 md:pt-48 lg:pt-32 px-6 relative overflow-hidden max-w-full">
      <div className="absolute top-4 lg:inset-0 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0 max-w-full overflow-hidden">
        {/* Mobile Version */}
        <div className="lg:hidden text-[20vw] font-bold font-sans tracking-tighter leading-none whitespace-nowrap" suppressHydrationWarning>
          <span className="relative inline-block">
            <span className="relative z-10 text-white px-2">BER</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 -z-0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </span>
          <span className="relative inline-block">
            <span className="relative z-10 text-white px-2">KAH</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 -z-0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
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
                className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 -z-0 rounded-2xl shadow-2xl"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
                className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 -z-0 rounded-2xl shadow-2xl"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-normal leading-tight max-w-4xl mx-auto mb-6 font-serif">
            Siap untuk berdonasi dengan amanah?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Bergabunglah dengan ribuan donatur dan pengurus masjid yang mempercayai DanaMasjid untuk transaksi donasi mereka.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="relative flex items-center justify-center gap-0 bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
              <span className="text-sm pr-4">Daftarkan Masjid</span>
              <span className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-foreground" />
              </span>
            </button>

            <button className="relative flex items-center justify-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
              <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
              <span className="text-sm text-foreground group-hover:text-background pr-4 relative z-10 transition-colors duration-300">
                Mulai Berdonasi
              </span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight className="w-4 h-4 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
                <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <AnimatedRevenueChart />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-16">
          <div className="text-center">
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">50K+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Donatur</p>
          </div>
          <div className="text-center">
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">15K+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Masjid Terdaftar</p>
          </div>
          <div className="text-center">
            <p className="text-7xl md:text-5xl lg:text-7xl font-light text-foreground">Rp 120M+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Donasi</p>
          </div>
        </div>
      </div>
    </section>
  )
}
