// @ts-nocheck
import { Building2, MapPin } from "lucide-react"

interface Step1Props {
  formData: any
  setFormData: (data: any) => void
  provinces: string[]
}

export default function Step1DataMasjid({ formData, setFormData, provinces }: Step1Props) {
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Provinsi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kota/Kabupaten <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelurahan/Desa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subDistrict}
                onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kode Pos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="5 digit"
              maxLength={5}
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
