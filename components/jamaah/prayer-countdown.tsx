// @ts-nocheck
"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

interface PrayerTimes {
    imsak: string
    subuh: string
    dzuhur: string
    ashar: string
    maghrib: string
    isya: string
}

interface PrayerCountdownProps {
    cityName: string
    prayerTimes: PrayerTimes | null
    loading: boolean
}

const prayerNames = ["Imsak", "Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"]
const prayerKeys: (keyof PrayerTimes)[] = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"]

function timeToMinutes(time: string): number {
    if (!time) return 0
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
}

function formatCountdown(diffMs: number): string {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const h = hours > 0 ? `${String(hours).padStart(2, '0')}:` : ""
    const m = String(minutes).padStart(2, '0')
    const s = String(seconds).padStart(2, '0')

    return `-${h}${m}:${s}`
}

// LED dot-matrix font characters (5x7 grid)
const LED_CHARS: Record<string, number[]> = {
    A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
    C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
    D: [0b11100, 0b10010, 0b10001, 0b10001, 0b10001, 0b10010, 0b11100],
    E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
    F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
    G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
    K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
    L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
    M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
    N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
    O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
    Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
    R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    S: [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
    T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
    U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
    W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
    X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
    Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
    Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
    "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
    "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    "2": [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
    "3": [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
    "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
    "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
    "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
    "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
    "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
    "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
    ":": [0b00000, 0b00100, 0b00100, 0b00000, 0b00100, 0b00100, 0b00000],
    " ": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
    "-": [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
}

function textToLedCols(text: string): boolean[][] {
    const cols: boolean[][] = []
    for (let ci = 0; ci < text.length; ci++) {
        const char = text[ci].toUpperCase()
        const charData = LED_CHARS[char] || LED_CHARS[" "]

        // Push 5 columns for the character
        for (let col = 4; col >= 0; col--) {
            const colData = []
            for (let row = 0; row < 7; row++) {
                colData.push(Boolean(charData[row] & (1 << col)))
            }
            cols.push(colData)
        }
        // Push 1 empty column for gap between characters
        cols.push(Array(7).fill(false))
    }
    return cols
}

function LEDMarquee({ text }: { text: string }) {
    // Generate columns for the text
    const textCols = useMemo(() => textToLedCols(text), [text])

    // Create a padding block (e.g., 20 empty columns = ~15 chars of space)
    const paddingCols = useMemo(() => Array.from({ length: 100 }, () => Array(7).fill(false)), [])

    // One full loop segment: text + padding
    const loopSegment = useMemo(() => [...textCols, ...paddingCols], [textCols, paddingCols])

    // For infinite scroll, render 2 segments. Since text length is ~24 chars (144 cols = ~720px),
    // one segment is wider than the max-w-md (448px) container.
    const displayCols = useMemo(() => [...loopSegment, ...loopSegment], [loopSegment])

    const colWidth = 5; // 4px dot + 1px gap
    const scrollDistance = loopSegment.length * colWidth

    // Duration based on text length for consistent speed
    const duration = loopSegment.length * 0.05

    return (
        <div className="bg-white rounded-xl shadow-md p-4 w-full sm:max-w-md mx-auto relative overflow-hidden h-[76px] flex flex-col justify-center">
            {/* Container simulating the hardware panel */}
            <div className="bg-zinc-50 rounded-lg overflow-hidden relative w-full h-full flex flex-col justify-center border border-zinc-100 shadow-inner">

                {/* Gradients to fade edges */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-50 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-50 to-transparent z-10" />

                <motion.div
                    animate={{ x: [0, -scrollDistance] }}
                    transition={{ duration, ease: "linear", repeat: Infinity }}
                    className="flex gap-[1px] absolute whitespace-nowrap pl-4"
                >
                    {displayCols.map((colData, ci) => (
                        <div key={ci} className="flex flex-col gap-[1px]">
                            {colData.map((on, ri) => (
                                <div
                                    key={ri}
                                    className={`w-[4px] h-[4px] rounded-[1px] ${on
                                        ? "bg-teal-500 shadow-[0_0_2px_rgba(20,184,166,0.8)]"
                                        : "bg-zinc-200"
                                        }`}
                                />
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

function LEDLoading() {
    const text = "MENUNGGU";
    const gridCols = useMemo(() => textToLedCols(text), [])

    return (
        <div className="bg-white rounded-xl shadow-md p-4 w-full sm:max-w-md mx-auto relative h-[76px] flex flex-col justify-center">
            <div className="bg-zinc-50 rounded-lg overflow-hidden relative w-full h-full flex flex-col justify-center border border-zinc-100 shadow-inner">
                <div className="flex gap-[1px] absolute whitespace-nowrap pl-4 justify-center w-full">
                    {gridCols.map((colData, ci) => (
                        <div key={ci} className="flex flex-col gap-[1px]">
                            {colData.map((on, ri) => (
                                <div
                                    key={ri}
                                    className={`w-[4px] h-[4px] rounded-[1px] animate-pulse ${on ? "bg-teal-500/50" : "bg-zinc-200"
                                        }`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function PrayerCountdown({ cityName, prayerTimes, loading }: PrayerCountdownProps) {
    const [now, setNow] = useState<Date>(new Date())

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    // Find next prayer & countdown text
    const ledText = useMemo(() => {
        if (!prayerTimes) return "LOADING..."

        const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

        for (let i = 0; i < prayerKeys.length; i++) {
            const pTime = prayerTimes[prayerKeys[i]]
            const pMinutes = timeToMinutes(pTime)
            const pSeconds = pMinutes * 60

            if (nowSeconds < pSeconds) {
                const diffMs = (pSeconds - nowSeconds) * 1000
                const cd = formatCountdown(diffMs)
                return `WAKTU ${prayerNames[i].toUpperCase()} ${pTime}   ${cd}`
            }
        }

        // After Isya -> show countdown to tomorrow's Imsak
        return `WAKTU IMSAK ${prayerTimes.imsak}   BESOK`
    }, [prayerTimes, now])

    return (
        <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 120, delay: 0.1 }}
            className="flex flex-col items-center"
        >
            <div className="w-full relative">
                {loading || !prayerTimes ? (
                    <LEDLoading />
                ) : (
                    <LEDMarquee text={ledText} />
                )}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[11px] font-medium text-zinc-400 mt-2.5 flex items-center gap-1 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-zinc-100 shadow-sm"
            >
                <MapPin className="w-3 h-3 text-red-500" />
                {cityName}
            </motion.p>
        </motion.div>
    )
}
