import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Generate secure random token
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Token expires in 24 hours
const TOKEN_EXPIRY_HOURS = 24

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nickname, email } = body

    if (!name || !nickname || !email) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    // Store token in Firestore using Admin SDK
    const { getFirestore } = await import('@/lib/firebase-admin')
    const db = getFirestore()

    const tokenData = {
      token,
      name,
      nickname: nickname.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    }

    await db.collection('registrationTokens').doc(token).set(tokenData)

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const verificationLink = `${baseUrl}/register/${token}`

    const emailSent = await sendVerificationEmail(email, name, verificationLink)

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Gagal mengirim email verifikasi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Link verifikasi telah dikirim ke email Anda',
      expiresIn: TOKEN_EXPIRY_HOURS,
    })
  } catch (error: any) {
    console.error('[POST /api/register-step1]', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

async function sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return false
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DanaMasjid <onboarding@resend.dev>',
      to: email,
      subject: '✅ Verifikasi Pendaftaran Akun - DanaMasjid',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af,#0ea5e9);padding:40px 30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">DanaMasjid</h1>
                    <p style="color:#bfdbfe;margin:8px 0 0;font-size:15px;">Platform Donasi Masjid Transparan</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 20px;">Verifikasi Pendaftaran Akun</h2>
                    
                    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 30px;">
                      Halo <strong style="color:#111827;">${name}</strong>,<br><br>
                      Terima kasih telah mendaftar di DanaMasjid. Untuk melanjutkan proses pendaftaran dan membuat password, klik tombol di bawah ini:
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align:center;margin:0 0 30px;">
                      <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">
                        ✅ Verifikasi & Buat Password
                      </a>
                    </div>
                    
                    <!-- Warning Box -->
                    <div style="background:#fef3c7;border:2px solid #fcd34d;border-radius:8px;padding:20px;margin:0 0 20px;">
                      <p style="color:#92400e;font-size:13px;margin:0;">
                        ⚠️ Link ini berlaku selama <strong>24 jam</strong> dan hanya dapat digunakan <strong>satu kali</strong>. Setelah itu, link akan kadaluarsa.
                      </p>
                    </div>
                    
                    <p style="color:#9ca3af;font-size:13px;margin:0;">
                      Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} DanaMasjid. Hak Cipta Dilindungi.</p>
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
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
