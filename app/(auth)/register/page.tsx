"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    email: "",
    phone: "",
    // Step 2
    otp: ["", "", "", "", "", ""],
    // Step 3
    password: "",
    confirmPassword: "",
    // Step 4
    mosqueName: "",
    mosqueAddress: "",
    mosqueCity: "",
  })

  const totalSteps = 4
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Animation variants untuk efek muncul
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1.2
      }
    }
  }

  const scaleVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.6
      }
    }
  }

  const slideRightVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.7
      }
    }
  }

  const slideLeftVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.7
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  }

  const curveVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: { 
        duration: 0.6,
        delay: 0.8
      }
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (currentStep === 1) {
        // Step 1: Send OTP
        const response = await fetch('http://localhost:3001/api/auth/register/step1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
        })

        const data = await response.json()

        if (data.success) {
          setResendCountdown(60) // Start 60 second countdown
          handleNext()
        } else {
          setError(data.message || 'Gagal mengirim OTP')
        }
      } else if (currentStep === 2) {
        // Step 2: Verify OTP
        const otpString = formData.otp.join('')
        const response = await fetch('http://localhost:3001/api/auth/register/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            otp: otpString
          })
        })

        const data = await response.json()

        if (data.success) {
          handleNext()
        } else {
          setError(data.message || 'Kode OTP tidak valid')
        }
      } else if (currentStep === 3) {
        // Step 3: Validate password
        if (formData.password !== formData.confirmPassword) {
          setError('Password tidak cocok')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password minimal 6 karakter')
          setLoading(false)
          return
        }
        handleNext()
      } else if (currentStep === 4) {
        // Step 4: Complete registration
        const response = await fetch('http://localhost:3001/api/auth/register/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            mosqueName: formData.mosqueName,
            mosqueAddress: formData.mosqueAddress,
            mosqueCity: formData.mosqueCity
          })
        })

        const data = await response.json()

        if (data.success) {
          router.push('/login')
        } else {
          setError(data.message || 'Gagal menyelesaikan registrasi')
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
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
    setTimeout(() => {
      router.push("/login")
    }, 100)
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Video Background with Fade In */}
      <motion.div
        variants={fadeInVariants}
        className="absolute inset-0 w-full h-full"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/vidio/register.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay with Fade In */}
      <motion.div
        variants={fadeInVariants}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-sky-900/30 to-cyan-900/40"
      />

      {/* Main Register Card - Split Screen */}
      <motion.div
        variants={scaleVariants}
        transition={{ delay: 0.3 }}
        className="relative z-20 w-full max-w-7xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border-0"
        style={{ outline: 'none', border: 'none' }}
      >
        {/* Left Side - Register Form */}
        <motion.div
          variants={slideLeftVariants}
          transition={{ delay: 0.5 }}
          className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col relative"
        >
          {/* Back Link - Top Left */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.7 }}
          >
            <Link
              href="/"
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-medium">Kembali</span>
            </Link>
          </motion.div>

          {/* Mobile Image - Below Back Button */}
          <motion.div
            variants={scaleVariants}
            transition={{ delay: 0.7 }}
            className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6"
          >
            <Image
              src="/images/login/loginnn.jpeg"
              alt="DanaMasjid Register"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col justify-center"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Daftar Admin</h1>
              <p className="text-gray-500 text-base">
                Buat akun baru untuk mengelola masjid Anda
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep === step 
                      ? "bg-yellow-400 text-gray-900 scale-110" 
                      : currentStep > step 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 mx-1 transition-all ${
                      currentStep > step ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Step Title */}
            <motion.div variants={itemVariants} className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {currentStep === 1 && "Informasi Pribadi"}
                {currentStep === 2 && "Verifikasi OTP"}
                {currentStep === 3 && "Keamanan Akun"}
                {currentStep === 4 && "Informasi Masjid"}
              </h2>
            </motion.div>

            {/* Register Form with Steps */}
            <form onSubmit={handleSubmit} className="space-y-5 overflow-hidden">
              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
              
              <AnimatePresence mode="wait" custom={currentStep}>
                <motion.div
                  key={currentStep}
                  custom={currentStep}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <>
                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type="text"
                          placeholder="Nama Lengkap"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type="tel"
                          placeholder="No. Telepon"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Step 2: OTP Verification */}
                  {currentStep === 2 && (
                    <>
                      <motion.div variants={itemVariants} className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          Kode verifikasi telah dikirim ke<br />
                          <strong>{formData.email || formData.phone}</strong>
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-6">
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            required
                          />
                        ))}
                      </motion.div>

                      <motion.div variants={itemVariants} className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Tidak menerima kode?
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            if (resendCountdown > 0) return
                            setLoading(true)
                            setError("")
                            try {
                              const response = await fetch('http://localhost:3001/api/auth/register/step1', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: formData.name,
                                  email: formData.email,
                                  phone: formData.phone
                                })
                              })
                              const data = await response.json()
                              if (data.success) {
                                setResendCountdown(60)
                              } else {
                                setError(data.message || 'Gagal mengirim OTP')
                              }
                            } catch (err) {
                              setError('Terjadi kesalahan. Silakan coba lagi.')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          disabled={resendCountdown > 0}
                          className={`text-sm font-semibold ${
                            resendCountdown > 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-700 underline'
                          }`}
                        >
                          {resendCountdown > 0 
                            ? `Kirim Ulang dalam ${resendCountdown}s` 
                            : 'Kirim Ulang Kode'}
                        </button>
                      </motion.div>
                    </>
                  )}

                  {/* Step 3: Security */}
                  {currentStep === 3 && (
                    <>
                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Kata Sandi"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
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
                        </button>
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Konfirmasi Kata Sandi"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        </button>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Tips Keamanan:</strong> Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka.
                        </p>
                      </motion.div>
                    </>
                  )}

                  {/* Step 4: Mosque Information */}
                  {currentStep === 4 && (
                    <>
                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type="text"
                          placeholder="Nama Masjid"
                          value={formData.mosqueName}
                          onChange={(e) => setFormData({...formData, mosqueName: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <textarea
                          placeholder="Alamat Lengkap Masjid"
                          value={formData.mosqueAddress}
                          onChange={(e) => setFormData({...formData, mosqueAddress: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base resize-none"
                          rows={3}
                          required
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative">
                        <input
                          type="text"
                          placeholder="Kota/Kabupaten"
                          value={formData.mosqueCity}
                          onChange={(e) => setFormData({...formData, mosqueCity: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                          required
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div variants={itemVariants} className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-base"
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : (currentStep === totalSteps ? "Daftar" : "Lanjut")}
                </button>
              </motion.div>
            </form>

            {/* Sign In Link */}
            <motion.p 
              variants={itemVariants}
              className="text-center text-base text-gray-600 mt-5"
            >
              Sudah punya akun?{" "}
              <Link 
                href="/login" 
                onClick={handleLoginClick}
                className="text-gray-900 font-semibold hover:underline transition-all"
              >
                Masuk Sekarang
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Right Side - Full Background Image */}
        <motion.div
          variants={slideRightVariants}
          transition={{ delay: 0.5 }}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <Image
            src="/images/login/loginnn.jpeg"
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
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/80 z-20"
      >
        Hak Cipta @danamasjid 2025 | Kebijakan Privasi
      </motion.div>
    </motion.div>
  )
}