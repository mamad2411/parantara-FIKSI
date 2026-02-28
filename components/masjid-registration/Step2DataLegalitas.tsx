// @ts-nocheck
import { FileText, Shield, Upload, CheckCircle2, X, Eye, Image as ImageIcon } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import toast, { Toaster } from 'react-hot-toast'

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step2DataLegalitas({ formData, setFormData }: Step2Props) {
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [activeGuideline, setActiveGuideline] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<{ [key: string]: string }>({})
  const [showPreview, setShowPreview] = useState<string | null>(null)

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

  // Validate if image is a document (not just a random photo) - IMPROVED ALGORITHM
  const validateDocumentContent = async (imageDataUrl: string, fieldName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve(true) // Skip validation if canvas not supported
          return
        }
        
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // 1. Check if image is mostly white/light (documents are usually on white paper)
        let whitePixels = 0
        let darkPixels = 0
        let totalPixels = data.length / 4
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3
          
          if (brightness > 200) {
            whitePixels++
          } else if (brightness < 100) {
            darkPixels++
          }
        }
        
        const whitePercentage = (whitePixels / totalPixels) * 100
        const darkPercentage = (darkPixels / totalPixels) * 100
        
        // 2. Check for text-like patterns (high contrast edges)
        let edgePixels = 0
        const edgeThreshold = 40 // Lebih rendah untuk deteksi lebih sensitif
        
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            
            const rightIdx = (y * canvas.width + (x + 1)) * 4
            const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3
            
            const bottomIdx = ((y + 1) * canvas.width + x) * 4
            const bottomBrightness = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3
            
            if (Math.abs(brightness - rightBrightness) > edgeThreshold || 
                Math.abs(brightness - bottomBrightness) > edgeThreshold) {
              edgePixels++
            }
          }
        }
        
        const edgePercentage = (edgePixels / totalPixels) * 100
        
        // 3. Check color variance (documents have low color variance)
        let colorVariance = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
          colorVariance += variance
        }
        const avgColorVariance = colorVariance / totalPixels
        
        // 4. Check contrast ratio (documents have good contrast between text and background)
        const contrastRatio = darkPercentage > 0 ? whitePercentage / darkPercentage : 0
        
        console.log(`Document Analysis for ${fieldName}:`, {
          whitePercentage: whitePercentage.toFixed(2) + '%',
          darkPercentage: darkPercentage.toFixed(2) + '%',
          edgePercentage: edgePercentage.toFixed(2) + '%',
          avgColorVariance: avgColorVariance.toFixed(2),
          contrastRatio: contrastRatio.toFixed(2)
        })
        
        // IMPROVED Document validation criteria:
        // - At least 30% white/light background (lebih fleksibel untuk dokumen dengan watermark/logo)
        // - At least 3% edges (text creates edges, lebih rendah untuk akomodasi berbagai jenis dokumen)
        // - Low color variance < 100 (documents are not colorful photos)
        // - OR has good contrast ratio > 2 (dokumen punya kontras baik antara teks dan background)
        
        const hasWhiteBackground = whitePercentage >= 30
        const hasTextEdges = edgePercentage >= 3
        const hasLowColorVariance = avgColorVariance < 100
        const hasGoodContrast = contrastRatio > 2
        
        // Document valid jika memenuhi salah satu kombinasi:
        // 1. Background putih + ada edges + low variance
        // 2. Background putih + good contrast
        // 3. Ada edges + good contrast (untuk dokumen dengan background tidak putih)
        const isDocument = 
          (hasWhiteBackground && hasTextEdges && hasLowColorVariance) ||
          (hasWhiteBackground && hasGoodContrast) ||
          (hasTextEdges && hasGoodContrast && hasLowColorVariance)
        
        if (!isDocument) {
          const reasons = []
          if (!hasWhiteBackground && !hasGoodContrast) reasons.push('latar belakang tidak seperti dokumen')
          if (!hasTextEdges) reasons.push('tidak terdeteksi teks atau konten dokumen yang jelas')
          if (!hasLowColorVariance && !hasGoodContrast) reasons.push('terlalu banyak warna seperti foto biasa')
          
          toast.error(
            `Gambar tidak terdeteksi sebagai dokumen resmi. Kemungkinan: ${reasons.join(', ')}. Pastikan upload scan/foto dokumen yang jelas dengan pencahayaan baik.`,
            {
              duration: 6000,
              position: 'top-center',
            }
          )
        }
        
        resolve(isDocument)
      }
      
      img.onerror = () => resolve(true) // Skip validation on error
      img.src = imageDataUrl
    })
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error(`Ukuran file maksimal 5MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`, {
          duration: 4000,
          position: 'top-center',
        })
        return
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file harus PDF atau JPG/PNG", {
          duration: 4000,
          position: 'top-center',
        })
        return
      }
      
      // For images, validate dimensions and quality
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const img = new Image()
          img.onload = async () => {
            // Check minimum dimensions (at least 600x400 - lebih rendah untuk akomodasi foto dokumen)
            if (img.width < 600 || img.height < 400) {
              toast.error(`Resolusi gambar minimal 600x400 pixels untuk kualitas yang baik. Resolusi Anda: ${img.width}x${img.height}`, {
                duration: 5000,
                position: 'top-center',
              })
              return
            }
            
            // Check maximum dimensions (max 5000x5000)
            if (img.width > 5000 || img.height > 5000) {
              toast.error(`Resolusi gambar maksimal 5000x5000 pixels. Resolusi Anda: ${img.width}x${img.height}`, {
                duration: 5000,
                position: 'top-center',
              })
              return
            }
            
            // Check aspect ratio (should be reasonable)
            const aspectRatio = img.width / img.height
            if (aspectRatio < 0.3 || aspectRatio > 3.0) {
              toast.error("Rasio aspek gambar tidak wajar. Pastikan gambar tidak terlalu panjang atau lebar", {
                duration: 5000,
                position: 'top-center',
              })
              return
            }
            
            // Validate document content (improved algorithm)
            const isValidDocument = await validateDocumentContent(e.target?.result as string, fieldName)
            if (!isValidDocument) {
              return
            }
            
            // All validations passed
            console.log(`Image validated: ${img.width}x${img.height}, ${(file.size / 1024).toFixed(0)}KB`)
            
            // Store preview
            setPreviewImage(prev => ({
              ...prev,
              [fieldName]: e.target?.result as string
            }))
            
            setFormData({ ...formData, [fieldName]: file })
            
            toast.success(`File berhasil diupload dan tervalidasi sebagai dokumen resmi. ${img.width}x${img.height} (${(file.size / 1024).toFixed(0)}KB)`, {
              duration: 3000,
              position: 'top-center',
            })
          }
          img.onerror = () => {
            toast.error("File gambar rusak atau tidak valid", {
              duration: 4000,
              position: 'top-center',
            })
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      } else {
        // For PDF, just set it
        setFormData({ ...formData, [fieldName]: file })
        toast.success(`File PDF berhasil diupload. (${(file.size / 1024).toFixed(0)}KB)`, {
          duration: 3000,
          position: 'top-center',
        })
      }
    }
  }

  const removeFile = (fieldName: string) => {
    setFormData({ ...formData, [fieldName]: null })
    setPreviewImage(prev => {
      const newPrev = { ...prev }
      delete newPrev[fieldName]
      return newPrev
    })
    toast.success("File berhasil dihapus", {
      duration: 2000,
      position: 'top-center',
    })
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
        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {guideline && (
          <button
            type="button"
            onClick={() => openGuideline(guideline)}
            className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors flex-shrink-0"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Lihat Panduan</span>
            <span className="sm:hidden">Panduan</span>
          </button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all ${
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
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">{placeholder}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Format: .jpeg, .jpg, .png, .pdf (Max 5MB)</p>
            <p className="text-[10px] sm:text-xs text-blue-600 mt-1">Resolusi: 600x400 - 5000x5000 pixels</p>
          </label>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between bg-white rounded-lg p-2 sm:p-3 border border-green-200">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {previewImage[id] && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(id)}
                    className="p-1 sm:p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                    title="Preview gambar"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="p-1 sm:p-1.5 hover:bg-red-50 rounded-full transition-colors"
                  title="Hapus file"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Preview */}
            {previewImage[id] && (
              <div className="relative rounded-lg overflow-hidden border-2 border-green-200 bg-gray-50">
                <img 
                  src={previewImage[id]} 
                  alt="Preview" 
                  className="w-full h-24 sm:h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowPreview(id)}
                />
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/60 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                  <ImageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Preview</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Toast Container */}
      <Toaster />
      
      <div className="space-y-6 md:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
            <span>Data Legalitas</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">Dokumen legal dan identitas resmi masjid</p>
        </div>

        {/* Masjid Documents Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-emerald-100">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
              <span>Masjid Documents</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Provide the following documents to show that your business details are valid and accurate
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
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
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-amber-100">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              <span>NPWP Masjid (Tax Number)</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Nomor Pokok Wajib Pajak untuk identitas perpajakan masjid
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="16 digit angka"
                maxLength={16}
                required
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">Format: 16 digit angka tanpa tanda baca</p>
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
                  "Jika belum memiliki NPWP masjid, pelajari cara mendapatkannya <a href='https://simas.kemenag.go.id/page/daftarmasjidmushalla' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline hover:text-blue-700'>di sini (simas.kemenag.go.id)</a>"
                ]
              }}
            />
          </div>
        </div>

        {/* Additional Documents Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-100">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>Dokumen Tambahan</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Dokumen pendukung lainnya untuk verifikasi masjid
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
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

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview && previewImage[showPreview] && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(null)}
              className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPreview(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-5xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={previewImage[showPreview]} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  <p className="text-white text-sm">
                    {formData[showPreview]?.name} - {(formData[showPreview]?.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
