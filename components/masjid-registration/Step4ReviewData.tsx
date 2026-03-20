// @ts-nocheck
"use client"
import { CheckCircle2, Edit2, X, FileText, Users, Building2, AlertCircle, Eye, Save } from "lucide-react"
import { useState } from "react"
import { ProductionFileUpload } from "@/components/ui/production-file-upload"

interface Step4Props {
  formData: any
  setFormData: (data: any) => void
  setCurrentStep: (step: number) => void
}

export default function Step4ReviewData({ formData, setFormData, setCurrentStep }: Step4Props) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [localData, setLocalData] = useState({ ...formData })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>("")

  const startEdit = (section: string) => { setLocalData({ ...formData }); setEditingSection(section) }
  const saveEdit = () => { setFormData({ ...localData }); setEditingSection(null) }
  const cancelEdit = () => { setLocalData({ ...formData }); setEditingSection(null) }
  const handleLocalFile = (field: string, file: File | null) => setLocalData((prev: any) => ({ ...prev, [field]: file }))

  const openPreview = (file: File) => {
    if (file?.type?.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => { setPreviewUrl(e.target?.result as string); setPreviewName(file.name) }
      reader.readAsDataURL(file)
    }
  }

  const inputCls = "w-full px-3 py-2.5 text-sm bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
  const selectCls = "w-full px-3 py-2.5 text-sm bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"

  const ReviewItem = ({ label, value }: any) => (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={`text-sm font-medium break-words ${value ? "text-gray-900" : "text-red-500"}`}>{value || "Belum diisi"}</p>
      </div>
      {value ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 ml-3 mt-1" /> : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-3 mt-1" />}
    </div>
  )

  const ReviewFile = ({ label, file }: any) => (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {file ? (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            {file.type?.startsWith("image/") && (
              <button type="button" onClick={() => openPreview(file)} className="p-1 hover:bg-blue-50 rounded">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
              </button>
            )}
          </div>
        ) : <p className="text-sm text-red-500">Belum diupload</p>}
      </div>
      {file ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 ml-3 mt-1" /> : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-3 mt-1" />}
    </div>
  )

  const SectionHeader = ({ title, icon: Icon, section, color }: any) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {editingSection === section ? (
        <div className="flex gap-2">
          <button type="button" onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
            <Save className="w-3 h-3" /> Simpan
          </button>
          <button type="button" onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
            <X className="w-3 h-3" /> Batal
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => startEdit(section)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <span>Review Data</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">Periksa dan edit langsung jika ada yang perlu diperbaiki</p>
        </div>

        {/* STEP 1: Data Masjid */}
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <SectionHeader title="Data Masjid" icon={Building2} section="masjid" color="bg-blue-600" />
          {editingSection === "masjid" ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Masjid *</label>
                <input className={inputCls} value={localData.mosqueName || ""} onChange={e => setLocalData({...localData, mosqueName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Foto Masjid *</label>
                <ProductionFileUpload id="review-mosqueImage" label="Foto Masjid" file={localData.mosqueImage} onFileChange={(f) => handleLocalFile("mosqueImage", f)} accept=".jpg,.jpeg,.png,.webp" required placeholder="Upload foto masjid (horizontal)" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat Lengkap *</label>
                <textarea className={inputCls} rows={2} value={localData.mosqueAddress || ""} onChange={e => setLocalData({...localData, mosqueAddress: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Provinsi *</label>
                  <input className={inputCls} value={localData.province || ""} onChange={e => setLocalData({...localData, province: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Kota/Kabupaten *</label>
                  <input className={inputCls} value={localData.regency || ""} onChange={e => setLocalData({...localData, regency: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Kecamatan *</label>
                  <input className={inputCls} value={localData.district || ""} onChange={e => setLocalData({...localData, district: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Kelurahan/Desa *</label>
                  <input className={inputCls} value={localData.village || ""} onChange={e => setLocalData({...localData, village: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">RT *</label>
                  <input className={inputCls} value={localData.rt || ""} onChange={e => setLocalData({...localData, rt: e.target.value.replace(/\D/g,'').slice(0,3)})} placeholder="001" maxLength={3} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">RW *</label>
                  <input className={inputCls} value={localData.rw || ""} onChange={e => setLocalData({...localData, rw: e.target.value.replace(/\D/g,'').slice(0,3)})} placeholder="001" maxLength={3} />
                </div>
              </div>

            </div>
          ) : (
            <div>
              <ReviewItem label="Nama Masjid" value={formData.mosqueName} />
              <ReviewFile label="Foto Masjid" file={formData.mosqueImage} />
              <ReviewItem label="Alamat Lengkap" value={formData.mosqueAddress} />
              <ReviewItem label="Provinsi" value={formData.province} />
              <ReviewItem label="Kota/Kabupaten" value={formData.regency} />
              <ReviewItem label="Kecamatan" value={formData.district} />
              <ReviewItem label="Kelurahan/Desa" value={formData.village} />
              <ReviewItem label="RT" value={formData.rt} />
              <ReviewItem label="RW" value={formData.rw} />
            </div>
          )}
        </div>

        {/* STEP 2: Data Legalitas */}
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <SectionHeader title="Data Legalitas" icon={FileText} section="legalitas" color="bg-emerald-600" />
          {editingSection === "legalitas" ? (
            <div className="space-y-4">
              <ProductionFileUpload id="review-aktaPendirian" label="Akta Pendirian *" file={localData.aktaPendirian} onFileChange={(f) => handleLocalFile("aktaPendirian", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload Akta Pendirian" />
              <ProductionFileUpload id="review-skKemenkumham" label="SK Kemenkumham *" file={localData.skKemenkumham} onFileChange={(f) => handleLocalFile("skKemenkumham", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload SK Kemenkumham" />
              <ProductionFileUpload id="review-npwpDokumen" label="Dokumen NPWP *" file={localData.npwpDokumen} onFileChange={(f) => handleLocalFile("npwpDokumen", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload foto/scan NPWP" />
              <ProductionFileUpload id="review-suratPernyataan" label="Surat Pernyataan Pendirian *" file={localData.suratPernyataan} onFileChange={(f) => handleLocalFile("suratPernyataan", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload Surat Pernyataan Pendirian" />
            </div>
          ) : (
            <div>
              <ReviewFile label="Akta Pendirian" file={formData.aktaPendirian} />
              <ReviewFile label="SK Kemenkumham" file={formData.skKemenkumham} />
              <ReviewFile label="Dokumen NPWP" file={formData.npwpDokumen} />
              <ReviewFile label="Surat Pernyataan Pendirian" file={formData.suratPernyataan} />
            </div>
          )}
        </div>

        {/* STEP 3: Perwakilan Resmi */}
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100">
          <SectionHeader title="Perwakilan Resmi" icon={Users} section="perwakilan" color="bg-purple-600" />
          {editingSection === "perwakilan" ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Jenis ID *</label>
                <select className={selectCls} value={localData.jenisID || "KTP"} onChange={e => setLocalData({...localData, jenisID: e.target.value})}>
                  <option value="KTP">KTP</option>
                  <option value="Paspor">Paspor</option>
                </select>
              </div>
              <ProductionFileUpload id="review-fotoKTP" label={`Foto ${localData.jenisID || "KTP"} *`} file={localData.fotoKTP} onFileChange={(f) => handleLocalFile("fotoKTP", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload foto KTP/Paspor" />
              <ProductionFileUpload id="review-imageKTP" label={`Foto selfie memegang ${localData.jenisID || "KTP"} *`} file={localData.imageKTP} onFileChange={(f) => handleLocalFile("imageKTP", f)} accept=".jpg,.jpeg,.png,.pdf" required placeholder="Upload foto selfie memegang KTP" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Lengkap *</label>
                  <input className={`${inputCls} col-span-2`} value={localData.namaLengkap || ""} onChange={e => setLocalData({...localData, namaLengkap: e.target.value, namaDepan: e.target.value.split(' ')[0] || '', namaBelakang: e.target.value.split(' ').slice(1).join(' ')})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Jenis Kelamin *</label>
                  <select className={selectCls} value={localData.jenisKelamin || ""} onChange={e => setLocalData({...localData, jenisKelamin: e.target.value})}>
                    <option value="">Pilih</option>
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Pekerjaan *</label>
                  <input className={inputCls} value={localData.pekerjaan || ""} onChange={e => setLocalData({...localData, pekerjaan: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                <input type="email" className="w-full px-3 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" value={localData.emailPerwakilan || ""} readOnly />
                <p className="text-[10px] text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tanggal Lahir *</label>
                  <input type="date" className={inputCls} value={localData.tanggalLahir || ""} onChange={e => setLocalData({...localData, tanggalLahir: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nomor Handphone *</label>
                  <input type="tel" className={inputCls} value={localData.nomorHandphone || ""} onChange={e => setLocalData({...localData, nomorHandphone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat Tempat Tinggal *</label>
                <textarea className={inputCls} rows={2} value={localData.alamatTempat || ""} onChange={e => setLocalData({...localData, alamatTempat: e.target.value})} />
              </div>
            </div>
          ) : (
            <div>
              <ReviewItem label="Jenis ID" value={formData.jenisID} />
              <ReviewFile label={`Foto ${formData.jenisID || "KTP"}`} file={formData.fotoKTP} />
              <ReviewFile label={`Selfie memegang ${formData.jenisID || "KTP"}`} file={formData.imageKTP} />
              <ReviewItem label="Nama Lengkap" value={formData.namaLengkap || `${formData.namaDepan || ""} ${formData.namaBelakang || ""}`.trim()} />
              <ReviewItem label="Jenis Kelamin" value={formData.jenisKelamin} />
              <ReviewItem label="Pekerjaan" value={formData.pekerjaan} />
              <ReviewItem label="Email" value={formData.emailPerwakilan} />
              <ReviewItem label="Tanggal Lahir" value={formData.tanggalLahir} />
              <ReviewItem label="Nomor Handphone" value={formData.nomorHandphone} />
              <ReviewItem label="Alamat Tempat Tinggal" value={formData.alamatTempat} />
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-800">
            Klik <strong>Edit</strong> pada section yang ingin diubah, lalu klik <strong>Simpan</strong>. Setelah semua data benar, klik <strong>Selanjutnya</strong>.
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full" onClick={() => setPreviewUrl(null)}>
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={previewUrl} alt={previewName} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-4 text-white text-sm opacity-70">{previewName}</p>
        </div>
      )}
    </>
  )
}
