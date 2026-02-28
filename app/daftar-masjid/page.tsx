// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, MapPin, FileText, Users, Upload, 
  CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Shield, Lock, Eye, EyeOff
} from "lucide-react"
import {
  Step1DataMasjid,
  Step2DataLegalitas,
  Step3PerwakilanResmi,
  Step4UploadDokumen,
  Step5AkunAdmin
} from "@/components/masjid-registration"
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateNPWP,
  validatePostalCode,
  detectSQLInjection,
  generateCSRFToken,
  validateFileUpload,
  RateLimiter,
  sanitizeObject
} from "@/lib/security-utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Initialize rate limiter (max 3 submissions per 5 minutes)
const rateLimiter = new RateLimiter(3, 5 * 60 * 1000)

export default function DaftarMasjidPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCSRFToken] = useState("")
  const [honeypot, setHoneypot] = useState("") // Bot detection

  // Generate CSRF token on mount
  useEffect(() => {
    const token = generateCSRFToken()
    setCSRFToken(token)
    sessionStorage.setItem('csrf_token', token)
  }, [])
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId')
      const authCookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
      
      if (!userId || !authCookie) {
        // Not authenticated, redirect to login
        router.push('/login?redirect=/daftar-masjid&message=Silakan login terlebih dahulu')
      }
    }
    
    checkAuth()
  }, [router])

  const [formData, setFormData] = useState({
    // Step 1: Data Masjid
    mosqueName: "",
    mosqueAddress: "",
    province: "",
    city: "",
    district: "",
    subDistrict: "",
    postalCode: "",
    
    // Step 2: Data Legalitas
    aktaPendirian: null,
    skKemenkumham: null,
    npwpMasjid: "",
    npwpDokumen: null,
    suratPernyataan: null,
    sertifikatPendaftaran: null,
    
    // Step 2: Data Legalitas
    aktaPendirian: "",
    skKemenkumham: "",
    npwpMasjid: "",
    
    // Step 3: Data Pengurus (Perwakilan Resmi)
    namaDepan: "",
    namaBelakang: "",
    jenisKelamin: "",
    pekerjaan: "",
    isPemilikBisnis: false,
    emailPerwakilan: "",
    tanggalLahir: "",
    nomorHandphone: "",
    alamatTempat: "",
    jenisID: "KTP",
    fotoKTP: null,
    nomorKTP: "",
    suratKuasa: null,
    // Kontak person sama dengan perwakilan
    kontakPersonSama: true,
    
    // Step 4: Upload Dokumen
    skKepengurusan: null,
    suratRekomendasiRTRW: null,
    fotoTampakDepan: null,
    fotoInterior: null,
    dokumenStatusTanah: null,
    ktpKetua: null,
    npwpDokumen: null,
    
    // Step 5: Akun Admin
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    recaptchaToken: "",
  })

  const totalSteps = 5

  const provinces = [
    "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten",
    "Yogyakarta", "Bali", "Sumatera Utara", "Sumatera Barat", "Sumatera Selatan"
  ]

  const handleNext = () => {
    setDirection(1)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setDirection(-1)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      // Use security utility for comprehensive file validation
      const validation = validateFileUpload(file)
      
      if (!validation.valid) {
        setError(validation.error || "File tidak valid")
        return
      }
    }
    setFormData({ ...formData, [field]: file })
  }

  const validateStep = (step: number): boolean => {
    setError("")
    
    switch (step) {
      case 1:
        if (!formData.mosqueName || !formData.mosqueAddress || !formData.province || 
            !formData.city || !formData.district || !formData.subDistrict || !formData.postalCode) {
          setError("Semua field harus diisi")
          return false
        }
        if (formData.postalCode.length !== 5 || !/^\d+$/.test(formData.postalCode)) {
          setError("Kode pos harus 5 digit angka")
          return false
        }
        break
        
      case 2:
        if (!formData.aktaPendirian || !formData.skKemenkumham || !formData.npwpMasjid) {
          setError("Semua field legalitas harus diisi")
          return false
        }
        if (formData.npwpMasjid.length !== 15 || !/^\d+$/.test(formData.npwpMasjid)) {
          setError("NPWP harus 15 digit angka")
          return false
        }
        break
        
      case 3:
        if (!formData.namaDepan || !formData.namaBelakang || !formData.jenisKelamin || 
            !formData.pekerjaan || !formData.emailPerwakilan || !formData.tanggalLahir ||
            !formData.nomorHandphone || !formData.alamatTempat || !formData.nomorKTP || !formData.fotoKTP) {
          setError("Semua field perwakilan resmi harus diisi")
          return false
        }
        if (formData.nomorKTP.length !== 16 || !/^\d+$/.test(formData.nomorKTP)) {
          setError("Nomor KTP harus 16 digit angka")
          return false
        }
        break
        
      case 4:
        if (!formData.skKepengurusan || !formData.suratRekomendasiRTRW || 
            !formData.fotoTampakDepan || !formData.fotoInterior || 
            !formData.dokumenStatusTanah || !formData.ktpKetua) {
          setError("Dokumen wajib harus diupload (SK Kepengurusan, Surat Rekomendasi, Foto Masjid, Status Tanah, KTP Ketua)")
          return false
        }
        break
        
      case 5:
        if (!formData.adminEmail || !formData.adminPassword || !formData.adminConfirmPassword) {
          setError("Semua field akun admin harus diisi")
          return false
        }
        if (formData.adminPassword !== formData.adminConfirmPassword) {
          setError("Password tidak cocok")
          return false
        }
        if (formData.adminPassword.length < 6) {
          setError("Password minimal 6 karakter")
          return false
        }
        if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.adminPassword)) {
          setError("Password harus mengandung huruf kapital dan angka")
          return false
        }
        break
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }
    
    if (currentStep < totalSteps) {
      setSuccess("Data tersimpan! Lanjut ke tahap berikutnya")
      setTimeout(() => {
        setSuccess("")
        handleNext()
      }, 1000)
      return
    }
    
    // Final submission
    setLoading(true)
    setError("")
    
    try {
      const formDataToSend = new FormData()
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] && typeof formData[key] !== 'object') {
          formDataToSend.append(key, formData[key])
        }
      })
      
      // Append files
      if (formData.skKepengurusan) formDataToSend.append('skKepengurusan', formData.skKepengurusan)
      if (formData.suratRekomendasiRTRW) formDataToSend.append('suratRekomendasiRTRW', formData.suratRekomendasiRTRW)
      if (formData.fotoTampakDepan) formDataToSend.append('fotoTampakDepan', formData.fotoTampakDepan)
      if (formData.fotoInterior) formDataToSend.append('fotoInterior', formData.fotoInterior)
      if (formData.dokumenStatusTanah) formDataToSend.append('dokumenStatusTanah', formData.dokumenStatusTanah)
      if (formData.ktpKetua) formDataToSend.append('ktpKetua', formData.ktpKetua)
      if (formData.npwpDokumen) formDataToSend.append('npwpDokumen', formData.npwpDokumen)
      
      const response = await fetch(`${API_URL}/api/masjid/register`, {
        method: 'POST',
        body: formDataToSend,
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Save registration completion status to localStorage
        const userId = localStorage.getItem('userId') || 'current_user'
        localStorage.setItem(`mosque_registration_${userId}`, 'completed')
        
        setSuccess("Pendaftaran berhasil! Menunggu verifikasi admin...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.message || "Gagal mendaftar")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        type: "spring",
        damping: 20,
        stiffness: 200
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-4 md:py-8 px-4 lg:px-8">
      <div className="w-full mx-auto flex gap-8">
        {/* Sidebar Navigation - Desktop Only (XL and above) */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Progress Pendaftaran</h3>
              
              <div className="space-y-6 relative">
                {/* Vertical Line - More subtle */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200">
                  <motion.div 
                    className="w-full bg-blue-600"
                    initial={{ height: 0 }}
                    animate={{ height: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>

                {/* Step 1: Data Masjid */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 1 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 1
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > 1 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">1</span>
                      )}
                    </motion.div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Data Masjid
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Informasi Dasar</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Alamat Lengkap</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 1 && formData.mosqueName && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ {formData.mosqueName}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 2: Legalitas */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 2 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 2
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > 2 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">2</span>
                      )}
                    </motion.div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Data Legalitas
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Akta & SK</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>NPWP</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 2 && formData.npwpMasjid && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ NPWP: {formData.npwpMasjid}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 3: Perwakilan Resmi */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 3 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 3
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > 3 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">3</span>
                      )}
                    </motion.div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Perwakilan Resmi
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Data Pribadi</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Identitas</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Dokumen</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 3 && formData.namaDepan && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ {formData.namaDepan} {formData.namaBelakang}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 4: Dokumen */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 4 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 4
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > 4 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">4</span>
                      )}
                    </motion.div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Upload Dokumen
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>SK Kepengurusan</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Surat Rekomendasi</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Foto & Dokumen</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 4 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ {[formData.skKepengurusan, formData.suratRekomendasiRTRW, formData.fotoTampakDepan, formData.fotoInterior, formData.dokumenStatusTanah, formData.ktpKetua].filter(Boolean).length} dokumen
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 5: Akun */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 5 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 5
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > 5 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">5</span>
                      )}
                    </motion.div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 5 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Buat Akun Admin
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 5 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Email & Password</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Review Data</span>
                        </div>
                      </motion.div>
                    )}
                    {formData.adminEmail && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ {formData.adminEmail}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress Percentage */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-blue-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold">Pendaftaran Masjid</h1>
                  <p className="text-blue-100 mt-1 text-sm md:text-base">Bergabunglah dengan ribuan masjid di Indonesia</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="font-medium">Progress Pendaftaran</span>
                  <span className="font-bold">{currentStep} dari {totalSteps}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex-1">
                      <motion.div 
                        className={`h-2 md:h-2.5 rounded-full transition-all duration-500 ${
                          currentStep >= step ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-white/30"
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: currentStep >= step ? 1 : 1 }}
                        transition={{ duration: 0.5, delay: step * 0.1 }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] md:text-xs">
                  <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${currentStep >= 1 ? "text-white" : "text-blue-200"}`}>
                    <Building2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={`${currentStep >= 1 ? "font-semibold" : ""} hidden sm:inline`}>Data Masjid</span>
                    <span className={`${currentStep >= 1 ? "font-semibold" : ""} sm:hidden`}>Data</span>
                  </div>
                  <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${currentStep >= 2 ? "text-white" : "text-blue-200"}`}>
                    <FileText className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={currentStep >= 2 ? "font-semibold" : ""}>Legalitas</span>
                  </div>
                  <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${currentStep >= 3 ? "text-white" : "text-blue-200"}`}>
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={currentStep >= 3 ? "font-semibold" : ""}>Perwakilan</span>
                  </div>
                  <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${currentStep >= 4 ? "text-white" : "text-blue-200"}`}>
                    <Upload className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={`${currentStep >= 4 ? "font-semibold" : ""} hidden sm:inline`}>Dokumen</span>
                    <span className={`${currentStep >= 4 ? "font-semibold" : ""} sm:hidden`}>Dok</span>
                  </div>
                  <div className={`flex flex-col items-center gap-0.5 md:gap-1 ${currentStep >= 5 ? "text-white" : "text-blue-200"}`}>
                    <Lock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={currentStep >= 5 ? "font-semibold" : ""}>Akun</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Form Content */}
            <div className="p-4 md:p-8 lg:p-12">
              {/* Error/Success Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    {/* STEP 1: Data Masjid */}
                    {currentStep === 1 && (
                      <Step1DataMasjid 
                        formData={formData}
                        setFormData={setFormData}
                        provinces={provinces}
                      />
                    )}

                    {/* STEP 2: Data Legalitas */}
                    {currentStep === 2 && (
                      <Step2DataLegalitas 
                        formData={formData}
                        setFormData={setFormData}
                      />
                    )}

                    {/* STEP 3: Data Perwakilan Resmi */}
                    {currentStep === 3 && (
                      <Step3PerwakilanResmi 
                        formData={formData}
                        setFormData={setFormData}
                        handleFileChange={handleFileChange}
                      />
                    )}

                    {/* STEP 4: Upload Dokumen */}
                    {currentStep === 4 && (
                      <Step4UploadDokumen 
                        formData={formData}
                        handleFileChange={handleFileChange}
                      />
                    )}

                    {/* STEP 5: Akun Admin */}
                    {currentStep === 5 && (
                      <Step5AkunAdmin 
                        formData={formData}
                        setFormData={setFormData}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Sebelumnya
                  </button>

                  <div className="text-sm text-gray-600">
                    Tahap {currentStep} dari {totalSteps}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : currentStep === totalSteps ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Kirim Pendaftaran
                      </>
                    ) : (
                      <>
                        Selanjutnya
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 md:px-12 py-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Data Anda aman dan terenkripsi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Verifikasi 1-3 hari kerja</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}