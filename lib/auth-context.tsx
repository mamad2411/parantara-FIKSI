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
    if (!auth) return
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase not initialized')
    
    try {
      const result = await signInWithPopup(auth, googleProvider!)
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
    if (!auth || !db) throw new Error('Firebase not initialized')
    
    try {
      console.log('Creating Firebase user account...')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Firebase user created:', user.uid)

      // Save userId to localStorage immediately
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

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
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase not initialized')
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      // Check device fingerprint
      const currentDevice = navigator.userAgent
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data()
        const lastDevice = userData.deviceFingerprint
        const lastLogin = userData.lastLoginAt ? new Date(userData.lastLoginAt) : null
        const now = new Date()
        
        // Check if force device verification flag is set (from 24hr timeout)
        const forceVerification = localStorage.getItem(`force_device_verification_${user.uid}`)
        
        // Check if device changed and last login was more than 24 hours ago OR force verification
        if ((lastDevice && lastDevice !== currentDevice && lastLogin) || forceVerification) {
          const hoursSinceLastLogin = lastLogin ? (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60) : 25
          
          if (hoursSinceLastLogin > 24 || forceVerification) {
            // Device not recognized and 24+ hours since last login OR forced verification
            // Generate verification token
            const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
            
            // Save verification token to Firestore
            await setDoc(userRef, {
              deviceVerificationToken: verificationToken,
              deviceVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
              pendingDeviceFingerprint: currentDevice
            }, { merge: true })
            
            // Send verification email
            try {
              await fetch('/api/send-device-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  userName: userData.name || 'User',
                  deviceInfo: currentDevice,
                  verificationToken: verificationToken
                })
              })
            } catch (emailError) {
              console.error('Failed to send verification email:', emailError)
            }
            
            // Clear the force verification flag
            localStorage.removeItem(`force_device_verification_${user.uid}`)
            
            // Trigger device verification
            localStorage.setItem('device_verification_required', 'true')
            localStorage.setItem('device_verification_email', email)
            
            // Sign out immediately
            await firebaseSignOut(auth)
            
            // Throw error to show device verification modal
            throw new Error('DEVICE_NOT_RECOGNIZED')
          }
        }
      }
      
      // Save userId to localStorage immediately for faster UX
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      
      // Do Firestore operations in background (non-blocking)
      updateUserLoginData(user.uid).catch(err => {
        console.error('Background update error:', err)
      })
      
      return user
    } catch (error: any) {
      // Handle device verification error
      if (error.message === 'DEVICE_NOT_RECOGNIZED') {
        throw new Error('Perangkat ini tidak diakui. Silakan cek surat elektronik Anda untuk memverifikasi perangkat Anda.')
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
          deviceFingerprint: currentDevice
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
