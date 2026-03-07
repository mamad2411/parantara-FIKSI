// @ts-nocheck
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import type { MonthlyFinancial } from "@/lib/types/masjid"

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

type SortField = "date" | "amount" | "description"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 8

interface FinancialTableProps {
    monthly: MonthlyFinancial[]
}

export function FinancialTable({ monthly }: FinancialTableProps) {
    const [selectedMonth, setSelectedMonth] = useState(0) // index into monthly array
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortDir, setSortDir] = useState<SortDir>("desc")
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState<string>("Semua")

    const currentMonth = monthly[selectedMonth]
    if (!currentMonth) return null

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
        else { setSortField(field); setSortDir("desc") }
    }

    const filtered = filter === "Semua"
        ? currentMonth.details
        : currentMonth.details.filter(d => d.type === filter.toLowerCase())

    const sorted = [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortField === "date") cmp = a.date.localeCompare(b.date)
        else if (sortField === "amount") cmp = a.amount - b.amount
        else cmp = a.description.localeCompare(b.description)
        return sortDir === "asc" ? cmp : -cmp
    })

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="inline-flex flex-col ml-1">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${sortField === field && sortDir === "asc" ? "text-amber-500" : "text-gray-300"}`} />
            <ChevronDown className={`w-2.5 h-2.5 ${sortField === field && sortDir === "desc" ? "text-amber-500" : "text-gray-300"}`} />
        </span>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.4 }}
            id="laporan"
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-zinc-100">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Laporan Keuangan</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Detail transaksi per bulan</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Month selector */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => { setSelectedMonth(Number(e.target.value)); setPage(1) }}
                        className="text-sm px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    >
                        {monthly.map((m, i) => (
                            <option key={m.month} value={i}>{formatMonth(m.month)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Monthly Summary Bar */}
            <div className="grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/50">
                {[
                    { label: "Saldo Awal", value: currentMonth.saldoAwal, color: "text-zinc-600" },
                    { label: "Pemasukan", value: currentMonth.pemasukan, color: "text-emerald-600" },
                    { label: "Pengeluaran", value: currentMonth.pengeluaran, color: "text-red-500" },
                    { label: "Saldo Akhir", value: currentMonth.saldoAkhir, color: "text-amber-600" },
                ].map((item) => (
                    <div key={item.label} className="p-3 text-center">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{item.label}</p>
                        <p className={`text-sm font-bold ${item.color} mt-0.5`}>{formatRupiah(item.value)}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-5 py-3 border-b border-zinc-50">
                {["Semua", "Pemasukan", "Pengeluaran"].map(f => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setPage(1) }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f
                                ? "bg-zinc-900 text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/30">
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 select-none"
                                onClick={() => handleSort("date")}
                            >
                                <span className="flex items-center">Tanggal <SortIcon field="date" /></span>
                            </th>
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 select-none"
                                onClick={() => handleSort("description")}
                            >
                                <span className="flex items-center">Keterangan <SortIcon field="description" /></span>
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Tipe
                            </th>
                            <th
                                className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 select-none"
                                onClick={() => handleSort("amount")}
                            >
                                <span className="flex items-center justify-end">Jumlah <SortIcon field="amount" /></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="wait">
                            {paginated.map((item, i) => (
                                <motion.tr
                                    key={`${item.date}-${item.description}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-zinc-50 hover:bg-amber-50/20 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-zinc-800 font-medium">
                                        {item.description}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        {item.type === "pemasukan" ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                <ArrowDownLeft className="w-3 h-3" /> Masuk
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                                                <ArrowUpRight className="w-3 h-3" /> Keluar
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-5 py-3.5 text-right text-sm font-bold whitespace-nowrap ${item.type === "pemasukan" ? "text-emerald-600" : "text-red-500"
                                        }`}>
                                        {item.type === "pemasukan" ? "+" : "-"}{formatRupiah(item.amount)}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-50">
                    <span className="text-xs text-zinc-400">
                        Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${page === p
                                        ? "bg-amber-400 text-white shadow-sm"
                                        : "text-zinc-500 hover:bg-zinc-100"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
