// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { VideoBackground } from "@/components/auth/video-background"
import { PolicyModal } from "@/components/policy-modal"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [redirectMessage, setRedirectMessage] = useState("")
  const [isPolicyOpen, setIsPolicyOpen] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Email validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError('Email wajib diisi')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError('Format email tidak valid')
      return false
    }
    setEmailError('')
    return true
  }

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password wajib diisi')
      return false
    }
    setPasswordError('')
    return true
  }
  
  // Get redirect message from URL
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setRedirectMessage(message)
    }
  }, [searchParams])

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setTimeout(() => {
      router.push("/register")
    }, 100)
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      await signInWithGoogle()
      
      // Wait for auth state to fully update before redirect
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.href = '/daftar-masjid'
    } catch (err: any) {
      setError(err.message || "Gagal login dengan Google")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }
    
    try {
      setLoading(true)
      setError("")
      setSuccess(false)
      await signInWithEmail(email, password)
      
      // Show success message, don't auto-redirect
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError("Email atau password salah")
      setLoading(false)
    }
  }

  // Enhanced animation variants
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

  const leftPanelVariants = {
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

  const rightPanelVariants = {
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

  const curveVariants = {
    hidden: { x: "100%" },
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

  const inputFocusVariants = {
    focus: { 
      scale: 1.01,
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full flex items-center justify-center p-4 pb-16 sm:pb-20 md:pb-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    >
      {/* Video Background */}
      <VideoBackground 
        videoSrc="/vidio/login.mp4"
        posterSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%230369a1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230891b2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
      />

      {/* Main Login Card - Split Screen */}
      <motion.div
        variants={cardVariants}
        className="relative z-20 w-full max-w-7xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Left Side - Full Background Image */}
        <motion.div
          variants={leftPanelVariants}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/login/loginnnn.webp"
              alt="DanaMasjid Login"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="50vw"
              quality={75}
              loading="eager"
            />
          </div>
          
          {/* Curved Divider with Slide Animation */}
          <motion.div
            variants={curveVariants}
            className="absolute top-0 right-0 h-full w-32 pointer-events-none"
          >
            <svg
              className="absolute top-0 right-0 h-full w-full"
              viewBox="0 0 100 700"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,0 Q80,350 0,700 L100,700 L100,0 Z"
                fill="white"
                className="drop-shadow-lg"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          variants={rightPanelVariants}
          className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col relative"
        >
          {/* Back Link - Top Left */}
          <motion.div
            custom={0}
            variants={itemVariants}
          >
            <Link
              href="/"
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group focus:outline-none"
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

          {/* Mobile Image with Scale Animation */}
          <motion.div
            variants={cardVariants}
            className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6"
          >
            <Image
              src="/images/login/loginnnn.webp"
              alt="DanaMasjid Login"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 0vw"
              quality={75}
              loading="eager"
            />
          </motion.div>

          <div className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col justify-center">
            {/* Header */}
            <motion.div 
              custom={1}
              variants={itemVariants} 
              className="text-center mb-6"
            >
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Masuk Admin</h1>
              <p className="text-gray-500 text-base">
                Halo, Masukkan detail Anda untuk masuk ke akun
              </p>
            </motion.div>

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleEmailSignIn}>
              {/* Redirect Message with Animation */}
              <AnimatePresence>
                {redirectMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm"
                  >
                    {redirectMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message with Animation */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email/Phone Input */}
              <motion.div 
                custom={2}
                variants={itemVariants} 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (e.target.value) validateEmail(e.target.value)
                  }}
                  onBlur={() => validateEmail(email)}
                  required
                  className={`w-full px-5 py-4 bg-white border-2 ${emailError ? 'border-red-500' : 'border-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base`}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Email icon"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </motion.button>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {emailError}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div 
                custom={3}
                variants={itemVariants} 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (e.target.value) validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                  required
                  className={`w-full px-5 py-4 bg-white border-2 ${passwordError ? 'border-red-500' : 'border-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base`}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </motion.div>

              {/* Forgot Password */}
              <motion.div 
                custom={4}
                variants={itemVariants} 
                className="text-left"
              >
                <Link 
                  href="/forgot-password" 
                  className="text-base text-gray-600 hover:text-gray-800 transition-colors focus:outline-none relative group"
                >
                  Lupa Password?
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-300"
                  />
                </Link>
              </motion.div>

              {/* Sign In Button */}
              <motion.div 
                custom={5}
                variants={itemVariants}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50"
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
                      <span>Loading...</span>
                    </motion.div>
                  ) : "Masuk"}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div 
              custom={6}
              variants={itemVariants} 
              className="relative my-7"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">— Atau Masuk dengan —</span>
              </div>
            </motion.div>

            {/* Google Login Button */}
            <motion.div 
              custom={7}
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
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

            {/* Sign Up Link */}
            <motion.p 
              custom={8}
              variants={itemVariants} 
              className="text-center text-base text-gray-600 mt-5"
            >
              Belum punya akun?{" "}
              <Link 
                href="/register" 
                onClick={handleRegisterClick}
                className="text-gray-900 font-semibold hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded relative group"
              >
                Daftar Sekarang
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"
                />
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={footerVariants}
        className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-0 right-0 text-center text-[9px] sm:text-[10px] md:text-xs text-white/90 z-20 px-4"
      >
        <p className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 md:gap-2">
          <span>Hak Cipta @danamasjid 2026</span>
          <span className="hidden sm:inline">|</span>
          <button 
            onClick={() => setIsPolicyOpen(true)}
            className="hover:text-white transition-colors underline"
          >
            Kebijakan Privasi
          </button>
        </p>
      </motion.div>

      <PolicyModal open={isPolicyOpen} onOpenChange={setIsPolicyOpen} />
    </motion.div>
  )
}