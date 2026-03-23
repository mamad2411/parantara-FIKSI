import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 400 }
      )
    }

    // Get token from Firestore using Admin SDK
    const { getFirestore } = await import('@/lib/firebase-admin')
    const db = getFirestore()

    const tokenDoc = await db.collection('registrationTokens').doc(token).get()

    if (!tokenDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Link verifikasi tidak valid atau sudah kadaluarsa' },
        { status: 404 }
      )
    }

    const tokenData = tokenDoc.data()

    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Data token tidak valid' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (tokenData.used) {
      return NextResponse.json(
        { success: false, message: 'Link verifikasi sudah pernah digunakan' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expiresAt)
    if (expiresAt < now) {
      return NextResponse.json(
        { success: false, message: 'Link verifikasi sudah kadaluarsa. Silakan daftar ulang.' },
        { status: 400 }
      )
    }

    // Return user data for step 2
    return NextResponse.json({
      success: true,
      data: {
        name: tokenData.name,
        nickname: tokenData.nickname,
        email: tokenData.email,
      },
    })
  } catch (error: any) {
    console.error('[POST /api/register-verify-token]', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
