'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  firebaseReady: boolean
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
  signUpWithEmail: (email: string, password: string, userData: any) => Promise<User>
  signInWithEmail: (email: string, password: string) => Promise<User | null>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

// Stable device signature — only OS + browser engine, ignores minor version changes
function getStableDeviceId(): string {
  const ua = navigator.userAgent
  const os = /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'MacOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux' : 'Unknown'
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari' : 'Unknown'
  return `${os}|${browser}`
}

// Create proper httpOnly session cookie via API route
async function createServerSession(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken()
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
  } catch (err) {
    console.error('Failed to create server session:', err)
  }
}

// Simple client-side rate limiter: max 5 attempts per 15 minutes per email
const loginAttempts: Record<string, { count: number; resetAt: number }> = {}

function checkRateLimit(email: string): void {
  const key = email.toLowerCase()
  const now = Date.now()
  const window = 15 * 60 * 1000 // 15 minutes

  if (!loginAttempts[key] || now > loginAttempts[key].resetAt) {
    loginAttempts[key] = { count: 1, resetAt: now + window }
    return
  }

  loginAttempts[key].count++

  if (loginAttempts[key].count > 5) {
    const remaining = Math.ceil((loginAttempts[key].resetAt - now) / 60000)
    throw new Error(`Terlalu banyak percobaan login. Coba lagi dalam ${remaining} menit.`)
  }
}

function resetRateLimit(email: string): void {
  delete loginAttempts[email.toLowerCase()]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const firebaseReady = !!auth // true if Firebase client SDK initialized

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    // Safety timeout — if onAuthStateChanged doesn't fire within 3s, unblock
    const timeout = setTimeout(() => setLoading(false), 3000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout)
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        await createServerSession(firebaseUser)
        document.cookie = `auth_token=${firebaseUser.uid}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
      } else {
        fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
        document.cookie = 'auth_token=; path=/; max-age=0'
      }
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase not initialized')
    
    try {
      const result = await signInWithPopup(auth, googleProvider!)
      const user = result.user

      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set proper httpOnly session cookie + legacy cookie
      await createServerSession(user)
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`

      // Save user data to Firestore
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          provider: 'google'
        })
      }
      
      return user
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, userData: any) => {
    if (!auth || !db) throw new Error('Firebase not initialized')
    
    try {
      console.log('Creating Firebase user account...')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Firebase user created:', user.uid)

      // Save userId to localStorage immediately
      localStorage.setItem('userId', user.uid)
      
      // Set proper httpOnly session cookie + legacy cookie
      await createServerSession(user)
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`

      // Save user data to Firestore (must wait to ensure data is saved)
      console.log('Saving user data to Firestore...')
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email?.toLowerCase().trim() || email.toLowerCase().trim(), // Ensure lowercase
        name: userData.name,
        nickname: userData.nickname.toLowerCase().trim(), // Ensure lowercase
        createdAt: new Date().toISOString(),
        provider: 'email',
        registrationCompleted: false, // Track if mosque registration is completed
        registrationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        accountStatus: 'pending_mosque_registration', // pending_mosque_registration, active, suspended
        lastLoginAt: new Date().toISOString(),
        deviceFingerprint: navigator.userAgent, // Simple device tracking
        deviceFingerprintStable: getStableDeviceId(),
      })
      console.log('User data saved to Firestore successfully')
      
      return user
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Terjadi kesalahan saat mendaftar'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan password yang lebih kuat.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Silakan coba lagi.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase not initialized')

    // Check rate limit before attempting login
    checkRateLimit(email)

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user

      // Reset rate limit on successful login
      resetRateLimit(email)

      // Check device fingerprint (stable: OS + browser engine only)
      const currentDevice = getStableDeviceId()
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        // Support both old full-UA fingerprints and new stable ones
        const lastDevice = userData.deviceFingerprint
        const lastDeviceStable = userData.deviceFingerprintStable

        // Only trigger verification if stable device changed (not first login)
        // Also skip in development — no point verifying devices locally
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        const stableChanged = !isDev && lastDeviceStable
          ? lastDeviceStable !== currentDevice
          : false

        if (stableChanged) {
          // Generate verification token
          const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

          await setDoc(userRef, {
            deviceVerificationToken: verificationToken,
            deviceVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            pendingDeviceFingerprint: currentDevice,
            pendingDeviceFingerprintStable: currentDevice,
          }, { merge: true })

          // Send verification email (fire and forget — don't block login flow on failure)
          fetch('/api/send-device-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              userName: userData.name || 'Pengguna',
              deviceInfo: currentDevice,
              verificationToken,
            }),
          }).catch(err => console.error('Failed to send verification email:', err))

          // Sign out and ask user to verify
          await firebaseSignOut(auth)
          throw new Error('DEVICE_NOT_RECOGNIZED')
        }
      }

      // Save userId to localStorage immediately for faster UX
      localStorage.setItem('userId', user.uid)

      // Set proper httpOnly session cookie + legacy cookie
      await createServerSession(user)
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`

      // Do Firestore operations in background (non-blocking)
      updateUserLoginData(user.uid).catch(err => {
        console.error('Background update error:', err)
      })

      return user
    } catch (error: any) {
      if (error.message === 'DEVICE_NOT_RECOGNIZED') {
        throw new Error('Perangkat ini tidak diakui. Silakan cek email Anda untuk memverifikasi perangkat.')
      }

      // Suppress offline errors in console
      if (error?.code === 'unavailable' || error?.message?.includes('client is offline')) {
        console.warn('Firebase offline - attempting to continue with cached data')
        return null
      }

      console.error('Sign in error:', error)
      throw error
    }
  }

  // Background function to update user data (non-blocking)
  const updateUserLoginData = async (userId: string) => {
    if (!db) return
    
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data()
        const currentDevice = navigator.userAgent
        const now = new Date()
        
        // Check if registration deadline has passed (just log, don't block login)
        if (userData.registrationDeadline && !userData.registrationCompleted) {
          const deadline = new Date(userData.registrationDeadline)
          if (now > deadline) {
            console.warn('Registration deadline passed - user should complete registration')
            // Update status but don't block
            await setDoc(userRef, {
              accountStatus: 'pending_mosque_registration',
              lastReminderAt: now.toISOString()
            }, { merge: true })
          }
        }
        
        // Update last login (fire and forget)
        setDoc(userRef, {
          lastLoginAt: now.toISOString(),
          deviceFingerprint: currentDevice,
          deviceFingerprintStable: getStableDeviceId(),
        }, { merge: true }).catch(err => console.error('Failed to update login time:', err))
      }
    } catch (error) {
      console.error('Error updating user login data:', error)
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    
    try {
      await firebaseSignOut(auth)
      
      // Clear auth cookie
      document.cookie = 'auth_token=; path=/; max-age=0'
      
      // Clear localStorage
      localStorage.removeItem('userId')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    firebaseReady,
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    signInWithEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
