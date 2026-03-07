import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email, userName, deviceInfo, verificationToken } = await request.json()

    if (!email || !verificationToken) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      )
    }

    // Check if Resend is configured
    if (!resend) {
      console.warn('Resend API key not configured, skipping email send')
      return NextResponse.json({ 
        success: true, 
        message: 'Email service not configured' 
      })
    }

    // Read HTML template
    const templatePath = path.join(process.cwd(), 'api/src/templates/device-verification.html')
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-device?token=${verificationToken}`

    // Get device info (simplified)
    const deviceName = deviceInfo.includes('Mobile') ? 'Mobile Device' : 'Desktop/Laptop'
    const timestamp = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    })

    // Replace placeholders
    htmlTemplate = htmlTemplate
      .replace(/{{userName}}/g, userName || 'User')
      .replace(/{{deviceInfo}}/g, deviceName)
      .replace(/{{location}}/g, 'Indonesia') // You can enhance this with IP geolocation
      .replace(/{{timestamp}}/g, timestamp)
      .replace(/{{verificationLink}}/g, verificationLink)

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'DanaMasjid <noreply@danamasjid.com>',
      to: email,
      subject: 'Verifikasi Perangkat Baru - DanaMasjid',
      html: htmlTemplate,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending device verification email:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
