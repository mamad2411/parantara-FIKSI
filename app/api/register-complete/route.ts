import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Get and validate token using Admin SDK
    const { getFirestore } = await import('@/lib/firebase-admin')
    const db = getFirestore()

    const tokenDoc = await db.collection('registrationTokens').doc(token).get()

    if (!tokenDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
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

    // Validate token
    if (tokenData.used) {
      return NextResponse.json(
        { success: false, message: 'Token sudah digunakan' },
        { status: 400 }
      )
    }

    const now = new Date()
    const expiresAt = new Date(tokenData.expiresAt)
    if (expiresAt < now) {
      return NextResponse.json(
        { success: false, message: 'Token sudah kadaluarsa' },
        { status: 400 }
      )
    }

    // Mark token as used
    await db.collection('registrationTokens').doc(token).update({
      used: true,
      usedAt: new Date().toISOString(),
    })

    // Return user data for Firebase Auth registration
    return NextResponse.json({
      success: true,
      data: {
        name: tokenData.name,
        nickname: tokenData.nickname,
        email: tokenData.email,
      },
    })
  } catch (error: any) {
    console.error('[POST /api/register-complete]', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
