"use client"

import { useEffect, useState } from "react"
import { MapPin, BadgeCheck } from "lucide-react"
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section"

interface ApprovedMosque {
  id: string
  mosqueName: string
  mosqueAddress: string
  province: string
  regency: string
  district: string
  village: string
  mosqueImage: string | null
}

function MosqueCard({ mosque }: { mosque: ApprovedMosque }) {
  const imageUrl = mosque.mosqueImage
    ? mosque.mosqueImage.startsWith("/api/files/")
      ? mosque.mosqueImage
      : null
    : null

  const location = [mosque.regency, mosque.province].filter(Boolean).join(", ")

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={mosque.mosqueName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        {/* Verified badge */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-emerald-500 text-white rounded-full shadow-sm">
            <BadgeCheck className="w-3 h-3" />
            Terverifikasi
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {mosque.mosqueName}
        </h3>
        <div className="flex items-start gap-2 text-gray-500">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
          <p className="text-sm line-clamp-2">{location || mosque.mosqueAddress}</p>
        </div>
      </div>
    </div>
  )
}

export function MasjidTerdaftarSection() {
  const [mosques, setMosques] = useState<ApprovedMosque[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/approved-mosques")
      .then((r) => r.json())
      .then((json) => setMosques(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || mosques.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection variant="fadeInUp" className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-4">
            <BadgeCheck className="w-4 h-4" />
            Masjid Terverifikasi
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Masjid yang Sudah Bergabung
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Masjid-masjid berikut telah terverifikasi dan resmi terdaftar di platform DanaMasjid.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mosques.map((mosque) => (
            <StaggerItem key={mosque.id}>
              <MosqueCard mosque={mosque} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
