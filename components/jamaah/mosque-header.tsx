// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Globe, Instagram, BadgeCheck, Calendar } from "lucide-react"
import type { MosqueProfile } from "@/lib/types/masjid"

interface MosqueHeaderProps {
    profile: MosqueProfile
}

export function MosqueHeader({ profile }: MosqueHeaderProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
        >
            {/* Hero Banner */}
            <div className="h-48 md:h-64 relative overflow-hidden">
                {profile.imageUrl ? (
                    <img
                        src={profile.imageUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 relative">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="px-6 md:px-8 pb-6 -mt-12 relative">
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center mb-4 overflow-hidden"
                >
                    {profile.logoUrl ? (
                        <img
                            src={profile.logoUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center">
                            <span className="text-2xl font-bold text-amber-600">
                                {profile.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Name + Verification */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">
                            Assalamu&apos;alaikum
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-800">
                            {profile.name}
                        </h2>
                        {profile.verified && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200"
                            >
                                <BadgeCheck className="w-3 h-3" />
                                Terverifikasi
                            </motion.span>
                        )}
                    </div>
                </motion.div>

                {/* Address */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-zinc-500 flex items-start gap-1.5 mt-2"
                >
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {profile.address}, {profile.city}, {profile.province}
                </motion.p>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-sm text-zinc-600 mt-3 leading-relaxed max-w-3xl"
                >
                    {profile.description}
                </motion.p>

                {/* Contact & Social */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3 mt-4"
                >
                    {profile.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                            <Phone className="w-3 h-3" /> {profile.phone}
                        </span>
                    )}
                    {profile.email && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                            <Mail className="w-3 h-3" /> {profile.email}
                        </span>
                    )}
                    {profile.established && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                            <Calendar className="w-3 h-3" /> Berdiri sejak {profile.established}
                        </span>
                    )}
                    {profile.socialMedia?.instagram && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                            <Instagram className="w-3 h-3" /> {profile.socialMedia.instagram}
                        </span>
                    )}
                    {profile.socialMedia?.website && (
                        <a href={profile.socialMedia.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors">
                            <Globe className="w-3 h-3" /> Website
                        </a>
                    )}
                </motion.div>
            </div>
        </motion.section>
    )
}
