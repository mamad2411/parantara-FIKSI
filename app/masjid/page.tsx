"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/layout"
import { Footer } from "@/components/layout"
import { MasjidHeroV2 } from "@/components/sections"
import { Search, MapPin, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MasjidPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Dummy data masjid
  const mosques = [
    {
      id: 1,
      name: "Masjid Al-Ikhlas",
      city: "Jakarta",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      image: "/images/login/loginnn.webp",
      donors: 1234,
      totalDonation: 125000000,
      category: "Operasional",
      description: "Masjid yang melayani jamaah di pusat kota Jakarta dengan berbagai program sosial dan pendidikan."
    },
    {
      id: 2,
      name: "Masjid Ar-Rahman",
      city: "Bandung",
      address: "Jl. Asia Afrika No. 45, Bandung",
      image: "/images/login/loginnn.webp",
      donors: 856,
      totalDonation: 87500000,
      category: "Renovasi",
      description: "Sedang dalam proses renovasi untuk memperluas ruang sholat dan fasilitas wudhu."
    },
    {
      id: 3,
      name: "Masjid Al-Falah",
      city: "Surabaya",
      address: "Jl. Pemuda No. 78, Surabaya",
      image: "/images/login/loginnn.webp",
      donors: 2341,
      totalDonation: 234000000,
      category: "Pembangunan",
      description: "Pembangunan masjid baru untuk melayani jamaah di kawasan Surabaya Timur."
    },
    {
      id: 4,
      name: "Masjid Nurul Huda",
      city: "Jakarta",
      address: "Jl. Gatot Subroto No. 234, Jakarta Selatan",
      image: "/images/login/loginnn.webp",
      donors: 567,
      totalDonation: 45000000,
      category: "Operasional",
      description: "Masjid dengan program tahfidz dan pendidikan Islam untuk anak-anak."
    },
    {
      id: 5,
      name: "Masjid Baitul Muttaqin",
      city: "Yogyakarta",
      address: "Jl. Malioboro No. 56, Yogyakarta",
      image: "/images/login/loginnn.webp",
      donors: 1890,
      totalDonation: 156000000,
      category: "Operasional",
      description: "Masjid bersejarah di pusat kota Yogyakarta dengan arsitektur tradisional Jawa."
    },
    {
      id: 6,
      name: "Masjid Al-Hidayah",
      city: "Semarang",
      address: "Jl. Pandanaran No. 89, Semarang",
      image: "/images/login/loginnn.webp",
      donors: 432,
      totalDonation: 38000000,
      category: "Renovasi",
      description: "Membutuhkan renovasi atap dan sistem sound untuk meningkatkan kenyamanan jamaah."
    },
  ]

  const cities = ["all", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang"]
  const categories = ["all", "Operasional", "Renovasi", "Pembangunan"]

  const filteredMosques = mosques.filter((mosque) => {
    const matchesSearch = mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mosque.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === "all" || mosque.city === selectedCity
    const matchesCategory = selectedCategory === "all" || mosque.category === selectedCategory
    return matchesSearch && matchesCity && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <MasjidHeroV2 />
      
      {/* Search and Filter Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-12"
          >
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
          </motion.div>

          {/* Mosque Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMosques.map((mosque, index) => (
              <motion.div
                key={mosque.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={mosque.image}
                    alt={mosque.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {mosque.name}
                  </h3>
                  
                  <div className="flex items-start gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-sm">{mosque.address}</p>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {mosque.description}
                  </p>

                  {/* CTA Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                    Masuk sebagai Jamaah
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredMosques.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
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
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 mt-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/masjid/masjid.webp"
            alt="Masjid Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Masjid Anda Belum Terdaftar?
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
              Daftarkan masjid Anda sekarang dan mulai terima donasi secara transparan dan amanah
            </p>
            <Link 
              href="/daftar-masjid"
              className="inline-block px-10 py-5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              Daftarkan Masjid Sekarang
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Spacer before Footer */}
      <div className="h-70"></div>

      <Footer />
    </div>
  )
}
