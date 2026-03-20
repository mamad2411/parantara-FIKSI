import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Check if we're in a browser environment and have valid config
const isValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId
const isBrowser = typeof window !== 'undefined'

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null
if (isValidConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

// Initialize Auth only if app is initialized
let auth: Auth | null = null
let db: Firestore | null = null
let googleProvider: GoogleAuthProvider | null = null

if (app) {
  auth = getAuth(app)

  // Set device language for better UX
  if (isBrowser) {
    auth.useDeviceLanguage()
  }

  // Initialize Firestore with modern cache settings
  if (getApps().length === 1) {
    // First initialization - use modern cache API
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      })
    } catch (error) {
      // Fallback to default if cache initialization fails
      console.warn('Failed to initialize Firestore with cache, using default:', error)
      db = getFirestore(app)
    }
  } else {
    // Already initialized
    db = getFirestore(app)
  }

  googleProvider = new GoogleAuthProvider()
}

// Suppress console errors and warnings
if (typeof window !== 'undefined') {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args) => {
    const firstArg = args[0]
    if (typeof firstArg === 'string') {
      // Filter out known non-critical errors
      if (
        firstArg.includes('Failed to load https://apis.google.com/js/api.js') ||
        firstArg.includes('ERR_CONNECTION_CLOSED') ||
        firstArg.includes('Failed to get document because the client is offline') ||
        firstArg.includes('FirebaseError: Failed to get document') ||
        firstArg.includes('Failed to obtain primary lease')
      ) {
        return
      }
    }
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    const firstArg = args[0]
    if (typeof firstArg === 'string') {
      // Filter out deprecation warnings we're already handling
      if (
        firstArg.includes('enableIndexedDbPersistence() will be deprecated') ||
        firstArg.includes('Partitioned cookie') ||
        firstArg.includes('_GRECAPTCHA')
      ) {
        return
      }
    }
    originalWarn.apply(console, args)
  }
}

export { auth, db, googleProvider }
