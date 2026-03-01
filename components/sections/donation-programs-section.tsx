"use client"

import { motion } from "framer-motion"

export function DonationProgramsSection() {
  return (
    <section id="pricing" className="py-16 md:py-32 px-6 bg-gradient-to-b from-slate-50 to-white lg:mt-142">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Kenapa Memilih <span className="text-blue-600 relative inline-block">
                DanaMasjid
                <motion.svg
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  style={{ height: '12px' }}
                >
                  <motion.path
                    d="M0,6 Q10,2 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 T140,6 T160,6 T180,6 T200,6 T220,6 T240,6 T260,6 T280,6 T300,6"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    initial={{ strokeDashoffset: 1000 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Platform donasi masjid terpercaya dengan fitur lengkap dan mudah digunakan
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Terpercaya */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
                className="relative w-full h-20 flex items-center justify-center"
              >
                <img 
                  src="/images/program/terpercaya.webp" 
                  alt="Terpercaya" 
                  className="h-34 w-34 object-contain"
                />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-slate-900"
              >
                Terpercaya
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-slate-600 text-center text-base leading-relaxed"
              >
                Platform donasi masjid yang telah <span className="font-semibold text-blue-600">terverifikasi</span> dan dipercaya ribuan pengguna
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                viewport={{ once: true }}
                className="flex items-center gap-1 text-sm text-slate-500 mt-2"
              >
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Terverifikasi</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Card 2: Aman & Terpercaya */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 animate-spin-slow"></div>
                <div className="absolute inset-2 rounded-full border-2 border-blue-100"></div>
                <div className="absolute inset-4 rounded-full border-2 border-blue-50"></div>
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
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <span className="text-sm text-slate-600">Pilih masjid tujuan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <span className="text-sm text-slate-600">Tentukan nominal donasi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <span className="text-sm text-slate-600">Pilih metode pembayaran</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Mudah Digunakan</h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Proses donasi yang <span className="font-semibold">simpel dan cepat</span> dengan antarmuka yang user-friendly.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">Kartu Kredit/Debit</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">Transfer Bank</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">QRIS</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">E-Wallet</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Laporan Real-time (2 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 lg:col-span-2"
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
                    Dashboard interaktif dengan grafik dan statistik donasi yang <span className="font-semibold">update secara otomatis</span> untuk transparansi maksimal.
                  </p>
                </div>

                {/* Dashboard Preview Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <img 
                    src="/images/program/dash.webp" 
                    alt="Dashboard Preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="text-xs text-slate-500 mb-2">Total Donasi</div>
                    <div className="text-lg font-bold text-slate-900">Rp 2.5M</div>
                    <div className="text-xs text-green-600">↑ 12%</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="text-xs text-slate-500 mb-2">Donatur</div>
                    <div className="text-lg font-bold text-slate-900">1,234</div>
                    <div className="text-xs text-green-600">↑ 8%</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="text-xs text-slate-500 mb-2">Masjid</div>
                    <div className="text-lg font-bold text-slate-900">156</div>
                    <div className="text-xs text-green-600">↑ 5%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Komunitas Donatur */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col h-full space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div>
                {/* Avatar Profiles */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-3">
                    <img 
                      src="https://i.pravatar.cc/150?img=12" 
                      alt="Donatur 1" 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img 
                      src="https://i.pravatar.cc/150?img=47" 
                      alt="Donatur 2" 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img 
                      src="https://i.pravatar.cc/150?img=33" 
                      alt="Donatur 3" 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img 
                      src="https://i.pravatar.cc/150?img=32" 
                      alt="Donatur 4" 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img 
                      src="https://i.pravatar.cc/150?img=15" 
                      alt="Donatur 5" 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+10K</span>
                    </div>
                  </div>
                </div>

                {/* Komunitas Image */}
                <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 mb-4">
                  <img 
                    src="/images/program/komunitas.webp" 
                    alt="Komunitas Donatur" 
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Donatur Aktif Hari Ini</span>
                    <span className="font-semibold text-slate-900">234 (75%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
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

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  )
}
