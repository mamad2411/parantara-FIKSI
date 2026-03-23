"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface RateLimitModalProps {
  isOpen: boolean
  onClose: () => void
  hoursLeft: number
  nextAllowedTime?: string
}

export function RateLimitModal({ isOpen, onClose, hoursLeft, nextAllowedTime }: RateLimitModalProps) {
  const [lottieData, setLottieData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    import("@/lotie/wait.json").then((d) => setLottieData(d.default as Record<string, unknown>))
  }, [])

  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Batas Waktu Pendaftaran</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Lottie Animation */}
                <div className="w-48 h-48 mx-auto mb-4">
                  {lottieData ? (
                    <Lottie animationData={lottieData} loop className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-orange-100 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Mohon Tunggu Sebentar
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Untuk menjaga kualitas data, Anda hanya dapat mendaftar{" "}
                    <span className="font-semibold text-orange-600">1 kali per hari</span>.
                  </p>
                </div>

                {/* Time Info */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <p className="font-semibold text-orange-900">Waktu Tunggu</p>
                  </div>
                  <p className="text-center text-2xl font-bold text-orange-600 mb-1">
                    {hoursLeft} Jam
                  </p>
                  {nextAllowedTime && (
                    <p className="text-center text-xs text-orange-700">
                      Dapat mendaftar kembali pada:<br />
                      <span className="font-semibold">{formatTime(nextAllowedTime)}</span>
                    </p>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-900 font-semibold mb-2">💡 Tips:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pastikan semua dokumen sudah lengkap</li>
                    <li>• Periksa kembali data yang akan diisi</li>
                    <li>• Siapkan foto dengan kualitas baik</li>
                  </ul>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
