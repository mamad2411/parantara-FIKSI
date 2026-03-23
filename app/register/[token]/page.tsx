// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { VideoBackground } from "@/components/auth/video-background"

export default function RegisterStep2Page() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const { signUpWithEmail } = useAuth()

  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)

  const [userData, setUserData] = useState<{
    name: string
    nickname: string
    email: string
  } | null>(null)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  // Animation variants - SAMA PERSIS dengan register page
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
        delay: 0.2
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
        delay: 0.2
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
        delay: 0.3 + (custom * 0.05)
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
        delay: 0.3
      }
    }
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

  // Verify token on mount
  useEffect(() => {
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      setVerifying(true)
      setError("")

      const response = await fetch('/api/register-verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (result.success) {
        setUserData(result.data)
      } else {
        setError(result.message || 'Link verifikasi tidak valid')
      }
    } catch (err: any) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setVerifying(false)
      setLoading(false)
    }
  }

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

  // Update password strength
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    } else {
      setPasswordStrength(null)
    }
  }, [formData.password])

  // Check password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordMatch(null)
    }
  }, [formData.password, formData.confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate password
      if (!formData.password) {
        setError('Masukkan password')
        setLoading(false)
        return
      }

      const strength = calculatePasswordStrength(formData.password)
      if (strength === 'weak') {
        setError('Password terlalu lemah. Gunakan minimal password sedang.')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Password tidak cocok')
        setLoading(false)
        return
      }

      // Complete registration
      const completeResponse = await fetch('/api/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      })

      const completeResult = await completeResponse.json()

      if (!completeResult.success) {
        setError(completeResult.message || 'Gagal menyelesaikan pendaftaran')
        setLoading(false)
        return
      }

      // Create Firebase account
      setSuccess('Membuat akun...')
      
      const user = await signUpWithEmail(
        userData!.email,
        formData.password,
        {
          name: userData!.name,
          nickname: userData!.nickname.toLowerCase()
        }
      )

      setSuccess('Pendaftaran berhasil! Mengarahkan ke login...')
      
      // Redirect to login immediately
      router.push('/login?message=Pendaftaran berhasil! Silakan login untuk melanjutkan.')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err?.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memverifikasi link...</p>
        </div>
      </div>
    )
  }

  // Error state - invalid/expired token
  if (error && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Tidak Valid</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Daftar Ulang
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    >
      <VideoBackground 
        videoSrc="/vidio/register.mp4"
        posterSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%230369a1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230891b2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
      />

      {/* Main Card - Split Screen */}
      <motion.div
        variants={cardVariants}
        className="relative z-20 w-full max-w-7xl min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border-0"
      >
        {/* Left Side - Form */}
        <motion.div
          variants={slideLeftVariants}
          className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col relative overflow-y-auto"
        >
          {/* Back Link */}
          <motion.div custom={0} variants={itemVariants}>
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

          {/* Mobile Image */}
          <motion.div
            variants={cardVariants}
            className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6"
          >
            <Image
              src="/images/regist/regist.webp"
              alt="DanaMasjid Register"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={80}
            />
          </motion.div>

          <div className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col py-4">
            {/* Header */}
            <motion.div custom={1} variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Daftar Admin</h1>
              <p className="text-gray-500 text-base">
                Buat akun baru untuk mengelola masjid Anda
              </p>
            </motion.div>

            {/* Progress Indicator - 2 Steps */}
            <motion.div custom={2} variants={itemVariants} className="flex items-center justify-center gap-3 mb-6">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step === 1 
                        ? "bg-green-500 text-white shadow-md" 
                        : step === 2
                        ? "bg-yellow-400 text-gray-900 shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    animate={step === 2 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {step === 1 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </motion.div>
                  {step < 2 && (
                    <motion.div 
                      className="w-12 h-1 mx-1 bg-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Step Title */}
            <motion.div custom={3} variants={itemVariants} className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Keamanan Akun</h2>
              <p className="text-sm text-gray-500 mt-1">
                Buat password yang kuat untuk akun Anda
              </p>
            </motion.div>

            {/* Success Badge */}
            <motion.div
              custom={4}
              variants={itemVariants}
              className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Verifikasi Berhasil!</span>
              </div>
              <p className="text-sm text-gray-700">
                Selamat datang, <strong>{userData?.name}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">{userData?.email}</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
              {/* Success/Error Messages */}
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

              {/* Password */}
              <motion.div
                variants={itemVariants}
                custom={5}
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

              {/* Password Strength */}
              {passwordStrength && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
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

              {/* Confirm Password */}
              <motion.div
                variants={itemVariants}
                custom={6}
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

              {/* Submit Button */}
              <motion.div variants={itemVariants} custom={7} className="pt-4">
                <motion.button
                  type="submit"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || passwordStrength === 'weak' || !passwordMatch}
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
                  ) : (
                    'Selesaikan Pendaftaran'
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Sign In Link */}
            <motion.p variants={itemVariants} custom={8} className="text-center text-base text-gray-600 mt-5">
              Sudah punya akun?{" "}
              <Link 
                href="/login"
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

        {/* Right Side - Image with Curved Divider */}
        <motion.div
          variants={slideRightVariants}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <Image
            src="/images/regist/regist.webp"
            alt="DanaMasjid Register"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 0vw, 50vw"
            quality={80}
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
    </motion.div>
  )
}
