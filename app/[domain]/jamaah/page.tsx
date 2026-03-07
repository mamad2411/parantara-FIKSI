// @ts-nocheck
"use client"

import { use, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import { getMosqueByDomain } from "@/lib/services/masjid-service"
import { PrayerCountdown } from "@/components/jamaah/prayer-countdown"
import { PrayerTimesDisplay } from "@/components/jamaah/prayer-times-display"
import { MosqueHeader } from "@/components/jamaah/mosque-header"
import { FinancialSummary } from "@/components/jamaah/financial-summary"
import { FinancialTable } from "@/components/jamaah/financial-table"
import { ProgramCard } from "@/components/jamaah/program-card"
import { ScheduleCard } from "@/components/jamaah/schedule-card"
import { DonationQR } from "@/components/jamaah/donation-qr"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 150 } },
}

export default function MosqueDetailPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params)
    const mosque = getMosqueByDomain(domain)

    const [prayerTimes, setPrayerTimes] = useState<any>(null)
    const [prayerLoading, setPrayerLoading] = useState(true)

    useEffect(() => {
        async function fetchPrayerTimes() {
            if (!mosque?.cityId) {
                setPrayerLoading(false)
                return
            }
            try {
                const today = new Date()
                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

                const res = await fetch(`/api/sholat?cityId=${mosque.cityId}&date=${dateStr}`)
                if (!res.ok) throw new Error("Fetch failed")
                const json = await res.json()

                if (json.status && json.data?.jadwal) {
                    setPrayerTimes(json.data.jadwal)
                }
            } catch (e) {
                console.error("Failed to fetch prayer times:", e)
            } finally {
                setPrayerLoading(false)
            }
        }
        fetchPrayerTimes()
    }, [mosque])

    if (!mosque) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
                <Building2 className="w-20 h-20 text-zinc-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Masjid Tidak Ditemukan</h1>
                <p className="text-zinc-500 mb-6">Masjid dengan domain &ldquo;{domain}&rdquo; tidak terdaftar.</p>
                <Link
                    href="/masjid"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Masjid
                </Link>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8"
        >
            {/* Back link */}
            <motion.div variants={fadeUp}>
                <Link
                    href="/masjid"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors group w-fit"
                >
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: -3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Masjid</span>
                    </motion.div>
                </Link>
            </motion.div>

            {/* LED Prayer Countdown */}
            <motion.div variants={fadeUp}>
                <PrayerCountdown
                    cityName={mosque.cityName}
                    prayerTimes={prayerTimes}
                    loading={prayerLoading}
                />
            </motion.div>

            {/* Mosque Profile Header */}
            <motion.div variants={fadeUp}>
                <MosqueHeader profile={mosque.profile} />
            </motion.div>

            {/* Prayer Times Display Grid */}
            <motion.div variants={fadeUp}>
                <PrayerTimesDisplay
                    cityName={mosque.cityName}
                    prayerTimes={prayerTimes}
                    loading={prayerLoading}
                />
            </motion.div>

            {/* Financial Summary Cards */}
            <motion.div variants={fadeUp}>
                <FinancialSummary
                    saldoAwal={mosque.financial.currentWeek.saldoAwal}
                    pemasukan={mosque.financial.currentWeek.pemasukan}
                    pengeluaran={mosque.financial.currentWeek.pengeluaran}
                    saldoAkhir={mosque.financial.currentWeek.saldoAkhir}
                    period="Pekan Ini"
                    domain={domain}
                />
            </motion.div>

            {/* Financial Detail Table */}
            <motion.div variants={fadeUp}>
                <FinancialTable monthly={mosque.financial.monthly} />
            </motion.div>

            {/* Programs & Schedule Grid */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProgramCard programs={mosque.programs} />
                <ScheduleCard schedules={mosque.schedules} />
            </motion.div>

            {/* Donation QR */}
            <motion.div variants={fadeUp}>
                <DonationQR donation={mosque.donation} mosqueName={mosque.profile.name} />
            </motion.div>

            {/* Bottom padding */}
            <div className="h-8" />
        </motion.div>
    )
}
