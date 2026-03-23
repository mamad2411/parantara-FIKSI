"use client"

import { useState } from "react"
import { Header } from "@/components/layout"
import { Footer } from "@/components/layout"
import { MasjidHeroV2, MasjidTerdaftarSection } from "@/components/sections"
import { Search, MapPin, Filter, ChevronDown, BadgeCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getAllMosques } from "@/lib/services/masjid-service"
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section"
import { AnimatedSection as AnimatedSectionV2 } from "@/components/animations/animated-section"

export default function MasjidPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const mosques = getAllMosques()
  
  // Image path as constant to prevent autofix from changing it
  const ctaImagePath = "/thubnail/thubnail.webp" as const

  const cities = ["all", ...Array.from(new Set(mosques.map(m => m.location)))]
  const categories = ["all", ...Array.from(new Set(mosques.map(m => m.category)))]

  const filteredMosques = mosques.filter((mosque) => {
    const matchesSearch = mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mosque.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === "all" || mosque.location.includes(selectedCity)
    const matchesCategory = selectedCategory === "all" || mosque.category === selectedCategory
    return matchesSearch && matchesCity && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <MasjidHeroV2 />

      {/* Masjid Terverifikasi dari Pendaftaran */}
      <MasjidTerdaftarSection />

      {/* Search and Filter Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Search and Filter */}
          <AnimatedSection variant="scaleIn" delay={0.1}>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama masjid atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">Semua Kota</option>
                  {cities.slice(1).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{filteredMosques.length}</span> masjid
            </div>
            </div>
          </AnimatedSection>

          {/* Mosque Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMosques.map((mosque) => (
              <StaggerItem key={mosque.id}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={mosque.imageUrl}
                    alt={mosque.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-medium px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-zinc-700 border border-zinc-100 shadow-sm">
                      {mosque.category}
                    </span>
                  </div>
                  {/* Verified badge */}
                  {mosque.verified && (
                    <div className="absolute top-3 right-3 shadow-sm rounded-full">
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-emerald-500 text-white rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {mosque.name}
                  </h3>

                  <div className="flex items-start gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-sm">{mosque.location}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-zinc-400">Total Donasi</p>
                      <p className="text-sm font-bold text-gray-900">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(mosque.totalDonation)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span>{mosque.jamaahCount} jamaah</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/${mosque.domain}/jamaah`} className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                    Masuk sebagai Jamaah
                  </Link>
                </div>
              </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Empty State */}
          {filteredMosques.length === 0 && (
            <AnimatedSection variant="bounceIn">
              <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Masjid Tidak Ditemukan</h3>
              <p className="text-gray-600 mb-6">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCity("all")
                  setSelectedCategory("all")
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Reset Filter
              </button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSectionV2 animation="slideUp" delay={0.2}>
        <section className="relative px-4 mt-16 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative h-[550px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-end justify-center pb-12">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/thubnail/thubnail.png"
                  alt="Masjid Background"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="relative z-10">
                <Link
                  href="/login?redirect=/daftar-masjid&type=daftar-masjid&message=Login+dulu+sebelum+daftarkan+masjid+Anda"
                  className="inline-block px-10 py-5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
                >
                  Daftarkan Masjid Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSectionV2>

      {/* Spacer before Footer */}
      <div className="h-70"></div>

      <Footer />
    </div>
  )
}
