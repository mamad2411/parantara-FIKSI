// Service layer for Masjid data
// Currently reads from local JSON files
// To upgrade to backend: replace these imports with fetch() calls

import type { MosqueSummary, MosqueDetail } from "@/lib/types/masjid"
import mosquesData from "@/data/masjid/mosques.json"
import alIkhlasData from "@/data/masjid/al-ikhlas.json"
import alFalahData from "@/data/masjid/al-falah.json"
import nurulImanData from "@/data/masjid/nurul-iman.json"
import alHattamData from "@/data/masjid/al-hattam.json"
import baitulMuttaqinData from "@/data/masjid/baitul-muttaqin.json"
import nurulHudaData from "@/data/masjid/nurul-huda.json"


// Map domain → detail JSON
const mosqueDetailMap: Record<string, any> = {
  "al-ikhlas": alIkhlasData,
  "al-falah": alFalahData,
  "nurul-iman": nurulImanData,
  "al-hattam": alHattamData,
  "baitul-muttaqin": baitulMuttaqinData,
  "nurul-huda": nurulHudaData,
}

/**
 * Get all mosques (summary list)
 * Future: GET /api/mosques
 */
export function getAllMosques(): MosqueSummary[] {
  return mosquesData as MosqueSummary[]
}

/**
 * Get mosque detail by domain
 * Future: GET /api/mosques/:domain
 */
export function getMosqueByDomain(domain: string): MosqueDetail | null {
  const data = mosqueDetailMap[domain]
  return data ? (data as MosqueDetail) : null
}

/**
 * Search mosques by name or location
 * Future: GET /api/mosques?search=query
 */
export function searchMosques(query: string): MosqueSummary[] {
  const q = query.toLowerCase()
  return getAllMosques().filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q)
  )
}

/**
 * Get all available mosque domains
 * Future: GET /api/mosques/domains
 */
export function getAllMosqueDomains(): string[] {
  return getAllMosques().map((m) => m.domain)
}
