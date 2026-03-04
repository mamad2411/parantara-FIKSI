"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Book, BookPage } from "@/components/ui/book"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface PolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PolicyModal({ open, onOpenChange }: PolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 border-b">
          <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center pr-8">
            Kebijakan Privasi & Syarat Ketentuan
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(95vh-60px)] sm:h-[calc(90vh-80px)] md:h-[calc(90vh-100px)] px-2 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <Book>
            {/* Page 1 - Cover & Introduction */}
            <BookPage pageNumber={1}>
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 md:space-y-6 py-8 sm:py-12 md:py-16">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900">DanaMasjid</h1>
                <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 bg-amber-600" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-amber-800 leading-tight">
                  Kebijakan Privasi &<br />Syarat Ketentuan
                </h2>
                <p className="text-xs sm:text-sm text-amber-700 mt-4 sm:mt-6 md:mt-8">
                  Terakhir diperbarui: Maret 2026
                </p>
              </div>
            </BookPage>

            {/* Page 2 - Pendahuluan */}
            <BookPage pageNumber={2}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Pendahuluan</h3>
              <p className="mb-3 sm:mb-4">
                Selamat datang di DanaMasjid. Kami berkomitmen untuk melindungi privasi Anda dan 
                memastikan transparansi dalam setiap transaksi donasi yang dilakukan melalui platform kami.
              </p>
              <p className="mb-3 sm:mb-4">
                Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi 
                informasi pribadi Anda saat menggunakan layanan DanaMasjid.
              </p>
              <h4 className="font-semibold mt-4 sm:mt-6 mb-2">Ruang Lingkup</h4>
              <p>
                Kebijakan ini berlaku untuk semua pengguna platform DanaMasjid, termasuk donatur, 
                pengurus masjid, dan administrator.
              </p>
            </BookPage>

            {/* Page 3 - Informasi yang Dikumpulkan */}
            <BookPage pageNumber={3}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Informasi yang Kami Kumpulkan</h3>
              
              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">1. Informasi Pribadi</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                <li>Nama lengkap</li>
                <li>Alamat email</li>
                <li>Nomor telepon</li>
                <li>Alamat</li>
                <li>Informasi pembayaran</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">2. Informasi Masjid</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                <li>Nama masjid</li>
                <li>Alamat lengkap</li>
                <li>Dokumen legalitas</li>
                <li>Data pengurus</li>
                <li>Rekening bank</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">3. Informasi Transaksi</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                <li>Riwayat donasi</li>
                <li>Jumlah dan tanggal transaksi</li>
                <li>Metode pembayaran</li>
                <li>Status transaksi</li>
              </ul>
            </BookPage>

            {/* Page 4 - Penggunaan Informasi */}
            <BookPage pageNumber={4}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Penggunaan Informasi</h3>
              
              <p className="mb-3 sm:mb-4">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Layanan Utama</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>Memproses donasi dan transaksi keuangan</li>
                <li>Mengirimkan konfirmasi dan tanda terima donasi</li>
                <li>Menyediakan laporan keuangan transparan</li>
                <li>Verifikasi identitas dan keamanan akun</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Komunikasi</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>Mengirim notifikasi penting terkait akun</li>
                <li>Update program dan kegiatan masjid</li>
                <li>Newsletter dan informasi layanan</li>
                <li>Dukungan pelanggan</li>
              </ul>
            </BookPage>

            {/* Page 5 - Keamanan Data */}
            <BookPage pageNumber={5}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Keamanan Data</h3>
              
              <p className="mb-3 sm:mb-4">
                Kami menerapkan langkah-langkah keamanan tingkat tinggi untuk melindungi data Anda:
              </p>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Teknologi Keamanan</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>Enkripsi SSL/TLS untuk semua transmisi data</li>
                <li>Penyimpanan data terenkripsi</li>
                <li>Autentikasi dua faktor (2FA)</li>
                <li>Monitoring keamanan 24/7</li>
                <li>Backup data berkala</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Akses Terbatas</h4>
              <p className="text-xs sm:text-sm">
                Hanya personel yang berwenang yang memiliki akses ke informasi pribadi Anda, 
                dan mereka terikat oleh kewajiban kerahasiaan.
              </p>
            </BookPage>

            {/* Page 6 - Hak Pengguna */}
            <BookPage pageNumber={6}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Hak Pengguna</h3>
              
              <p className="mb-3 sm:mb-4">Anda memiliki hak untuk:</p>

              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Akses:</strong> Meminta salinan data pribadi yang kami simpan
                </li>
                <li>
                  <strong>Koreksi:</strong> Memperbarui atau memperbaiki informasi yang tidak akurat
                </li>
                <li>
                  <strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda
                </li>
                <li>
                  <strong>Portabilitas:</strong> Menerima data Anda dalam format yang dapat dibaca mesin
                </li>
                <li>
                  <strong>Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu
                </li>
                <li>
                  <strong>Penarikan Persetujuan:</strong> Menarik persetujuan kapan saja
                </li>
              </ul>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm">
                Untuk menggunakan hak-hak ini, silakan hubungi kami di danamasjid48@gmail.com
              </p>
            </BookPage>

            {/* Page 7 - Syarat Ketentuan */}
            <BookPage pageNumber={7}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Syarat & Ketentuan</h3>
              
              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">1. Penggunaan Layanan</h4>
              <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                Dengan menggunakan DanaMasjid, Anda setuju untuk menggunakan platform ini 
                sesuai dengan hukum yang berlaku dan tidak untuk tujuan yang melanggar hukum.
              </p>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">2. Akun Pengguna</h4>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                <li>Anda bertanggung jawab menjaga kerahasiaan akun</li>
                <li>Informasi yang diberikan harus akurat dan terkini</li>
                <li>Satu akun per pengguna/masjid</li>
                <li>Tidak boleh berbagi akun dengan pihak lain</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">3. Donasi</h4>
              <p className="text-xs sm:text-sm">
                Semua donasi bersifat final dan tidak dapat dibatalkan kecuali dalam 
                kondisi tertentu yang diatur dalam kebijakan pengembalian dana.
              </p>
            </BookPage>

            {/* Page 8 - Transparansi & Pelaporan */}
            <BookPage pageNumber={8}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Transparansi & Pelaporan</h3>
              
              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Komitmen Transparansi</h4>
              <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                DanaMasjid berkomitmen untuk menyediakan transparansi penuh dalam 
                pengelolaan dana donasi:
              </p>

              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>Laporan keuangan real-time untuk setiap masjid</li>
                <li>Rincian penggunaan dana yang jelas</li>
                <li>Dokumentasi foto/video kegiatan</li>
                <li>Audit berkala oleh pihak independen</li>
              </ul>

              <h4 className="font-semibold mt-3 sm:mt-4 mb-2">Akses Laporan</h4>
              <p className="text-xs sm:text-sm">
                Donatur dapat mengakses laporan penggunaan dana mereka kapan saja 
                melalui dashboard akun mereka.
              </p>
            </BookPage>

            {/* Page 9 - Kontak & Penutup */}
            <BookPage pageNumber={9}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Hubungi Kami</h3>
              
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi atau syarat ketentuan ini, 
                silakan hubungi kami:
              </p>

              <div className="bg-amber-100 p-3 sm:p-4 rounded-lg space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <p><strong>Email:</strong> danamasjid48@gmai.com </p>
                <p><strong>Telepon:</strong> +62 85810117735 </p>
              </div>

              <h4 className="font-semibold mt-4 sm:mt-6 mb-2">Perubahan Kebijakan</h4>
              <p className="text-xs sm:text-sm">
                Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan 
                diberitahukan melalui email atau notifikasi di platform.
              </p>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-[10px] sm:text-xs text-amber-700">
                  Terima kasih telah mempercayai DanaMasjid
                </p>
              </div>
            </BookPage>
          </Book>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
