'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation variants dengan tipe yang benar
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

  const slideVariants = {
    enter: {
      x: 50,
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: {
      x: -50,
      opacity: 0
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || 'Gagal mengirim OTP');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.message || 'Kode OTP tidak valid');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/login';
      } else {
        setError(data.message || 'Gagal reset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Card - Split Screen */}
      <motion.div 
        variants={scaleVariants}
        transition={{ delay: 0.3 }}
        className="relative z-20 w-full max-w-7xl min-h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Left Side - Image */}
        <motion.div
          variants={slideLeftVariants}
          transition={{ delay: 0.5 }}
          className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        >
          <div className="relative w-full h-full">
            <Image
              src="/images/login/loginnnn.jpeg"
              alt="Forgot Password"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          variants={slideRightVariants}
          transition={{ delay: 0.5 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16"
        >
          <motion.div
            variants={containerVariants}
            className="w-full max-w-md"
          >
            {/* Back Link */}
            <motion.div variants={itemVariants}>
              <Link
                href="/login"
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 && 'Lupa Password'}
                {step === 2 && 'Verifikasi OTP'}
                {step === 3 && 'Password Baru'}
              </h1>
              <p className="text-sm text-gray-600">
                {step === 1 && 'Masukkan email Anda untuk menerima kode OTP'}
                {step === 2 && 'Masukkan kode OTP yang dikirim ke email Anda'}
                {step === 3 && 'Buat password baru untuk akun Anda'}
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                variants={itemVariants}
                className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Step Content with Animation */}
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Email */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@masjid.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 font-semibold text-base"
                      disabled={loading}
                    >
                      {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
                    </Button>
                  </motion.div>
                </form>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                      Kode OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Masukkan 6 digit kode OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 font-semibold text-base"
                      disabled={loading}
                    >
                      {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                    </Button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Kirim ulang kode OTP
                    </button>
                  </motion.div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password Baru
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Konfirmasi Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 font-semibold text-base"
                      disabled={loading}
                    >
                      {loading ? 'Menyimpan...' : 'Reset Password'}
                    </Button>
                  </motion.div>
                </form>
              )}
            </motion.div>
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
  );
}