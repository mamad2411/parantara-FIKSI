"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { useSubscribe } from "@/hooks/api"

export function MasjidHeroV2() {
  const [email, setEmail] = useState("")
  const subscribeMutation = useSubscribe()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await subscribeMutation.mutateAsync({ email })

      if (result.success) {
        setEmail("")
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  const message = subscribeMutation.isSuccess 
    ? "Terima kasih! Cek email Anda untuk langkah selanjutnya."
    : subscribeMutation.isError
    ? `❌ ${subscribeMutation.error?.message || "Gagal berlangganan. Silakan coba lagi."}`
    : ""

  return (
    <main>
      <section className="overflow-hidden min-h-[700px] lg:min-h-[750px]">
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="relative z-10 mx-auto max-w-2xl text-center lg:ml-0 lg:w-3/5 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link
                  href="/login"
                  className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-all duration-300 group"
                >
                  <span className="bg-blue-600 text-white rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs font-semibold">
                    Admin Masjid
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Kelola Masjid Anda di Sini</span>
                  <span className="bg-gray-300 block h-4 w-px"></span>
                  <ArrowRight className="size-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-6xl text-gray-900"
              >
                Daftarkan Masjid Anda & Terima Donasi{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-white px-2">Transparan</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 -z-0"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 text-gray-600 text-lg"
              >
                Bergabunglah dengan ratusan masjid di Indonesia yang sudah menerima donasi secara transparan dan amanah melalui platform kami.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <form onSubmit={handleSubscribe} className="mx-auto my-10 max-w-2xl lg:my-12 lg:ml-0 lg:mr-auto">
                  <div className="bg-white has-[input:focus]:ring-blue-500 relative grid grid-cols-[1fr_auto] items-center rounded-[1rem] border border-gray-200 pr-1.5 shadow-lg has-[input:focus]:ring-2">
                    <Mail className="text-gray-400 pointer-events-none absolute inset-y-0 left-6 my-auto size-5" />

                    <input
                      placeholder="Masukkan email Anda..."
                      className="h-16 w-full bg-transparent pl-14 pr-4 focus:outline-none text-gray-900 text-base"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={subscribeMutation.isPending}
                    />

                    <div className="md:pr-1.5 lg:pr-1">
                      <Button
                        type="submit"
                        aria-label="subscribe"
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
                        disabled={subscribeMutation.isPending}
                      >
                        <span className="hidden md:block">
                          {subscribeMutation.isPending ? "Mengirim..." : "Daftar Sekarang"}
                        </span>
                        <Mail className="relative mx-auto size-5 md:hidden" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                  
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 text-sm ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}
                    >
                      {message}
                    </motion.p>
                  )}
                </form>

                <ul className="list-inside space-y-2 text-gray-700">
                  {[
                    "Gratis untuk 3 bulan pertama",
                    "Dashboard lengkap & mudah",
                    "Support 24/7"
                  ].map((text, index) => (
                    <motion.li
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3"
          >
            <div aria-hidden className="absolute z-[1] inset-0 bg-gradient-to-r from-white from-25%" />
            <div className="relative h-full w-full">
              <Image
                className="rounded-2xl shadow-2xl object-cover"
                src="/images/masjid/interior.webp"
                alt="Masjid illustration"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
