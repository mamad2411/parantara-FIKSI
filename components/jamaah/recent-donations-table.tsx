// @ts-nocheck
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface Donation {
    id: string
    tanggal: string
    masjid: string
    lokasi: string
    nominal: number
    kategori: string
    status: "Sukses" | "Pending" | "Gagal"
}

const mockDonations: Donation[] = [
    { id: "DN001", tanggal: "2026-02-28", masjid: "Masjid Al-Ikhlas", lokasi: "Jakarta Selatan", nominal: 50000, kategori: "Infaq", status: "Sukses" },
    { id: "DN002", tanggal: "2026-02-25", masjid: "Masjid Al-Falah", lokasi: "Bandung", nominal: 100000, kategori: "Zakat", status: "Sukses" },
    { id: "DN003", tanggal: "2026-02-20", masjid: "Masjid Nurul Iman", lokasi: "Surabaya", nominal: 75000, kategori: "Sedekah", status: "Sukses" },
    { id: "DN004", tanggal: "2026-02-15", masjid: "Masjid Al-Hidayah", lokasi: "Yogyakarta", nominal: 200000, kategori: "Infaq", status: "Pending" },
    { id: "DN005", tanggal: "2026-02-10", masjid: "Masjid Baitul Makmur", lokasi: "Medan", nominal: 150000, kategori: "Sedekah", status: "Sukses" },
    { id: "DN006", tanggal: "2026-02-05", masjid: "Masjid Al-Amin", lokasi: "Makassar", nominal: 50000, kategori: "Zakat", status: "Gagal" },
    { id: "DN007", tanggal: "2026-01-28", masjid: "Masjid Raya", lokasi: "Semarang", nominal: 300000, kategori: "Infaq", status: "Sukses" },
    { id: "DN008", tanggal: "2026-01-20", masjid: "Masjid Al-Ikhlas", lokasi: "Jakarta Selatan", nominal: 75000, kategori: "Sedekah", status: "Sukses" },
    { id: "DN009", tanggal: "2026-01-15", masjid: "Masjid Al-Falah", lokasi: "Bandung", nominal: 100000, kategori: "Infaq", status: "Sukses" },
    { id: "DN010", tanggal: "2026-01-10", masjid: "Masjid Nurul Huda", lokasi: "Malang", nominal: 250000, kategori: "Zakat", status: "Pending" },
]

const statusConfig = {
    Sukses: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Gagal: "bg-red-50 text-red-600 border-red-200",
}

const kategoriConfig: Record<string, string> = {
    Infaq: "bg-blue-50 text-blue-600",
    Zakat: "bg-purple-50 text-purple-600",
    Sedekah: "bg-amber-50 text-amber-700",
}

const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

type SortField = "tanggal" | "nominal" | "masjid"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 5

export function RecentDonationsTable() {
    const [sortField, setSortField] = useState<SortField>("tanggal")
    const [sortDir, setSortDir] = useState<SortDir>("desc")
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState<string>("Semua")

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
        else { setSortField(field); setSortDir("desc") }
    }

    const filtered = filter === "Semua" ? mockDonations : mockDonations.filter(d => d.status === filter)
    const sorted = [...filtered].sort((a, b) => {
        let cmp = 0
        if (sortField === "tanggal") cmp = a.tanggal.localeCompare(b.tanggal)
        else if (sortField === "nominal") cmp = a.nominal - b.nominal
        else cmp = a.masjid.localeCompare(b.masjid)
        return sortDir === "asc" ? cmp : -cmp
    })

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const SortIcon = ({ field }: { field: SortField }) => (
        <span className="inline-flex flex-col ml-1">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${sortField === field && sortDir === "asc" ? "text-yellow-500" : "text-gray-300"}`} />
            <ChevronDown className={`w-2.5 h-2.5 ${sortField === field && sortDir === "desc" ? "text-yellow-500" : "text-gray-300"}`} />
        </span>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-50">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Riwayat Donasi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{filtered.length} transaksi ditemukan</p>
                </div>
                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                    {["Semua", "Sukses", "Pending", "Gagal"].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1) }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                onClick={() => handleSort("tanggal")}
                            >
                                <span className="flex items-center">Tanggal <SortIcon field="tanggal" /></span>
                            </th>
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                onClick={() => handleSort("masjid")}
                            >
                                <span className="flex items-center">Masjid <SortIcon field="masjid" /></span>
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th
                                className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                                onClick={() => handleSort("nominal")}
                            >
                                <span className="flex items-center justify-end">Nominal <SortIcon field="nominal" /></span>
                            </th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="wait">
                            {paginated.map((item, i) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(item.tanggal)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{item.masjid}</p>
                                        <p className="text-xs text-gray-400">{item.lokasi}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kategoriConfig[item.kategori] || "bg-gray-100 text-gray-600"}`}>
                                            {item.kategori}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        {formatRupiah(item.nominal)}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusConfig[item.status]}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Sukses" ? "bg-emerald-500" : item.status === "Pending" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                                                }`} />
                                            {item.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                    Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${page === p
                                    ? "bg-yellow-400 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
