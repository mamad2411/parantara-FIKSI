"use client"

import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Ahmad Fauzi",
    role: "Pengurus Masjid Al-Ikhlas",
    content: "Alhamdulillah, dengan DanaMasjid donasi masjid kami meningkat 300%. Sistemnya sangat mudah dan transparan! Jamaah jadi lebih percaya untuk berdonasi.",
    rating: 5,
    color: "#3b82f6",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Siti Nurhaliza",
    role: "Donatur Aktif",
    content: "Akhirnya ada platform yang benar-benar transparan. Saya bisa lihat kemana donasi saya digunakan secara real-time. Sangat recommended!",
    rating: 5,
    color: "#10b981",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Budi Santoso",
    role: "Pengurus Masjid Nurul Huda",
    content: "Sistem verifikasi yang ketat membuat donatur lebih percaya. Sangat membantu masjid kami dalam mengelola keuangan dengan lebih baik.",
    rating: 5,
    color: "#8b5cf6",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
]

const testimonials2 = [
  {
    name: "Fatimah Zahra",
    role: "Donatur dari Jakarta",
    content: "Pengalaman berdonasi terbaik yang pernah saya alami. Prosesnya mudah, cepat, dan aman. Terima kasih DanaMasjid!",
    rating: 5,
    color: "#f59e0b",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Muhammad Rizki",
    role: "Pengurus Masjid Ar-Rahman",
    content: "Masjid kami terdaftar dan mendapat donasi dalam hitungan hari. Platform yang luar biasa! Dashboard-nya juga sangat informatif.",
    rating: 5,
    color: "#ef4444",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Dewi Lestari",
    role: "Donatur dari Bandung",
    content: "Tanpa biaya tersembunyi, tanpa keraguan. Persis seperti yang saya cari untuk berdonasi. Semoga makin banyak masjid yang bergabung.",
    rating: 5,
    color: "#06b6d4",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Apa Kata <span className="text-blue-600">Mereka</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Ribuan masjid dan donatur telah mempercayai DanaMasjid untuk mengelola donasi mereka
          </p>
        </div>

        <div className="space-y-6">
          {/* Baris pertama - scroll ke kanan */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="overflow-x-hidden">
              <div className="flex gap-6 animate-scroll-right hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                  <div
                    key={`row1-${index}`}
                    className="flex-shrink-0 w-full sm:w-[450px] bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Quote className="w-full h-full" style={{ color: testimonial.color }} />
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-bold text-base">{testimonial.name}</p>
                          <p className="text-slate-500 text-sm">{testimonial.role}</p>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 leading-relaxed text-base">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Baris kedua - scroll ke kiri */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="overflow-x-hidden">
              <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused]">
                {[...testimonials2, ...testimonials2, ...testimonials2].map((testimonial, index) => (
                  <div
                    key={`row2-${index}`}
                    className="flex-shrink-0 w-full sm:w-[450px] bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Quote className="w-full h-full" style={{ color: testimonial.color }} />
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-bold text-base">{testimonial.name}</p>
                          <p className="text-slate-500 text-sm">{testimonial.role}</p>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 leading-relaxed text-base">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
      `}</style>
    </section>
  )
}
