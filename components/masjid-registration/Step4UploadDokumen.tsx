// @ts-nocheck
import { Upload, Shield, CheckCircle2, FileText, Image, Building } from "lucide-react"

interface Step4Props {
  formData: any
  handleFileChange: (field: string, file: File | null) => void
}

export default function Step4UploadDokumen({ formData, handleFileChange }: Step4Props) {
  const FileUploadBox = ({ id, label, required = true, file, icon: Icon, color }: any) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-400">(Opsional)</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all bg-white">
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/jpg,image/png"
          onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
          className="hidden"
          id={id}
          required={required}
        />
        <label htmlFor={id} className="cursor-pointer">
          <Icon className={`w-12 h-12 ${color} mx-auto mb-3`} />
          <p className="text-sm font-medium text-gray-700 mb-1">Unggah atau seret file ke sini</p>
          <p className="text-xs text-gray-500">Format: PDF, JPG, PNG (Max 2MB)</p>
        </label>
      </div>
      {file && (
        <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {file.name} ({(file.size / 1024).toFixed(0)} KB)
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Upload className="w-7 h-7 text-blue-600" />
          Upload Dokumen
        </h2>
        <p className="text-sm text-gray-600">Unggah semua dokumen yang diperlukan untuk verifikasi masjid</p>
      </div>
      
      {/* Security Info */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-red-900 mb-2">🔒 Keamanan Upload File:</p>
            <ul className="space-y-1 text-red-800">
              <li>• File maksimal 2MB</li>
              <li>• Format: PDF atau JPG/PNG</li>
              <li>• Scan virus otomatis</li>
              <li>• Metadata file dicek</li>
              <li>• File executable tidak diperbolehkan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Required Documents Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm font-semibold text-blue-900 mb-2">📋 Dokumen Wajib:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ SK Kepengurusan Terbaru</li>
          <li>✓ Surat Rekomendasi RT/RW atau Kelurahan</li>
          <li>✓ Foto Tampak Depan Masjid</li>
          <li>✓ Foto Interior Masjid</li>
          <li>✓ Dokumen Status Tanah (Wakaf/SHM/Yayasan)</li>
          <li>✓ KTP Ketua DKM</li>
        </ul>
      </div>

      {/* Dokumen Kepengurusan */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-violet-600" />
          Dokumen Kepengurusan
        </h3>
        <div className="space-y-4">
          <FileUploadBox
            id="skKepengurusan"
            label="SK Kepengurusan Terbaru"
            file={formData.skKepengurusan}
            icon={FileText}
            color="text-violet-400"
          />
          <FileUploadBox
            id="suratRekomendasiRTRW"
            label="Surat Rekomendasi RT/RW atau Kelurahan"
            file={formData.suratRekomendasiRTRW}
            icon={FileText}
            color="text-violet-400"
          />
        </div>
      </div>

      {/* Foto Masjid */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border-2 border-sky-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-sky-600" />
          Foto Masjid
        </h3>
        <div className="space-y-4">
          <FileUploadBox
            id="fotoTampakDepan"
            label="Foto Tampak Depan Masjid"
            file={formData.fotoTampakDepan}
            icon={Image}
            color="text-sky-400"
          />
          <FileUploadBox
            id="fotoInterior"
            label="Foto Interior Masjid"
            file={formData.fotoInterior}
            icon={Image}
            color="text-sky-400"
          />
        </div>
      </div>

      {/* Dokumen Legal */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-green-600" />
          Dokumen Legal & Identitas
        </h3>
        <div className="space-y-4">
          <FileUploadBox
            id="dokumenStatusTanah"
            label="Dokumen Status Tanah (Wakaf/SHM/Yayasan)"
            file={formData.dokumenStatusTanah}
            icon={FileText}
            color="text-green-400"
          />
          <FileUploadBox
            id="ktpKetua"
            label="KTP Ketua DKM"
            file={formData.ktpKetua}
            icon={FileText}
            color="text-green-400"
          />
          <FileUploadBox
            id="npwpDokumen"
            label="NPWP Masjid"
            required={false}
            file={formData.npwpDokumen}
            icon={FileText}
            color="text-green-400"
          />
        </div>
      </div>
    </div>
  )
}
