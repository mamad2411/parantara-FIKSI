"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const stats = [
  { label: "Donasi Umum", value: "Rp 21.188.729", percentage: 23, color: "#3B82F6" },
  { label: "Zakat",        value: "Rp 26.018.385", percentage: 28, color: "#10B981" },
  { label: "Infaq",        value: "Rp 34.055.082", percentage: 37, color: "#8B5CF6" },
  { label: "Sedekah",      value: "Rp 11.374.620", percentage: 12, color: "#F59E0B" },
]

const TOTAL = "Rp 92.636.816"
const GROWTH = "+21.6%"

// Pre-compute donut segments (no motion.circle — pure CSS stroke-dasharray)
const R = 40
const CIRC = 2 * Math.PI * R

function DonutChart({ inView }: { inView: boolean }) {
  let offset = 0
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#F1F5F9" strokeWidth="12" />
        {stats.map((s) => {
          const dash = (s.percentage / 100) * CIRC
          const gap  = CIRC - dash
          const off  = -offset
          offset += dash
          return (
            <circle
              key={s.label}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={inView ? `${dash} ${gap}` : `0 ${CIRC}`}
              strokeDashoffset={off}
              style={{ transition: inView ? "stroke-dasharray 0.8s ease" : "none" }}
            />
          )
        })}
      </svg>
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function StatsList() {
  return (
    <div className="space-y-4 mt-6">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-slate-700">{s.label}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500">{s.percentage}%</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function BerkahStatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — BERKAH text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* BER */}
            <div className="relative inline-block">
              <h2 className="text-[120px] md:text-[160px] lg:text-[200px] font-black leading-none text-blue-600">
                BER
              </h2>
              <div
                className="absolute bottom-4 left-0 h-8 bg-blue-600"
                style={{
                  width: isInView ? "100%" : "0%",
                  transition: isInView ? "width 0.7s 0.3s ease-in-out" : "none",
                }}
              />
            </div>

            {/* KAH */}
            <div className="relative inline-block">
              <h2 className="text-[120px] md:text-[160px] lg:text-[200px] font-black leading-none text-yellow-500">
                KAH
              </h2>
              <div
                className="absolute bottom-4 left-0 h-8 bg-yellow-500"
                style={{
                  width: isInView ? "100%" : "0%",
                  transition: isInView ? "width 0.7s 0.5s ease-in-out" : "none",
                }}
              />
            </div>

            <p className="text-lg md:text-xl text-slate-600 mt-6 max-w-md"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "none" : "translateY(8px)",
                transition: isInView ? "opacity 0.5s 0.7s, transform 0.5s 0.7s" : "none",
              }}
            >
              Transparansi penuh dalam setiap donasi yang masuk untuk kemakmuran masjid
            </p>
          </motion.div>

          {/* Right — Chart card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-500">Total Donasi</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{TOTAL}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Kuartal Ini</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{GROWTH}</span>
              </div>

              <DonutChart inView={isInView} />
              <StatsList />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
