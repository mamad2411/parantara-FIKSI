// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { Clock, User, BookOpen, Calendar, Repeat } from "lucide-react"
import type { Schedule } from "@/lib/types/masjid"

interface ScheduleCardProps {
    schedules: Schedule[]
}

const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"]

export function ScheduleCard({ schedules }: ScheduleCardProps) {
    const todayIndex = new Date().getDay()
    // JS: 0=Sunday → map to "Ahad"
    const todayName = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][todayIndex]

    const todaySchedules = schedules.filter(s => s.day === todayName)
    const sortedSchedules = [...schedules].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.6 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Jadwal Kajian</h3>
                <span className="text-xs text-zinc-400">{schedules.length} jadwal</span>
            </div>

            {/* Today's schedule highlight */}
            {todaySchedules.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-4 mb-4"
                >
                    <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Jadwal Hari Ini — {todayName}
                    </p>
                    {todaySchedules.map(s => (
                        <div key={s.id} className="flex items-start gap-3 mt-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">{s.title}</p>
                                <p className="text-xs text-zinc-500">{s.topic}</p>
                                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                                    <User className="w-3 h-3" /> {s.speaker}
                                    <span className="mx-1">•</span>
                                    <Clock className="w-3 h-3" /> {s.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 mb-4 text-center"
                >
                    <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 font-medium">Belum ada jadwal kajian untuk hari ini.</p>
                    <p className="text-xs text-zinc-400 mt-1">Hari ini: {todayName}</p>
                </motion.div>
            )}

            {/* Full schedule list */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="divide-y divide-zinc-50">
                    {sortedSchedules.map((schedule, i) => (
                        <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.05 }}
                            whileHover={{ backgroundColor: "#fffbeb" }}
                            className="flex items-center gap-4 px-5 py-4 transition-colors"
                        >
                            <div className="w-12 text-center flex-shrink-0">
                                <p className="text-xs font-bold text-amber-600 uppercase">{schedule.day.slice(0, 3)}</p>
                                <p className="text-[10px] text-zinc-400">{schedule.time}</p>
                            </div>

                            <div className="w-px h-8 bg-zinc-100" />

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{schedule.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{schedule.topic}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-400">
                                    <User className="w-3 h-3" /> {schedule.speaker.split(",")[0]}
                                </span>
                                {schedule.recurring && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-full">
                                        <Repeat className="w-3 h-3" /> Rutin
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
