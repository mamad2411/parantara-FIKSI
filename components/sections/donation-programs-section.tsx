"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

const cardAnim = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07, ease: "easeOut" as const },
  viewport: { once: true as const },
})

const AVATAR_IMAGES = [
  "/images/profil/profil1.webp",
  "/images/profil/profil2.webp",
  "/images/profil/profil6.webp",
  "/images/profil/profil7.webp",
  "/images/profil/profil5.webp",
]

export function DonationProgramsSection() {
  const [animationData, setAnimationData] = useState<any>(null)
  const lottieRef = useRef<HTMLDivElement>(null)

  // Only load Lottie JSON when the card scrolls into view
  useEffect(() => {
    if (!lottieRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          import("@/lotie/Man goes to the mosque on Ramadan.json").then((d) =>
            setAnimationData(d.default)
          )
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(lottieRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-8 md:py-12 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Kenapa Memilih{" "}
            <span className="text-blue-600 relative inline-block">
              DanaMasjid
              <motion.svg
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                viewport={{ once: true }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                style={{ height: "12px" }}
              >
                <motion.path
                  d="M0,6 Q10,2 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 T140,6 T160,6 T180,6 T200,6 T220,6 T240,6 T260,6 T280,6 T300,6"
                  stroke="url(#underlineGrad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Platform manajemen keuangan masjid terpercaya dengan transparansi penuh dan fitur lengkap
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Transparansi */}
          <motion.div
            {...cardAnim(0)}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-full h-28 md:h-32 flex items-center justify-center mb-2">
                <img
                  src="/images/program/terpercaya.webp"
                  alt="Transparansi"
                  width={128}
                  height={128}
                  className="h-24 w-24 md:h-32 md:w-32 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">Transparansi</h3>
              <p className="text-slate-600 text-center text-base leading-relaxed mt-1">
                Platform manajemen keuangan masjid yang{" "}
                <span className="font-semibold text-blue-600">transparan</span> dan dipercaya ribuan masjid
              </p>
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Terverifikasi</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Aman & Terpercaya */}
          <motion.div
            {...cardAnim(1)}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Shield icon — static rings, no spin */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200" />
                <div className="absolute inset-2 rounded-full border-2 border-blue-100" />
                <div className="absolute inset-4 rounded-full border-2 border-blue-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Aman & Terpercaya</h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Sistem keamanan berlapis dengan <span className="font-semibold">enkripsi SSL</span> dan verifikasi masjid ketat.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">ISO 27001</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">PCI DSS</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Mudah Digunakan */}
          <motion.div
            {...cardAnim(2)}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Langkah Donasi</span>
                </div>
                <span className="font-bold text-orange-600">3 Langkah</span>
              </div>

              <div className="py-2 space-y-3">
                {["Pilih masjid tujuan", "Tentukan nominal donasi", "Pilih metode pembayaran"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-sm text-slate-600">{step}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Mudah Digunakan</h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Proses pencatatan keuangan yang <span className="font-semibold">simpel dan cepat</span> dengan antarmuka yang user-friendly untuk pengurus masjid.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {["Kartu Kredit/Debit", "Transfer Bank", "QRIS", "E-Wallet"].map((m) => (
                  <span key={m} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{m}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 4: Laporan Real-time */}
          <motion.div
            {...cardAnim(3)}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-200 lg:col-span-2"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Laporan Real-time</h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Dashboard interaktif dengan grafik dan statistik keuangan yang{" "}
                    <span className="font-semibold">update secara otomatis</span> untuk transparansi maksimal kepada jamaah.
                  </p>
                </div>

                {/* Program illustration */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Image
                    src="/images/program/program.webp"
                    alt="Ilustrasi Program Masjid"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  {[
                    { label: "Total Donasi", value: "Rp 2.5M", change: "↑ 12%" },
                    { label: "Donatur", value: "1,234", change: "↑ 8%" },
                    { label: "Masjid", value: "156", change: "↑ 5%" },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-slate-50 rounded-xl p-4 lg:p-6 ${i === 2 ? "col-span-2 lg:col-span-1" : ""}`}>
                      <div className="text-xs text-slate-500 mb-2">{stat.label}</div>
                      <div className="text-base lg:text-lg font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-green-600">{stat.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Komunitas Donatur */}
          <motion.div
            {...cardAnim(4)}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex flex-col h-full space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div>
                {/* Avatar placeholders — no external requests */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-3">
                    {AVATAR_IMAGES.map((src, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt={`Donatur ${i + 1}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+10K</span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 mb-4 aspect-[4/3]">
                  <Image
                    src="/images/program/komunitas.webp"
                    alt="Komunitas Donatur"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Donatur Aktif Hari Ini</span>
                    <span className="font-semibold text-slate-900">234 (75%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Total Donatur</div>
                      <div className="text-lg font-bold text-slate-900">10,234</div>
                      <div className="text-xs text-green-600">↑ 15%</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Aktif Bulan Ini</div>
                      <div className="text-lg font-bold text-slate-900">8,456</div>
                      <div className="text-xs text-green-600">↑ 22%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
