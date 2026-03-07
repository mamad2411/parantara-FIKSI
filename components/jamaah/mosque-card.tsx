// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { MapPin, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Mosque {
    id: string
    name: string
    location: string
    totalDonated: number
    lastDonation: string
    category: string
    verifiedColor: string
    initials: string
}

const myMosques: Mosque[] = [
    {
        id: "1",
        name: "Masjid Al-Ikhlas",
        location: "Jakarta Selatan",
        totalDonated: 125000,
        lastDonation: "28 Feb 2026",
        category: "Infaq & Sedekah",
        verifiedColor: "from-yellow-400 to-amber-500",
        initials: "AI",
    },
    {
        id: "2",
        name: "Masjid Al-Falah",
        location: "Bandung",
        totalDonated: 375000,
        lastDonation: "25 Feb 2026",
        category: "Zakat & Infaq",
        verifiedColor: "from-emerald-400 to-green-500",
        initials: "AF",
    },
    {
        id: "3",
        name: "Masjid Nurul Iman",
        location: "Surabaya",
        totalDonated: 75000,
        lastDonation: "20 Feb 2026",
        category: "Sedekah",
        verifiedColor: "from-blue-400 to-sky-500",
        initials: "NI",
    },
]

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 150 } },
}

export function MosqueCard() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-3"
        >
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Masjid Saya</h3>
                    <p className="text-xs text-gray-400">Masjid yang pernah Anda donasi</p>
                </div>
                <Link href="/jamaah/masjid" className="text-xs text-yellow-600 font-medium hover:underline flex items-center gap-1">
                    Lihat Semua <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {myMosques.map((mosque) => (
                <motion.div
                    key={mosque.id}
                    variants={cardVariants}
                    whileHover={{ y: -2, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12)" }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer group transition-all"
                >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mosque.verifiedColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
                        {mosque.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                            {mosque.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {mosque.location}
                        </p>
                        <p className="text-[10px] text-gray-300 mt-0.5">Terakhir: {mosque.lastDonation}</p>
                    </div>

                    {/* Total */}
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatRupiah(mosque.totalDonated)}</p>
                        <p className="text-[10px] text-gray-400">Total donasi</p>
                        <div className="flex items-center justify-end gap-0.5 mt-1">
                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                            <span className="text-[10px] text-gray-400">{mosque.category}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
