import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, removeAuthCookies } from 'next-firebase-auth-edge/lib/next/cookies'
import { authEdgeConfig } from '@/lib/firebase-auth-edge'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/auth/session — exchange Firebase ID token for session cookie
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    // Pass idToken via Authorization header — that's how setAuthCookies reads it
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${idToken}`)

    return await setAuthCookies(headers, authEdgeConfig)
  } catch (err: any) {
    console.error('Session creation error:', err?.message)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 })
  }
}

// DELETE /api/auth/session — clear session cookies
export async function DELETE() {
  return removeAuthCookies(new Headers(), {
    cookieName: authEdgeConfig.cookieName,
    cookieSerializeOptions: authEdgeConfig.cookieSerializeOptions,
  })
}
