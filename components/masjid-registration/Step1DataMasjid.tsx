// @ts-nocheck
import { Building2, MapPin, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
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

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step1DataMasjid({ formData, setFormData }: Step1Props) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  
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
      const found = regencies.find(r => 
        r.name.toLowerCase() === formData.regency.toLowerCase()
      )
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
      const found = districts.find(d => 
        d.name.toLowerCase() === formData.district.toLowerCase()
      )
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
      const found = villages.find(v => 
        v.name.toLowerCase() === formData.village.toLowerCase()
      )
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

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5)
    setFormData({ ...formData, postalCode: value })
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
      </div>
    </div>
  )
}
