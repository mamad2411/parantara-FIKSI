// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { VideoBackground } from "@/components/auth/video-background"
import { useRegisterStep1, useVerifyOTP } from "@/lib/hooks/use-auth"

export default function RegisterPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  
  // TanStack Query mutations
  const registerStep1Mutation = useRegisterStep1()
  const verifyOTPMutation = useVerifyOTP()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [direction, setDirection] = useState(0)
  
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    nickname: "",
    email: "",
    // Step 2
    otp: ["", "", "", "", "", ""],
    // Step 3
    password: "",
    confirmPassword: "",
  })

  const totalSteps = 3
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [nicknameChecking, setNicknameChecking] = useState(false)
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null)

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Calculate password strength
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0
    
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    if (strength <= 2) return 'weak'
    if (strength <= 4) return 'medium'
    return 'strong'
  }

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    } else {
      setPasswordStrength(null)
    }
  }, [formData.password])

  // Check password match when confirm password changes
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordMatch(null)
    }
  }, [formData.password, formData.confirmPassword])

  // Check email availability with Firebase Auth
  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailAvailable(null)
      return
    }

    const checkEmail = async () => {
      setEmailChecking(true)
      try {
        // Use Firebase Auth fetchSignInMethodsForEmail
        const { fetchSignInMethodsForEmail } = await import('firebase/auth')
        const { auth } = await import('@/lib/firebase')
        
        const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email)
        // If signInMethods array is empty, email is available
        setEmailAvailable(signInMethods.length === 0)
      } catch (error: any) {
        // If error code is auth/invalid-email, still show as available but invalid format
        if (error?.code === 'auth/invalid-email') {
          setEmailAvailable(null)
        } else {
          console.error('Error checking email:', error)
          setEmailAvailable(null)
        }
      } finally {
        setEmailChecking(false)
      }
    }

    const timer = setTimeout(checkEmail, 300) // Reduced from 500ms to 300ms
    return () => clearTimeout(timer)
  }, [formData.email])

  // Generate nickname suggestions from full name
  const generateNicknameSuggestions = (fullName: string): string[] => {
    if (!fullName) return []
    
    // Clean and split name
    const cleanName = fullName.toLowerCase().replace(/[^a-z\s]/g, '').trim()
    const nameParts = cleanName.split(/\s+/)
    
    if (nameParts.length === 0) return []
    
    const suggestions: string[] = []
    
    // Generate random 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000)
    
    // Suggestion 1: firstname + code
    if (nameParts[0]) {
      suggestions.push(`${nameParts[0]}${randomCode}`)
    }
    
    // Suggestion 2: firstname + lastname initial + code (if has lastname)
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
      const lastInitial = nameParts[nameParts.length - 1][0]
      suggestions.push(`${nameParts[0]}${lastInitial}${randomCode}`)
    }
    
    // Suggestion 3: first 3 letters of each word + code
    if (nameParts.length > 1) {
      const combined = nameParts.map(part => part.substring(0, 3)).join('')
      suggestions.push(`${combined}${randomCode}`)
    }
    
    return suggestions.filter(s => s.length >= 3 && s.length <= 20)
  }

  // Auto-suggest nickname when name changes
  const [nicknameSuggestions, setNicknameSuggestions] = useState<string[]>([])
  
  useEffect(() => {
    if (formData.name && formData.name.length >= 3) {
      const suggestions = generateNicknameSuggestions(formData.name)
      setNicknameSuggestions(suggestions)
    } else {
      setNicknameSuggestions([])
    }
  }, [formData.name])

  // Check nickname availability in Firestore
  useEffect(() => {
    if (!formData.nickname || formData.nickname.length < 3) {
      setNicknameAvailable(null)
      return
    }

    const checkNickname = async () => {
      setNicknameChecking(true)
      console.log('Checking nickname:', formData.nickname)
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        
        // Query Firestore for existing nickname
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('nickname', '==', formData.nickname.toLowerCase()))
        const querySnapshot = await getDocs(q)
        
        // If no documents found, nickname is available
        const available = querySnapshot.empty
        console.log('Nickname check result:', available ? 'Available' : 'Taken')
        setNicknameAvailable(available)
      } catch (error) {
        console.error('Error checking nickname:', error)
        setNicknameAvailable(null)
      } finally {
        setNicknameChecking(false)
      }
    }

    const timer = setTimeout(checkNickname, 300) // Reduced from 500ms to 300ms
    return () => clearTimeout(timer)
  }, [formData.nickname])

  // Animation variants untuk efek muncul
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.15,
      }
    }
  }

  const videoOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  }

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 200,
        delay: 0.3
      }
    }
  }

  const slideRightVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: 0.5
      }
    }
  }

  const slideLeftVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: 0.5
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        delay: 0.9 + (custom * 0.1)
      }
    })
  }

  const curveVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 150,
        delay: 0.8
      }
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        damping: 20,
        stiffness: 200
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    })
  }

  const buttonHoverVariants = {
    hover: { 
      scale: 1.02,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.98,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 1.5,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    console.log('=== FORM SUBMIT ===')
    console.log('Current Step:', currentStep)
    console.log('Form Data:', formData)
    console.log('Nickname:', formData.nickname)
    console.log('Nickname Available:', nicknameAvailable)
    console.log('Email Available:', emailAvailable)
    console.log('Password Strength:', passwordStrength)
    console.log('Password Match:', passwordMatch)
    
    setLoading(true)

    try {
      if (currentStep === 1) {
        // Validate nickname availability
        if (!formData.nickname || formData.nickname.length < 3) {
          setError('Nickname minimal 3 karakter')
          setLoading(false)
          return
        }
        
        if (nicknameAvailable === false) {
          setError('Nickname sudah digunakan. Silakan pilih nickname lain.')
          setLoading(false)
          return
        }
        
        if (!nicknameAvailable) {
          setError('Mohon tunggu pengecekan nickname selesai')
          setLoading(false)
          return
        }
        
        // Validate email availability
        if (emailAvailable === false) {
          setError('Email sudah terdaftar. Silakan gunakan email lain atau login.')
          setLoading(false)
          return
        }
        
        if (!emailAvailable) {
          setError('Mohon tunggu pengecekan email selesai')
          setLoading(false)
          return
        }
        
        // Step 1: Send OTP using TanStack Query
        console.log('Step 1: Sending OTP...')
        const result = await registerStep1Mutation.mutateAsync({
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email
        })

        if (result.success) {
          setResendCountdown(60)
          setSuccess('Kode OTP telah dikirim ke email Anda')
          console.log('Step 1: OTP sent successfully')
          handleNext()
        } else {
          setError(result.message || 'Gagal mengirim OTP')
          console.error('Step 1: Failed to send OTP')
        }
      } else if (currentStep === 2) {
        // Step 2: Verify OTP using TanStack Query
        console.log('Step 2: Verifying OTP...')
        const otpString = formData.otp.join('')
        if (otpString.length !== 6) {
          setError('Masukkan 6 digit kode OTP')
          setLoading(false)
          return
        }
        
        const result = await verifyOTPMutation.mutateAsync({
          email: formData.email,
          otp: otpString
        })

        if (result.success) {
          setSuccess('Verifikasi berhasil!')
          console.log('Step 2: OTP verified successfully')
          handleNext()
        } else {
          setError(result.message || 'Kode OTP tidak valid')
          console.error('Step 2: OTP verification failed')
        }
      } else if (currentStep === 3) {
        // Step 3: Validate password
        console.log('Step 3: Validating and registering...')
        
        if (!formData.password) {
          setError('Masukkan password')
          setLoading(false)
          console.error('Step 3: Password empty')
          return
        }
        
        const strength = calculatePasswordStrength(formData.password)
        console.log('Step 3: Password strength:', strength)
        
        if (strength === 'weak') {
          setError('Password terlalu lemah. Gunakan minimal password sedang.')
          setLoading(false)
          console.error('Step 3: Password too weak')
          return
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Password tidak cocok')
          setLoading(false)
          console.error('Step 3: Password mismatch')
          return
        }
        
        // Complete registration with Firebase
        console.log('Step 3: Starting Firebase registration...', {
          email: formData.email,
          name: formData.name
        })
        
        const user = await signUpWithEmail(formData.email, formData.password, {
          name: formData.name,
          nickname: formData.nickname.toLowerCase()
        })

        console.log('Step 3: Firebase registration successful! User ID:', user.uid)
        setSuccess('Pendaftaran berhasil! Mengalihkan ke pendaftaran masjid...')
        
        setTimeout(() => {
          console.log('Step 3: Redirecting to /daftar-masjid')
          router.push('/daftar-masjid')
        }, 1500)
      }
    } catch (err: any) {
      console.error('=== REGISTRATION ERROR ===')
      console.error('Error object:', err)
      console.error('Error message:', err?.message)
      console.error('Error code:', err?.code)
      const errorMessage = err?.message || err?.code || 'Terjadi kesalahan. Silakan coba lagi.'
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log('=== FORM SUBMIT END ===')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...formData.otp]
      newOtp[index] = value
      setFormData({...formData, otp: newOtp})
      
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }

      // Auto submit if all digits are filled
      if (index === 5 && value && newOtp.every(digit => digit !== "")) {
        setTimeout(() => {
          document.getElementById('submit-step-2')?.click()
        }, 300)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/login")
  }

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return
    
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const result = await registerStep1Mutation.mutateAsync({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email
      })
      
      if (result.success) {
        setResendCountdown(60)
        setSuccess('Kode OTP telah dikirim ulang')
      } else {
        setError(result.message || 'Gagal mengirim OTP')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    >
      {/* Video Background */}
      <VideoBackground 
        videoSrc="/vidio/register.mp4"
        posterSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%230369a1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230891b2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
      />

      {/* Main Register Card - Split Screen */}
      <motion.div
        variants={cardVariants}
        className="relative z-20 w-full max-w-7xl min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border-0"
      >
        {/* Left Side - Register Form */}
        <motion.div
          variants={slideLeftVariants}
          className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col relative"
        >
          {/* Back Link - Top Left */}
          <motion.div
            custom={0}
            variants={itemVariants}
          >
            <Link
              href="/"
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ x: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </motion.svg>
                <span className="text-base font-medium relative">
                  Kembali
                  <motion.span 
                    className="absolute bottom-0 left-0 h-0.5 bg-gray-900"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Mobile Image - Below Back Button */}
          <motion.div
            variants={cardVariants}
            className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6"
          >
            <Image
              src="/images/login/loginnn.webp"
              alt="DanaMasjid Register"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <div className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col justify-center">
            {/* Header */}
            <motion.div 
              custom={1}
              variants={itemVariants} 
              className="text-center mb-6"
            >
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Daftar Admin</h1>
              <p className="text-gray-500 text-base">
                Buat akun baru untuk mengelola masjid Anda
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div 
              custom={2}
              variants={itemVariants} 
              className="flex items-center justify-center gap-3 mb-6"
            >
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step 
                        ? "bg-yellow-400 text-gray-900 shadow-lg" 
                        : currentStep > step 
                        ? "bg-green-500 text-white shadow-md" 
                        : "bg-gray-200 text-gray-500"
                    }`}
                    animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </motion.div>
                  {step < 3 && (
                    <motion.div 
                      className={`w-12 h-1 mx-1 transition-all ${
                        currentStep > step ? "bg-green-500" : "bg-gray-200"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > step ? 48 : 48 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Step Title */}
            <motion.div 
              custom={3}
              variants={itemVariants} 
              className="text-center mb-4"
            >
              <h2 className="text-lg font-semibold text-gray-700">
                {currentStep === 1 && "Informasi Pribadi"}
                {currentStep === 2 && "Verifikasi OTP"}
                {currentStep === 3 && "Keamanan Akun"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 1 && "Masukkan data diri Anda untuk memulai"}
                {currentStep === 2 && "Masukkan kode 6 digit yang telah dikirim"}
                {currentStep === 3 && "Buat password yang kuat untuk akun Anda"}
              </p>
            </motion.div>

            {/* Register Form with Steps */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
              {/* Success/Error Messages with Animation */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-5 overflow-visible"
                >
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <>
                      <motion.div 
                        variants={itemVariants} 
                        custom={4}
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <input
                          type="text"
                          placeholder="Nama Lengkap"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-5 py-4 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                          autoComplete="name"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </motion.div>

                      <motion.div 
                        variants={itemVariants} 
                        custom={5}
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <input
                          type="text"
                          placeholder="Nickname (Username)"
                          value={formData.nickname}
                          onChange={(e) => setFormData({...formData, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                          className={`w-full px-5 py-4 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-base shadow-sm ${
                            nicknameAvailable === false ? 'border-red-500' : 
                            nicknameAvailable === true ? 'border-green-500' : 
                            'border-gray-900 focus:border-blue-500'
                          }`}
                          autoComplete="username"
                          minLength={3}
                          maxLength={20}
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          {nicknameChecking ? (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : nicknameAvailable === false ? (
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : nicknameAvailable === true ? (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        {nicknameAvailable === false && (
                          <p className="text-xs text-red-500 mt-1.5 ml-1">Nickname sudah digunakan</p>
                        )}
                        {nicknameAvailable === true && (
                          <p className="text-xs text-green-500 mt-1.5 ml-1">Nickname tersedia</p>
                        )}
                        {formData.nickname && formData.nickname.length < 3 && (
                          <p className="text-xs text-gray-500 mt-1.5 ml-1">Minimal 3 karakter</p>
                        )}
                        {/* Nickname Suggestions */}
                        {nicknameSuggestions.length > 0 && !formData.nickname && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 font-medium mb-2">Saran nickname:</p>
                            <div className="flex flex-wrap gap-2">
                              {nicknameSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setFormData({...formData, nickname: suggestion})}
                                  className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 font-medium"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>

                      <motion.div 
                        variants={itemVariants} 
                        custom={6}
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={`w-full px-5 py-4 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-base shadow-sm ${
                            emailAvailable === false ? 'border-red-500' : 
                            emailAvailable === true ? 'border-green-500' : 
                            'border-gray-900 focus:border-blue-500'
                          }`}
                          autoComplete="email"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          {emailChecking ? (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : emailAvailable === false ? (
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : emailAvailable === true ? (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          )}
                        </div>
                        {emailAvailable === false && (
                          <p className="text-xs text-red-500 mt-1.5 ml-1">Email sudah terdaftar</p>
                        )}
                        {emailAvailable === true && (
                          <p className="text-xs text-green-500 mt-1.5 ml-1">Email tersedia</p>
                        )}
                      </motion.div>
                    </>
                  )}

                  {/* Step 2: OTP Verification */}
                  {currentStep === 2 && (
                    <>
                      <motion.div 
                        variants={itemVariants} 
                        custom={4}
                        className="text-center mb-6"
                      >
                        <motion.div 
                          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                          animate={{ 
                            scale: [1, 1.15, 1],
                            rotate: [0, 8, -8, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <motion.svg 
                            className="w-8 h-8 text-blue-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{
                              y: [0, -3, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </motion.svg>
                        </motion.div>
                        <p className="text-sm text-gray-600">
                          Kode verifikasi telah dikirim ke<br />
                          <strong className="text-gray-900">{formData.email}</strong>
                        </p>
                      </motion.div>

                      <motion.div 
                        variants={itemVariants} 
                        custom={5}
                        className="flex justify-center gap-3 mb-6"
                      >
                        {formData.otp.map((digit, index) => (
                          <motion.input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            whileFocus={{ scale: 1.05, borderColor: "#3B82F6" }}
                            required
                          />
                        ))}
                      </motion.div>

                      <motion.div 
                        variants={itemVariants} 
                        custom={6}
                        className="text-center"
                      >
                        <p className="text-sm text-gray-600 mb-2">
                          Tidak menerima kode?
                        </p>
                        <motion.button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendCountdown > 0 || loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-sm font-semibold transition-all ${
                            resendCountdown > 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {resendCountdown > 0 
                            ? `Kirim Ulang dalam ${resendCountdown}s` 
                            : 'Kirim Ulang Kode'}
                        </motion.button>
                      </motion.div>

                      {/* Hidden submit button for auto-submit */}
                      <button type="submit" id="submit-step-2" className="hidden" />
                    </>
                  )}

                  {/* Step 3: Security */}
                  {currentStep === 3 && (
                    <>
                      <motion.div 
                        variants={itemVariants} 
                        custom={4}
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Kata Sandi"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-5 py-4 bg-white border-2 border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                          autoComplete="new-password"
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </motion.button>
                      </motion.div>

                      {/* Password Strength Indicator */}
                      {passwordStrength && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          {/* Progress Bars */}
                          <div className="flex gap-2">
                            <motion.div 
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'weak' ? 'bg-red-500' :
                                passwordStrength === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{ transformOrigin: 'left' }}
                            />
                            <motion.div 
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'medium' ? 'bg-yellow-500' :
                                passwordStrength === 'strong' ? 'bg-green-500' :
                                'bg-gray-200'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: passwordStrength !== 'weak' ? 1 : 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                              style={{ transformOrigin: 'left' }}
                            />
                            <motion.div 
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: passwordStrength === 'strong' ? 1 : 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              style={{ transformOrigin: 'left' }}
                            />
                          </div>
                          
                          {/* Status Text */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-semibold ${
                                passwordStrength === 'weak' ? 'text-red-600' :
                                passwordStrength === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {passwordStrength === 'weak' && 'Lemah'}
                                {passwordStrength === 'medium' && 'Sedang'}
                                {passwordStrength === 'strong' && 'Kuat'}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                passwordStrength === 'weak' ? 'bg-red-100 text-red-700' :
                                passwordStrength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {passwordStrength === 'weak' && '33%'}
                                {passwordStrength === 'medium' && '66%'}
                                {passwordStrength === 'strong' && '100%'}
                              </span>
                            </div>
                            {passwordStrength === 'weak' && (
                              <p className="text-xs text-red-600 font-medium">Minimal sedang</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <motion.div 
                        variants={itemVariants} 
                        custom={5}
                        className="space-y-3"
                      >
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Konfirmasi Kata Sandi"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className={`w-full px-5 py-4 pr-24 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-base shadow-sm ${
                              passwordMatch === null ? 'border-gray-900' :
                              passwordMatch ? 'border-green-500 focus:border-green-500' :
                              'border-red-500 focus:border-red-500'
                            }`}
                            autoComplete="new-password"
                            required
                          />
                          
                          {/* Match/Mismatch Indicator */}
                          {passwordMatch !== null && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`absolute right-16 top-1/2 -translate-y-1/2 ${
                                passwordMatch ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {passwordMatch ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </motion.div>
                          )}
                          
                          <motion.button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            )}
                          </motion.button>
                        </div>

                        {/* Password Match Indicator */}
                        {passwordMatch !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-2 text-sm font-medium ${
                              passwordMatch ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {passwordMatch ? (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>✓ Password cocok</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>✗ Password tidak cocok</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div 
                variants={itemVariants} 
                custom={7}
                className="flex gap-3 pt-4"
              >
                {currentStep > 1 && (
                  <motion.button
                    type="button"
                    onClick={handlePrev}
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-base"
                  >
                    Kembali
                  </motion.button>
                )}
                <motion.button
                  type="submit"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || (currentStep === 3 && passwordStrength === 'weak')}
                >
                  {loading ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </motion.div>
                  ) : (currentStep === totalSteps ? "Daftar" : "Lanjut")}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider - Only show on step 1 */}
            {currentStep === 1 && (
              <motion.div 
                variants={itemVariants} 
                custom={8}
                className="relative my-7"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">— Atau Masuk dengan —</span>
                </div>
              </motion.div>
            )}

            {/* Google Register Button - Only show on step 1 */}
            {currentStep === 1 && (
              <motion.div 
                variants={itemVariants} 
                custom={9}
              >
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true)
                      setError("")
                      await signInWithGoogle()
                      router.push("/daftar-masjid")
                    } catch (err: any) {
                      setError(err.message || "Gagal login dengan Google")
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-base disabled:opacity-50"
                >
                  <motion.svg 
                    className="w-6 h-6" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </motion.svg>
                  <span className="text-base font-medium text-gray-700">Google</span>
                </motion.button>
              </motion.div>
            )}

            {/* Sign In Link */}
            <motion.p 
              variants={itemVariants} 
              custom={10}
              className="text-center text-base text-gray-600 mt-5"
            >
              Sudah punya akun?{" "}
              <Link 
                href="/login" 
                onClick={handleLoginClick}
                className="text-gray-900 font-semibold hover:underline transition-all relative group"
              >
                Masuk Sekarang
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"
                />
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* Right Side - Full Background Image */}
        <motion.div
          variants={slideRightVariants}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <Image
            src="/images/login/loginnn.webp"
            alt="DanaMasjid Register"
            fill
            className="object-cover"
            priority
          />
          
          {/* Curved Divider */}
          <motion.div
            variants={curveVariants}
            className="absolute top-0 left-0 h-full w-32"
          >
            <svg
              className="absolute top-0 left-0 h-full w-full"
              viewBox="0 0 100 700"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100,0 Q20,350 100,700 L0,700 L0,0 Z"
                fill="white"
                className="drop-shadow-lg"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={footerVariants}
        className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/90 z-20"
      >

      </motion.div>
    </motion.div>
  )
}