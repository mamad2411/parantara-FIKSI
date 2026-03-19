// @ts-nocheck
import { Building2, MapPin, CheckCircle, XCircle, Navigation, Map as MapIcon, Search, Crosshair } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import toast from "react-hot-toast"
import { ProductionFileUpload } from "@/components/ui/production-file-upload"
import { 
  getProvinces, 
  getRegencies, 
  getDistricts, 
  getVillages,
  type Province,
  type Regency,
  type District,
  type Village
} from "@/lib/indonesia-regions"

// Dynamic import to avoid SSR issues with Leaflet
const MapPicker = dynamic(
  () => import("@/components/maps/MapPicker").then((mod) => mod.MapPicker),
  { ssr: false }
)

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
}

// Custom hook for debounced validation
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Smart address parser for Indonesian addresses
const parseIndonesianAddress = (fullAddress: string) => {
  if (!fullAddress || fullAddress.length < 10) return null

  const addressLower = fullAddress.toLowerCase()
  
  // Common Indonesian address patterns
  const patterns = {
    province: [
      /(?:provinsi\s+)?(?:dki\s+)?jakarta(?:\s+(?:pusat|utara|selatan|barat|timur))?/i,
      /(?:provinsi\s+)?jawa\s+(?:barat|tengah|timur)/i,
      /(?:provinsi\s+)?sumatera\s+(?:utara|barat|selatan|tengah)/i,
      /(?:provinsi\s+)?kalimantan\s+(?:barat|tengah|timur|selatan|utara)/i,
      /(?:provinsi\s+)?sulawesi\s+(?:utara|tengah|selatan|tenggara|barat)/i,
      /(?:provinsi\s+)?(?:di\s+)?yogyakarta/i,
      /(?:provinsi\s+)?(?:aceh|riau|jambi|bengkulu|lampung|banten|bali|gorontalo)/i,
      /(?:provinsi\s+)?nusa\s+tenggara\s+(?:barat|timur)/i,
      /(?:provinsi\s+)?maluku(?:\s+utara)?/i,
      /(?:provinsi\s+)?papua(?:\s+barat)?/i,
      /(?:provinsi\s+)?bangka\s+belitung/i,
      /(?:provinsi\s+)?kepulauan\s+riau/i
    ],
    regency: [
      /(?:kota|kabupaten|kab\.?)\s+([a-z\s]+)/i,
      /([a-z\s]+)\s+(?:city|regency)/i
    ],
    district: [
      /(?:kecamatan|kec\.?)\s+([a-z\s]+)/i,
      /([a-z\s]+)\s+district/i
    ],
    village: [
      /(?:kelurahan|kel\.?|desa)\s+([a-z\s]+)/i,
      /([a-z\s]+)\s+(?:village|ward)/i
    ]
  }

  const results = {
    province: '',
    regency: '',
    district: '',
    village: ''
  }

  // Extract province
  for (const pattern of patterns.province) {
    const match = addressLower.match(pattern)
    if (match) {
      results.province = match[0].replace(/^(provinsi\s+)?/i, '').trim()
      break
    }
  }

  // Extract regency/city
  for (const pattern of patterns.regency) {
    const match = addressLower.match(pattern)
    if (match) {
      results.regency = match[1] ? match[1].trim() : match[0].replace(/^(kota|kabupaten|kab\.?)\s+/i, '').trim()
      break
    }
  }

  // Extract district
  for (const pattern of patterns.district) {
    const match = addressLower.match(pattern)
    if (match) {
      results.district = match[1] ? match[1].trim() : match[0].replace(/^(kecamatan|kec\.?)\s+/i, '').trim()
      break
    }
  }

  // Extract village
  for (const pattern of patterns.village) {
    const match = addressLower.match(pattern)
    if (match) {
      results.village = match[1] ? match[1].trim() : match[0].replace(/^(kelurahan|kel\.?|desa)\s+/i, '').trim()
      break
    }
  }

  // Fallback: try to extract from comma-separated parts
  if (!results.province || !results.regency || !results.district || !results.village) {
    const parts = fullAddress.split(',').map(p => p.trim()).filter(p => p.length > 2)
    
    // Look for administrative keywords in parts
    for (const part of parts) {
      const partLower = part.toLowerCase()
      
      if (!results.province && patterns.province.some(p => p.test(partLower))) {
        results.province = part.replace(/^(provinsi\s+)?/i, '').trim()
      }
      
      if (!results.regency && (partLower.includes('kota') || partLower.includes('kabupaten') || partLower.includes('kab'))) {
        results.regency = part.replace(/^(kota|kabupaten|kab\.?)\s+/i, '').trim()
      }
      
      if (!results.district && (partLower.includes('kecamatan') || partLower.includes('kec'))) {
        results.district = part.replace(/^(kecamatan|kec\.?)\s+/i, '').trim()
      }
      
      if (!results.village && (partLower.includes('kelurahan') || partLower.includes('desa') || partLower.includes('kel'))) {
        results.village = part.replace(/^(kelurahan|kel\.?|desa)\s+/i, '').trim()
      }
    }
  }

  return results
}

