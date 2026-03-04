"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

export function BerkahStatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [textAnimationComplete, setTextAnimationComplete] = useState(false)

  const stats = [
    { label: "Donasi Umum", value: "Rp 22.663.582", percentage: 46.7, color: "#3B82F6" },
    { label: "Zakat", value: "Rp 11.995.744", percentage: 1.0, color: "#10B981" },
    { label: "Infaq", value: "Rp 58.749.283", percentage: 8.0, color: "#8B5CF6" },
    { label: "Sedekah", value: "Rp 28.249.643", percentage: 27, color: "#F59E0B" },
  ]

  const totalDonasi = "Rp 103.658.252"
  const totalPercentage = "+46.7%"

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          
          {/* Left Side - BERKAH Text */}
          <div className="relative">
            {/* BERKAH Text with Strip Animation */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* BER Text */}
                <div className="relative inline-block">
                  <motion.h2 
                    className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-black leading-none text-blue-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    BER
                  </motion.h2>
                  
                  {/* Animated Strip for BER */}
                  <motion.div
                    className="absolute bottom-2 sm:bottom-4 left-0 right-0 h-4 sm:h-6 md:h-8 bg-blue-600 rounded-sm"
                    style={{ zIndex: -1 }}
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                  />
                </div>

                {/* KAH Text */}
                <div className="relative inline-block">
                  <motion.h2 
                    className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-black leading-none text-yellow-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    KAH
                  </motion.h2>
                  
                  {/* Animated Strip for KAH */}
                  <motion.div
                    className="absolute bottom-2 sm:bottom-4 left-0 right-0 h-4 sm:h-6 md:h-8 bg-yellow-500 rounded-sm"
                    style={{ zIndex: -1 }}
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
                    onAnimationComplete={() => setTextAnimationComplete(true)}
                  />
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="text-lg md:text-xl text-slate-600 mt-6 max-w-md"
              >
                Transparansi penuh dalam setiap donasi yang masuk untuk kemakmuran masjid
              </motion.p>
            </div>
          </div>

          {/* Right Side - Chart (Only show on desktop after text animation completes) */}
          <div className="hidden md:block">
            {textAnimationComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  {/* Total Donasi Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">Total Donasi</span>
                      <span className="text-sm font-semibold text-green-600">{totalPercentage}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{totalDonasi}</h3>
                    <p className="text-sm text-slate-500 mt-1">Kuartal Ini</p>
                  </div>

                  {/* Donut Chart */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-64 h-64">
                      {/* SVG Donut Chart */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="12"
                        />
                        
                        {/* Animated Segments */}
                        {stats.map((stat, index) => {
                          const previousPercentages = stats.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)
                          const circumference = 2 * Math.PI * 40
                          const offset = (previousPercentages / 100) * circumference
                          const dashArray = `${(stat.percentage / 100) * circumference} ${circumference}`
                          
                          return (
                            <motion.circle
                              key={stat.label}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={stat.color}
                              strokeWidth="12"
                              strokeDasharray={dashArray}
                              strokeDashoffset={-offset}
                              strokeLinecap="round"
                              initial={{ strokeDasharray: `0 ${circumference}` }}
                              animate={{ strokeDasharray: dashArray }}
                              transition={{ duration: 1, delay: 0.3 + index * 0.2, ease: "easeOut" }}
                            />
                          )
                        })}
                      </svg>

                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Stats List */}
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: stat.color }}
                          />
                          <span className="text-sm text-slate-700">{stat.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900">{stat.value}</div>
                          <div className="text-xs text-slate-500">{stat.percentage}%</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              // Placeholder to maintain layout
              <div className="h-[600px]" />
            )}
          </div>

          {/* Mobile Chart (Show immediately without waiting for text animation) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:hidden"
          >
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              {/* Total Donasi Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Total Donasi</span>
                  <span className="text-sm font-semibold text-green-600">{totalPercentage}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{totalDonasi}</h3>
                <p className="text-sm text-slate-500 mt-1">Kuartal Ini</p>
              </div>

              {/* Stats List (Mobile) */}
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="text-sm text-slate-700">{stat.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.percentage}%</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
