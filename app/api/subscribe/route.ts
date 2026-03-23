import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('[SUBSCRIBE] Received request for email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('[SUBSCRIBE] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DanaMasjid <onboarding@resend.dev>',
      to: email,
      subject: 'Daftarkan Masjid Anda di DanaMasjid',
      replyTo: 'support@danamasjid.com',
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
                    <h2 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 20px;">Mulai Daftarkan Masjid Anda</h2>
                    
                    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 30px;">
                      Assalamu'alaikum,<br><br>
                      Terima kasih atas minat Anda untuk bergabung dengan DanaMasjid. Kami siap membantu masjid Anda menerima donasi secara transparan dan amanah.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align:center;margin:0 0 30px;">
                      <a href="http://localhost:3000/register?email=${encodeURIComponent(email)}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;">
                        Buat Akun Sekarang
                      </a>
                    </div>
                    
                    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">
                      Klik tombol di atas untuk membuat akun dan mulai mendaftarkan masjid Anda. Prosesnya mudah dan cepat.
                    </p>
                    
                    <p style="color:#9ca3af;font-size:13px;margin:0;">
                      Jika Anda tidak meminta email ini, abaikan saja.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#6b7280;font-size:12px;margin:0 0 10px;">Email ini dikirim ke ${email}</p>
                    <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} DanaMasjid. Hak Cipta Dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `
Assalamu'alaikum Warahmatullahi Wabarakatuh,

Terima kasih atas minat Anda untuk bergabung dengan DanaMasjid!

Silakan buat akun Anda di: http://localhost:3000/register?email=${encodeURIComponent(email)}

Kami siap membantu masjid Anda menerima donasi secara transparan dan amanah.

Jika ada pertanyaan, hubungi: support@danamasjid.com

Terima kasih,
Tim DanaMasjid
      `
    });

    if (error) {
      console.error('[SUBSCRIBE] Resend error:', error);
      return NextResponse.json(
        { error: 'Gagal mengirim email. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    console.log('[SUBSCRIBE] Success! Email sent to:', email);
    console.log('[SUBSCRIBE] Resend message ID:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email berhasil dikirim! Silakan cek inbox Anda.'
    });

  } catch (error: any) {
    console.error('[SUBSCRIBE] Error in subscribe API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
