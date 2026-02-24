import nodemailer, { Transporter } from 'nodemailer';

// Create transporter
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
    console.error('Error details:', {
      code: (error as any).code,
      command: (error as any).command,
      response: (error as any).response,
      responseCode: (error as any).responseCode
    });
  } else {
    console.log('✅ SMTP server is ready to send emails');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM
    });
  }
});

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendOTPEmail = async (email: string, name: string, otpCode: string): Promise<EmailResult> => {
  try {
    const mailOptions = {
      from: `"DanaMasjid" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Kode Verifikasi OTP - DanaMasjid',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo img {
              width: 50px;
              height: 50px;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              color: rgba(255, 255, 255, 0.9);
              margin: 10px 0 0;
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              color: #4b5563;
              margin-bottom: 30px;
              font-size: 15px;
            }
            .otp-box {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 2px solid #3b82f6;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 10px;
              font-weight: 500;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 700;
              color: #3b82f6;
              letter-spacing: 12px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-validity {
              color: #6b7280;
              font-size: 13px;
              margin-top: 10px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 30px 0;
              border-radius: 8px;
            }
            .warning-title {
              color: #92400e;
              font-weight: 600;
              margin-bottom: 10px;
              font-size: 15px;
            }
            .warning ul {
              margin: 10px 0;
              padding-left: 20px;
              color: #78350f;
            }
            .warning li {
              margin: 8px 0;
              font-size: 14px;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              color: #6b7280;
              font-size: 13px;
              margin: 5px 0;
            }
            .footer-links {
              margin-top: 15px;
            }
            .footer-links a {
              color: #3b82f6;
              text-decoration: none;
              margin: 0 10px;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="50" rx="8" fill="#3b82f6"/>
                  <path d="M25 10 L35 20 L35 38 L15 38 L15 20 Z" fill="white"/>
                  <rect x="22" y="28" width="6" height="10" fill="#3b82f6"/>
                  <circle cx="25" cy="15" r="3" fill="white"/>
                </svg>
              </div>
              <h1>DanaMasjid</h1>
              <p>Platform Donasi Masjid Terpercaya</p>
            </div>
            
            <div class="content">
              <div class="greeting">Halo, ${name}!</div>
              
              <div class="message">
                Terima kasih telah mendaftar di DanaMasjid. Untuk melanjutkan proses registrasi, 
                silakan gunakan kode verifikasi OTP berikut:
              </div>
              
              <div class="otp-box">
                <div class="otp-label">Kode Verifikasi OTP Anda</div>
                <div class="otp-code">${otpCode}</div>
                <div class="otp-validity">Kode ini berlaku selama 10 menit</div>
              </div>

              <div class="warning">
                <div class="warning-title">Perhatian Keamanan</div>
                <ul>
                  <li>Jangan bagikan kode OTP ini kepada siapapun</li>
                  <li>Tim DanaMasjid tidak akan pernah meminta kode OTP Anda</li>
                  <li>Jika Anda tidak merasa mendaftar, abaikan email ini</li>
                </ul>
              </div>

              <div class="message">
                Jika Anda mengalami kesulitan, silakan hubungi tim support kami.
              </div>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              <div class="footer-links">
                <a href="#">Bantuan</a>
                <a href="#">Kebijakan Privasi</a>
                <a href="#">Syarat & Ketentuan</a>
              </div>
              <p style="margin-top: 20px;">&copy; 2025 DanaMasjid. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending OTP email:', error);
    console.error('Error details:', {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode
    });
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email: string, name: string, mosqueName: string): Promise<EmailResult> => {
  try {
    const mailOptions = {
      from: `"DanaMasjid" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Selamat Datang di DanaMasjid',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo img {
              width: 50px;
              height: 50px;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              color: rgba(255, 255, 255, 0.9);
              margin: 10px 0 0;
              font-size: 16px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .message {
              color: #4b5563;
              margin-bottom: 25px;
              font-size: 15px;
            }
            .features {
              background: #f9fafb;
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
            }
            .features h3 {
              color: #1f2937;
              margin: 0 0 20px;
              font-size: 17px;
            }
            .feature-item {
              margin: 15px 0;
              padding-left: 30px;
              position: relative;
              color: #4b5563;
              font-size: 14px;
            }
            .feature-item:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
              font-size: 18px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              margin: 25px 0;
              font-weight: 600;
              font-size: 15px;
            }
            .button-container {
              text-align: center;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              color: #6b7280;
              font-size: 13px;
              margin: 5px 0;
            }
            .footer-links {
              margin-top: 15px;
            }
            .footer-links a {
              color: #3b82f6;
              text-decoration: none;
              margin: 0 10px;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="50" rx="8" fill="#fbbf24"/>
                  <path d="M25 10 L35 20 L35 38 L15 38 L15 20 Z" fill="white"/>
                  <rect x="22" y="28" width="6" height="10" fill="#fbbf24"/>
                  <circle cx="25" cy="15" r="3" fill="white"/>
                </svg>
              </div>
              <h1>Selamat Datang!</h1>
              <p>Akun Anda Berhasil Dibuat</p>
            </div>
            
            <div class="content">
              <div class="greeting">Halo, ${name}!</div>
              
              <div class="message">
                Selamat! Akun admin DanaMasjid Anda untuk <strong>${mosqueName}</strong> telah berhasil dibuat.
              </div>
              
              <div class="features">
                <h3>Apa yang bisa Anda lakukan:</h3>
                <div class="feature-item">Kelola data masjid dengan mudah</div>
                <div class="feature-item">Terima donasi secara transparan</div>
                <div class="feature-item">Laporan keuangan real-time</div>
                <div class="feature-item">Komunikasi dengan jamaah</div>
                <div class="feature-item">Dashboard analytics lengkap</div>
              </div>

              <div class="button-container">
                <a href="http://localhost:3000/login" class="button">Masuk ke Dashboard</a>
              </div>

              <div class="message">
                Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.
              </div>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              <div class="footer-links">
                <a href="#">Bantuan</a>
                <a href="#">Kebijakan Privasi</a>
                <a href="#">Syarat & Ketentuan</a>
              </div>
              <p style="margin-top: 20px;">&copy; 2025 DanaMasjid. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
