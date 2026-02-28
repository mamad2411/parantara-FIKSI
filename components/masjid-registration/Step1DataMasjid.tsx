// @ts-nocheck
import { Building2, MapPin, CheckCircle, XCircle, Navigation, Map as MapIcon, Search, Crosshair } from "lucide-react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import toast from "react-hot-toast"
import { 
  getProvinces, 
  getRegencies, 
  getDistricts, 
  getVillages,
  validatePostalCode,
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

export default function Step1DataMasjid({ formData, setFormData }: Step1Props) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [coordinates, setCoordinates] = useState({ lat: -6.2088, lng: 106.8456 }) // Default Jakarta
  const [showMap, setShowMap] = useState(false)
  
  const [validation, setValidation] = useState({
    province: { valid: false, message: '' },
    regency: { valid: false, message: '' },
    district: { valid: false, message: '' },
    village: { valid: false, message: '' },
    postalCode: { valid: false, message: '' }
  })

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    const provincesData = await getProvinces()
    setProvinces(provincesData)
  }

  // Validate province input
  useEffect(() => {
    if (formData.province) {
      const found = provinces.find(p => 
        p.name.toLowerCase() === formData.province.toLowerCase()
      )
      if (found) {
        setValidation(prev => ({ ...prev, province: { valid: true, message: '✓ Provinsi valid' }}))
        loadRegencies(found.id)
      } else {
        setValidation(prev => ({ ...prev, province: { valid: false, message: '✗ Provinsi tidak ditemukan' }}))
        setRegencies([])
      }
    } else {
      setValidation(prev => ({ ...prev, province: { valid: false, message: '' }}))
    }
  }, [formData.province, provinces])

  // Validate regency input
  useEffect(() => {
    if (formData.regency && regencies.length > 0) {
      const input = formData.regency.toLowerCase().trim()
      
      // Try exact match first
      let found = regencies.find(r => 
        r.name.toLowerCase() === input
      )
      
      // If not found, try fuzzy match (contains)
      if (!found) {
        found = regencies.find(r => {
          const name = r.name.toLowerCase()
          // Check if input is contained in name or vice versa
          return name.includes(input) || input.includes(name.replace(/^(kota|kabupaten)\s+/i, ''))
        })
      }
      
      if (found) {
        setValidation(prev => ({ ...prev, regency: { valid: true, message: '✓ Kota/Kabupaten valid' }}))
        loadDistricts(found.id)
      } else {
        setValidation(prev => ({ ...prev, regency: { valid: false, message: '✗ Kota/Kabupaten tidak ditemukan' }}))
        setDistricts([])
      }
    } else {
      setValidation(prev => ({ ...prev, regency: { valid: false, message: '' }}))
    }
  }, [formData.regency, regencies])

  // Validate district input
  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const input = formData.district.toLowerCase().trim()
      
      // Try exact match first
      let found = districts.find(d => 
        d.name.toLowerCase() === input
      )
      
      // If not found, try fuzzy match (contains)
      if (!found) {
        found = districts.find(d => {
          const name = d.name.toLowerCase()
          return name.includes(input) || input.includes(name)
        })
      }
      
      if (found) {
        setValidation(prev => ({ ...prev, district: { valid: true, message: '✓ Kecamatan valid' }}))
        loadVillages(found.id)
      } else {
        setValidation(prev => ({ ...prev, district: { valid: false, message: '✗ Kecamatan tidak ditemukan' }}))
        setVillages([])
      }
    } else {
      setValidation(prev => ({ ...prev, district: { valid: false, message: '' }}))
    }
  }, [formData.district, districts])

  // Validate village input
  useEffect(() => {
    if (formData.village && villages.length > 0) {
      const input = formData.village.toLowerCase().trim()
      
      // Try exact match first
      let found = villages.find(v => 
        v.name.toLowerCase() === input
      )
      
      // If not found, try fuzzy match (contains)
      if (!found) {
        found = villages.find(v => {
          const name = v.name.toLowerCase()
          return name.includes(input) || input.includes(name)
        })
      }
      
      if (found) {
        setValidation(prev => ({ ...prev, village: { valid: true, message: '✓ Kelurahan/Desa valid' }}))
      } else {
        setValidation(prev => ({ ...prev, village: { valid: false, message: '✗ Kelurahan/Desa tidak ditemukan' }}))
      }
    } else {
      setValidation(prev => ({ ...prev, village: { valid: false, message: '' }}))
    }
  }, [formData.village, villages])

  // Validate postal code
  useEffect(() => {
    if (formData.postalCode) {
      if (validatePostalCode(formData.postalCode)) {
        setValidation(prev => ({ ...prev, postalCode: { valid: true, message: '✓ Kode pos valid' }}))
      } else {
        setValidation(prev => ({ ...prev, postalCode: { valid: false, message: '✗ Kode pos harus 5 digit' }}))
      }
    } else {
      setValidation(prev => ({ ...prev, postalCode: { valid: false, message: '' }}))
    }
  }, [formData.postalCode])

  const loadRegencies = async (provinceId: string) => {
    console.log('Loading regencies for province:', provinceId)
    const data = await getRegencies(provinceId)
    console.log('Regencies loaded:', data.length)
    setRegencies(data)
  }

  const loadDistricts = async (regencyId: string) => {
    console.log('Loading districts for regency:', regencyId)
    const data = await getDistricts(regencyId)
    console.log('Districts loaded:', data.length, data.map(d => d.name))
    setDistricts(data)
  }

  const loadVillages = async (districtId: string) => {
    console.log('Loading villages for district:', districtId)
    const data = await getVillages(districtId)
    console.log('Villages loaded:', data.length)
    setVillages(data)
  }

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5)
    setFormData({ ...formData, postalCode: value })
  }

  const getCurrentLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          setShowMap(true)
          setFormData({ 
            ...formData, 
            latitude: latitude.toString(), 
            longitude: longitude.toString() 
          })
          setLoadingLocation(false)
          toast.success("Lokasi berhasil didapatkan!")
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Tidak dapat mengakses lokasi. Pastikan Anda memberikan izin lokasi.")
          setLoadingLocation(false)
        }
      )
    } else {
      toast.error("Browser Anda tidak mendukung geolocation")
      setLoadingLocation(false)
    }
  }

  const searchCoordinates = async () => {
    const fullAddress = `${formData.mosqueAddress}, ${formData.village}, ${formData.district}, ${formData.regency}, ${formData.province}`
    
    if (!formData.mosqueAddress || !formData.province) {
      toast.error("Mohon isi alamat dan provinsi terlebih dahulu")
      return
    }

    toast.loading("Mencari koordinat...", { id: "geocoding" })
    
    try {
      // Use Nominatim (OpenStreetMap) Geocoding API - Free and no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=id&limit=1`
      )
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
    setFormData({ 
      ...formData, 
      latitude: lat.toString(), 
      longitude: lng.toString() 
    })
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
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          Alamat Lengkap
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Ketik alamat sesuai dengan wilayah yang ada. Sistem akan memvalidasi otomatis.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.mosqueAddress}
              onChange={(e) => setFormData({ ...formData, mosqueAddress: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={3}
              placeholder="Jalan, RT/RW, Nomor"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Provinsi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    validation.province.valid ? 'border-green-500' : 
                    validation.province.message && !validation.province.valid ? 'border-red-500' : 
                    'border-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Contoh: Jawa Barat"
                  required
                />
                {validation.province.message && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    validation.province.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.province.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                )}
              </div>
              {validation.province.message && (
                <p className={`text-xs mt-1 ${validation.province.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.province.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kota/Kabupaten <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.regency || ''}
                  onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    validation.regency.valid ? 'border-green-500' : 
                    validation.regency.message && !validation.regency.valid ? 'border-red-500' : 
                    'border-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Contoh: Bandung"
                  required
                />
                {validation.regency.message && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    validation.regency.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.regency.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                )}
              </div>
              {validation.regency.message && (
                <p className={`text-xs mt-1 ${validation.regency.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.regency.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    validation.district.valid ? 'border-green-500' : 
                    validation.district.message && !validation.district.valid ? 'border-red-500' : 
                    'border-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Contoh: Coblong"
                  required
                />
                {validation.district.message && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    validation.district.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.district.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                )}
              </div>
              {validation.district.message && (
                <p className={`text-xs mt-1 ${validation.district.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.district.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelurahan/Desa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.village || ''}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    validation.village.valid ? 'border-green-500' : 
                    validation.village.message && !validation.village.valid ? 'border-red-500' : 
                    'border-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Contoh: Dago"
                  required
                />
                {validation.village.message && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    validation.village.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.village.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                )}
              </div>
              {validation.village.message && (
                <p className={`text-xs mt-1 ${validation.village.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.village.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kode Pos <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={handlePostalCodeChange}
                className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  validation.postalCode.valid ? 'border-green-500' : 
                  validation.postalCode.message && !validation.postalCode.valid ? 'border-red-500' : 
                  'border-gray-900 focus:border-blue-500'
                }`}
                placeholder="5 digit"
                maxLength={5}
                required
              />
              {validation.postalCode.message && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  validation.postalCode.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {validation.postalCode.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
              )}
            </div>
            {validation.postalCode.message && (
              <p className={`text-xs mt-1 ${validation.postalCode.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.postalCode.message}
              </p>
            )}
          </div>
        </div>

        {/* Location & Maps Section */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-600" />
              Lokasi & Koordinat
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loadingLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
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
              <strong>Tips:</strong> Gunakan tombol "Lokasi Terkini" untuk mendapatkan koordinat otomatis, atau "Cari Koordinat" untuk mencari berdasarkan alamat yang diisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
