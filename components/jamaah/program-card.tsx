// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { CalendarDays, Target, CheckCircle, Clock, Sparkles } from "lucide-react"
import type { Program } from "@/lib/types/masjid"

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const statusConfig = {
    active: { label: "Aktif", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Sparkles },
    completed: { label: "Selesai", color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: CheckCircle },
    upcoming: { label: "Akan Datang", color: "bg-blue-50 text-blue-600 border-blue-200", icon: Clock },
}

interface ProgramCardProps {
    programs: Program[]
}

export function ProgramCard({ programs }: ProgramCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Program</h3>
                <span className="text-xs text-zinc-400">{programs.length} program</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.map((program, i) => {
                    const progress = Math.min(100, Math.round((program.collected / program.target) * 100))
                    const status = statusConfig[program.status]
                    const StatusIcon = status.icon

                    return (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1, type: "spring", damping: 20, stiffness: 150 }}
                            whileHover={{ y: -3, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.1)" }}
                            className="bg-white rounded-2xl border border-zinc-200 p-5 group cursor-default"
                        >
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                </span>
                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    {new Date(program.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-base font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                                {program.title}
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{program.description}</p>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full ${progress >= 100
                                                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                                : "bg-gradient-to-r from-amber-400 to-yellow-500"
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Target Info */}
                            <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                    <Target className="w-3 h-3" />
                                    <span>Terkumpul: <span className="font-semibold text-zinc-800">{formatRupiah(program.collected)}</span></span>
                                </div>
                                <span className="text-xs text-zinc-400">
                                    Target: {formatRupiah(program.target)}
                                </span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
