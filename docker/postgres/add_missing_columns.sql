ALTER TABLE masjid_registrations ADD COLUMN IF NOT EXISTS rt text NOT NULL DEFAULT '';
ALTER TABLE masjid_registrations ADD COLUMN IF NOT EXISTS rw text NOT NULL DEFAULT '';
ALTER TABLE masjid_registrations ADD COLUMN IF NOT EXISTS "suratPernyataan" text;
ALTER TABLE masjid_registrations ADD COLUMN IF NOT EXISTS "namaLengkap" text NOT NULL DEFAULT '';
