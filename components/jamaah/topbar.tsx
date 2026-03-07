// @ts-nocheck
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Search, ChevronDown, User, Settings, LogOut, Sun } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TopbarProps {
    title?: string
    subtitle?: string
}

export function Topbar({ title = "Dashboard", subtitle = "Selamat Datang di Portal Jamaah" }: TopbarProps) {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [showDropdown, setShowDropdown] = useState(false)
    const [showNotif, setShowNotif] = useState(false)

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Jamaah"
    const avatarInitial = displayName.charAt(0).toUpperCase()

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam"

    const handleLogout = async () => {
        await signOut()
        router.push("/login")
    }

    const notifications = [
        { id: 1, title: "Donasi berhasil!", body: "Donasi Rp 50.000 ke Masjid Al-Ikhlas berhasil.", time: "2 menit lalu", unread: true },
        { id: 2, title: "Laporan Keuangan Baru", body: "Masjid Al-Falah telah merilis laporan bulan Februari.", time: "1 jam lalu", unread: true },
        { id: 3, title: "Jazakumullah Khairan!", body: "Terima kasih atas donasi Anda bulan ini.", time: "1 hari lalu", unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 md:px-6 shadow-sm"
        >
            {/* Sidebar Toggle */}
            <SidebarTrigger className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" />

            {/* Title */}
            <div className="flex-1 min-w-0">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
                    <p className="text-xs text-gray-500 hidden sm:block truncate">
                        <span className="text-yellow-600 font-medium">{greeting}</span>, {displayName}! ✨
                    </p>
                </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-xl hover:border-yellow-300 hover:text-gray-600 transition-all"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-xs">Cari...</span>
                    <kbd className="ml-1 text-[9px] bg-gray-200 px-1 py-0.5 rounded font-mono">⌘K</kbd>
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowNotif(!showNotif); setShowDropdown(false) }}
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                    >
                        <Bell className="w-4.5 h-4.5" />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotif && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
                                        <span className="text-xs text-yellow-600 font-medium cursor-pointer hover:underline">
                                            Tandai semua dibaca
                                        </span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((n) => (
                                            <motion.div
                                                key={n.id}
                                                whileHover={{ backgroundColor: "#fef9ec" }}
                                                className={`p-4 cursor-pointer transition-colors ${n.unread ? "bg-yellow-50/50" : "bg-white"}`}
                                            >
                                                <div className="flex gap-3">
                                                    {n.unread && (
                                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
                                                    )}
                                                    <div className={n.unread ? "" : "ml-5"}>
                                                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-50">
                                        <button className="w-full text-xs text-center text-yellow-600 font-medium hover:underline">
                                            Lihat semua notifikasi
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false) }}
                        className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : avatarInitial}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                            {displayName}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                    </motion.button>

                    <AnimatePresence>
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="absolute right-0 top-12 z-50 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-50">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        {[
                                            { icon: User, label: "Profil Saya", href: "/jamaah/profil" },
                                            { icon: Settings, label: "Pengaturan", href: "/jamaah/pengaturan" },
                                        ].map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                <item.icon className="w-4 h-4 text-gray-400" />
                                                {item.label}
                                            </Link>
                                        ))}
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Keluar
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    )
}
