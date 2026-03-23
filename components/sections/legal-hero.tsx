"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { useState } from "react"
import { useSubscribe } from "@/lib/hooks/use-subscribe"

interface LegalHeroProps {
  title: string
  subtitle?: string
  description: string
  variant?: "privacy" | "terms"
  stats?: {
    label: string
    value: string
  }[]
}

export function LegalHero({ title, subtitle, description, variant = "privacy", stats }: LegalHeroProps) {
  // Color schemes based on variant
  const colors = {
    privacy: {
      bg: "from-blue-900 via-blue-800 to-indigo-900",
      accent: "text-blue-300",
      button: "bg-white text-blue-900 hover:bg-blue-50",
      statValue: "text-white",
      decorative1: "bg-white/30",
      decorative2: "bg-white/20",
    },
    terms: {
      bg: "from-blue-900 via-blue-800 to-indigo-900",
      accent: "text-blue-300",
      button: "bg-white text-blue-900 hover:bg-blue-50",
      statValue: "text-white",
      decorative1: "bg-white/30",
      decorative2: "bg-white/20",
    }
  }

  const theme = colors[variant]

  const [email, setEmail] = useState("")
  const subscribeMutation = useSubscribe()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await subscribeMutation.mutateAsync({ email })

      if (result.success) {
        setEmail("")
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  const message = subscribeMutation.isSuccess 
    ? "Email berhasil dikirim! Silakan cek inbox Anda."
    : subscribeMutation.isError
    ? `❌ ${subscribeMutation.error?.message || "Gagal mengirim email. Silakan coba lagi."}`
    : ""

  return (
    <section className={`relative bg-gradient-to-br ${theme.bg} text-white overflow-hidden`}>
      {/* Background Pattern - Yellow dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #fbbf24 2px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center lg:text-left pt-16 md:pt-20 lg:pt-0"
          >
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${theme.accent} font-medium mb-4 uppercase tracking-wider text-xs md:text-sm`}
              >
                {subtitle}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 text-sm md:text-base lg:text-lg mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {description}
            </motion.p>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6 md:gap-8 justify-center lg:justify-start"
              >
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className={`text-2xl md:text-3xl lg:text-4xl font-bold ${theme.statValue} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Email Subscribe Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl">
                {/* Email Form */}
                <form onSubmit={handleSubscribe}>
                  <div className="bg-white has-[input:focus]:ring-blue-500 relative grid grid-cols-[1fr_auto] items-center rounded-lg border border-gray-200 pr-1.5 has-[input:focus]:ring-2">
                    <Mail className="text-gray-400 pointer-events-none absolute inset-y-0 left-4 my-auto size-5" />

                    <input
                      placeholder="Belum Punya Akun? mari Daftarin dengan email"
                      className="h-14 w-full bg-transparent pl-12 pr-4 focus:outline-none text-gray-900 text-base"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={subscribeMutation.isPending}
                    />

                    <div className="pr-1">
                      <button
                        type="submit"
                        aria-label="subscribe"
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                        disabled={subscribeMutation.isPending}
                      >
                        {subscribeMutation.isPending ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:block">Mengirim...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:block">Kirim</span>
                            <Mail className="relative mx-auto size-5 sm:hidden" strokeWidth={2} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 text-sm ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}
                    >
                      {message}
                    </motion.p>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image - Grid Collage */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            {/* Grid of images */}
            <div className="grid grid-cols-2 gap-3 h-full">
              {/* Left column - 3 images stacked */}
              <div className="grid grid-rows-3 gap-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white"
                >
                  <Image
                    src="/images/privacy/Frame1.webp"
                    alt="Frame 1"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white"
                >
                  <Image
                    src="/images/privacy/Frame2.webp"
                    alt="Frame 2"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white"
                >
                  <Image
                    src="/images/privacy/Frame3.webp"
                    alt="Frame 3"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </div>
              
              {/* Right column - 2 images (top small, bottom large) */}
              <div className="grid grid-rows-2 gap-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white"
                >
                  <Image
                    src="/images/privacy/Frame4.webp"
                    alt="Frame 4"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl row-span-1 bg-white"
                >
                  <Image
                    src="/images/privacy/Frame5.webp"
                    alt="Frame 5"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Decorative dots pattern overlay */}
            <div className="absolute -top-4 -right-4 w-32 h-32 opacity-20">
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 -mb-px">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" stroke="none" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>
    </section>
  )
}
