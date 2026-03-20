// @ts-nocheck
import { FileText, Upload, CheckCircle2, X, Eye, Image as ImageIcon } from "lucide-react"
import { useState, useRef } from "react"
import toast, { Toaster } from 'react-hot-toast'
import { ImageForensics } from '@/lib/image-forensics'
import { ProductionFileUpload } from '@/components/ui/production-file-upload'

interface Step2Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step2DataLegalitas({ formData, setFormData }: Step2Props) {
  const [activeGuideline, setActiveGuideline] = useState<any>(null)

  const guidelines = {
    npwpMasjid: {
      title: "Panduan NPWP Masjid",
      image: "/images/daftarmasjid/npwp.webp",
      points: [
        "NPWP Masjid adalah Nomor Pokok Wajib Pajak yang diterbitkan oleh Direktorat Jenderal Pajak untuk organisasi/badan.",
        "Nomor NPWP terdiri dari <strong>15 digit angka</strong> dengan format: XX.XXX.XXX.X-XXX.XXX.",
        "Untuk mendapatkan NPWP, daftarkan masjid ke <strong>Kantor Pelayanan Pajak (KPP)</strong> terdekat atau melalui ereg.pajak.go.id.",
        "Upload <strong>foto atau scan kartu NPWP</strong> yang jelas dan tidak terpotong.",
        "Format file yang diterima: <strong>JPG, PNG, atau PDF</strong> dengan ukuran maksimal 5MB.",
        "Jika masjid belum memiliki NPWP, segera daftarkan ke <strong>Kantor Pelayanan Pajak (KPP)</strong> terdekat atau melalui ereg.pajak.go.id.",
      ]
    },
    aktaPendirian: {
      title: "Panduan Akta Pendirian",
      image: "/images/daftarmasjid/datapendirimasjid.webp",
      points: [
        "Akta pendirian adalah dokumen resmi yang dibuat oleh notaris saat masjid didirikan.",
        "Pastikan dokumen <strong>asli atau fotokopi yang dilegalisir</strong> oleh notaris.",
        "Dokumen harus memuat: nama masjid, tanggal pendirian, alamat, dan tanda tangan notaris.",
        "Format file yang diterima: <strong>JPG, PNG, atau PDF</strong> dengan ukuran maksimal 5MB.",
        "Pastikan foto/scan dokumen <strong>jelas, tidak buram, dan tidak terpotong</strong>.",
        "Latar belakang dokumen harus <strong>putih atau terang</strong> agar mudah dibaca.",
      ]
    },
    skKemenkumham: {
      title: "Panduan SK Kemenkumham",
      image: "/images/daftarmasjid/SKkemenkumham.webp",
      points: [
        "SK Kemenkumham adalah Surat Keputusan dari Kementerian Hukum dan HAM yang mengesahkan badan hukum masjid.",
        "Dokumen ini biasanya diterbitkan setelah akta pendirian didaftarkan ke Kemenkumham.",
        "Pastikan SK memuat: <strong>nomor SK, tanggal penerbitan, nama organisasi, dan cap resmi Kemenkumham</strong>.",
        "Format file yang diterima: <strong>JPG, PNG, atau PDF</strong> dengan ukuran maksimal 5MB.",
        "Scan atau foto dokumen harus <strong>lengkap dan terbaca dengan jelas</strong>.",
        "Jika belum memiliki SK Kemenkumham, hubungi notaris atau kantor Kemenkumham setempat.",
      ]
    },
    suratPernyataan: {
      title: "Panduan Surat Pernyataan Pendirian",
      image: "/images/daftarmasjid/pernyataanpendirian.webp",
      points: [
        "Surat pernyataan pendirian adalah dokumen yang menyatakan keberadaan dan keabsahan masjid.",
        "Dokumen ini dapat dibuat oleh pengurus masjid dan diketahui oleh pejabat setempat (RT/RW/Kelurahan).",
        "Surat harus memuat: <strong>nama masjid, alamat, nama pengurus, dan tanda tangan</strong>.",
        "Dokumen ini <strong>wajib</strong> disertakan untuk proses verifikasi masjid.",
        "Format file yang diterima: <strong>JPG, PNG, atau PDF</strong> dengan ukuran maksimal 5MB.",
        "Pastikan dokumen <strong>ditandatangani dan distempel</strong> oleh pihak yang berwenang.",
      ]
    }
  }

  const openGuideline = (guideline: any) => setActiveGuideline(guideline)
  const closeGuideline = () => setActiveGuideline(null)

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData(prevData => ({ ...prevData, [fieldName]: file }))
  }

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
              <span>Dokumen Masjid</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Upload dokumen legal dan identitas resmi masjid
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Dokumen akta resmi dari notaris</span>
                <button
                  type="button"
                  onClick={() => openGuideline(guidelines.aktaPendirian)}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Lihat Panduan
                </button>
              </div>
              <ProductionFileUpload
                id="aktaPendirian"
                label="Akta Pendirian"
                file={formData.aktaPendirian}
                onFileChange={(file) => handleFileChange('aktaPendirian', file)}
                required={true}
                placeholder="Upload Akta Pendirian masjid"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">SK pengesahan dari Kemenkumham</span>
                <button
                  type="button"
                  onClick={() => openGuideline(guidelines.skKemenkumham)}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Lihat Panduan
                </button>
              </div>
              <ProductionFileUpload
                id="skKemenkumham"
                label="SK Kemenkumham"
                file={formData.skKemenkumham}
                onFileChange={(file) => handleFileChange('skKemenkumham', file)}
                required={true}
                placeholder="Upload SK dari Kemenkumham"
              />
            </div>
          </div>
        </div>

        {/* NPWP Section */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-amber-100">
          <div className="mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              <span>NPWP Masjid</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">Nomor Pokok Wajib Pajak organisasi masjid</p>
          </div>

          <div className="space-y-4">
            {/* Upload Dokumen NPWP */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Foto/scan kartu NPWP masjid</span>
                <button
                  type="button"
                  onClick={() => openGuideline(guidelines.npwpMasjid)}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Lihat Panduan
                </button>
              </div>
              <ProductionFileUpload
                id="npwpDokumen"
                label="Dokumen NPWP"
                file={formData.npwpDokumen}
                onFileChange={(file) => handleFileChange('npwpDokumen', file)}
                required={true}
                placeholder="Upload foto/scan kartu NPWP"
              />
            </div>
          </div>
        </div>

        {/* Additional Documents Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-100">          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>Dokumen Tambahan</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Dokumen pendukung lainnya untuk verifikasi masjid
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Dokumen pendukung verifikasi masjid</span>
                <button
                  type="button"
                  onClick={() => openGuideline(guidelines.suratPernyataan)}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Lihat Panduan
                </button>
              </div>
              <ProductionFileUpload
                id="suratPernyataan"
                label="Surat Pernyataan Pendirian"
                file={formData.suratPernyataan}
                onFileChange={(file) => handleFileChange('suratPernyataan', file)}
                required={true}
                placeholder="Upload Surat Pernyataan Pendirian"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Sidebar */}
      {/* Backdrop */}
      <div
        onClick={closeGuideline}
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-150 ${activeGuideline ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-150 ease-out ${activeGuideline ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{activeGuideline?.title}</h3>
          <button onClick={closeGuideline} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {activeGuideline?.image && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
              <img src={activeGuideline.image} alt="Contoh dokumen" className="w-full h-auto" />
            </div>
          )}
          <ol className="space-y-4">
            {activeGuideline?.points.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 flex-1" dangerouslySetInnerHTML={{ __html: point }} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}