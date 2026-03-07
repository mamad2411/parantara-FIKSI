// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

const data = [
    { bulan: "Sep", donasi: 150000, target: 200000 },
    { bulan: "Okt", donasi: 275000, target: 250000 },
    { bulan: "Nov", donasi: 190000, target: 300000 },
    { bulan: "Des", donasi: 420000, target: 400000 },
    { bulan: "Jan", donasi: 310000, target: 350000 },
    { bulan: "Feb", donasi: 580000, target: 500000 },
]

const formatRupiah = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`
    return `Rp ${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 min-w-36">
                <p className="text-xs text-gray-500 mb-2 font-medium">{label} 2025</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs text-gray-500">{p.name}:</span>
                        <span className="text-xs font-semibold text-gray-900">{formatRupiah(p.value)}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function DonationChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Tren Donasi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">6 bulan terakhir</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-0.5 bg-yellow-400 rounded-full inline-block" /> Realisasi
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-0.5 bg-blue-300 rounded-full inline-block" /> Target
                    </span>
                </div>
            </div>

            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorDonasi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="bulan"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatRupiah}
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="target"
                            name="Target"
                            stroke="#93c5fd"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            fill="url(#colorTarget)"
                            dot={false}
                            activeDot={{ r: 4, fill: "#93c5fd", strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="donasi"
                            name="Donasi"
                            stroke="#fbbf24"
                            strokeWidth={2.5}
                            fill="url(#colorDonasi)"
                            dot={false}
                            activeDot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fef3c7" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span>Total Periode: <span className="font-semibold text-gray-700">Rp 1,93jt</span></span>
                <span className="text-emerald-500 font-medium">↑ 87% dari periode sebelumnya</span>
            </div>
        </motion.div>
    )
}
