import admin from 'firebase-admin'

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin environment variables')
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  })
}

export const adminAuth = {
  updateUser: (...args: Parameters<admin.auth.Auth['updateUser']>) =>
    getAdminApp().auth().updateUser(...args),
}

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    return (getAdminApp().firestore() as any)[prop]
  },
})
