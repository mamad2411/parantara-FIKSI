import { NextRequest, NextResponse } from 'next/server'
import { getAuth, getFirestore } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token dan password wajib diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Find user with this reset token
    const usersRef = getFirestore().collection('users')
    const snap = await usersRef.where('passwordResetToken', '==', token).get()

    if (snap.empty) {
      return NextResponse.json({ error: 'Link reset password tidak valid atau sudah digunakan' }, { status: 400 })
    }

    const userDoc = snap.docs[0]
    const userData = userDoc.data()

    // Check expiry
    if (!userData.passwordResetExpiry || new Date() > new Date(userData.passwordResetExpiry)) {
      // Invalidate expired token
      await userDoc.ref.update({ passwordResetToken: null, passwordResetExpiry: null })
      return NextResponse.json({ error: 'Link reset password sudah kedaluwarsa. Silakan minta link baru.' }, { status: 400 })
    }

    // Update password via Firebase Admin
    await getAuth().updateUser(userDoc.id, { password: newPassword })

    // Invalidate token (one-time use)
    await userDoc.ref.update({
      passwordResetToken: null,
      passwordResetExpiry: null,
      passwordResetAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Reset password error:', err?.message || err)
    return NextResponse.json({ error: 'Gagal mereset password' }, { status: 500 })
  }
}
