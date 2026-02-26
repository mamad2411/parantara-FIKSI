"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Gagal login dengan Google")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")
      await signInWithEmail(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError("Email atau password salah")
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
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
    hidden: { x: "100%" },
    visible: { 
      x: 0,
      transition: { 
        duration: 0.6,
        delay: 0.8
      }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white"
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
          <source src="/vidio/login.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay with Fade In */}
      <motion.div
        variants={fadeInVariants}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-sky-900/30 to-cyan-900/40"
      />

      {/* Main Login Card - Split Screen */}
      <motion.div
        variants={scaleVariants}
        transition={{ delay: 0.3 }}
        className="relative z-20 w-full max-w-7xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Left Side - Full Background Image */}
        <motion.div
          variants={slideLeftVariants}
          transition={{ delay: 0.5 }}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/login/loginnnn.webp"
              alt="DanaMasjid Login"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
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
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          variants={slideRightVariants}
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
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group focus:outline-none"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-medium">Kembali</span>
            </Link>
          </motion.div>

          {/* Mobile Image with Scale Animation */}
          <motion.div
            variants={scaleVariants}
            transition={{ delay: 0.7 }}
            className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6"
          >
            <Image
              src="/images/login/loginnnn.webp"
              alt="DanaMasjid Login"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col justify-center"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Masuk Admin</h1>
              <p className="text-gray-500 text-base">
                Halo, Masukkan detail Anda untuk masuk ke akun
              </p>
            </motion.div>

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleEmailSignIn}>
              {/* Error Message */}
              {error && (
                <motion.div variants={itemVariants} className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </motion.div>
              )}

              {/* Email/Phone Input */}
              <motion.div variants={itemVariants} className="relative">
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </button>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                </button>
              </motion.div>

              {/* Forgot Password */}
              <motion.div variants={itemVariants} className="text-left">
                <Link href="/forgot-password" className="text-base text-gray-600 hover:text-gray-800 transition-colors focus:outline-none">
                  Lupa Password?
                </Link>
              </motion.div>

              {/* Sign In Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Masuk"}
                </button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">— Atau Masuk dengan —</span>
              </div>
            </motion.div>

            {/* Google Login Button */}
            <motion.div variants={itemVariants}>
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                </svg>
                <span className="text-base font-medium text-gray-700">Google</span>
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p variants={itemVariants} className="text-center text-base text-gray-600 mt-5">
              Belum punya akun?{" "}
              <Link 
                href="/register" 
                onClick={handleRegisterClick}
                className="text-gray-900 font-semibold hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
              >
                Daftar Sekarang
              </Link>
            </motion.p>
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