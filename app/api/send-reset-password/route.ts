import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getFirestore } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    // Find user by email in Firestore
    const usersRef = getFirestore().collection('users')
    const snap = await usersRef.where('email', '==', email.toLowerCase().trim()).get()

    // Always return success to prevent email enumeration
    if (snap.empty) {
      return NextResponse.json({ success: true })
    }

    const userDoc = snap.docs[0]
    const userData = userDoc.data()

    // Generate one-time reset token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

    // Save token to Firestore
    await userDoc.ref.update({
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '🔑 Reset Password - DanaMasjid',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a,#0369a1);padding:32px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DanaMasjid</h1>
                    <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Platform Donasi Masjid Transparan</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">Reset Password Anda</h2>
                    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                      Halo <strong style="color:#111827;">${userData.name || 'Pengguna'}</strong>,<br><br>
                      Kami menerima permintaan untuk mereset password akun DanaMasjid Anda. Klik tombol di bawah untuk membuat password baru.
                    </p>
                    <div style="text-align:center;margin:0 0 32px;">
                      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;">
                        🔑 Reset Password
                      </a>
                    </div>
                    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:0 0 24px;">
                      <p style="color:#92400e;font-size:13px;margin:0;">
                        ⚠️ Link ini berlaku selama <strong>1 jam</strong> dan hanya bisa digunakan sekali. Jika bukan Anda yang meminta reset password, abaikan email ini.
                      </p>
                    </div>
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                      Atau salin link berikut:<br>
                      <span style="color:#3b82f6;word-break:break-all;">${resetUrl}</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 DanaMasjid. Hak Cipta Dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Send reset password error:', err?.message || err)
    return NextResponse.json({ error: 'Gagal mengirim email' }, { status: 500 })
  }
}
