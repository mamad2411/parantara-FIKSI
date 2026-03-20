// @ts-nocheck
import { Users, User, Mail, CreditCard, CheckCircle2 } from "lucide-react"
import { ProductionFileUpload } from "@/components/ui/production-file-upload"

interface Step3Props {
  formData: any
  setFormData: (data: any) => void
  handleFileChange: (field: string, file: File | null) => void
}

export default function Step3PerwakilanResmi({ formData, setFormData, handleFileChange }: Step3Props) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          <span>Perwakilan Resmi</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Anda harus memiliki otorisasi untuk membuat tindakan dan keputusan penting atas nama masjid Anda
        </p>
      </div>

      {/* Dokumen Identitas */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-orange-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
          <span>Dokumen Identitas</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Jenis ID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenisID}
              onChange={(e) => setFormData({ ...formData, jenisID: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="KTP">KTP</option>
              <option value="Paspor">Paspor</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-500">Foto bagian depan {formData.jenisID || 'KTP'} yang jelas</span>
            <ProductionFileUpload
              id="fotoKTP"
              label={`Foto ${formData.jenisID || 'KTP'}`}
              file={formData.fotoKTP}
              onFileChange={(file) => handleFileChange('fotoKTP', file)}
              required={true}
              placeholder={`Upload foto ${formData.jenisID || 'KTP'} Anda`}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-500">Foto selfie sambil memegang {formData.jenisID || 'KTP'}</span>
            <ProductionFileUpload
              id="imageKTP"
              label={`Selfie dengan ${formData.jenisID || 'KTP'}`}
              file={formData.imageKTP}
              onFileChange={(file) => handleFileChange('imageKTP', file)}
              required={true}
              placeholder={`Upload foto selfie memegang ${formData.jenisID || 'KTP'}`}
            />
          </div>
        </div>
      </div>

      {/* Data Pribadi Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span>Data Pribadi</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Nama lengkap sesuai KTP"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenisKelamin}
                onChange={(e) => setFormData({...formData, jenisKelamin: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Pilih</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Pekerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Contoh: Pengusaha, Pegawai, dll"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kontak Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <span>Informasi Kontak</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.emailPerwakilan}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-28 text-sm sm:text-base bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-700 cursor-default"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Dari akun
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Nomor Handphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.nomorHandphone}
              onChange={(e) => setFormData({...formData, nomorHandphone: e.target.value})}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Alamat Tempat Tinggal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.alamatTempat}
              onChange={(e) => setFormData({...formData, alamatTempat: e.target.value})}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={3}
              placeholder="Alamat lengkap tempat tinggal"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}
