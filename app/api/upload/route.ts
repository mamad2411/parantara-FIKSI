import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const globalForPg = globalThis as unknown as { pgPool?: Pool }
const pool: Pool = globalForPg.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadedBy = formData.get('uploadedBy') as string | null

    if (!file) return NextResponse.json({ error: 'File diperlukan' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const { randomUUID } = await import('crypto')
    const id = randomUUID()

    await pool.query(
      `INSERT INTO uploaded_files (id, filename, mimetype, size, data, "uploadedBy") VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, file.name, file.type, file.size, base64, uploadedBy || null]
    )

    return NextResponse.json({ id, url: `/api/files/${id}` })
  } catch (err: any) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: err?.message || 'Upload gagal' }, { status: 500 })
  }
}
