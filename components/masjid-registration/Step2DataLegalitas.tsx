// @ts-nocheck
import { FileText, Shield, Upload, CheckCircle2, X, Eye } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step2DataLegalitas({ formData, setFormData }: Step2Props) {
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [activeGuideline, setActiveGuideline] = useState<any>(null)

  const handleDrag = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(fieldName)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(fieldName, e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB")
        return
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        alert("Format file harus PDF atau JPG/PNG")
        return
      }
      setFormData({ ...formData, [fieldName]: file })
    }
  }

  const removeFile = (fieldName: string) => {
    setFormData({ ...formData, [fieldName]: null })
  }

  const openGuideline = (guideline: any) => {
    setActiveGuideline(guideline)
  }

  const closeGuideline = () => {
    setActiveGuideline(null)
  }

  const FileUploadBox = ({ 
    id, 
    label, 
    required = true, 
    file, 
    guideline,
    placeholder = "Drag and drop your file to upload"
  }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {guideline && (
          <button
            type="button"
            onClick={() => openGuideline(guideline)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Lihat Panduan
          </button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive === id
            ? "border-blue-500 bg-blue-50"
            : file
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-white hover:border-blue-400"
        }`}
        onDragEnter={(e) => handleDrag(e, id)}
        onDragLeave={(e) => handleDrag(e, id)}
        onDragOver={(e) => handleDrag(e, id)}
        onDrop={(e) => handleDrop(e, id)}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
          className="hidden"
          id={id}
          required={required && !file}
        />
        
        {!file ? (
          <label htmlFor={id} className="cursor-pointer block">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">{placeholder}</p>
            <p className="text-xs text-gray-500">Accepted Format: .jpeg, .jpg, .png, .pdf</p>
          </label>
        ) : (
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(id)}
              className="p-1 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Data Legalitas
          </h2>
          <p className="text-sm text-gray-600">Dokumen legal dan identitas resmi masjid</p>
        </div>

        {/* Masjid Documents Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Masjid Documents
            </h3>
            <p className="text-xs text-gray-600">
              Provide the following documents to show that your business details are valid and accurate
            </p>
          </div>

          <div className="space-y-6">
            <FileUploadBox
              id="aktaPendirian"
              label="Akta Pendirian"
              file={formData.aktaPendirian}
              guideline={{
                title: "Panduan Akta Pendirian",
                points: [
                  "Dokumen <strong>Akta Pendirian</strong> harus jelas dan dapat dibaca",
                  "Pastikan <strong>nama masjid, alamat, dan tanggal pendirian</strong> terlihat dengan jelas",
                  "Akta harus disahkan oleh <strong>Notaris</strong> yang berwenang",
                  "Jika dokumen lebih dari 1 halaman, gunakan format <strong>PDF</strong>"
                ]
              }}
            />

            <FileUploadBox
              id="skKemenkumham"
              label="SK Kemenkumham"
              file={formData.skKemenkumham}
              guideline={{
                title: "Panduan SK Kemenkumham",
                points: [
                  "Upload <strong>Surat Keputusan</strong> dari Kementerian Hukum dan HAM",
                  "Pastikan <strong>nomor SK dan tanggal penerbitan</strong> terlihat jelas",
                  "SK harus dikeluarkan oleh <strong>Direktorat Jendral Administrasi Hukum Umum</strong>",
                  "Dokumen harus dalam kondisi baik dan tidak buram"
                ]
              }}
            />
          </div>
        </div>

        {/* NPWP Section */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber-600" />
              NPWP Masjid (Tax Number)
            </h3>
            <p className="text-xs text-gray-600">
              Nomor Pokok Wajib Pajak untuk identitas perpajakan masjid
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                16-Digit NPWP Number (Tax Number) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.npwpMasjid}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 16) {
                    setFormData({...formData, npwpMasjid: value})
                  }
                }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="16 digit angka"
                maxLength={16}
                required
              />
              <p className="text-xs text-gray-500 mt-2">Format: 16 digit angka tanpa tanda baca</p>
            </div>

            <FileUploadBox
              id="npwpDokumen"
              label="Dokumen NPWP Masjid"
              file={formData.npwpDokumen}
              guideline={{
                title: "Panduan NPWP Masjid",
                points: [
                  "<strong>Nama masjid, alamat, dan nomor NPWP</strong> harus jelas dan dapat dibaca",
                  "Nomor NPWP harus mengandung <strong>16 digit</strong>",
                  "NPWP harus diterbitkan oleh <strong>Direktorat Jenderal Pajak</strong>",
                  "Jika belum memiliki NPWP masjid, pelajari cara mendapatkannya <a href='#' class='text-blue-600 underline'>di sini</a>"
                ]
              }}
            />
          </div>
        </div>

        {/* Additional Documents Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Dokumen Tambahan
            </h3>
            <p className="text-xs text-gray-600">
              Dokumen pendukung lainnya untuk verifikasi masjid
            </p>
          </div>

          <div className="space-y-6">
            <FileUploadBox
              id="suratPernyataan"
              label="Surat Pernyataan Pendirian"
              file={formData.suratPernyataan}
              guideline={{
                title: "Panduan Surat Pernyataan Pendirian",
                points: [
                  "Surat pernyataan ditandatangani oleh <strong>pengurus masjid</strong>",
                  "Harus diketahui oleh <strong>RT/RW atau Kelurahan</strong> setempat",
                  "Mencantumkan <strong>tujuan pendirian masjid</strong>",
                  "Dokumen dalam kondisi baik dan stempel terlihat jelas"
                ]
              }}
              required={false}
            />

            <FileUploadBox
              id="sertifikatPendaftaran"
              label="Sertifikat Pendaftaran"
              file={formData.sertifikatPendaftaran}
              guideline={{
                title: "Panduan Sertifikat Pendaftaran",
                points: [
                  "Sertifikat dari <strong>instansi terkait</strong> (Kemenag/Pemda)",
                  "Menunjukkan bahwa masjid telah <strong>terdaftar secara resmi</strong>",
                  "Nomor registrasi dan tanggal pendaftaran harus jelas",
                  "Stempel dan tanda tangan pejabat berwenang terlihat"
                ]
              }}
              required={false}
            />
          </div>
        </div>
      </div>

      {/* Guidelines Modal/Sidebar */}
      <AnimatePresence>
        {activeGuideline && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGuideline}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{activeGuideline.title}</h3>
                <button
                  onClick={closeGuideline}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <FileText className="w-16 h-16 text-blue-600" />
                </div>

                {activeGuideline.image && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <img src={activeGuideline.image} alt="Contoh dokumen" className="w-full h-auto" />
                  </div>
                )}

                <ol className="space-y-4">
                  {activeGuideline.points.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span 
                        className="text-sm text-gray-700 flex-1" 
                        dangerouslySetInnerHTML={{ __html: point }} 
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
