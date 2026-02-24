import * as admin from 'firebase-admin';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Initialize Firebase Admin (for server-side)
// Note: For production, use service account key file
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
};

// For development, we'll use the config directly
// In production, use service account:
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

try {
  if (!admin.apps.length) {
    // For now, we'll skip Firebase Admin initialization
    // You can add service account later for production
    console.log('⚠️  Firebase Admin not initialized (requires service account)');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { firebaseConfig, admin };
