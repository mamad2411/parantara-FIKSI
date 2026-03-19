import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email, mosqueName, status, rejectionReason, fieldFeedback } = await request.json()

    if (!email || !status || !mosqueName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isApproved = status === 'approved'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Build field feedback HTML for rejection
    let fieldFeedbackHtml = ''
    if (!isApproved && fieldFeedback) {
      const rejected = Object.entries(fieldFeedback as Record<string, { status: string; reason?: string; imageUrl?: string }>)
        .filter(([, v]) => v.status === 'rejected')

      if (rejected.length > 0) {
        const fieldLabels: Record<string, string> = {
          mosqueName: 'Nama Masjid', mosqueAddress: 'Alamat Masjid', province: 'Provinsi',
          regency: 'Kota/Kabupaten', district: 'Kecamatan', village: 'Kelurahan/Desa',
          postalCode: 'Kode Pos', mosqueImage: 'Foto Masjid', aktaPendirian: 'Akta Pendirian',
          skKemenkumham: 'SK Kemenkumham', npwpMasjid: 'NPWP Masjid',
          namaDepan: 'Nama Depan', namaBelakang: 'Nama Belakang', jenisKelamin: 'Jenis Kelamin',
          pekerjaan: 'Pekerjaan', emailPerwakilan: 'Email Perwakilan', tanggalLahir: 'Tanggal Lahir',
          nomorHandphone: 'No. Handphone', alamatTempat: 'Alamat Tempat Tinggal',
          nomorKTP: 'Nomor KTP', fotoKTP: 'Foto KTP', skKepengurusan: 'SK Kepengurusan',
          suratRekomendasiRTRW: 'Surat Rekomendasi RT/RW', fotoTampakDepan: 'Foto Tampak Depan',
          fotoInterior: 'Foto Interior', dokumenStatusTanah: 'Dokumen Status Tanah',
          ktpKetua: 'KTP Ketua', npwpDokumen: 'NPWP Dokumen', adminEmail: 'Email Admin',
        }

        const items = rejected.map(([key, val]) => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #fee2e2;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#991b1b;">
                ❌ ${fieldLabels[key] ?? key}
              </p>
              ${val.reason ? `<p style="margin:6px 0 0;font-size:13px;color:#7f1d1d;">${val.reason}</p>` : ''}
              ${val.imageUrl ? `<img src="${val.imageUrl}" alt="bukti" style="margin-top:8px;max-width:100%;max-height:200px;border-radius:8px;border:1px solid #fca5a5;" />` : ''}
            </td>
          </tr>
        `).join('')

        fieldFeedbackHtml = `
          <div style="margin:24px 0;">
            <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 12px;">Detail Field Bermasalah:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fee2e2;border-radius:10px;overflow:hidden;background:#fff5f5;">
              ${items}
            </table>
          </div>
        `
      }
    }

    const subject = isApproved
      ? `✅ Pendaftaran Masjid Disetujui - ${mosqueName}`
      : `❌ Pendaftaran Masjid Ditolak - ${mosqueName}`

    const html = isApproved ? `
      <!DOCTYPE html>
      <html lang="id">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f0fdf4;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#15803d,#16a34a);padding:32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DanaMasjid</h1>
                  <p style="color:#bbf7d0;margin:8px 0 0;font-size:14px;">Platform Donasi Masjid Transparan</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 32px;text-align:center;">
                  <div style="font-size:64px;margin-bottom:16px;">🎉</div>
                  <h2 style="color:#15803d;font-size:24px;margin:0 0 12px;">Selamat! Pendaftaran Disetujui</h2>
                  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    Pendaftaran masjid <strong style="color:#111827;">${mosqueName}</strong> telah <strong style="color:#15803d;">disetujui</strong> oleh tim DanaMasjid.
                  </p>
                  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin:0 0 32px;text-align:left;">
                    <p style="color:#166534;font-size:14px;margin:0 0 8px;font-weight:600;">Langkah selanjutnya:</p>
                    <ul style="color:#166534;font-size:14px;margin:0;padding-left:20px;line-height:2;">
                      <li>Login ke dashboard masjid Anda</li>
                      <li>Lengkapi profil masjid</li>
                      <li>Mulai buat program donasi</li>
                    </ul>
                  </div>
                  <a href="${appUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#15803d,#16a34a);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;">
                    Masuk ke Dashboard →
                  </a>
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
    ` : `
      <!DOCTYPE html>
      <html lang="id">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#fff5f5;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#991b1b,#dc2626);padding:32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DanaMasjid</h1>
                  <p style="color:#fecaca;margin:8px 0 0;font-size:14px;">Platform Donasi Masjid Transparan</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 32px;">
                  <div style="text-align:center;font-size:64px;margin-bottom:16px;">😔</div>
                  <h2 style="color:#991b1b;font-size:22px;margin:0 0 12px;text-align:center;">Pendaftaran Belum Dapat Disetujui</h2>
                  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 16px;">
                    Mohon maaf, pendaftaran masjid <strong style="color:#111827;">${mosqueName}</strong> belum dapat kami setujui saat ini.
                  </p>
                  ${rejectionReason ? `
                  <div style="background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:16px;margin:0 0 16px;">
                    <p style="color:#991b1b;font-size:14px;font-weight:600;margin:0 0 6px;">Alasan:</p>
                    <p style="color:#7f1d1d;font-size:14px;margin:0;">${rejectionReason}</p>
                  </div>
                  ` : ''}
                  ${fieldFeedbackHtml}
                  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px;margin:16px 0 32px;">
                    <p style="color:#92400e;font-size:14px;margin:0;">
                      💡 Anda dapat memperbaiki data yang bermasalah dan mendaftar kembali melalui website DanaMasjid.
                    </p>
                  </div>
                  <div style="text-align:center;">
                    <a href="${appUrl}/daftar-masjid" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;">
                      Daftar Ulang →
                    </a>
                  </div>
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
    `

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Mosque registration status email error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
