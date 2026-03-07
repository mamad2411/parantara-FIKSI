// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: number
    prefix?: string
    suffix?: string
    change?: number
    trend?: "up" | "down" | "neutral"
    icon: LucideIcon
    color: "yellow" | "green" | "blue" | "purple" | "rose"
    delay?: number
}

const colorMap = {
    yellow: {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-100",
        iconBg: "from-yellow-400 to-amber-500",
        badge: "bg-yellow-100 text-yellow-700",
        text: "text-yellow-600",
    },
    green: {
        bg: "from-emerald-50 to-green-50",
        border: "border-emerald-100",
        iconBg: "from-emerald-400 to-green-500",
        badge: "bg-emerald-100 text-emerald-700",
        text: "text-emerald-600",
    },
    blue: {
        bg: "from-blue-50 to-sky-50",
        border: "border-blue-100",
        iconBg: "from-blue-400 to-sky-500",
        badge: "bg-blue-100 text-blue-700",
        text: "text-blue-600",
    },
    purple: {
        bg: "from-purple-50 to-violet-50",
        border: "border-purple-100",
        iconBg: "from-purple-400 to-violet-500",
        badge: "bg-purple-100 text-purple-700",
        text: "text-purple-600",
    },
    rose: {
        bg: "from-rose-50 to-pink-50",
        border: "border-rose-100",
        iconBg: "from-rose-400 to-pink-500",
        badge: "bg-rose-100 text-rose-700",
        text: "text-rose-600",
    },
}

export function StatsCard({
    title,
    value,
    prefix = "",
    suffix = "",
    change,
    trend = "neutral",
    icon: Icon,
    color = "yellow",
    delay = 0,
}: StatsCardProps) {
    const colors = colorMap[color]

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
    const trendColor =
        trend === "up"
            ? "text-emerald-600 bg-emerald-50"
            : trend === "down"
                ? "text-red-500 bg-red-50"
                : "text-gray-500 bg-gray-50"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 150, delay }}
            whileHover={{
                y: -4,
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.12)",
            }}
            className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-5 overflow-hidden group cursor-default`}
        >
            {/* Decorative circle */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/40 blur-xl group-hover:blur-2xl transition-all duration-500" />

            <div className="flex items-start justify-between relative">
                {/* Icon */}
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-md`}
                >
                    <Icon className="w-5 h-5 text-white" />
                </motion.div>

                {/* Trend Badge */}
                {change !== undefined && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: delay + 0.3 }}
                        className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColor}`}
                    >
                        <TrendIcon className="w-3 h-3" />
                        {change > 0 ? "+" : ""}{change}%
                    </motion.span>
                )}
            </div>

            <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <div className={`text-2xl font-bold text-gray-900 flex items-baseline gap-1`}>
                    {prefix && <span className="text-base text-gray-500">{prefix}</span>}
                    <NumberFlow
                        value={value}
                        format={
                            prefix === "Rp"
                                ? { style: "decimal", maximumFractionDigits: 0, notation: "compact" }
                                : { style: "decimal", maximumFractionDigits: 0 }
                        }
                        className="tabular-nums"
                    />
                    {suffix && <span className="text-sm text-gray-500 font-medium">{suffix}</span>}
                </div>
                {change !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
                        {Math.abs(change)}% dari bulan lalu
                    </p>
                )}
            </div>
        </motion.div>
    )
}
