// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { Wallet, ArrowDownLeft, ArrowUpRight, Landmark, Eye } from "lucide-react"
import Link from "next/link"

interface FinancialSummaryProps {
    saldoAwal: number
    pemasukan: number
    pengeluaran: number
    saldoAkhir: number
    period?: string
    domain?: string
}

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const cards = [
    { key: "saldoAwal", label: "Saldo Awal", sublabel: "Saldo per awal periode", icon: Wallet, color: "from-zinc-50 to-gray-50", borderColor: "border-zinc-200", textColor: "text-zinc-700" },
    { key: "pemasukan", label: "Pemasukan", sublabel: "Pemasukan hingga hari ini", icon: ArrowDownLeft, color: "from-emerald-50 to-green-50", borderColor: "border-emerald-200", textColor: "text-emerald-600" },
    { key: "pengeluaran", label: "Pengeluaran", sublabel: "Pengeluaran hingga hari ini", icon: ArrowUpRight, color: "from-red-50 to-rose-50", borderColor: "border-red-200", textColor: "text-red-500" },
    { key: "saldoAkhir", label: "Saldo Akhir", sublabel: "Saldo hari ini (terkini)", icon: Landmark, color: "from-amber-50 to-yellow-50", borderColor: "border-amber-200", textColor: "text-amber-600" },
]

export function FinancialSummary({
    saldoAwal,
    pemasukan,
    pengeluaran,
    saldoAkhir,
    period = "Pekan Ini",
    domain,
}: FinancialSummaryProps) {
    const values: Record<string, number> = { saldoAwal, pemasukan, pengeluaran, saldoAkhir }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-zinc-900">Laporan {period}</h3>
                    <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        Operasional Masjid
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08, type: "spring", damping: 20, stiffness: 150 }}
                        whileHover={{ y: -3, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.1)" }}
                        className={`bg-gradient-to-br ${card.color} rounded-2xl border ${card.borderColor} p-5 relative overflow-hidden group cursor-default`}
                    >
                        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/30 blur-xl" />

                        <div className="flex items-center justify-between relative">
                            <div>
                                <p className="text-sm font-semibold text-zinc-700">{card.label}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{card.sublabel}</p>
                            </div>
                        </div>

                        <div className="mt-3">
                            <span className={`text-2xl font-bold ${card.textColor}`}>
                                <span className="text-base text-zinc-400 font-normal">Rp </span>
                                <NumberFlow
                                    value={values[card.key]}
                                    format={{ style: "decimal", maximumFractionDigits: 0 }}
                                    className="tabular-nums"
                                />
                            </span>
                            <p className="text-[10px] text-zinc-300 mt-1">{formatRupiah(values[card.key])}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
