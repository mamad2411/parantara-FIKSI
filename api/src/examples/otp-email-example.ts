import { sendEmail, getLogoAttachment } from '../utils/emailWorker';
import { EmailService } from '../utils/emailService';

// Contoh penggunaan untuk mengirim email OTP dengan logo
async function sendOTPEmailWithLogo() {
  const otpCode = '442591'; // Generate OTP code (6 digit)
  const userEmail = 'user@example.com';

  // Generate email template
  const emailTemplate = EmailService.getOTPVerificationEmail({
    email: userEmail,
    otpCode: otpCode,
    logoUrl: 'https://danamasjid.com/logo.png', // URL logo dari server
  });

  // Kirim email dengan logo attachment
  await sendEmail({
    to: userEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    attachments: [getLogoAttachment()], // Attach logo sebagai inline image
    resendApiKey: process.env.RESEND_API_KEY,
  });
  
  console.log(`OTP email sent to ${userEmail} with logo`);
}

// Contoh fungsi untuk generate OTP
function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Contoh penggunaan dalam route registrasi
export async function handleUserRegistration(email: string) {
  // Generate OTP
  const otpCode = generateOTP(6);
  
  // Simpan OTP ke database dengan expiry time (10 menit)
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang
  
  // TODO: Simpan ke database
  // await db.otp.create({
  //   email,
  //   code: otpCode,
  //   expiresAt: expiryTime,
  // });
  
  // Kirim email OTP dengan logo
  const emailTemplate = EmailService.getOTPVerificationEmail({
    email,
    otpCode,
    logoUrl: 'https://danamasjid.com/logo.png',
  });
  
  await sendEmail({
    to: email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    attachments: [getLogoAttachment()], // Logo akan muncul di email
    resendApiKey: process.env.RESEND_API_KEY,
  });
  
  return {
    success: true,
    message: 'OTP telah dikirim ke email Anda',
  };
}

// Contoh verifikasi OTP
export async function verifyOTP(email: string, inputOTP: string) {
  // TODO: Ambil OTP dari database
  // const storedOTP = await db.otp.findOne({ email });
  
  // if (!storedOTP) {
  //   return { success: false, message: 'OTP tidak ditemukan' };
  // }
  
  // if (new Date() > storedOTP.expiresAt) {
  //   return { success: false, message: 'OTP sudah kadaluarsa' };
  // }
  
  // if (storedOTP.code !== inputOTP) {
  //   return { success: false, message: 'OTP tidak valid' };
  // }
  
  // // Hapus OTP setelah berhasil diverifikasi
  // await db.otp.delete({ email });
  
  return {
    success: true,
    message: 'OTP berhasil diverifikasi',
  };
}

export { generateOTP, sendOTPEmailWithLogo };