export default function Step1DataMasjid({ formData, setFormData }: Step1Props) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [coordinates, setCoordinates] = useState({ lat: -6.2088, lng: 106.8456 }) // Default Jakarta
  const [showMap, setShowMap] = useState(false)
  
  // New state for integrated address validation
  const [addressValidation, setAddressValidation] = useState({
    province: { valid: false, message: '', data: null },
    regency: { valid: false, message: '', data: null },
    district: { valid: false, message: '', data: null },
    village: { valid: false, message: '', data: null },
    parsing: false
  })

  // Debounced address for parsing
  const debouncedAddress = useDebounce(formData.mosqueAddress || '', 1000)

  // Validate parsed address components
  const validateAddressComponents = async (components: any) => {
    const validation = {
      province: { valid: false, message: '', data: null },
      regency: { valid: false, message: '', data: null },
      district: { valid: false, message: '', data: null },
      village: { valid: false, message: '', data: null }
    }

    if (!components) return validation

    // Validate province
    if (components.province && provinces.length > 0) {
      const foundProvince = provinces.find(p => {
        const pName = p.name.toLowerCase().replace(/\s+/g, '')
        const searchName = components.province.toLowerCase().replace(/\s+/g, '')
        return pName.includes(searchName) || searchName.includes(pName) ||
               p.name.toLowerCase() === components.province.toLowerCase()
      })
      
      if (foundProvince) {
        validation.province = { valid: true, message: `✓ ${foundProvince.name}`, data: foundProvince }
        
        // Load regencies for validation
        const regenciesData = await getRegencies(foundProvince.id)
        
        // Validate regency
        if (components.regency) {
          const foundRegency = regenciesData.find(r => {
            const rName = r.name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '').replace(/\s+/g, '')
            const searchName = components.regency.toLowerCase().replace(/\s+/g, '')
            return rName.includes(searchName) || searchName.includes(rName) ||
                   r.name.toLowerCase().includes(components.regency.toLowerCase())
          })
          
          if (foundRegency) {
            validation.regency = { valid: true, message: `✓ ${foundRegency.name}`, data: foundRegency }
            
            // Load districts for validation
            const districtsData = await getDistricts(foundRegency.id)
            
            // Validate district
            if (components.district) {
              const foundDistrict = districtsData.find(d => {
                const dName = d.name.toLowerCase().replace(/\s+/g, '')
                const searchName = components.district.toLowerCase().replace(/\s+/g, '')
                return dName.includes(searchName) || searchName.includes(dName) ||
                       d.name.toLowerCase() === components.district.toLowerCase()
              })
              
              if (foundDistrict) {
                validation.district = { valid: true, message: `✓ ${foundDistrict.name}`, data: foundDistrict }
                
                // Load villages for validation
                const villagesData = await getVillages(foundDistrict.id)
                
                // Validate village
                if (components.village) {
                  const foundVillage = villagesData.find(v => {
                    const vName = v.name.toLowerCase().replace(/\s+/g, '')
                    const searchName = components.village.toLowerCase().replace(/\s+/g, '')
                    return vName.includes(searchName) || searchName.includes(vName) ||
                           v.name.toLowerCase() === components.village.toLowerCase()
                  })
                  
                  if (foundVillage) {
                    validation.village = { valid: true, message: `✓ ${foundVillage.name}`, data: foundVillage }
                  } else {
                    validation.village = { valid: false, message: `✗ Kelurahan/Desa "${components.village}" tidak ditemukan di ${foundDistrict.name}`, data: null }
                  }
                } else {
                  validation.village = { valid: false, message: '⚠ Kelurahan/Desa tidak terdeteksi dalam alamat', data: null }
                }
              } else {
                validation.district = { valid: false, message: `✗ Kecamatan "${components.district}" tidak ditemukan di ${foundRegency.name}`, data: null }
              }
            } else {
              validation.district = { valid: false, message: '⚠ Kecamatan tidak terdeteksi dalam alamat', data: null }
            }
          } else {
            validation.regency = { valid: false, message: `✗ Kota/Kabupaten "${components.regency}" tidak ditemukan di ${foundProvince.name}`, data: null }
          }
        } else {
          validation.regency = { valid: false, message: '⚠ Kota/Kabupaten tidak terdeteksi dalam alamat', data: null }
        }
      } else {
        validation.province = { valid: false, message: `✗ Provinsi "${components.province}" tidak ditemukan`, data: null }
      }
    } else {
      validation.province = { valid: false, message: '⚠ Provinsi tidak terdeteksi dalam alamat', data: null }
    }

    return validation
  }

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Parse and validate address when user stops typing
  useEffect(() => {
    const parseAndValidateAddress = async () => {
      if (!debouncedAddress || debouncedAddress.length < 10) {
        setAddressValidation({
          province: { valid: false, message: '', data: null },
          regency: { valid: false, message: '', data: null },
          district: { valid: false, message: '', data: null },
          village: { valid: false, message: '', data: null },
          parsing: false
        })
        return
      }

      setAddressValidation(prev => ({ ...prev, parsing: true }))

      try {
        // Parse address components
        const components = parseIndonesianAddress(debouncedAddress)
        
        if (components) {
          console.log("Parsed components:", components)
          
          // Validate components against database
          const validation = await validateAddressComponents(components)
          
          // Update form data with parsed and validated components
          if (validation.province.valid && validation.province.data) {
            setFormData(prev => ({
              ...prev,
              province: validation.province.data.name,
              regency: validation.regency.valid ? validation.regency.data?.name || '' : '',
              district: validation.district.valid ? validation.district.data?.name || '' : '',
              village: validation.village.valid ? validation.village.data?.name || '' : ''
            }))
          }
          
          setAddressValidation({
            ...validation,
            parsing: false
          })
        } else {
          setAddressValidation({
            province: { valid: false, message: '⚠ Format alamat tidak dapat diparsing. Gunakan format: Jl. [Nama Jalan], Kec. [Kecamatan], [Kota/Kabupaten], [Provinsi]', data: null },
            regency: { valid: false, message: '', data: null },
            district: { valid: false, message: '', data: null },
            village: { valid: false, message: '', data: null },
            parsing: false
          })
        }
      } catch (error) {
        console.error("Error parsing address:", error)
        setAddressValidation({
          province: { valid: false, message: '✗ Gagal memproses alamat', data: null },
          regency: { valid: false, message: '', data: null },
          district: { valid: false, message: '', data: null },
          village: { valid: false, message: '', data: null },
          parsing: false
        })
      }
    }

    parseAndValidateAddress()
  }, [debouncedAddress, provinces])

  const loadAllData = async () => {
    const provincesData = await getProvinces()
    setProvinces(provincesData)
  }

  const loadRegencies = async (provinceId: string) => {
    const data = await getRegencies(provinceId)
    setRegencies(data)
  }

  const loadDistricts = async (regencyId: string) => {
    const data = await getDistricts(regencyId)
    setDistricts(data)
  }

  const loadVillages = async (districtId: string) => {
    const data = await getVillages(districtId)
    setVillages(data)
  }

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      toast.loading("Mengambil alamat dari lokasi...", { id: "reverse-geocoding" })
      
      // Single request, no retry delays — zoom 16 cukup untuk jalan + kelurahan + kecamatan
      let bestData = null
      
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}&zoom=16`)
        if (res.ok) bestData = await res.json()
      } catch { /* ignore */ }

      // Jika state kosong, coba zoom 10 sekali tanpa delay (Netlify serverless tidak perlu rate limit client-side)
      if (bestData?.address && !bestData.address.state) {
        try {
          const adminRes = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}&zoom=10`)
          if (adminRes.ok) {
            const adminData = await adminRes.json()
            if (adminData?.address?.state) {
              bestData.address = { ...adminData.address, ...bestData.address }
            }
          }
        } catch { /* ignore */ }
      }
      
      if (bestData && bestData.address) {
        const address = bestData.address
        const streetAddress = address
        const adminAddress = address
        // Build comprehensive full address with aggressive data extraction
        const addressComponents = []
        
        // Try to extract street/road information from multiple sources
        let streetName = address.road || streetAddress.road || address.pedestrian || address.path || 
                        address.residential || address.footway || address.cycleway || address.service || 
                        address.track || streetAddress.pedestrian || streetAddress.path || ''
        
        // If no street name, try to extract from display_name
        if (!streetName && bestData.display_name) {
          const displayParts = bestData.display_name.split(',')
          const firstPart = displayParts[0]?.trim() || ''
          
          // Check if first part looks like a street name
          if (firstPart && (firstPart.includes('Jl') || firstPart.includes('Jalan') || 
                           firstPart.includes('Gang') || firstPart.includes('Gg') ||
                           firstPart.includes('Komplek') || firstPart.includes('Perumahan') ||
                           firstPart.length > 5)) {
            streetName = firstPart.replace(/^(Jl\.?\s*|Jalan\s*)/i, '')
          }
        }
        
        // Add house number if available
        const houseNumber = address.house_number || streetAddress.house_number || ''
        if (houseNumber) {
          addressComponents.push(`No. ${houseNumber}`)
        }
        
        // Add street name with proper formatting
        if (streetName) {
          const formattedStreet = streetName.startsWith('Jl') ? streetName : `Jl. ${streetName}`
          addressComponents.push(formattedStreet)
        }
        
        // Try to find RT/RW information from multiple sources
        let rtRwInfo = address.quarter || streetAddress.quarter || address.city_block || 
                      streetAddress.city_block || address.suburb_block || ''
        
        // If no RT/RW, try to extract from other fields or create generic one
        if (!rtRwInfo) {
          const possibleRtRw = address.neighbourhood || address.hamlet || streetAddress.neighbourhood || ''
          if (possibleRtRw && (possibleRtRw.includes('RT') || possibleRtRw.includes('RW') || 
                              possibleRtRw.match(/\d+\/\d+/))) {
            rtRwInfo = possibleRtRw
          } else if (streetName || houseNumber) {
            // Jangan isi dummy RT/RW — user harus isi manual
            rtRwInfo = ''
          }
        }
        
        // Add RT/RW if found
        if (rtRwInfo) {
          addressComponents.push(rtRwInfo)
        }
        
        // Add area/neighborhood information
        const area = address.neighbourhood || streetAddress.neighbourhood || address.suburb || 
                    address.hamlet || address.quarter
        if (area && !addressComponents.some(comp => comp.toLowerCase().includes(area.toLowerCase())) &&
            area !== rtRwInfo && !area.includes('RT') && !area.includes('RW')) {
          addressComponents.push(area)
        }
        
        let fullAddress = addressComponents.join(', ')
        
        // If still no detailed address, try alternative approaches
        if (!fullAddress || fullAddress.length < 10) {
          const displayParts = bestData.display_name?.split(',') || []
          
          // Try to build address from display name parts
          const addressParts = []
          
          // First part might be street or area
          if (displayParts[0]) {
            let firstPart = displayParts[0].trim()
            // Add generic details if it's too simple
            if (firstPart && firstPart.length > 3) {
              if (!firstPart.includes('Jl') && !firstPart.includes('Gang') && !firstPart.includes('Komplek')) {
                firstPart = `Jl. ${firstPart}`
              }
              addressParts.push(firstPart)
              
              // Jangan tambah dummy RT/RW — user isi manual di field RT/RW
            }
          }
          
          // Second part might be neighborhood
          if (displayParts[1] && displayParts[1].trim() !== displayParts[0]?.trim()) {
            addressParts.push(displayParts[1].trim())
          }
          
          fullAddress = addressParts.join(', ')
        }
        
        // If still generic, add some context with coordinates
        if (!fullAddress || fullAddress.length < 8) {
          fullAddress = `Alamat detail tidak tersedia, Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }
        
        // Extract administrative levels with comprehensive mapping from all data sources
        let province = adminAddress.state || address.state || streetAddress.state || 
                      adminAddress.province || address.province || streetAddress.province || ''
        let regency = adminAddress.city || address.city || streetAddress.city || 
                     adminAddress.county || address.county || streetAddress.county ||
                     adminAddress.municipality || address.municipality || streetAddress.municipality || 
                     adminAddress.town || address.town || streetAddress.town || ''
        
        // Better district extraction - try multiple fields and all data sources
        let district = adminAddress.suburb || adminAddress.district || adminAddress.subdistrict ||
                      adminAddress.city_district || adminAddress.town_district ||
                      address.suburb || address.district || address.subdistrict || 
                      address.town_district || address.city_district ||
                      streetAddress.suburb || streetAddress.district || streetAddress.subdistrict || ''
        
        // If district is still empty, try alternative fields but avoid duplication with village
        if (!district) {
          const altDistrict = address.neighbourhood || address.hamlet || streetAddress.neighbourhood || ''
          if (altDistrict && altDistrict !== (address.village || '')) {
            district = altDistrict
          }
        }
        
        let village = address.village || address.neighbourhood || address.hamlet || address.quarter || 
                     address.residential || adminAddress.village || streetAddress.village || 
                     streetAddress.neighbourhood || streetAddress.hamlet || ''
        
        // Clean administrative names
        province = province.replace(/^(Provinsi|Province|Prov\.?)\s*/i, '').trim()
        regency = regency.replace(/^(Kota|Kabupaten|City|Regency|Kab\.?)\s*/i, '').trim()
        district = district.replace(/^(Kecamatan|District|Kec\.?)\s*/i, '').trim()
        village = village.replace(/^(Kelurahan|Desa|Village|Kel\.?)\s*/i, '').trim()
        
        // Parse from display_name if administrative data is missing
        if ((!province || !regency || !district || !village) && bestData.display_name) {
          const displayParts = bestData.display_name.split(',').map(s => s.trim())
          
          // Indonesian province patterns
          const provincePatterns = [
            /^(DKI\s+)?Jakarta$/i,
            /^DI\s+Yogyakarta$/i,
            /^Jawa\s+(Barat|Tengah|Timur)$/i,
            /^Sumatera\s+(Utara|Barat|Selatan|Tengah)$/i,
            /^Kalimantan\s+(Barat|Tengah|Timur|Selatan|Utara)$/i,
            /^Sulawesi\s+(Utara|Tengah|Selatan|Tenggara|Barat)$/i,
            /^Nusa\s+Tenggara\s+(Barat|Timur)$/i,
            /^Maluku(\s+Utara)?$/i,
            /^Papua(\s+Barat)?$/i,
            /^(Aceh|Riau|Jambi|Bengkulu|Lampung|Banten|Bali|Gorontalo)$/i,
            /^Bangka\s+Belitung$/i,
            /^Kepulauan\s+Riau$/i
          ]
          
          // Find province in display name
          if (!province) {
            for (const part of displayParts.reverse()) { // Start from end (country -> province)
              if (provincePatterns.some(pattern => pattern.test(part))) {
                province = part
                break
              }
            }
          }
          
          // Find regency/city and district from display name (work backwards from province)
          const reversedParts = displayParts.reverse()
          let foundProvince = false
          let foundRegency = false
          
          for (let i = 0; i < reversedParts.length; i++) {
            const candidate = reversedParts[i]
            
            if (provincePatterns.some(pattern => pattern.test(candidate))) {
              foundProvince = true
              continue
            }
            
            if (foundProvince && candidate && candidate !== 'Indonesia' && candidate.length > 2) {
              if (!regency && !foundRegency) {
                regency = candidate
                foundRegency = true
              } else if (!district && foundRegency) {
                district = candidate
              } else if (!village && foundRegency && district) {
                village = candidate
                break
              }
            }
          }
        }
        
        // Ensure we have at least basic administrative data
        if (!province && bestData.display_name) {
          // Try to extract province from any part of display name
          const displayLower = bestData.display_name.toLowerCase()
          if (displayLower.includes('jakarta')) province = 'DKI Jakarta'
          else if (displayLower.includes('yogyakarta')) province = 'DI Yogyakarta'
          else if (displayLower.includes('jawa barat')) province = 'Jawa Barat'
          else if (displayLower.includes('jawa tengah')) province = 'Jawa Tengah'
          else if (displayLower.includes('jawa timur')) province = 'Jawa Timur'
          else if (displayLower.includes('sumatera')) {
            if (displayLower.includes('utara')) province = 'Sumatera Utara'
            else if (displayLower.includes('barat')) province = 'Sumatera Barat'
            else if (displayLower.includes('selatan')) province = 'Sumatera Selatan'
            else province = 'Sumatera'
          }
        }
        
        // Provide fallback values if still missing
        if (!regency && province) {
          regency = 'Kota/Kabupaten [Belum Terdeteksi]'
        }
        if (!district && regency) {
          district = 'Kecamatan [Belum Terdeteksi]'
        }
        if (!village && district) {
          village = 'Kelurahan/Desa [Belum Terdeteksi]'
        }
        
        // Ensure we have meaningful address data with proper formatting
        if (!fullAddress || fullAddress.length < 5) {
          const fallbackParts = []
          if (village) fallbackParts.push(village)
          if (district) fallbackParts.push(`Kec. ${district}`)
          if (regency) fallbackParts.push(regency)
          
          if (fallbackParts.length > 0) {
            fullAddress = fallbackParts.join(', ')
          } else {
            fullAddress = `Lokasi ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          }
        }
        
        // Add RT/RW info to address if available but not already included
        if (address.quarter && !fullAddress.includes('RT') && !fullAddress.includes('RW')) {
          fullAddress = `${fullAddress}, ${address.quarter}`
        }
        
        // Add more context to address if it's still too generic
        if (fullAddress.length < 20 && (village || district)) {
          const contextParts = [fullAddress]
          if (village && !fullAddress.includes(village)) contextParts.push(village)
          if (district && !fullAddress.includes(district)) contextParts.push(`Kec. ${district}`)
          fullAddress = [...new Set(contextParts)].join(', ')
        }
        
        console.log("Final extracted address:", { fullAddress, province, regency, district, village })
        const comprehensiveAddress = []
        
        // Add street details if available
        if (fullAddress && !fullAddress.includes('Koordinat:') && !fullAddress.includes('Lokasi ')) {
          comprehensiveAddress.push(fullAddress)
        } else {
          // Fallback street info
          const streetParts = []
          if (address.house_number) streetParts.push(`No. ${address.house_number}`)
          if (streetName) {
            const formattedStreet = streetName.startsWith('Jl') ? streetName : `Jl. ${streetName}`
            streetParts.push(formattedStreet)
          } else {
            streetParts.push('Jl. [Nama Jalan]')
          }
          if (rtRwInfo) {
            streetParts.push(rtRwInfo)
          }
          // Jangan push dummy RT/RW — user isi di field terpisah
          comprehensiveAddress.push(streetParts.join(', '))
        }
        if (village) comprehensiveAddress.push(`Kel. ${village}`)
        if (district) comprehensiveAddress.push(`Kec. ${district}`)
        if (regency) {
          // Smart Kota vs Kabupaten detection for Indonesian cities
          const kotaList = [
            // DKI Jakarta
            'jakarta pusat', 'jakarta utara', 'jakarta selatan', 'jakarta barat', 'jakarta timur',
            // Jawa Barat
            'bandung', 'bekasi', 'bogor', 'cimahi', 'cirebon', 'depok', 'sukabumi', 'tasikmalaya', 'banjar',
            // Jawa Tengah  
            'magelang', 'pekalongan', 'salatiga', 'semarang', 'surakarta', 'tegal',
            // Jawa Timur
            'batu', 'blitar', 'kediri', 'madiun', 'malang', 'mojokerto', 'pasuruan', 'probolinggo', 'surabaya',
            // Sumatera Utara
            'binjai', 'gunungsitoli', 'medan', 'padangsidimpuan', 'pematangsiantar', 'sibolga', 'tanjungbalai', 'tebing tinggi',
            // Sumatera Barat
            'bukittinggi', 'padang', 'padangpanjang', 'pariaman', 'payakumbuh', 'sawahlunto', 'solok',
            // Sumatera Selatan
            'lubuklinggau', 'pagar alam', 'palembang', 'prabumulih',
            // Riau
            'dumai', 'pekanbaru',
            // Kepulauan Riau
            'batam', 'tanjungpinang',
            // Jambi
            'jambi', 'sungai penuh',
            // Bengkulu
            'bengkulu',
            // Lampung
            'bandar lampung', 'metro',
            // Banten
            'cilegon', 'serang', 'tangerang', 'tangerang selatan',
            // Kalimantan Barat
            'pontianak', 'singkawang',
            // Kalimantan Tengah
            'palangka raya',
            // Kalimantan Selatan
            'banjarbaru', 'banjarmasin',
            // Kalimantan Timur
            'balikpapan', 'bontang', 'samarinda',
            // Kalimantan Utara
            'tarakan',
            // Sulawesi Utara
            'bitung', 'kotamobagu', 'manado', 'tomohon',
            // Sulawesi Tengah
            'palu',
            // Sulawesi Selatan
            'makassar', 'palopo', 'parepare',
            // Sulawesi Tenggara
            'bau-bau', 'kendari',
            // Gorontalo
            'gorontalo',
            // Sulawesi Barat
            'mamuju',
            // Maluku
            'ambon', 'tual',
            // Maluku Utara
            'ternate', 'tidore kepulauan',
            // Papua Barat
            'sorong',
            // Papua
            'jayapura',
            // Bali
            'denpasar',
            // Nusa Tenggara Barat
            'bima', 'mataram',
            // Nusa Tenggara Timur
            'kupang',
            // Aceh
            'banda aceh', 'langsa', 'lhokseumawe', 'sabang', 'subulussalam',
            // DI Yogyakarta
            'yogyakarta'
          ]
          
          const regencyLower = regency.toLowerCase().trim()
          const isKota = kotaList.some(kota => {
            // Exact match or contains match for compound city names
            return regencyLower === kota || 
                   regencyLower.includes(kota) || 
                   kota.includes(regencyLower)
          })
          
          // Format regency properly based on type
          let formattedRegency = regency
          if (!regency.toLowerCase().startsWith('kota') && !regency.toLowerCase().startsWith('kabupaten')) {
            if (isKota) {
              formattedRegency = `Kota ${regency}`
            } else {
              formattedRegency = `Kabupaten ${regency}`
            }
          }
          
          comprehensiveAddress.push(formattedRegency)
        }
        if (province) {
          const formattedProvince = province.startsWith('Provinsi') ? province : `Provinsi ${province}`
          comprehensiveAddress.push(formattedProvince)
        }
        
        // Create final comprehensive address
        const finalComprehensiveAddress = comprehensiveAddress.join(', ')
        
        console.log("Final comprehensive address:", finalComprehensiveAddress)
        
        // Ekstrak RT/RW dari data geocoding jika ada (format: "RT X RW Y" atau "X/Y")
        let extractedRT = ''
        let extractedRW = ''
        const rtRwRaw = address.quarter || streetAddress.quarter || address.city_block || ''
        if (rtRwRaw) {
          const rtMatch = rtRwRaw.match(/RT\s*(\d+)/i)
          const rwMatch = rtRwRaw.match(/RW\s*(\d+)/i)
          const slashMatch = rtRwRaw.match(/(\d+)\s*\/\s*(\d+)/)
          if (rtMatch) extractedRT = rtMatch[1].padStart(3, '0')
          if (rwMatch) extractedRW = rwMatch[1].padStart(3, '0')
          if (!extractedRT && !extractedRW && slashMatch) {
            extractedRT = slashMatch[1].padStart(3, '0')
            extractedRW = slashMatch[2].padStart(3, '0')
          }
        }
        
        // Jika RT/RW berhasil diekstrak dari geocoding, sisipkan ke alamat
        const rtRwFromGeo = extractedRT && extractedRW
          ? `RT ${extractedRT}/RW ${extractedRW}`
          : ''
        // Jika ada RT/RW dari geocoding dan belum ada di finalComprehensiveAddress, sisipkan setelah jalan
        let finalAddr = finalComprehensiveAddress
        if (rtRwFromGeo && !finalAddr.includes('RT ')) {
          // Sisipkan setelah komponen jalan pertama (sebelum Kel.)
          finalAddr = finalAddr.replace(/(Kel\.)/, `${rtRwFromGeo}, $1`)
        }
        
        // Update form data — RT/RW hanya diisi jika benar-benar ada dari geocoding
        const updatedFormData = {
          ...formData,
          mosqueAddress: finalAddr,
          province: province,
          regency: regency,
          district: district,
          village: village,
          ...(extractedRT && { rt: extractedRT }),
          ...(extractedRW && { rw: extractedRW }),
          latitude: lat.toString(),
          longitude: lng.toString()
        }
        
        setFormData(updatedFormData)
        
        // Load validation data if province found
        if (province && provinces.length > 0) {
          const foundProvince = provinces.find(p => {
            const pName = p.name.toLowerCase().replace(/\s+/g, '')
            const searchName = province.toLowerCase().replace(/\s+/g, '')
            return pName.includes(searchName) || searchName.includes(pName) ||
                   p.name.toLowerCase() === province.toLowerCase()
          })
          
          if (foundProvince) {
            console.log("Found matching province:", foundProvince.name)
            await loadRegencies(foundProvince.id)
          }
        }
        
        const successMsg = `Alamat lengkap berhasil diisi dari lokasi terkini: ${province || 'Lokasi terdeteksi'}`
        toast.success(successMsg, { id: "reverse-geocoding" })
      } else {
        toast.error("Tidak dapat mengambil alamat dari lokasi ini", { id: "reverse-geocoding" })
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      toast.error("Gagal mengambil alamat. Silakan isi manual.", { id: "reverse-geocoding" })
    }
  }

  const getCurrentLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          setShowMap(true)
          
          // Perform reverse geocoding to fill address fields
          await reverseGeocode(latitude, longitude)
          
          setLoadingLocation(false)
          toast.success("Lokasi dan alamat berhasil didapatkan!")
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Tidak dapat mengakses lokasi. Pastikan Anda memberikan izin lokasi.")
          setLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      toast.error("Browser Anda tidak mendukung geolocation")
      setLoadingLocation(false)
    }
  }

  const searchCoordinates = async () => {
    const rtRwStr = (formData.rt && formData.rw)
      ? `RT ${formData.rt.padStart(3,'0')}/RW ${formData.rw.padStart(3,'0')}, `
      : ''
    const fullAddress = `${formData.mosqueAddress}, ${rtRwStr}${formData.village}, ${formData.district}, ${formData.regency}, ${formData.province}`
    
    if (!formData.mosqueAddress || !formData.province) {
      toast.error("Mohon isi alamat dan provinsi terlebih dahulu")
      return
    }

    toast.loading("Mencari koordinat...", { id: "geocoding" })
    
    try {
      // Gunakan proxy API route untuk menghindari CORS
      const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(fullAddress)}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        setCoordinates({ lat: latitude, lng: longitude })
        setFormData({ 
          ...formData, 
          latitude: latitude.toString(), 
          longitude: longitude.toString() 
        })
        setShowMap(true)
        toast.success("Koordinat berhasil ditemukan!", { id: "geocoding" })
      } else {
        toast.error("Lokasi tidak ditemukan. Coba gunakan 'Lokasi Terkini' atau masukkan koordinat manual.", { id: "geocoding" })
      }
    } catch (error) {
      console.error("Error geocoding:", error)
      toast.error("Gagal mencari koordinat. Silakan coba lagi.", { id: "geocoding" })
    }
  }

  const handleMapLocationChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng })
    
    // Debounce 1.2 detik — tunggu user berhenti drag sebelum hit geocoding API
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current)
    geocodeTimerRef.current = setTimeout(() => {
      reverseGeocode(lat, lng)
    }, 1200)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-600" />
          Data Masjid
        </h2>
        <p className="text-sm text-gray-600">Informasi dasar dan alamat lengkap masjid Anda</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          Informasi Dasar
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Masjid <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.mosqueName}
              onChange={(e) => setFormData({ ...formData, mosqueName: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Contoh: Masjid Al-Ikhlas"
              required
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Foto tampak depan masjid — wajib horizontal (landscape). Foto vertikal tidak diterima.</p>
            <ProductionFileUpload
              id="mosqueImage"
              label="Foto Masjid"
              file={formData.mosqueImage}
              onFileChange={(file) => {
                if (!file) { setFormData({ ...formData, mosqueImage: null }); return }
                const img = new Image()
                img.onload = () => {
                  if (img.width < img.height) {
                    toast.error("Foto harus horizontal (landscape). Foto vertikal tidak diterima.", { duration: 4000, position: 'top-center' })
                    return
                  }
                  setFormData({ ...formData, mosqueImage: file })
                  URL.revokeObjectURL(img.src)
                }
                img.src = URL.createObjectURL(file)
              }}
              accept=".jpg,.jpeg,.png,.webp"
              required={true}
              placeholder="Drag & drop atau klik — wajib horizontal (landscape)"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          Alamat Lengkap dengan Validasi Otomatis
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Ketik alamat lengkap dengan format: Jl. [Nama Jalan], RT/RW, Kec. [Kecamatan], [Kota/Kabupaten], [Provinsi]. Sistem akan memvalidasi otomatis.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.mosqueAddress}
                onChange={(e) => setFormData({ ...formData, mosqueAddress: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                rows={4}
                placeholder="Contoh: Jl. Bojong Pondok Terong No. 123, RT 001/RW 001, Kec. Cipayung, Kota Depok, Jawa Barat"
                required
              />
              {addressValidation.parsing && (
                <div className="absolute right-3 top-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal 10 karakter. Gunakan format lengkap untuk validasi otomatis.
            </p>
          </div>

          {/* Field RT dan RW */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RT <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">RT</span>
                <input
                  type="text"
                  value={formData.rt || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                    setFormData({ ...formData, rt: val })
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  placeholder="001"
                  maxLength={3}
                  required
                />
              </div>
              {formData.rt && (
                <p className="text-xs text-green-600 mt-1">RT {formData.rt.padStart(3, '0')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RW <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">RW</span>
                <input
                  type="text"
                  value={formData.rw || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                    setFormData({ ...formData, rw: val })
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  placeholder="001"
                  maxLength={3}
                  required
                />
              </div>
              {formData.rw && (
                <p className="text-xs text-green-600 mt-1">RW {formData.rw.padStart(3, '0')}</p>
              )}
            </div>
          </div>

          {/* Preview RT/RW gabungan */}
          {(formData.rt || formData.rw) && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-800 font-medium">
                RT {(formData.rt || '').padStart(3, '0')} / RW {(formData.rw || '').padStart(3, '0')}
              </p>
            </div>
          )}

          {/* Validation Results */}
          {(addressValidation.province.message || addressValidation.regency.message || 
            addressValidation.district.message || addressValidation.village.message) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Hasil Validasi Alamat
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addressValidation.province.message && (
                  <div className="flex items-center gap-2">
                    {addressValidation.province.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">Provinsi</p>
                      <p className={`text-xs ${addressValidation.province.valid ? 'text-green-700' : 'text-red-700'}`}>
                        {addressValidation.province.message}
                      </p>
                    </div>
                  </div>
                )}

                {addressValidation.regency.message && (
                  <div className="flex items-center gap-2">
                    {addressValidation.regency.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">Kota/Kabupaten</p>
                      <p className={`text-xs ${addressValidation.regency.valid ? 'text-green-700' : 'text-red-700'}`}>
                        {addressValidation.regency.message}
                      </p>
                    </div>
                  </div>
                )}

                {addressValidation.district.message && (
                  <div className="flex items-center gap-2">
                    {addressValidation.district.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">Kecamatan</p>
                      <p className={`text-xs ${addressValidation.district.valid ? 'text-green-700' : 'text-red-700'}`}>
                        {addressValidation.district.message}
                      </p>
                    </div>
                  </div>
                )}

                {addressValidation.village.message && (
                  <div className="flex items-center gap-2">
                    {addressValidation.village.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">Kelurahan/Desa</p>
                      <p className={`text-xs ${addressValidation.village.valid ? 'text-green-700' : 'text-red-700'}`}>
                        {addressValidation.village.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Parsed Data Display */}
              {(formData.province || formData.regency || formData.district || formData.village) && (
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-medium text-slate-600 mb-2">Data Terdeteksi:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {formData.province && (
                      <div className={`rounded-lg px-2 py-1 border ${
                        formData.province.includes('[Belum Terdeteksi]') ? 
                        'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-slate-500">Provinsi:</span>
                        <br />
                        <span className={`font-medium ${
                          formData.province.includes('[Belum Terdeteksi]') ? 'text-yellow-700' : ''
                        }`}>{formData.province}</span>
                      </div>
                    )}
                    {formData.regency && (
                      <div className={`rounded-lg px-2 py-1 border ${
                        formData.regency.includes('[Belum Terdeteksi]') ? 
                        'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-slate-500">Kota/Kab:</span>
                        <br />
                        <span className={`font-medium ${
                          formData.regency.includes('[Belum Terdeteksi]') ? 'text-yellow-700' : ''
                        }`}>{formData.regency}</span>
                      </div>
                    )}
                    {formData.district && (
                      <div className={`rounded-lg px-2 py-1 border ${
                        formData.district.includes('[Belum Terdeteksi]') ? 
                        'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-slate-500">Kecamatan:</span>
                        <br />
                        <span className={`font-medium ${
                          formData.district.includes('[Belum Terdeteksi]') ? 'text-yellow-700' : ''
                        }`}>{formData.district}</span>
                      </div>
                    )}
                    {formData.village && (
                      <div className={`rounded-lg px-2 py-1 border ${
                        formData.village.includes('[Belum Terdeteksi]') ? 
                        'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-slate-500">Kel/Desa:</span>
                        <br />
                        <span className={`font-medium ${
                          formData.village.includes('[Belum Terdeteksi]') ? 'text-yellow-700' : ''
                        }`}>{formData.village}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Warning for undetected data */}
                  {(formData.province?.includes('[Belum Terdeteksi]') || 
                    formData.regency?.includes('[Belum Terdeteksi]') || 
                    formData.district?.includes('[Belum Terdeteksi]') || 
                    formData.village?.includes('[Belum Terdeteksi]')) && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠ Perhatian:</strong> Beberapa data administratif belum terdeteksi otomatis. 
                        Silakan edit alamat lengkap di atas untuk melengkapi informasi yang kurang.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Tips:</strong> Untuk hasil terbaik, gunakan format: "Jl. [Nama Jalan], RT [XX]/RW [XX], Kec. [Kecamatan], [Kota/Kabupaten], [Provinsi]"
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Contoh: "Jl. Sudirman No. 123, RT 001/RW 005, Kec. Menteng, Jakarta Pusat, DKI Jakarta"
            </p>
          </div>
        </div>

        {/* Location & Maps Section */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-600" />
              Lokasi & Koordinat
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loadingLocation}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold w-full sm:w-auto"
              >
                {loadingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengambil...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>Lokasi Terkini</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={searchCoordinates}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-xs sm:text-sm font-semibold w-full sm:w-auto"
              >
                <Search className="w-4 h-4" />
                <span>Cari Koordinat</span>
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          {(formData.latitude || coordinates.lat) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={formData.latitude || coordinates.lat}
                  onChange={(e) => {
                    setFormData({ ...formData, latitude: e.target.value })
                    setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) || coordinates.lat })
                  }}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="-6.2088"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={formData.longitude || coordinates.lng}
                  onChange={(e) => {
                    setFormData({ ...formData, longitude: e.target.value })
                    setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) || coordinates.lng })
                  }}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="106.8456"
                />
              </div>
            </div>
          )}

          {/* Map Preview */}
          {showMap && (
            <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      Preview Lokasi Interaktif
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">Klik pada peta untuk mengubah posisi marker</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </div>
              <div className="p-4">
                <MapPicker
                  center={[coordinates.lat, coordinates.lng]}
                  onLocationChange={handleMapLocationChange}
                />
                <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-700">
                    <strong>Koordinat Terpilih:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Tips:</strong> Gunakan tombol "Lokasi Terkini" untuk mendapatkan koordinat dan alamat otomatis, atau "Cari Koordinat" untuk mencari berdasarkan alamat yang diisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
