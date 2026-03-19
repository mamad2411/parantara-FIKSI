-- =============================================================
-- Prisma schema tables — 100% sync dengan api/prisma/schema.prisma
-- Semua nama kolom camelCase sesuai Prisma (tanpa @map override)
-- =============================================================

-- users (@@map("users"))
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    nama        TEXT NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- masjid (@@map("masjid"))
CREATE TABLE IF NOT EXISTS masjid (
    id          TEXT PRIMARY KEY,
    nama        TEXT NOT NULL,
    alamat      TEXT NOT NULL,
    deskripsi   TEXT,
    gambar      TEXT,
    email       TEXT,
    telepon     TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- program (@@map("program"))
CREATE TABLE IF NOT EXISTS program (
    id          TEXT PRIMARY KEY,
    nama        TEXT NOT NULL,
    deskripsi   TEXT NOT NULL,
    target      DECIMAL(15,2) NOT NULL,
    terkumpul   DECIMAL(15,2) NOT NULL DEFAULT 0,
    gambar      TEXT,
    status      TEXT NOT NULL DEFAULT 'aktif',
    "masjidId"  TEXT NOT NULL REFERENCES masjid(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- donasi (@@map("donasi"))
CREATE TABLE IF NOT EXISTS donasi (
    id            TEXT PRIMARY KEY,
    jumlah        DECIMAL(15,2) NOT NULL,
    nama          TEXT NOT NULL,
    email         TEXT,
    telepon       TEXT,
    pesan         TEXT,
    anonim        BOOLEAN NOT NULL DEFAULT false,
    status        TEXT NOT NULL DEFAULT 'pending',
    "metodeBayar" TEXT,
    "masjidId"    TEXT NOT NULL REFERENCES masjid(id) ON DELETE CASCADE,
    "programId"   TEXT REFERENCES program(id) ON DELETE SET NULL,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- masjid_registrations (@@map("masjid_registrations"))
CREATE TABLE IF NOT EXISTS masjid_registrations (
    id                    TEXT PRIMARY KEY,
    "userId"              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Step 1: Data Masjid
    "mosqueName"          TEXT NOT NULL,
    "mosqueAddress"       TEXT NOT NULL,
    province              TEXT NOT NULL,
    regency               TEXT NOT NULL,
    district              TEXT NOT NULL,
    village               TEXT NOT NULL,
    "postalCode"          TEXT NOT NULL,
    "mosqueImage"         TEXT,

    -- Step 2: Data Legalitas
    "aktaPendirian"       TEXT,
    "skKemenkumham"       TEXT,
    "npwpMasjid"          TEXT,

    -- Step 3: Data Pengurus
    "namaDepan"           TEXT NOT NULL,
    "namaBelakang"        TEXT NOT NULL,
    "jenisKelamin"        TEXT NOT NULL,
    pekerjaan             TEXT NOT NULL,
    "isPemilikBisnis"     BOOLEAN NOT NULL DEFAULT false,
    "emailPerwakilan"     TEXT NOT NULL,
    "tanggalLahir"        TEXT NOT NULL,
    "nomorHandphone"      TEXT NOT NULL,
    "alamatTempat"        TEXT NOT NULL,
    "jenisID"             TEXT NOT NULL DEFAULT 'KTP',
    "fotoKTP"             TEXT,
    "nomorKTP"            TEXT NOT NULL,
    "suratKuasa"          TEXT,
    "kontakPersonSama"    BOOLEAN NOT NULL DEFAULT true,

    -- Step 4: Upload Dokumen
    "skKepengurusan"      TEXT,
    "suratRekomendasiRTRW" TEXT,
    "fotoTampakDepan"     TEXT,
    "fotoInterior"        TEXT,
    "dokumenStatusTanah"  TEXT,
    "ktpKetua"            TEXT,
    "npwpDokumen"         TEXT,

    -- Step 5: Akun Admin
    "adminEmail"          TEXT NOT NULL,
    "adminPassword"       TEXT NOT NULL,

    -- Status review
    status                TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason"     TEXT,
    "fieldFeedback"       JSONB,
    "approvedAt"          TIMESTAMPTZ,
    "approvedBy"          TEXT,

    "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email                    ON users(email);
CREATE INDEX IF NOT EXISTS idx_program_masjid_id              ON program("masjidId");
CREATE INDEX IF NOT EXISTS idx_donasi_masjid_id               ON donasi("masjidId");
CREATE INDEX IF NOT EXISTS idx_donasi_program_id              ON donasi("programId");
CREATE INDEX IF NOT EXISTS idx_masjid_reg_user_id             ON masjid_registrations("userId");
CREATE INDEX IF NOT EXISTS idx_masjid_reg_status              ON masjid_registrations(status);
CREATE INDEX IF NOT EXISTS idx_masjid_reg_created_at          ON masjid_registrations("createdAt");

-- Auto-update updatedAt trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to all tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['users','masjid','program','donasi','masjid_registrations']
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
             CREATE TRIGGER trg_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            t, t
        );
    END LOOP;
END;
$$;
