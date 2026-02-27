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
  signInWithEmail: (email: string, password: string) => Promise<User>
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
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user

      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
        provider: 'email'
      })
      
      return user
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      // Save userId to localStorage
      localStorage.setItem('userId', user.uid)
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${user.uid}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      
      return user
    } catch (error) {
      console.error('Sign in error:', error)
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
