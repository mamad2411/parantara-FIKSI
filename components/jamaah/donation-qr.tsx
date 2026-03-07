// @ts-nocheck
"use client"

import { motion } from "framer-motion"
import { QrCode, Copy, Check, CreditCard } from "lucide-react"
import { useState } from "react"
import type { DonationInfo } from "@/lib/types/masjid"

interface DonationQRProps {
    donation: DonationInfo
    mosqueName: string
}

export function DonationQR({ donation, mosqueName }: DonationQRProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.7 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Donasi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Code */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col items-center justify-center"
                >
                    <div className="w-48 h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center mb-4">
                        <QrCode className="w-20 h-20 text-zinc-300 mb-2" />
                        <p className="text-xs text-zinc-400 text-center">QR Code QRIS</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 text-center">{mosqueName}</p>
                    <p className="text-xs text-zinc-400 text-center mt-1">
                        Scan QR code di atas untuk donasi via QRIS
                    </p>
                </motion.div>

                {/* Bank Accounts */}
                <div className="space-y-3">
                    {donation.bankAccounts.map((account, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.85 + i * 0.1 }}
                            whileHover={{ y: -2, boxShadow: "0 4px 20px -4px rgba(0,0,0,0.08)" }}
                            className="bg-white rounded-2xl border border-zinc-200 p-4 cursor-default"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900">{account.bank}</p>
                                    <p className="text-xs text-zinc-400">Transfer Bank</p>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-zinc-900 tracking-wider font-mono">{account.accountNumber}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">a.n. {account.accountName}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCopy(account.accountNumber, i)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${copiedIndex === i
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
                                        }`}
                                >
                                    {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Call to action */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-4 text-center"
                    >
                        <p className="text-sm text-amber-800 font-medium">
                            &ldquo;Perumpamaan orang yang menginfakkan hartanya di jalan Allah...&rdquo;
                        </p>
                        <p className="text-xs text-amber-600 mt-1">— QS. Al-Baqarah: 261</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
