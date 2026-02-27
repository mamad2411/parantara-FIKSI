import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Auth
const auth = getAuth(app)

// Set device language for better UX
if (typeof window !== 'undefined') {
  auth.useDeviceLanguage()
}

const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Suppress console errors for Google API loading issues
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args) => {
    // Filter out Google API loading errors that don't affect functionality
    if (
      args[0]?.includes?.('apis.google.com') ||
      args[0]?.includes?.('ERR_CONNECTION_CLOSED')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export { auth, db, googleProvider }
