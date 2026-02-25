import { prisma } from '../lib/prisma';

async function main() {
  console.log('Starting seed...');

  // Seed Masjid
  const masjid = await prisma.masjid.create({
    data: {
      nama: 'Masjid Al-Ikhlas',
      alamat: 'Jl. Contoh No. 123, Jakarta',
      deskripsi: 'Masjid yang melayani masyarakat sekitar',
      email: 'info@masjidalikhlas.com',
      telepon: '021-12345678',
    },
  });

  console.log('Created masjid:', masjid);

  // Seed Program
  const program = await prisma.program.create({
    data: {
      nama: 'Renovasi Masjid',
      deskripsi: 'Program renovasi untuk memperbaiki fasilitas masjid',
      target: 100000000,
      terkumpul: 25000000,
      masjidId: masjid.id,
      status: 'aktif',
    },
  });

  console.log('Created program:', program);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
