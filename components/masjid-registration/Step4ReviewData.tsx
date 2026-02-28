// @ts-nocheck
import { CheckCircle2, Edit2, Eye, FileText, MapPin, Users, Building2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Step4Props {
  formData: any
  setFormData: (data: any) => void
  setCurrentStep: (step: number) => void
}

export default function Step4ReviewData({ formData, setFormData, setCurrentStep }: Step4Props) {
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const handleImagePreview = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        setShowImagePreview(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const ReviewSection = ({ title, icon: Icon, children, stepNumber }: any) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-blue-200 transition-all">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setCurrentStep(stepNumber)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>
    </div>
  )

  const ReviewItem = ({ label, value, isValid = true }: any) => (
    <div className="flex items-start justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">{label}</p>
        <p className={`text-sm sm:text-base font-medium ${isValid ? 'text-gray-900' : 'text-red-600'} break-words`}>
          {value || <span className="text-red-600 text-xs sm:text-sm">Belum diisi</span>}
        </p>
      </div>
      {isValid && value ? (
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 ml-2 sm:ml-3" />
      ) : (
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 ml-2 sm:ml-3" />
      )}
    </div>
  )

  const ReviewFile = ({ label, file, isValid = true }: any) => (
    <div className="flex items-start justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">{label}</p>
        {file ? (
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {file.name}
            </p>
            {file.type?.startsWith('image/') && (
              <button
                type="button"
                onClick={() => handleImagePreview(file)}
                className="p-1 hover:bg-blue-50 rounded transition-all"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-red-600 text-xs sm:text-sm">Belum diupload</p>
        )}
      </div>
      {isValid && file ? (
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 ml-2 sm:ml-3" />
      ) : (
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 ml-2 sm:ml-3" />
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
            <span>Review Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Periksa kembali data Anda untuk memastikan semuanya benar dan akurat
          </p>
        </div>

        {/* Data Masjid */}
        <ReviewSection title="Data Masjid" icon={Building2} stepNumber={1}>
          <ReviewItem 
            label="Nama Masjid" 
            value={formData.mosqueName}
            isValid={!!formData.mosqueName}
          />
          <ReviewItem 
            label="Alamat Lengkap" 
            value={formData.mosqueAddress}
            isValid={!!formData.mosqueAddress}
          />
          <ReviewItem 
            label="Provinsi" 
            value={formData.province}
            isValid={!!formData.province}
          />
          <ReviewItem 
            label="Kota/Kabupaten" 
            value={formData.regency}
            isValid={!!formData.regency}
          />
          <ReviewItem 
            label="Kecamatan" 
            value={formData.district}
            isValid={!!formData.district}
          />
          <ReviewItem 
            label="Kelurahan/Desa" 
            value={formData.village}
            isValid={!!formData.village}
          />
          <ReviewItem 
            label="Kode Pos" 
            value={formData.postalCode}
            isValid={!!formData.postalCode && formData.postalCode.length === 5}
          />
        </ReviewSection>

        {/* Data Legalitas */}
        <ReviewSection title="Data Legalitas" icon={FileText} stepNumber={2}>
          <ReviewItem 
            label="Akta Pendirian" 
            value={formData.aktaPendirian}
            isValid={!!formData.aktaPendirian}
          />
          <ReviewItem 
            label="SK Kemenkumham" 
            value={formData.skKemenkumham}
            isValid={!!formData.skKemenkumham}
          />
          <ReviewItem 
            label="NPWP Masjid (16 Digit)" 
            value={formData.npwpMasjid}
            isValid={!!formData.npwpMasjid && formData.npwpMasjid.length === 15}
          />
          <ReviewFile 
            label="Dokumen NPWP" 
            file={formData.npwpDokumen}
            isValid={!!formData.npwpDokumen}
          />
        </ReviewSection>

        {/* Perwakilan Resmi */}
        <ReviewSection title="Perwakilan Resmi" icon={Users} stepNumber={3}>
          <ReviewItem 
            label="Nama Lengkap" 
            value={`${formData.namaDepan || ''} ${formData.namaBelakang || ''}`.trim()}
            isValid={!!formData.namaDepan && !!formData.namaBelakang}
          />
          <ReviewItem 
            label="Jenis Kelamin" 
            value={formData.jenisKelamin}
            isValid={!!formData.jenisKelamin}
          />
          <ReviewItem 
            label="Pekerjaan" 
            value={formData.pekerjaan}
            isValid={!!formData.pekerjaan}
          />
          <ReviewItem 
            label="Email" 
            value={formData.emailPerwakilan}
            isValid={!!formData.emailPerwakilan}
          />
          <ReviewItem 
            label="Tanggal Lahir" 
            value={formData.tanggalLahir}
            isValid={!!formData.tanggalLahir}
          />
          <ReviewItem 
            label="Nomor Handphone" 
            value={formData.nomorHandphone}
            isValid={!!formData.nomorHandphone}
          />
          <ReviewItem 
            label="Alamat Tempat Tinggal" 
            value={formData.alamatTempat}
            isValid={!!formData.alamatTempat}
          />
          <ReviewItem 
            label={`Nomor ${formData.jenisID || 'KTP'}`}
            value={formData.nomorKTP}
            isValid={!!formData.nomorKTP && formData.nomorKTP.length === 16}
          />
          <ReviewFile 
            label={`Foto ${formData.jenisID || 'KTP'}`}
            file={formData.fotoKTP}
            isValid={!!formData.fotoKTP}
          />
          {formData.suratKuasa && (
            <ReviewFile 
              label="Surat Kuasa" 
              file={formData.suratKuasa}
              isValid={true}
            />
          )}
        </ReviewSection>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-1 sm:mb-2">
                Pastikan Semua Data Benar
              </h4>
              <p className="text-xs sm:text-sm text-blue-800">
                Jika ada data yang salah atau perlu diubah, klik tombol "Edit" pada section yang ingin diubah. 
                Setelah yakin semua data benar, klik "Selanjutnya" untuk melanjutkan ke tahap pembuatan akun admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && previewUrl && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowImagePreview(null)
                setPreviewUrl("")
              }}
              className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            >
              <button
                onClick={() => {
                  setShowImagePreview(null)
                  setPreviewUrl("")
                }}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <span className="text-white text-xl">×</span>
              </button>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-5xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  <p className="text-white text-sm">{showImagePreview}</p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
