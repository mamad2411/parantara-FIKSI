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
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  signUpWithEmail: (email: string, password: string, userData: any) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
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
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, userData: any) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        phone: userData.phone,
        mosqueName: userData.mosqueName,
        mosqueAddress: userData.mosqueAddress,
        mosqueCity: userData.mosqueCity,
        createdAt: new Date().toISOString(),
        provider: 'email'
      })

      // Also save mosque data
      if (userData.mosqueName) {
        await setDoc(doc(db, 'mosques', user.uid), {
          userId: user.uid,
          name: userData.mosqueName,
          address: userData.mosqueAddress,
          city: userData.mosqueCity,
          adminEmail: user.email,
          adminName: userData.name,
          adminPhone: userData.phone,
          createdAt: new Date().toISOString(),
          status: 'active'
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
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
