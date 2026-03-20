import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const globalForPg = globalThis as unknown as { pgPool?: Pool }
const pool: Pool = globalForPg.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { rows } = await pool.query(
      `SELECT filename, mimetype, data FROM uploaded_files WHERE id = $1`,
      [params.id]
    )
    if (!rows.length) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })

    const { filename, mimetype, data } = rows[0]
    const buffer = Buffer.from(data, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimetype,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: any) {
    console.error('[GET /api/files]', err)
    return NextResponse.json({ error: 'Gagal mengambil file' }, { status: 500 })
  }
}
