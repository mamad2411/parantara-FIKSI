// Shared config for next-firebase-auth-edge
// Used by both middleware and API routes

export const COOKIE_NAME = 'fb_session'

// Must be at least 32 chars — use private key prefix as signing secret
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''
const signingKey = rawKey.replace(/\\n/g, '\n').slice(0, 64) || 'fallback-dev-key-change-in-production'

export const authEdgeConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: COOKIE_NAME,
  cookieSignatureKeys: [signingKey],
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
