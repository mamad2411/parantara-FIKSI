import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.mosqueName || !data.adminEmail || !data.adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10)

    // Create mosque registration in PostgreSQL
    const registration = await prisma.masjidRegistration.create({
      data: {
        userId: data.userId,
        
        // Step 1: Data Masjid
        mosqueName: data.mosqueName,
        mosqueAddress: data.mosqueAddress,
        province: data.province,
        regency: data.regency,
        district: data.district,
        village: data.village,
        postalCode: data.postalCode,
        
        // Step 2: Data Legalitas
        aktaPendirian: data.aktaPendirian || null,
        skKemenkumham: data.skKemenkumham || null,
        npwpMasjid: data.npwpMasjid || null,
        
        // Step 3: Data Pengurus
        namaDepan: data.namaDepan,
        namaBelakang: data.namaBelakang,
        jenisKelamin: data.jenisKelamin,
        pekerjaan: data.pekerjaan,
        isPemilikBisnis: data.isPemilikBisnis || false,
        emailPerwakilan: data.emailPerwakilan,
        tanggalLahir: data.tanggalLahir,
        nomorHandphone: data.nomorHandphone,
        alamatTempat: data.alamatTempat,
        jenisID: data.jenisID || 'KTP',
        fotoKTP: data.fotoKTP || null,
        nomorKTP: data.nomorKTP,
        suratKuasa: data.suratKuasa || null,
        kontakPersonSama: data.kontakPersonSama !== false,
        
        // Step 4: Upload Dokumen
        skKepengurusan: data.skKepengurusan || null,
        suratRekomendasiRTRW: data.suratRekomendasiRTRW || null,
        fotoTampakDepan: data.fotoTampakDepan || null,
        fotoInterior: data.fotoInterior || null,
        dokumenStatusTanah: data.dokumenStatusTanah || null,
        ktpKetua: data.ktpKetua || null,
        npwpDokumen: data.npwpDokumen || null,
        
        // Step 5: Akun Admin
        adminEmail: data.adminEmail,
        adminPassword: hashedPassword,
        
        status: 'pending'
      }
    })

    // Send confirmation email (optional)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-registration-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.emailPerwakilan,
          mosqueName: data.mosqueName,
          registrationId: registration.id
        })
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: 'Pendaftaran masjid berhasil dikirim dan sedang dalam proses review'
    })

  } catch (error) {
    console.error('Error creating mosque registration:', error)
    return NextResponse.json(
      { error: 'Failed to create mosque registration' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve registration status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const registrationId = searchParams.get('registrationId')

    if (!userId && !registrationId) {
      return NextResponse.json(
        { error: 'userId or registrationId is required' },
        { status: 400 }
      )
    }

    let registration

    if (registrationId) {
      registration = await prisma.masjidRegistration.findUnique({
        where: { id: registrationId },
        include: { user: { select: { email: true, nama: true } } }
      })
    } else if (userId) {
      registration = await prisma.masjidRegistration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, nama: true } } }
      })
    }

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: registration })

  } catch (error) {
    console.error('Error fetching mosque registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mosque registration' },
      { status: 500 }
    )
  }
}
