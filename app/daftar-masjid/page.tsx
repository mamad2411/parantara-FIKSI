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
import toast, { Toaster } from 'react-hot-toast'
import {
  Step1DataMasjid,
  Step2DataLegalitas,
  Step3PerwakilanResmi,
  Step4ReviewData,
  Step5AkunAdmin
} from "@/components/masjid-registration"
// TODO: Re-enable after fixing bundling issues
// import { SessionTimer } from "@/components/masjid-registration/SessionTimer"
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
// TODO: Re-enable after fixing bundling issues
// import {
//   createRegistrationSession,
//   getRegistrationSession,
//   saveFormDataToSession,
//   getFormDataFromSession,
//   clearRegistrationSession,
// } from "@/lib/registration-session"
// TODO: Re-enable after fixing bundling issues
// import {
//   generateDeviceFingerprint,
//   saveDeviceFingerprint,
// } from "@/lib/device-fingerprint"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Initialize rate limiter (max 3 submissions per 5 minutes)
const rateLimiter = new RateLimiter(3, 5 * 60 * 1000)

export default function DaftarMasjidPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCSRFToken] = useState("")
  const [honeypot, setHoneypot] = useState("") // Bot detection
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [formStartTime, setFormStartTime] = useState<number | null>(null)
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())

  // Track form inactivity and session timeout
  useEffect(() => {
    // Set start time when form is initialized
    if (!formStartTime) {
      setFormStartTime(Date.now())
    }

    // Update last activity time on any user interaction
    const updateActivity = () => {
      setLastActivityTime(Date.now())
    }

    // Listen to user interactions
    window.addEventListener('mousemove', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('click', updateActivity)
    window.addEventListener('scroll', updateActivity)
    window.addEventListener('touchstart', updateActivity)
    window.addEventListener('touchmove', updateActivity)

    // Check timeouts every 30 seconds for more responsive timeout
    const timeoutCheck = setInterval(() => {
      const now = Date.now()
      const inactiveTime = now - lastActivityTime

      // Redirect to login if inactive for 1 hour (no submit/no fill)
      if (inactiveTime > 60 * 60 * 1000) {
        localStorage.setItem('session_expired', 'inactive')
        localStorage.setItem('redirect_after_login', '/daftar-masjid')
        router.push('/login')
        return
      }
    }, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
      window.removeEventListener('touchstart', updateActivity)
      window.removeEventListener('touchmove', updateActivity)
      clearInterval(timeoutCheck)
    }
  }, [formStartTime, lastActivityTime, router])

  // Initialize session and device fingerprint
  useEffect(() => {
    const initSession = async () => {
      // TODO: Re-enable device fingerprinting after fixing bundling issues
      // try {
      //   const fingerprint = await generateDeviceFingerprint()
      //   saveDeviceFingerprint(fingerprint)
      // } catch (error) {
      //   console.error('Failed to generate device fingerprint:', error)
      // }

      // TODO: Re-enable session management after fixing bundling issues
      // const existingSession = getRegistrationSession()
      // if (existingSession) {
      //   setCurrentStep(existingSession.currentStep)
      //   setSessionInitialized(true)
      // } else {
      //   setSessionInitialized(true)
      // }
      
      setSessionInitialized(true)
    }

    initSession()
  }, [])

  // Auto-save form data to session - Temporarily disabled
  // useEffect(() => {
  //   if (sessionInitialized && currentStep > 0) {
  //     saveFormDataToSession(currentStep, formData)
  //   }
  // }, [formData, currentStep, sessionInitialized])

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
    regency: "",
    district: "",
    village: "",
    postalCode: "",
    
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

  const handleFileChange = async (field: string, file: File | null) => {
    if (file) {
      // Use security utility for comprehensive file validation
      const validation = validateFileUpload(file)
      
      if (!validation.valid) {
        toast.error(validation.error || "File tidak valid", {
          duration: 4000,
          position: 'top-center',
        })
        return
      }

      // Additional validation for image files (detect editing/manipulation)
      if (file.type.startsWith('image/')) {
        // Import image forensics dynamically
        const { analyzeImage, getValidationMessage } = await import('@/lib/image-forensics')
        
        toast.loading('Memvalidasi foto...', { id: 'image-validation' })
        
        try {
          const forensics = await analyzeImage(file)
          
          if (forensics.isSuspicious) {
            const message = getValidationMessage(forensics)
            toast.error(
              `Foto tidak valid!\n\n${message}\n\nMohon upload foto asli dokumen, bukan hasil screenshot atau editan.`,
              {
                id: 'image-validation',
                duration: 6000,
                position: 'top-center',
              }
            )
            return
          }
          
          // Show warnings if any
          if (forensics.warnings.length > 0) {
            toast.warning(
              `Peringatan:\n${forensics.warnings.join('\n')}\n\nPastikan foto adalah dokumen asli.`,
              {
                id: 'image-validation',
                duration: 5000,
                position: 'top-center',
              }
            )
          } else {
            toast.success('Foto valid', { id: 'image-validation', duration: 2000 })
          }
        } catch (error) {
          console.error('Error validating image:', error)
          toast.dismiss('image-validation')
        }
      }
    }
    setFormData({ ...formData, [field]: file })
  }

  const validateStep = (step: number): boolean => {
    
    switch (step) {
      case 1:
        if (!formData.mosqueName || !formData.mosqueAddress || !formData.province || 
            !formData.regency || !formData.district || !formData.village || !formData.postalCode) {
          toast.error("Semua field harus diisi", {
            duration: 3000,
            position: 'top-center',
          })
          return false
        }
        if (formData.postalCode.length !== 5 || !/^\d+$/.test(formData.postalCode)) {
          toast.error("Kode pos harus 5 digit angka", {
            duration: 3000,
            position: 'top-center',
          })
          return false
        }
        break
        
      case 2:
        if (!formData.aktaPendirian || !formData.skKemenkumham) {
          toast.error("Semua field legalitas harus diisi", {
            duration: 3000,
            position: 'top-center',
          })
          return false
        }
        break
        
      case 3:
        if (!formData.namaDepan || !formData.namaBelakang || !formData.jenisKelamin || 
            !formData.pekerjaan || !formData.emailPerwakilan || !formData.tanggalLahir ||
            !formData.nomorHandphone || !formData.alamatTempat || !formData.nomorKTP || !formData.fotoKTP) {
          toast.error("Semua field perwakilan resmi harus diisi", {
            duration: 3000,
            position: 'top-center',
          })
          return false
        }
        if (formData.nomorKTP.length !== 16 || !/^\d+$/.test(formData.nomorKTP)) {
          toast.error("Nomor KTP harus 16 digit angka", {
            duration: 3000,
            position: 'top-center',
          })
          return false
        }
        break
        
      case 4:
        // Step 4 is review, no validation needed
        break
        
      case 5:
        // Step 5 is now just 2FA setup (optional), no validation needed
        // Email is already set from logged in user
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
      toast.success("Data tersimpan! Lanjut ke tahap berikutnya", {
        duration: 2000,
        position: 'top-center',
      })
      setTimeout(() => {
        handleNext()
      }, 800)
      return
    }
    
    // Final submission
    setLoading(true)
    
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.", {
          duration: 4000,
          position: 'top-center',
        })
        router.push('/login?redirect=/daftar-masjid')
        return
      }
      
      // Prepare data for PostgreSQL (via Prisma)
      const registrationData = {
        userId,
        ...formData,
        // Convert file objects to base64 or URLs if needed
        // For now, we'll send file names/paths
      }
      
      const response = await fetch('/api/masjid-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Save registration completion status to localStorage
        localStorage.setItem(`mosque_registration_${userId}`, 'completed')
        localStorage.setItem(`mosque_registration_id_${userId}`, data.registrationId)
        
        // Clear the force verification flag since registration is complete
        localStorage.removeItem(`force_device_verification_${userId}`)
        
        toast.success("Pendaftaran berhasil! Menunggu verifikasi admin...", {
          duration: 3000,
          position: 'top-center',
        })
        setTimeout(() => {
          router.push("/masjid?message=Pendaftaran berhasil dikirim")
        }, 2000)
      } else {
        toast.error(data.error || "Gagal mendaftar", {
          duration: 4000,
          position: 'top-center',
        })
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error("Terjadi kesalahan. Silakan coba lagi.", {
        duration: 4000,
        position: 'top-center',
      })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-2 sm:py-3 md:py-6 lg:py-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      {/* Toast Container */}
      <Toaster />
      
      {/* Session Timer - Temporarily disabled */}
      {/* {sessionInitialized && <SessionTimer />} */}
      
      <div className="w-full max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Sidebar Navigation - Desktop Only (XL and above) */}
        <div className="hidden xl:block w-64 2xl:w-72 flex-shrink-0">
          <div className="sticky top-4 lg:top-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
            >
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6">Progress Pendaftaran</h3>
              
              <div className="space-y-5 lg:space-y-6 relative">
                {/* Vertical Line - More subtle */}
                <div className="absolute left-4 top-4 w-px bg-gray-200" style={{ height: 'calc(100% - 2rem)' }}>
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

                {/* Step 4: Review Data */}
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
                      Review Data
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
                          <span>Periksa Data</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <span>Konfirmasi</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 4 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ Data telah direview
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 5: Akun Admin & 2FA */}
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
                      Akun Admin & 2FA
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
                          <span>Keamanan 2FA</span>
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
              <div className="mt-5 lg:mt-6 pt-5 lg:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-blue-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 text-white shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold truncate">Pendaftaran Masjid</h1>
                  <p className="text-blue-100 mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm lg:text-base">Bergabunglah dengan ribuan masjid di Indonesia</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm">
                  <span className="font-medium">Progress Pendaftaran</span>
                  <span className="font-bold">{currentStep} dari {totalSteps}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex-1">
                      <motion.div 
                        className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-500 ${
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
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={currentStep >= 4 ? "font-semibold" : ""}>Review</span>
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
            className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Form Content */}
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
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

                    {/* STEP 4: Review Data */}
                    {currentStep === 4 && (
                      <Step4ReviewData 
                        formData={formData}
                        setFormData={setFormData}
                        setCurrentStep={setCurrentStep}
                      />
                    )}

                    {/* STEP 5: Akun Admin & 2FA */}
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                    <span className="sm:hidden">Kembali</span>
                  </button>

                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left order-first sm:order-none">
                    Tahap {currentStep} dari {totalSteps}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Memproses...</span>
                        <span className="sm:hidden">Proses...</span>
                      </>
                    ) : currentStep === totalSteps ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Kirim Pendaftaran</span>
                        <span className="sm:hidden">Kirim</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <span className="sm:hidden">Lanjut</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5 md:py-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <span>Data Anda aman dan terenkripsi</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
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