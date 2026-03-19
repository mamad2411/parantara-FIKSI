let adminModule: typeof import('firebase-admin') | null = null

async function getAdmin() {
  if (!adminModule) {
    adminModule = (await import('firebase-admin')).default
  }
  return adminModule
}

function getAdminSync() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const admin = require('firebase-admin') as typeof import('firebase-admin')
  return admin
}

function getAdminApp() {
  const admin = getAdminSync()
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

export function getAuth() {
  return getAdminApp().auth()
}

export function getFirestore() {
  return getAdminApp().firestore()
}
