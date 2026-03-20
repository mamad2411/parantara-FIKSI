import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Singleton pool — reused across requests in dev (HMR safe)
const globalForPg = globalThis as unknown as { pgPool?: Pool }
const pool: Pool = globalForPg.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool

const stripFile = (val: unknown): string | null => {
  if (!val) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && 'name' in val) return (val as { name: string }).name
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

    const { rows } = await pool.query(
      `SELECT id, "userId", "mosqueName", status, "rejectionReason", "fieldFeedback", "createdAt"
       FROM masjid_registrations WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5`,
      [userId]
    )
    return NextResponse.json({ data: rows })
  } catch (err) {
    console.error('[GET /api/masjid-registration]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...formData } = body

    if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })
    if (!formData.mosqueName || !formData.mosqueAddress || !formData.emailPerwakilan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Check duplicate
    const dup = await pool.query(
      `SELECT id FROM masjid_registrations WHERE "userId" = $1 AND status IN ('pending','approved') LIMIT 1`,
      [userId]
    )
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'Anda sudah memiliki pendaftaran yang sedang diproses' }, { status: 409 })
    }

    const { randomUUID } = await import('crypto')
    const id = randomUUID()
    const userEmail = (formData.adminEmail || formData.emailPerwakilan || '').toLowerCase().trim()

    await pool.query(
      `INSERT INTO masjid_registrations (
        id, "userId",
        "mosqueName", "mosqueAddress", province, regency, district, village, rt, rw, "mosqueImage",
        "aktaPendirian", "skKemenkumham", "npwpDokumen", "suratPernyataan",
        "jenisID", "fotoKTP", "imageKTP", "namaLengkap", "jenisKelamin", pekerjaan,
        "emailPerwakilan", "tanggalLahir", "nomorHandphone", "alamatTempat",
        "adminEmail", "adminPassword", status, "createdAt", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,''::text,'pending',NOW(),NOW()
      )`,
      [
        id,                                        // $1
        userId,                                    // $2
        formData.mosqueName,                       // $3
        formData.mosqueAddress,                    // $4
        formData.province || '',                   // $5
        formData.regency || '',                    // $6
        formData.district || '',                   // $7
        formData.village || '',                    // $8
        formData.rt || '',                         // $9
        formData.rw || '',                         // $10
        stripFile(formData.mosqueImage),           // $11
        stripFile(formData.aktaPendirian),         // $12
        stripFile(formData.skKemenkumham),         // $13
        stripFile(formData.npwpDokumen),           // $14
        stripFile(formData.suratPernyataan),       // $15
        formData.jenisID || 'KTP',                 // $16
        stripFile(formData.fotoKTP),               // $17
        stripFile(formData.imageKTP),              // $18
        formData.namaLengkap || '',                // $19
        formData.jenisKelamin || '',               // $20
        formData.pekerjaan || '',                  // $21
        formData.emailPerwakilan,                  // $22
        formData.tanggalLahir || '',               // $23
        formData.nomorHandphone || '',             // $24
        formData.alamatTempat || '',               // $25
        userEmail,                                 // $26 adminEmail
      ]
    )

    // Notify SuperAdmin (fire-and-forget)
    const superAdminUrl = process.env.SUPERADMIN_URL || 'http://localhost:8000'
    fetch(`${superAdminUrl}/api/registrations/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Key': process.env.INTERNAL_API_KEY || '' },
      body: JSON.stringify({ registrationId: id }),
    }).catch(() => {})

    return NextResponse.json({ success: true, registrationId: id })
  } catch (err: any) {
    console.error('[POST /api/masjid-registration]', err)
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Pendaftaran dengan data ini sudah ada' }, { status: 409 })
    }
    return NextResponse.json({ error: err?.message || 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
