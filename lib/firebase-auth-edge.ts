// Shared config for next-firebase-auth-edge
// Used by both middleware and API routes

export const COOKIE_NAME = 'fb_session'

const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''

// Cookie signing secret — use dedicated env var, fallback to a derived key
// Set AUTH_COOKIE_SECRET in your deployment env (any random 32+ char string)
const cookieSecret = process.env.AUTH_COOKIE_SECRET
  || process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
  || 'danamasjid-cookie-secret-dev-only'

export const authEdgeConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: COOKIE_NAME,
  cookieSignatureKeys: [cookieSecret],
  cookieSerializeOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  },
  serviceAccount: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: rawKey.replace(/\\n/g, '\n'),
  },
}
