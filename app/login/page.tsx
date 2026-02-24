"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      {/* Large Blob Shapes - Random positions */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] bg-cyan-400 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.09 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute top-[35%] right-[12%] w-72 h-72 bg-sky-400 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.07 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-[25%] left-[8%] w-64 h-64 bg-blue-300 rounded-full blur-2xl"
      />

      {/* Curved Lines - Random positions */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M-50,120 Q180,60 420,130 T850,110"
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          opacity="0.15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
        />
        <motion.path
          d="M200,80 Q450,30 700,90 T1200,70"
          stroke="#0ea5e9"
          strokeWidth="1.5"
          fill="none"
          opacity="0.12"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.path
          d="M-100,380 Q250,320 550,390 T1100,370"
          stroke="#06b6d4"
          strokeWidth="2"
          fill="none"
          opacity="0.14"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
        />
        <motion.path
          d="M100,580 Q400,520 700,590 T1300,560"
          stroke="#3b82f6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.9 }}
        />
      </svg>

      {/* Floating Circles - Random positions */}
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          x: [0, 10, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[18%] left-[12%] w-4 h-4 bg-blue-400 rounded-full"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[45%] right-[18%] w-5 h-5 bg-cyan-400 rounded-full"
      />
      <motion.div
        animate={{ 
          y: [0, -18, 0],
          x: [0, -8, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[28%] left-[22%] w-3 h-3 bg-sky-400 rounded-full"
      />
      <motion.div
        animate={{ 
          y: [0, 22, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[52%] right-[25%] w-6 h-6 bg-blue-300 rounded-full"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-[65%] left-[8%] w-4 h-4 bg-cyan-300 rounded-full"
      />
      <motion.div
        animate={{ 
          y: [0, -28, 0],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[72%] right-[15%] w-5 h-5 bg-sky-300 rounded-full"
      />

      {/* Geometric Shapes - Random positions */}
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.12, rotate: 35 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-[22%] right-[8%] w-20 h-20 border-2 border-blue-300 rounded-lg"
      />
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.1, rotate: -25 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute bottom-[35%] left-[6%] w-24 h-24 border-2 border-cyan-300 rounded-full"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.14, scale: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="absolute top-[68%] left-[18%] w-16 h-16 bg-sky-200 rounded-lg rotate-12"
      />
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.11, rotate: 50 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute top-[38%] left-[5%] w-14 h-14 border-2 border-blue-200 rounded-lg"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.13, scale: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-[18%] right-[20%] w-18 h-18 bg-cyan-200 rounded-full"
      />

      {/* Diagonal Lines - Random positions */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.12, scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute top-[12%] left-[28%] w-40 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent rotate-45"
      />
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.1, scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-[22%] right-[28%] w-36 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent -rotate-35"
      />
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.14, scaleX: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-[55%] right-[32%] w-28 h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent rotate-15"
      />
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.11, scaleX: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-[48%] left-[15%] w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent -rotate-20"
      />
      
      {/* Curved Lines - Bottom Right Corner */}
      <svg className="absolute bottom-0 right-0 w-[600px] h-[400px] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M600,200 Q450,150 300,200 T0,200"
          stroke="#06b6d4"
          strokeWidth="2"
          fill="none"
          opacity="0.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.path
          d="M600,280 Q480,230 360,280 T120,280"
          stroke="#3b82f6"
          strokeWidth="1.5"
          fill="none"
          opacity="0.15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
        />
        <motion.path
          d="M600,350 Q500,310 400,350 T200,350"
          stroke="#0ea5e9"
          strokeWidth="1"
          fill="none"
          opacity="0.12"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.9 }}
        />
      </svg>

      {/* Main Login Card - Split Screen */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-7xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Left Side - Full Background Image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <Image
            src="/images/login/loginnn.jpeg"
            alt="DanaMasjid Login"
            fill
            className="object-cover"
            priority
          />
          {/* Curved Divider */}
          <div className="absolute top-0 right-0 h-full w-32">
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
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col relative">
          {/* Back Link - Top Left */}
          <Link
            href="/"
            className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-medium">Kembali</span>
          </Link>

          {/* Mobile Image - Below Back Button */}
          <div className="lg:hidden w-full h-48 relative rounded-2xl overflow-hidden mt-16 mb-6">
            <Image
              src="/images/login/loginnn.jpeg"
              alt="DanaMasjid Login"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="w-full max-w-lg mx-auto space-y-6 flex-1 flex flex-col justify-center">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">Masuk Admin</h1>
          <p className="text-gray-500 text-base">
            Halo, Masukkan detail Anda untuk masuk ke akun
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-5">
          {/* Email/Phone Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Masukkan Email / No. Telepon"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
            />
            <button
              type="button"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </button>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base"
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
          </div>

          {/* Forgot Password */}
          <div className="text-left">
            <Link href="/forgot-password" className="text-base text-gray-600 hover:text-gray-800">
              Lupa Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md text-base"
          >
            Masuk
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">— Atau Masuk dengan —</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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

        {/* Sign Up Link */}
        <p className="text-center text-base text-gray-600 mt-5">
          Belum punya akun?{" "}
          <Link href="/register" className="text-gray-900 font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-500">
        Hak Cipta @DanaMasjid 2026 | Kebijakan Privasi
      </div>
    </div>
  )
}
