// @ts-nocheck
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    History,
    Building2,
    User,
    Bell,
    LogOut,
    Heart,
    ChevronRight,
    Settings,
    HelpCircle,
} from "lucide-react"

const navItems = [
    {
        group: "Menu Utama",
        items: [
            { href: "/jamaah", icon: LayoutDashboard, label: "Beranda", exact: true },
            { href: "/jamaah/riwayat", icon: History, label: "Riwayat Donasi" },
            { href: "/jamaah/masjid", icon: Building2, label: "Masjid Saya" },
            { href: "/jamaah/donasi", icon: Heart, label: "Buat Donasi" },
        ],
    },
    {
        group: "Akun",
        items: [
            { href: "/jamaah/notifikasi", icon: Bell, label: "Notifikasi", badge: 3 },
            { href: "/jamaah/profil", icon: User, label: "Profil Saya" },
            { href: "/jamaah/pengaturan", icon: Settings, label: "Pengaturan" },
            { href: "/jamaah/bantuan", icon: HelpCircle, label: "Bantuan" },
        ],
    },
]

export function SidebarNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut } = useAuth()
    const { state } = useSidebar()
    const [loggingOut, setLoggingOut] = useState(false)

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href
        return pathname.startsWith(href) && href !== "/jamaah"
    }

    const handleLogout = async () => {
        try {
            setLoggingOut(true)
            await signOut()
            router.push("/login")
        } catch (e) {
            setLoggingOut(false)
        }
    }

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Jamaah"
    const avatarInitial = displayName.charAt(0).toUpperCase()

    return (
        <Sidebar collapsible="icon" className="border-r-0 shadow-xl">
            {/* Header */}
            <SidebarHeader className="border-b border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 px-4 py-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-sm">DM</span>
                    </div>
                    <AnimatePresence>
                        {state === "expanded" && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <p className="font-bold text-gray-900 text-sm leading-tight">DanaMasjid</p>
                                <p className="text-xs text-gray-500 leading-tight">Portal Jamaah</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </SidebarHeader>

            {/* Nav Content */}
            <SidebarContent className="bg-white px-2 py-3">
                {navItems.map((group, gi) => (
                    <SidebarGroup key={gi}>
                        <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {group.group}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item, ii) => {
                                const active = isActive(item.href, item.exact)
                                return (
                                    <SidebarMenuItem key={ii}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.label}
                                            size="lg"
                                            className={`relative rounded-xl transition-all duration-200 group ${active
                                                    ? "bg-gradient-to-r from-yellow-400/15 to-amber-400/10 text-yellow-700 font-semibold"
                                                    : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <Link href={item.href} className="flex items-center gap-3 w-full">
                                                {active && (
                                                    <motion.div
                                                        layoutId="active-nav"
                                                        className="absolute left-0 top-1 bottom-1 w-1 bg-yellow-400 rounded-r-full"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                                <item.icon
                                                    className={`w-5 h-5 flex-shrink-0 ${active ? "text-yellow-600" : "text-gray-400 group-hover:text-gray-600"
                                                        }`}
                                                />
                                                <span className="flex-1">{item.label}</span>
                                                {item.badge && (
                                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {active && state === "expanded" && (
                                                    <ChevronRight className="w-3.5 h-3.5 text-yellow-500" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-gray-100 bg-gray-50 p-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white shadow-sm border border-gray-100 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            avatarInitial
                        )}
                    </div>
                    <AnimatePresence>
                        {state === "expanded" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
                                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Logout */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            disabled={loggingOut}
                            tooltip="Keluar"
                            className="w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <motion.div
                                animate={loggingOut ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <LogOut className="w-4 h-4" />
                            </motion.div>
                            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
