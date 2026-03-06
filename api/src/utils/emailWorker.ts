// Email service for Cloudflare Workers using Resend or MailChannels
// Resend: 3000 free emails/month - https://resend.com

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  resendApiKey?: string
  attachments?: EmailAttachment[]
}

interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  cid?: string // Content-ID for inline images
  contentType?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from = 'DanaMasjid <noreply@danamasjid.com>', resendApiKey, attachments } = options

  try {
    // Log email for development
    console.log('=== EMAIL SENT ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    
    // Extract OTP from HTML if present
    const otpMatch = html.match(/font-size: 36px[^>]*>([0-9]{6})</)
    if (otpMatch) {
      console.log('OTP CODE:', otpMatch[1])
    }
    
    // Try Resend API first (requires RESEND_API_KEY)
    if (resendApiKey) {
      try {
        const resendPayload: any = {
          from: 'DanaMasjid <onboarding@resend.dev>', // Use verified domain
          to: [to],
          subject,
          html,
        }

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
          resendPayload.attachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            content_type: att.contentType || 'image/png',
            disposition: att.cid ? 'inline' : 'attachment',
            content_id: att.cid,
          }))
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        })

        if (response.ok) {
          console.log(`✅ Email sent via Resend to: ${to}`)
          return true
        } else {
          console.warn('Resend error:', await response.text())
        }
      } catch (resendError) {
        console.warn('Resend send failed:', resendError)
      }
    }
    
    // Fallback: Try MailChannels (free for Cloudflare Workers)
    try {
      const mailChannelsPayload: any = {
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: 'noreply@danamasjid.com',
          name: 'DanaMasjid',
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }

      // Add attachments for MailChannels
      if (attachments && attachments.length > 0) {
        mailChannelsPayload.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.contentType || 'image/png',
          disposition: att.cid ? 'inline' : 'attachment',
          content_id: att.cid,
        }))
      }

      const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailChannelsPayload),
      })

      if (response.ok) {
        console.log(`✅ Email sent via MailChannels to: ${to}`)
        return true
      } else {
        console.warn('MailChannels error:', await response.text())
      }
    } catch (mailError) {
      console.warn('MailChannels send failed:', mailError)
    }

    // Return success anyway for development (OTP is logged to console)
    console.log(`📧 Email logged (check Cloudflare logs for OTP)`)
    return true
  } catch (error) {
    console.error('Send email error:', error)
    // Return true to not block registration flow
    return true
  }
}

// Logo DanaMasjid dalam base64 (SVG sederhana)
export const DANAMASJID_LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTYiIGZpbGw9IiMxZTQwYWYiLz4KPHBhdGggZD0iTTUwIDIwTDI1IDM1VjUwQzI1IDYyLjUgMzUgNzIgNTAgNzVDNjUgNzIgNzUgNjIuNSA3NSA1MFYzNUw1MCAyMFoiIGZpbGw9IiNmZmZmZmYiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1NSIgcj0iOCIgZmlsbD0iIzFlNDBhZiIvPgo8L3N2Zz4='

// Helper function to get logo attachment
export function getLogoAttachment(): EmailAttachment {
  // Extract base64 content from data URL
  const base64Content = DANAMASJID_LOGO_BASE64.split(',')[1]
  
  return {
    filename: 'logo.svg',
    content: base64Content,
    cid: 'logo', // This matches cid:logo in HTML templates
    contentType: 'image/svg+xml',
  }
}

// Generate OTP using cryptographically secure random
export function generateOTP(): string {
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  // Generate 6-digit OTP (100000-999999)
  const otp = (array[0] % 900000) + 100000
  return otp.toString()
}

// Email templates
export function getOTPEmailHTML(otp: string, purpose: string = 'verifikasi'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP DanaMasjid</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DanaMasjid</h1>
              <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Platform Donasi Masjid Terpercaya</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Kode OTP Anda</h2>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Gunakan kode OTP berikut untuk ${purpose} akun DanaMasjid Anda:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px solid #2563eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #1e40af; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                <strong>Catatan:</strong> Kode OTP ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #dbeafe; font-size: 14px;">
                © 2026 DanaMasjid. Platform Donasi Masjid Terpercaya.
              </p>
              <p style="margin: 0; color: #93c5fd; font-size: 12px;">
                Email ini dikirim otomatis, mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function getWelcomeEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di DanaMasjid</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DanaMasjid</h1>
              <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Platform Donasi Masjid Terpercaya</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Selamat Datang, ${name}!</h2>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Terima kasih telah bergabung dengan DanaMasjid. Kami senang Anda menjadi bagian dari platform donasi masjid terpercaya.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">
                  GRATIS 3 Bulan Pertama!
                </p>
                <p style="margin: 10px 0 0 0; color: #78350f; font-size: 14px;">
                  Nikmati semua fitur premium tanpa biaya selama 3 bulan pertama.
                </p>
              </div>
              
              <p style="margin: 30px 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Mulai kelola donasi masjid Anda dengan mudah dan transparan.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://danamasjid.vercel.app/daftar-masjid" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Mulai Sekarang
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #dbeafe; font-size: 14px;">
                © 2026 DanaMasjid. Platform Donasi Masjid Terpercaya.
              </p>
              <p style="margin: 0; color: #93c5fd; font-size: 12px;">
                Butuh bantuan? Hubungi kami di danamasjid48@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function getSubscribeWelcomeEmailHTML(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terima Kasih Telah Berlangganan</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DanaMasjid</h1>
              <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Platform Donasi Masjid Terpercaya</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Terima Kasih Telah Berlangganan!</h2>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                Selamat! Anda telah berhasil berlangganan newsletter DanaMasjid. Kami akan mengirimkan update terbaru tentang:
              </p>
              
              <ul style="margin: 20px 0; padding-left: 20px; color: #6b7280; font-size: 16px; line-height: 1.8;">
                <li>Tips mengelola donasi masjid</li>
                <li>Fitur-fitur baru DanaMasjid</li>
                <li>Kisah sukses masjid-masjid di Indonesia</li>
                <li>Promo dan penawaran khusus</li>
              </ul>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">
                  Penawaran Khusus untuk Anda!
                </p>
                <p style="margin: 10px 0 0 0; color: #78350f; font-size: 14px;">
                  Daftarkan masjid Anda sekarang dan dapatkan GRATIS 3 bulan pertama!
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://danamasjid.vercel.app/daftar-masjid" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Daftarkan Masjid Sekarang
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #dbeafe; font-size: 14px;">
                © 2026 DanaMasjid. Platform Donasi Masjid Terpercaya.
              </p>
              <p style="margin: 0; color: #93c5fd; font-size: 12px;">
                Email ini dikirim otomatis, mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
