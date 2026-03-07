// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun } from "lucide-react"

interface PrayerTimesData {
    imsak: string
    subuh: string
    terbit: string
    dhuha: string
    dzuhur: string
    ashar: string
    maghrib: string
    isya: string
}

interface PrayerTimesDisplayProps {
    cityName: string
    prayerTimes: PrayerTimesData | null
    loading: boolean
}

const prayerConfig = [
    { key: "imsak", label: "Imsak", icon: Moon, color: "from-indigo-500 to-blue-600" },
    { key: "subuh", label: "Subuh", icon: Sunrise, color: "from-sky-400 to-blue-500" },
    { key: "terbit", label: "Terbit", icon: Sun, color: "from-amber-400 to-orange-500" },
    { key: "dhuha", label: "Dhuha", icon: CloudSun, color: "from-yellow-400 to-amber-500" },
    { key: "dzuhur", label: "Dzuhur", icon: Sun, color: "from-yellow-500 to-orange-500" },
    { key: "ashar", label: "Ashar", icon: Sunset, color: "from-orange-400 to-red-500" },
    { key: "maghrib", label: "Maghrib", icon: Sunset, color: "from-rose-400 to-pink-600" },
    { key: "isya", label: "Isya", icon: Moon, color: "from-purple-500 to-indigo-600" },
]

function isCurrentPrayer(current: string, next: string | null, nowMinutes: number): boolean {
    if (!current) return false
    const [ch, cm] = current.split(":").map(Number)
    const currentMin = ch * 60 + cm

    if (!next) return nowMinutes >= currentMin

    const [nh, nm] = next.split(":").map(Number)
    const nextMin = nh * 60 + nm
    return nowMinutes >= currentMin && nowMinutes < nextMin
}

export function PrayerTimesDisplay({ cityName, prayerTimes, loading }: PrayerTimesDisplayProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(interval)
    }, [])

    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-zinc-100 rounded animate-pulse" />
                    <div className="w-40 h-5 bg-zinc-100 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-20 bg-zinc-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </motion.div>
        )
    }

    if (!prayerTimes) return null

    // Ensure prayerTimes has values before accessing them
    const prayerTimeValues = prayerConfig.map(p => {
        return prayerTimes[p.key as keyof PrayerTimesData] || "00:00"
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.15 }}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-base font-bold text-zinc-900">Jadwal Sholat</h3>
                    <span className="text-xs text-zinc-400 hidden sm:inline">— {cityName}</span>
                </div>
                <span className="text-xs text-zinc-400">
                    {now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </span>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
                {prayerConfig.map((prayer, i) => {
                    const time = prayerTimeValues[i]
                    const nextTime = i < prayerTimeValues.length - 1 ? prayerTimeValues[i + 1] : null
                    const active = isCurrentPrayer(time, nextTime, nowMinutes)
                    const Icon = prayer.icon

                    return (
                        <motion.div
                            key={prayer.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.05 }}
                            className={`relative rounded-xl p-3 text-center transition-all overflow-hidden ${active
                                    ? "bg-gradient-to-br " + prayer.color + " text-white shadow-lg scale-105 z-10"
                                    : "bg-zinc-50 text-zinc-600 border border-zinc-100 hover:bg-zinc-100"
                                }`}
                        >
                            {active && (
                                <motion.div
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/10 rounded-xl"
                                />
                            )}
                            <Icon className={`w-4 h-4 mx-auto mb-1.5 ${active ? "text-white" : "text-zinc-400"}`} />
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${active ? "text-white/90" : "text-zinc-500"}`}>
                                {prayer.label}
                            </p>
                            <p className={`text-sm font-bold ${active ? "text-white" : "text-zinc-900"}`}>
                                {time}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
