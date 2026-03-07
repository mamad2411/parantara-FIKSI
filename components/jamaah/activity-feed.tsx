// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { Heart, Building2, CheckCircle, Clock, XCircle, Zap } from "lucide-react"

interface Activity {
    id: string
    type: "donation_success" | "donation_pending" | "donation_failed" | "mosque_verified" | "badge_earned"
    title: string
    description: string
    time: string
    amount?: number
}

const activities: Activity[] = [
    {
        id: "1",
        type: "donation_success",
        title: "Donasi Berhasil",
        description: "Donasi ke Masjid Al-Ikhlas berhasil diproses",
        time: "2 menit lalu",
        amount: 50000,
    },
    {
        id: "2",
        type: "donation_success",
        title: "Donasi Berhasil",
        description: "Zakat ke Masjid Al-Falah diterima",
        time: "3 hari lalu",
        amount: 100000,
    },
    {
        id: "3",
        type: "mosque_verified",
        title: "Masjid Terverifikasi",
        description: "Masjid Nurul Iman kini terverifikasi oleh DanaMasjid",
        time: "5 hari lalu",
    },
    {
        id: "4",
        type: "badge_earned",
        title: "Badge Baru! 🏆",
        description: "Anda mendapatkan badge \"Dermawan Setia\" atas konsistensi donasi",
        time: "1 minggu lalu",
    },
    {
        id: "5",
        type: "donation_pending",
        title: "Menunggu Konfirmasi",
        description: "Donasi ke Masjid Al-Hidayah sedang diverifikasi",
        time: "2 minggu lalu",
        amount: 200000,
    },
    {
        id: "6",
        type: "donation_failed",
        title: "Donasi Gagal",
        description: "Transaksi ke Masjid Al-Amin tidak berhasil",
        time: "3 minggu lalu",
        amount: 50000,
    },
]

const typeConfig = {
    donation_success: {
        icon: CheckCircle,
        iconClass: "text-emerald-600",
        bgClass: "bg-emerald-50",
        dotClass: "bg-emerald-400",
    },
    donation_pending: {
        icon: Clock,
        iconClass: "text-yellow-600",
        bgClass: "bg-yellow-50",
        dotClass: "bg-yellow-400",
    },
    donation_failed: {
        icon: XCircle,
        iconClass: "text-red-500",
        bgClass: "bg-red-50",
        dotClass: "bg-red-400",
    },
    mosque_verified: {
        icon: Building2,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        dotClass: "bg-blue-400",
    },
    badge_earned: {
        icon: Zap,
        iconClass: "text-purple-600",
        bgClass: "bg-purple-50",
        dotClass: "bg-purple-400",
    },
}

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 20, stiffness: 150 } },
}

export function ActivityFeed() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Aktivitas Terbaru</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Riwayat aktivitas Anda</p>
                </div>
                <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                {/* Timeline line */}
                <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gray-100" />

                <div className="space-y-1">
                    {activities.map((activity, i) => {
                        const config = typeConfig[activity.type]
                        const Icon = config.icon
                        return (
                            <motion.div
                                key={activity.id}
                                variants={itemVariants}
                                whileHover={{ x: 2 }}
                                className="flex gap-3.5 pl-1 pr-1 py-2.5 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-default"
                            >
                                {/* Icon dot */}
                                <div className={`relative z-10 w-9 h-9 rounded-xl ${config.bgClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Icon className={`w-4 h-4 ${config.iconClass}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">{activity.title}</p>
                                        {activity.amount && (
                                            <span className="text-xs font-bold text-gray-700 whitespace-nowrap flex-shrink-0">
                                                {formatRupiah(activity.amount)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.description}</p>
                                    <p className="text-[10px] text-gray-300 mt-1">{activity.time}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            <div className="mt-3 pt-3 border-t border-gray-50 text-center">
                <button className="text-xs text-yellow-600 font-medium hover:underline">
                    Lihat semua aktivitas →
                </button>
            </div>
        </motion.div>
    )
}
