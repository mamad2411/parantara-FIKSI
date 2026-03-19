"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function VerifyDeviceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token verifikasi tidak valid')
      return
    }

    verifyDevice()
  }, [token])

  const verifyDevice = async () => {
    if (!db) {
      setStatus('error')
      setMessage('Firebase tidak tersedia')
      return
    }
    
    try {
      // Search for user with this verification token
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('deviceVerificationToken', '==', token))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Check if token was already used (token set to null after use)
        const usedQuery = query(usersRef, where('deviceVerificationUsed', '==', true))
        // We can't query by null token, so just show appropriate message
        setStatus('error')
        setMessage('Link verifikasi ini sudah digunakan atau tidak valid. Silakan login kembali untuk mendapatkan link baru.')
        return
      }

      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      // Check if token expired
      const expiryDate = new Date(userData.deviceVerificationExpiry)
      if (new Date() > expiryDate) {
        // Invalidate expired token so it can't be reused
        const userRef = doc(db, 'users', userDoc.id)
        await setDoc(userRef, {
          deviceVerificationToken: null,
          deviceVerificationExpiry: null,
          pendingDeviceFingerprint: null,
        }, { merge: true })
        setStatus('error')
        setMessage('Link verifikasi sudah kedaluwarsa. Silakan login kembali untuk mendapatkan link baru.')
        return
      }

      // Update user document - approve the new device
      const userRef = doc(db, 'users', userDoc.id)
      await setDoc(userRef, {
        deviceFingerprint: userData.pendingDeviceFingerprint,
        deviceVerificationToken: null,
        deviceVerificationExpiry: null,
        pendingDeviceFingerprint: null,
        deviceVerifiedAt: new Date().toISOString(),
        deviceVerificationUsed: true,
      }, { merge: true })

      setStatus('success')
      setMessage('Perangkat berhasil diverifikasi! Anda sekarang dapat login.')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Perangkat berhasil diverifikasi. Silakan login.')
      }, 3000)

    } catch (error) {
      console.error('Error verifying device:', error)
      setStatus('error')
      setMessage('Terjadi kesalahan saat memverifikasi perangkat')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Memverifikasi Perangkat
              </h1>
              <p className="text-gray-600">
                Mohon tunggu sebentar...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifikasi Berhasil!
              </h1>
              <p className="text-gray-600">
                {message}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Anda akan diarahkan ke halaman login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifikasi Gagal
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali ke Login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyDevicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Memverifikasi Perangkat
            </h1>
            <p className="text-gray-600">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      </div>
    }>
      <VerifyDeviceContent />
    </Suspense>
  )
}
