"use client"

import { useRef, useEffect, useState } from "react"
import { PropertyBookingCard } from "./property-booking-card"

const properties = [
  {
    propertyName: "Renovasi Masjid Al-Ikhlas",
    location: "Jakarta Selatan",
    duration: "Target 3 bulan",
    availableDate: "Aktif sekarang",
    image: "/images/property-beach-villa.jpg",
    pricePerNight: 150000000,
    propertyType: "Program Renovasi",
    features: ["Perbaikan Atap", "Cat Ulang", "Renovasi Toilet", "Perbaikan Lantai"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.9,
  },
  {
    propertyName: "Pembangunan Masjid Nurul Huda",
    location: "Bandung, Jawa Barat",
    duration: "Target 6 bulan",
    availableDate: "Aktif sekarang",
    image: "/images/property-mountain-cabin.jpg",
    pricePerNight: 500000000,
    propertyType: "Pembangunan Baru",
    features: ["Kapasitas 500 Jamaah", "Fasilitas Wudhu", "Ruang Kajian", "Perpustakaan"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.8,
  },
  {
    propertyName: "Santunan Anak Yatim",
    location: "Surabaya, Jawa Timur",
    duration: "Program Bulanan",
    availableDate: "Aktif sekarang",
    image: "/images/property-city-loft.jpg",
    pricePerNight: 50000000,
    propertyType: "Program Sosial",
    features: ["100 Anak Yatim", "Biaya Pendidikan", "Perlengkapan Sekolah", "Santunan Bulanan"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.7,
  },
  {
    propertyName: "Masjid Ar-Rahman",
    location: "Yogyakarta",
    duration: "Target 4 bulan",
    availableDate: "Aktif sekarang",
    image: "/images/property-tuscan-estate.jpg",
    pricePerNight: 200000000,
    propertyType: "Renovasi & Perluasan",
    features: ["Perluasan Area", "AC Masjid", "Sound System", "Karpet Baru"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.9,
  },
  {
    propertyName: "Beasiswa Tahfidz",
    location: "Depok, Jawa Barat",
    duration: "Program Tahunan",
    availableDate: "Aktif sekarang",
    image: "/images/property-tropical-bungalow.jpg",
    pricePerNight: 75000000,
    propertyType: "Program Pendidikan",
    features: ["50 Santri", "Biaya Makan", "Asrama", "Bimbingan Ustadz"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.8,
  },
  {
    propertyName: "Masjid Al-Falah",
    location: "Tangerang, Banten",
    duration: "Target 5 bulan",
    availableDate: "Aktif sekarang",
    image: "/images/property-lakefront-modern.jpg",
    pricePerNight: 300000000,
    propertyType: "Pembangunan Menara",
    features: ["Menara 3 Lantai", "Ruang Serbaguna", "Lift", "Tempat Parkir"],
    amenities: ["Transparan", "Terverifikasi", "Update Rutin"],
    rating: 4.9,
  },
]

export function PricingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const positionRef = useRef(0)
  const animationRef = useRef<number>()

  const duplicatedProperties = [...properties, ...properties, ...properties]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const speed = isHovered ? 0.3 : 1 // Slow down on hover instead of changing animation duration
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      positionRef.current += speed * (deltaTime / 16)

      const totalWidth = scrollContainer.scrollWidth / 3

      if (positionRef.current >= totalWidth) {
        positionRef.current = 0
      }

      scrollContainer.style.transform = `translateX(-${positionRef.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovered])

  return (
    <section id="pricing" className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif">Program Donasi Unggulan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Temukan program donasi dari masjid terverifikasi. Berdonasi dengan penuh kepercayaan.
        </p>
      </div>

      <div className="relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div ref={scrollRef} className="flex gap-6" style={{ width: "fit-content" }}>
          {duplicatedProperties.map((property, index) => (
            <div key={index} className="flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-[400px]">
              <PropertyBookingCard {...property} currency="Rp " onBook={() => console.log(`Donasi ${property.propertyName}`)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
