// @ts-nocheck
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoBackground } from '@/components/auth/video-background';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    }
  };

  const cardVariants = {
    hidden: { 
      scale: 0.95, 
      opacity: 0,
      y: 30
    },
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
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 15,
        stiffness: 100,
        delay: 0.6 + (custom * 0.1)
      }
    })
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      setError(`Tunggu ${cooldown} detik sebelum mengirim ulang`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Step 1: Verifikasi email terdaftar di Firebase
      console.log('Checking if email exists:', email);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Sign-in methods found:', signInMethods);
      
      if (signInMethods.length === 0) {
        console.log('Email not registered');
        setError('Email tidak terdaftar. Silakan daftar terlebih dahulu atau periksa kembali email Anda.');
        setLoading(false);
        return;
      }
      
      console.log('Email verified, user exists');
      
      // Step 2: Kirim email reset password
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      console.log('Password reset email sent successfully');
      
      setSuccess(true);
      setCooldown(60);
      
      // Countdown timer
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Email tidak terdaftar. Silakan daftar terlebih dahulu.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid. Periksa kembali email Anda.');
          break;
        case 'auth/too-many-requests':
          setError('Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.');
          break;
        case 'auth/network-request-failed':
          setError('Koneksi internet bermasalah. Periksa koneksi Anda.');
          break;
        default:
          setError(`Gagal mengirim email reset: ${err.message || 'Silakan coba lagi'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    >
      {/* Video Background */}
      <VideoBackground 
        videoSrc="/vidio/login.mp4"
        posterSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231e3a8a;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%230369a1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230891b2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-sky-900/30 to-cyan-900/40 backdrop-blur-[2px]" />

      {/* Main Card */}
      <motion.div 
        variants={cardVariants}
        className="relative z-20 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top - Image */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src="/images/login/loginnnn.webp"
            alt="Forgot Password"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          
          {/* Curved Divider */}
          <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none">
            <svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1200 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,0 Q600,80 1200,0 L1200,100 L0,100 Z"
                fill="white"
                className="drop-shadow-lg"
              />
            </svg>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full p-8 md:p-12">
          {/* Back Link */}
          <motion.div custom={0} variants={itemVariants}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all group mb-6"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Login</span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div custom={1} variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lupa Password?
            </h1>
            <p className="text-sm text-gray-600">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password
            </p>
          </motion.div>

          {/* Success/Error Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Email reset password telah dikirim!
                    </p>
                    <p className="text-xs text-green-700">
                      Silakan cek inbox email Anda dan klik link yang kami kirimkan untuk reset password. 
                      Link akan kadaluarsa dalam 1 jam.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSendResetLink} className="space-y-6">
            <motion.div custom={2} variants={itemVariants} className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@masjid.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsHovered(true)}
                  onBlur={() => setIsHovered(false)}
                  className="pl-10 h-12 border-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  required
                  disabled={loading || cooldown > 0}
                />
              </motion.div>
            </motion.div>

            <motion.div custom={3} variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || cooldown > 0}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </div>
                ) : cooldown > 0 ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Tunggu {cooldown}s</span>
                  </div>
                ) : (
                  'Kirim Link Reset Password'
                )}
              </Button>
            </motion.div>

          </form>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-white/90 z-20">
        Hak Cipta @danamasjid
      </div>
    </motion.div>
  );
}
