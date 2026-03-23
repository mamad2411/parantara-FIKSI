// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, MapPin, FileText, Users, Upload, 
  CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Shield, Lock, Eye, EyeOff
} from "lucide-react"
import toast, { Toaster } from 'react-hot-toast'
import dynamic from "next/dynamic"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { uploadAllFiles } from "@/lib/upload-file"
import { LottieLoading } from "@/components/ui/lottie-loading"
import { RateLimitModal } from "@/components/ui/rate-limit-modal"

// Lazy load each step — only Step1 is needed on initial render
const Step1DataMasjid = dynamic(
  () => import("@/components/masjid-registration/Step1DataMasjid"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)
const Step2DataLegalitas = dynamic(
  () => import("@/components/masjid-registration/Step2DataLegalitas"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)
const Step3PerwakilanResmi = dynamic(
  () => import("@/components/masjid-registration/Step3PerwakilanResmi"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)
const Step4ReviewData = dynamic(
  () => import("@/components/masjid-registration/Step4ReviewData"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)
const Step5AkunAdmin = dynamic(
  () => import("@/components/masjid-registration/Step5AkunAdmin"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)
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

// Safe toast position helper — avoids window.innerWidth during SSR
const toastPos = () =>
  typeof window !== "undefined" && window.innerWidth >= 768
    ? ("top-right" as const)
    : ("top-center" as const)

export default function DaftarMasjidPage() {
  const router = useRouter()
  const { user, loading: authLoading, firebaseReady } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCSRFToken] = useState("")
  const [honeypot, setHoneypot] = useState("") // Bot detection
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [formStartTime, setFormStartTime] = useState<number | null>(null)
  const [showRateLimitModal, setShowRateLimitModal] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState({ hoursLeft: 24, nextAllowedTime: "" })
  const lastActivityTime = useRef<number>(Date.now())

  // Clear any stored registration data on page load (fresh start every time)
  useEffect(() => {
    // Clear localStorage items related to registration
    const keysToRemove = [
      'daftar_masjid_data',
      'daftar_masjid_progress', 
      'daftar_masjid_step',
      'registration_session',
      'form_data_backup',
      'masjid_registration_draft'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear sessionStorage items
    const sessionKeysToRemove = [
      'daftar_masjid_temp',
      'registration_temp_data',
      'form_progress'
    ]
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
    })
    
    console.log('🧹 Registration data cleared - fresh start required')
  }, []) // Run only once on mount

  const [authChecked, setAuthChecked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Firebase auth guard — with grace period to handle onAuthStateChanged race condition
  useEffect(() => {
    if (!mounted) return

    // If user is already set, allow immediately
    if (user) {
      setAuthChecked(true)
      return
    }

    // If still loading, wait
    if (authLoading) return

    // authLoading=false but user=null — check localStorage first
    const userId = localStorage.getItem('userId')
    if (userId) {
      // userId exists in localStorage — Firebase session likely still restoring
      // Give it a grace period before redirecting
      setAuthChecked(true)
      return
    }

    // No user, no localStorage userId — wait a short grace period
    // in case onAuthStateChanged fires slightly after authLoading=false
    const grace = setTimeout(() => {
      // Re-check after grace period
      const uid = localStorage.getItem('userId')
      if (uid) {
        setAuthChecked(true)
      } else {
        router.replace(
          '/login?redirect=/daftar-masjid&message=Harus+login+terlebih+dahulu+untuk+mendaftar+masjid&type=daftar-masjid'
        )
      }
    }, 800)

    return () => clearTimeout(grace)
  }, [user, authLoading, mounted, router])

  // Track form inactivity and session timeout
  useEffect(() => {
    if (!formStartTime) {
      setFormStartTime(Date.now())
    }

    // Throttled activity update — avoids setState on every mousemove pixel
    let throttleTimer: ReturnType<typeof setTimeout> | null = null
    const updateActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          lastActivityTime.current = Date.now()
          throttleTimer = null
        }, 5000) // Update at most every 5 seconds
      }
    }

    // Only listen to meaningful interactions, not mousemove/touchmove
    window.addEventListener('keydown', updateActivity, { passive: true })
    window.addEventListener('click', updateActivity, { passive: true })
    window.addEventListener('scroll', updateActivity, { passive: true })

    const timeoutCheck = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime.current
      if (inactiveTime > 60 * 60 * 1000) {
        localStorage.setItem('session_expired', 'inactive')
        localStorage.setItem('redirect_after_login', '/daftar-masjid')
        router.push('/login')
      }
    }, 60000) // Check every 60 seconds (was 30)

    return () => {
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
      if (throttleTimer) clearTimeout(throttleTimer)
      clearInterval(timeoutCheck)
    }
  }, [formStartTime, router])

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
  
  // Pre-fill user data from Firestore
  // Pre-fill user data — runs when user object is available (handles Google sign-in race condition)
  useEffect(() => {
    const prefillUserData = async () => {
      // First try from Firebase user object directly (fastest, works for Google sign-in)
      // Only prefill email — name fields in Step 3 are filled manually by user
      if (user) {
        const emailFromUser = user.email || ""
        if (emailFromUser) {
          setFormData(prev => ({
            ...prev,
            emailPerwakilan: prev.emailPerwakilan || emailFromUser,
            adminEmail: prev.adminEmail || emailFromUser,
          }))
        }
      }

      // Then enrich from Firestore (email only)
      const userId = user?.uid || localStorage.getItem('userId')
      if (!userId || !db) return
      try {
        const snap = await getDoc(doc(db, 'users', userId))
        if (snap.exists()) {
          const data = snap.data()
          const email = data.email || ""
          setFormData(prev => ({
            ...prev,
            emailPerwakilan: prev.emailPerwakilan || email,
            adminEmail: prev.adminEmail || email,
          }))
        }
      } catch (e) {
        console.error('Failed to prefill user data', e)
      }
    }
    prefillUserData()
  }, [user])


  const [formData, setFormData] = useState({
    // Step 1: Data Masjid
    mosqueName: "",
    mosqueImage: null,
    mosqueAddress: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    rt: "",
    rw: "",
    
    // Step 2: Data Legalitas
    aktaPendirian: "",
    skKemenkumham: "",
    npwpMasjid: "",
    
    // Step 3: Data Pengurus (Perwakilan Resmi)
    namaLengkap: "",
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
    imageKTP: null,
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
    adminPin: "",
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
      const validation = validateFileUpload(file)
      
      if (!validation.valid) {
        toast.error(validation.error || "File tidak valid", {
          duration: 4000,
          position: toastPos(),
        })
        return
      }

      // Forensics hanya untuk foto KTP/wajah (field fotoKTP), bukan scan dokumen resmi
      // Scan dokumen (akta, SK, surat) punya karakteristik yang selalu false-positive di ELA
      if (field === 'fotoKTP' && file.type.startsWith('image/')) {
        const { ImageForensics } = await import('@/lib/image-forensics')
        toast.loading('Memvalidasi dokumen...', { id: 'image-validation' })
        try {
          const forensicResult = await ImageForensics.validateDocument(file)
          if (!forensicResult.isValid) {
            toast('⚠️ Foto KTP terdeteksi mungkin telah diedit. Pastikan foto asli dari kamera.', {
              id: 'image-validation',
              duration: 5000,
              position: 'top-center',
              icon: '⚠️',
              style: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }
            })
          } else {
            toast.success('Foto KTP terverifikasi', { id: 'image-validation', duration: 2000 })
          }
        } catch {
          toast.dismiss('image-validation')
        }
      }
    }
    setFormData({ ...formData, [field]: file })
  }

  const validateStep = (step: number): boolean => {
    const err = (msg: string) => {
      toast.error(msg, { duration: 4000, position: toastPos() })
      return false
    }

    switch (step) {
      case 1:
        if (!formData.mosqueName) return err("Nama masjid wajib diisi")
        if (!formData.mosqueImage) return err("Foto masjid wajib diupload")
        if (!formData.mosqueAddress) return err("Alamat lengkap masjid wajib diisi")
        if (!formData.province) return err("Provinsi wajib diisi")
        if (!formData.regency) return err("Kota/Kabupaten wajib diisi")
        if (!formData.district) return err("Kecamatan wajib diisi")
        if (!formData.village) return err("Kelurahan/Desa wajib diisi")
        if (!formData.rt) return err("RT wajib diisi")
        if (!formData.rw) return err("RW wajib diisi")
        if ([formData.province, formData.regency, formData.district, formData.village].some(f => f?.includes('[Belum Terdeteksi]'))) {
          return err("Mohon lengkapi data administratif yang belum terdeteksi")
        }
        break

      case 2:
        if (!formData.aktaPendirian) return err("Akta Pendirian wajib diupload")
        if (!formData.skKemenkumham) return err("SK Kemenkumham wajib diupload")
        if (!formData.npwpDokumen) return err("Dokumen NPWP wajib diupload")
        if (!formData.suratPernyataan) return err("Surat Pernyataan Pendirian wajib diupload")
        break

      case 3:
        if (!formData.fotoKTP) return err(`Foto ${formData.jenisID || 'KTP'} wajib diupload`)
        if (!formData.imageKTP) return err(`Foto selfie memegang ${formData.jenisID || 'KTP'} wajib diupload`)
        if (!formData.namaLengkap) return err("Nama lengkap wajib diisi")
        if (!formData.jenisKelamin) return err("Jenis kelamin wajib dipilih")
        if (!formData.pekerjaan) return err("Pekerjaan wajib diisi")
        if (!formData.tanggalLahir) return err("Tanggal lahir wajib diisi")
        if (!formData.nomorHandphone) return err("Nomor handphone wajib diisi")
        if (!formData.alamatTempat) return err("Alamat tempat tinggal wajib diisi")
        break

      case 4:
        // Validate all required fields are filled before proceeding to step 5
        if (!formData.mosqueName) return err("Nama masjid belum diisi — edit di bagian Data Masjid")
        if (!formData.mosqueImage) return err("Foto masjid belum diupload — edit di bagian Data Masjid")
        if (!formData.mosqueAddress) return err("Alamat masjid belum diisi — edit di bagian Data Masjid")
        if (!formData.province || !formData.regency || !formData.district || !formData.village) return err("Data wilayah masjid belum lengkap — edit di bagian Data Masjid")
        if (!formData.rt) return err("RT belum diisi — edit di bagian Data Masjid")
        if (!formData.rw) return err("RW belum diisi — edit di bagian Data Masjid")
        if (!formData.aktaPendirian) return err("Akta Pendirian belum diupload — edit di bagian Data Legalitas")
        if (!formData.skKemenkumham) return err("SK Kemenkumham belum diupload — edit di bagian Data Legalitas")
        if (!formData.npwpDokumen) return err("Dokumen NPWP belum diupload — edit di bagian Data Legalitas")
        if (!formData.suratPernyataan) return err("Surat Pernyataan Pendirian belum diupload — edit di bagian Data Legalitas")
        if (!formData.fotoKTP) return err(`Foto ${formData.jenisID || 'KTP'} belum diupload — edit di bagian Perwakilan Resmi`)
        if (!formData.imageKTP) return err("Foto selfie belum diupload — edit di bagian Perwakilan Resmi")
        if (!formData.namaLengkap) return err("Nama lengkap belum diisi — edit di bagian Perwakilan Resmi")
        if (!formData.jenisKelamin) return err("Jenis kelamin belum dipilih — edit di bagian Perwakilan Resmi")
        if (!formData.pekerjaan) return err("Pekerjaan belum diisi — edit di bagian Perwakilan Resmi")
        if (!formData.tanggalLahir) return err("Tanggal lahir belum diisi — edit di bagian Perwakilan Resmi")
        if (!formData.nomorHandphone) return err("Nomor handphone belum diisi — edit di bagian Perwakilan Resmi")
        if (!formData.alamatTempat) return err("Alamat tempat tinggal belum diisi — edit di bagian Perwakilan Resmi")
        break

      case 5:
        if (!formData.adminPin || formData.adminPin.length !== 6) {
          return err("PIN 6 digit wajib diisi")
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
      handleNext()
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
          position: toastPos(),
        })
        router.push('/login?redirect=/daftar-masjid')
        return
      }
      
      // Prepare data — upload File objects first, then submit URLs
      const toastId = toast.loading('Mengupload dokumen...', { position: toastPos() })

      const dataWithUrls = await uploadAllFiles(formData, userId, (done, total) => {
        toast.loading(`Mengupload dokumen ${done}/${total}...`, { id: toastId, position: toastPos() })
      })

      toast.loading('Menyimpan pendaftaran...', { id: toastId, position: toastPos() })

      const registrationData = {
        userId,
        ...dataWithUrls,
      }
      
      const response = await fetch('/api/masjid-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        // Rate limit exceeded
        toast.dismiss(toastId)
        const hoursLeft = data.nextAllowedTime 
          ? Math.ceil((new Date(data.nextAllowedTime).getTime() - Date.now()) / (1000 * 60 * 60))
          : 24
        
        setRateLimitInfo({
          hoursLeft,
          nextAllowedTime: data.nextAllowedTime || ""
        })
        setShowRateLimitModal(true)
        setLoading(false)
        return
      }
      
      if (data.success) {
        toast.dismiss(toastId)
        // Save registration completion status to localStorage
        localStorage.setItem(`mosque_registration_${userId}`, 'completed')
        localStorage.setItem(`mosque_registration_id_${userId}`, data.registrationId)
        
        // Set cookie so middleware can redirect completed users — include userId to prevent cross-account leakage
        document.cookie = `mosque_registered=${userId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`
        
        // Clear the force verification flag since registration is complete
        localStorage.removeItem(`force_device_verification_${userId}`)
        
        toast.success("Pendaftaran berhasil! Menunggu verifikasi admin...", {
          duration: 2000,
          position: toastPos(),
        })
        setTimeout(() => router.push("/menunggu"), 1000)
      } else {
        toast.dismiss(toastId)
        toast.error(data.error || "Gagal mendaftar", {
          duration: 4000,
          position: toastPos(),
        })
      }
    } catch (err) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.", {
        duration: 4000,
        position: toastPos(),
      })
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    })
  }

  // SSR renders null to avoid hydration mismatch — client handles auth check
  if (!mounted) return null
  if (!authChecked) {
    return <LottieLoading className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-2 sm:py-3 md:py-6 lg:py-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      {/* Toast Container */}
      <Toaster />
      
      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        hoursLeft={rateLimitInfo.hoursLeft}
        nextAllowedTime={rateLimitInfo.nextAllowedTime}
      />
      
      {/* Session Timer - Temporarily disabled */}
      {/* {sessionInitialized && <SessionTimer />} */}
      
      <div className="w-full max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Sidebar Navigation - Desktop Only (XL and above) */}
        <div className="hidden xl:block w-64 2xl:w-72 flex-shrink-0">
          <div className="sticky top-4 lg:top-6">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 lg:mb-6">Progress Pendaftaran</h3>
              
              <div className="space-y-5 lg:space-y-6 relative">
                {/* Vertical Line - More subtle */}
                <div className="absolute left-4 top-4 w-px bg-gray-200" style={{ height: 'calc(100% - 2rem)' }}>
                  <div 
                    className="w-full bg-blue-600 transition-all duration-300"
                    style={{ height: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                  />
                </div>

                {/* Step 1: Data Masjid */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 1 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 1
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 1 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">1</span>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Data Masjid
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 1 && (
                      <motion.div 
                        key="step1-active"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Informasi Dasar</span>
                        </div>
                        <div className={`flex items-center gap-2 font-medium ${formData.mosqueName && formData.mosqueImage ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.mosqueName && formData.mosqueImage ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <span>Alamat Lengkap</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 1 && formData.mosqueName && (
                      <motion.div 
                        key="step1-done"
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
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 2 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 2
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 2 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">2</span>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Data Legalitas
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 2 && (
                      <motion.div 
                        key="step2-active"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Akta & SK</span>
                        </div>
                        <div className={`flex items-center gap-2 font-medium ${formData.aktaPendirian && formData.skKemenkumham ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.aktaPendirian && formData.skKemenkumham ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <span>NPWP</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 3: Perwakilan Resmi */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 3 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 3
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 3 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">3</span>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Perwakilan Resmi
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 3 && (
                      <motion.div 
                        key="step3-active"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-11 mt-2 space-y-2 text-sm"
                      >
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span>Dokumen Identitas</span>
                        </div>
                        <div className={`flex items-center gap-2 font-medium ${formData.fotoKTP ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.fotoKTP ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <span>Data Pribadi</span>
                        </div>
                        <div className={`flex items-center gap-2 font-medium ${formData.namaLengkap ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.namaLengkap ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <span>Informasi Kontak</span>
                        </div>
                      </motion.div>
                    )}
                    {currentStep > 3 && formData.namaLengkap && (
                      <motion.div 
                        key="step3-done"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-11 mt-1 text-xs text-gray-500"
                      >
                        ✓ {formData.namaLengkap}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 4: Review Data */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 4 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 4
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 4 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">4</span>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Review Data
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 4 && (
                      <motion.div 
                        key="step4-active"
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
                        key="step4-done"
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
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 border-2 transition-all ${
                        currentStep > 5 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : currentStep === 5
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 5 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="font-bold text-sm">5</span>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${
                      currentStep >= 5 ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      Akun Admin & 2FA
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {currentStep === 5 && (
                      <motion.div 
                        key="step5-active"
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
                        key="step5-done"
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
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header Card */}
          <div className="mb-4 sm:mb-6 md:mb-8">
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
                      <div 
                        className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                          currentStep >= step ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-white/30"
                        }`}
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
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden">
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
          </div>
        </div>
      </div>
    </div>
  )
}