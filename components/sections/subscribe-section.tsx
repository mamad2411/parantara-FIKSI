"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"

export function SubscribeSection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Terima kasih! Silakan cek inbox email Anda untuk mendapatkan kode voucher.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Terjadi kesalahan. Silakan coba lagi.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dapatkan Kode Voucher Spesial
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Subscribe sekarang dan dapatkan kode voucher untuk mendaftarkan masjid Anda
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {status === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Berhasil Subscribe!
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => setStatus("idle")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Subscribe lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  required
                  disabled={status === "loading"}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {status === "error" && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {status === "loading" ? "Mengirim..." : "Subscribe Sekarang"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Dengan subscribe, Anda setuju dengan{" "}
                <a href="/syarat-ketentuan" className="text-blue-600 hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                kami
              </p>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 border-2 border-yellow-300 rounded-full">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold text-yellow-900">
              Promo: GRATIS 3 Bulan Pertama!
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
