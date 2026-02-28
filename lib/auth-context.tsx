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
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
  signUpWithEmail: (email: string, password: string, userData: any) => Promise<User>
  signInWithEmail: (email: string, password: string) => Promise<User | null>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

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
    try {
      console.log('Creating Firebase user account...')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Firebase user created:', user.uid)

      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

      // Save user data to Firestore with registration tracking
      console.log('Saving user data to Firestore...')
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
        provider: 'email',
        registrationCompleted: false, // Track if mosque registration is completed
        registrationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        accountStatus: 'pending_mosque_registration', // pending_mosque_registration, active, suspended
        lastLoginAt: new Date().toISOString(),
        deviceFingerprint: navigator.userAgent // Simple device tracking
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
      }
      
      throw new Error(errorMessage)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      // Get user data from Firestore
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data()
        const currentDevice = navigator.userAgent
        const now = new Date()
        
        // Check if registration deadline has passed
        if (userData.registrationDeadline && !userData.registrationCompleted) {
          const deadline = new Date(userData.registrationDeadline)
          if (now > deadline) {
            // Account suspended - need reactivation
            await setDoc(userRef, {
              ...userData,
              accountStatus: 'suspended',
              suspendedAt: now.toISOString(),
              suspensionReason: 'registration_incomplete'
            }, { merge: true })
            
            // Sign out immediately
            await firebaseSignOut(auth)
            
            throw new Error('ACCOUNT_SUSPENDED')
          }
        }
        
        // Check device fingerprint
        if (userData.deviceFingerprint && userData.deviceFingerprint !== currentDevice) {
          // Different device - require verification
          throw new Error('DEVICE_NOT_RECOGNIZED')
        }
        
        // Update last login
        await setDoc(userRef, {
          lastLoginAt: now.toISOString(),
          deviceFingerprint: currentDevice
        }, { merge: true })
      }
      
      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      
      return user
    } catch (error: any) {
      // Suppress offline errors in console
      if (error?.code === 'unavailable' || error?.message?.includes('client is offline')) {
        console.warn('Firebase offline - attempting to continue with cached data')
        // Don't throw, let the app continue with cached auth state
        return null
      }
      
      console.error('Sign in error:', error)
      
      // Handle custom errors
      if (error.message === 'ACCOUNT_SUSPENDED') {
        throw new Error('Akun Anda telah dinonaktifkan karena belum menyelesaikan pendaftaran masjid dalam 48 jam. Silakan verifikasi email Anda untuk mengaktifkan kembali.')
      }
      
      if (error.message === 'DEVICE_NOT_RECOGNIZED') {
        throw new Error('DEVICE_NOT_RECOGNIZED')
      }
      
      throw error
    }
  }

  const signOut = async () => {
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
    signInWithGoogle,
    signOut,
    signUpWithEmail,
    signInWithEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
