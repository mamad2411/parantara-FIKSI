import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email, userName, deviceInfo, verificationToken } = await request.json()

    if (!email || !verificationToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/verify-device?token=${verificationToken}`

    // Parse device info for display
    const deviceSummary = deviceInfo
      ? deviceInfo.substring(0, 100) + (deviceInfo.length > 100 ? '...' : '')
      : 'Perangkat tidak diketahui'

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '🔒 Verifikasi Perangkat Baru - DanaMasjid',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a,#0369a1);padding:32px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DanaMasjid</h1>
                    <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Platform Donasi Masjid Transparan</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">Verifikasi Perangkat Baru</h2>
                    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                      Halo <strong style="color:#111827;">${userName || 'Pengguna'}</strong>,<br><br>
                      Kami mendeteksi percobaan login dari perangkat baru. Untuk keamanan akun Anda, klik tombol di bawah untuk memverifikasi perangkat ini.
                    </p>
                    <!-- Device Info -->
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 32px;">
                      <p style="color:#374151;font-size:13px;margin:0 0 4px;font-weight:600;">Info Perangkat:</p>
                      <p style="color:#6b7280;font-size:12px;margin:0;word-break:break-all;">${deviceSummary}</p>
                    </div>
                    <!-- CTA Button -->
                    <div style="text-align:center;margin:0 0 32px;">
                      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                        ✅ Verifikasi Perangkat
                      </a>
                    </div>
                    <!-- Warning -->
                    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:0 0 24px;">
                      <p style="color:#92400e;font-size:13px;margin:0;">
                        ⚠️ Link ini berlaku selama <strong>24 jam</strong>. Jika bukan Anda yang melakukan login ini, abaikan email ini dan segera ganti password Anda.
                      </p>
                    </div>
                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                      Atau salin link berikut ke browser Anda:<br>
                      <span style="color:#3b82f6;word-break:break-all;">${verifyUrl}</span>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
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

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('Send device verification error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
