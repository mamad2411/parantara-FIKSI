// @ts-nocheck
"use client"

import type React from "react"
import { useState } from "react"
import { Menu, X, ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function PortalHeader() {
    const [isOpen, setIsOpen] = useState(false)
    const isScrolled = true
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        { href: "/", label: "Beranda" },
        { href: "/donasi", label: "Donasi" },
        { href: "/masjid", label: "Daftar Masjid" },
        { href: "/pricing", label: "Harga" },
        { href: "/team", label: "Tim" },
    ]

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "px-4 pt-4" : ""}`}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className={`max-w-7xl mx-auto transition-all duration-300 rounded-2xl ${isScrolled
                    ? "bg-white/70 backdrop-blur-xl border border-zinc-200 px-6 py-3"
                    : "bg-background/90 backdrop-blur-md px-6 py-5"
                    }`}
            >
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 cursor-pointer">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/images/logo/DanaMasjid.webp"
                                alt="DanaMasjid Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm transition-colors cursor-pointer ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                                    ? "text-black font-semibold"
                                    : isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            href="/login"
                            className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium border transition-all duration-300 group ${isScrolled
                                ? "border-zinc-300 text-zinc-700"
                                : "border-border text-foreground"
                                }`}
                        >
                            <span className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center ${isScrolled ? "bg-black" : "bg-foreground"
                                }`} />
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Masuk</span>
                        </Link>

                        <Link
                            href="/donasi"
                            className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 transition-all duration-300 group overflow-hidden ${isScrolled ? "border-zinc-300" : "border-border"
                                }`}
                        >
                            <span
                                className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${isScrolled ? "bg-black" : "bg-foreground"
                                    }`}
                            />
                            <span
                                className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                                    }`}
                            >
                                Donasi Sekarang
                            </span>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                                <ArrowRight
                                    className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${isScrolled ? "text-black" : "text-foreground"
                                        }`}
                                />
                                <ArrowUpRight
                                    className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                                        }`}
                                />
                            </span>
                        </Link>
                    </div>

                    <button
                        className={`lg:hidden transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isOpen && (
                    <nav
                        className={`lg:hidden mt-6 pb-6 flex flex-col gap-4 border-t pt-6 ${isScrolled ? "border-zinc-200" : "border-border"
                            }`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`transition-colors cursor-pointer ${pathname === item.href
                                    ? "text-black font-semibold"
                                    : isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className={`h-px w-full ${isScrolled ? "bg-zinc-200" : "bg-border"}`} />

                        <div className={`flex flex-col gap-3 mt-4 pt-4 border-t ${isScrolled ? "border-zinc-200" : "border-border"}`}>
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium border w-fit transition-all duration-300 group ${isScrolled
                                    ? "border-zinc-300 text-zinc-700"
                                    : "border-border text-foreground"
                                    }`}
                            >
                                <span className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center ${isScrolled ? "bg-black" : "bg-foreground"
                                    }`} />
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Masuk</span>
                            </Link>

                            <Link
                                href="/donasi"
                                onClick={() => setIsOpen(false)}
                                className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 w-fit transition-all duration-300 group overflow-hidden ${isScrolled ? "border-zinc-300" : "border-border"
                                    }`}
                            >
                                <span
                                    className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${isScrolled ? "bg-black" : "bg-foreground"
                                        }`}
                                />
                                <span
                                    className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                                        }`}
                                >
                                    Donasi Sekarang
                                </span>
                                <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                                    <ArrowRight
                                        className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${isScrolled ? "text-black" : "text-foreground"
                                            }`}
                                    />
                                    <ArrowUpRight
                                        className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                                            }`}
                                    />
                                </span>
                            </Link>
                        </div>
                    </nav>
                )}
            </motion.div>
        </motion.header>
    )
}
