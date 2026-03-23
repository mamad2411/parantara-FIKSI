"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, Scale, CreditCard, Users } from "lucide-react"
import { LegalHero } from "@/components/sections/legal-hero"
import { Header, Footer } from "@/components/layout"

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <LegalHero
        variant="terms"
        title="Syarat & Ketentuan"
        subtitle="Aturan Penggunaan Platform"
        description="Ketentuan dan aturan yang mengatur penggunaan platform DanaMasjid untuk memastikan transparansi dan keamanan bagi semua pengguna."
        stats={[
          { value: "100%", label: "Transparansi" },
          { value: "2.5%", label: "Admin Fee" }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 pb-12 pt-16">
        {/* Last Updated */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm text-gray-500 text-center mb-16"
        >
          Terakhir diperbarui: 11 Maret 2026
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
        >
          {/* Penerimaan Syarat */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Penerimaan Syarat
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Dengan mengakses dan menggunakan platform DanaMasjid, Anda menyetujui untuk terikat 
              dengan Syarat & Ketentuan ini. Jika Anda tidak setuju dengan syarat-syarat ini, 
              mohon untuk tidak menggunakan layanan kami.
            </p>
          </motion.section>

          {/* Definisi */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Definisi</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-700">
                  <strong>"Platform"</strong> mengacu pada website, aplikasi mobile, dan semua layanan DanaMasjid.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-700">
                  <strong>"Pengguna"</strong> adalah individu atau organisasi yang menggunakan platform kami.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-700">
                  <strong>"Masjid"</strong> adalah institusi keagamaan yang terdaftar di platform kami.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-700">
                  <strong>"Donasi"</strong> adalah kontribusi finansial yang diberikan melalui platform kami.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Layanan Platform */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-green-600" />
              Layanan Platform
            </h2>
            <p className="text-gray-700 mb-4">DanaMasjid menyediakan layanan berikut:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Platform donasi online untuk masjid</li>
              <li>Sistem manajemen keuangan masjid</li>
              <li>Laporan transparansi keuangan</li>
              <li>Sistem notifikasi dan komunikasi</li>
              <li>Dashboard analitik untuk pengurus masjid</li>
              <li>Integrasi dengan gateway pembayaran</li>
            </ul>
          </motion.section>

          {/* Registrasi dan Akun */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrasi dan Akun</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Persyaratan Registrasi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Berusia minimal 17 tahun</li>
                  <li>Memberikan informasi yang akurat dan lengkap</li>
                  <li>Memiliki alamat email yang valid</li>
                  <li>Untuk masjid: memiliki legalitas yang sah</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tanggung Jawab Akun</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Menjaga kerahasiaan password dan informasi login</li>
                  <li>Bertanggung jawab atas semua aktivitas di akun Anda</li>
                  <li>Segera melaporkan penggunaan akun yang tidak sah</li>
                  <li>Memperbarui informasi akun secara berkala</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Donasi dan Pembayaran */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-green-600" />
              Donasi dan Pembayaran
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Proses Donasi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Donasi bersifat sukarela dan tidak dapat dikembalikan</li>
                  <li>Minimum donasi adalah Rp 10.000</li>
                  <li>Donasi akan langsung disalurkan ke rekening masjid tujuan</li>
                  <li>Bukti donasi akan dikirim melalui email</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Biaya Layanan</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Biaya administrasi 2.5% dari total donasi</li>
                  <li>Biaya gateway pembayaran sesuai ketentuan penyedia</li>
                  <li>Tidak ada biaya tersembunyi</li>
                  <li>Transparansi biaya ditampilkan sebelum konfirmasi</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Metode Pembayaran</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Transfer bank</li>
                  <li>E-wallet (GoPay, OVO, DANA, ShopeePay)</li>
                  <li>Kartu kredit/debit</li>
                  <li>Virtual account</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Kewajiban Pengguna */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kewajiban Pengguna</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Penggunaan yang Dilarang</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Menggunakan platform untuk aktivitas ilegal</li>
                  <li>Memberikan informasi palsu atau menyesatkan</li>
                  <li>Melakukan fraud atau penipuan</li>
                  <li>Mengganggu operasional platform</li>
                  <li>Melanggar hak kekayaan intelektual</li>
                  <li>Menyebarkan konten yang tidak pantas</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Kewajiban Masjid</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Memiliki legalitas dan izin yang sah</li>
                  <li>Menyediakan informasi yang akurat</li>
                  <li>Menggunakan donasi sesuai tujuan yang dinyatakan</li>
                  <li>Memberikan laporan penggunaan dana secara berkala</li>
                  <li>Menjaga transparansi keuangan</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Hak Kekayaan Intelektual */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hak Kekayaan Intelektual</h2>
            <p className="text-gray-700 mb-4">
              Semua konten, fitur, dan fungsionalitas platform DanaMasjid dilindungi oleh hak cipta, 
              merek dagang, dan hak kekayaan intelektual lainnya. Pengguna tidak diperkenankan:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Menyalin, memodifikasi, atau mendistribusikan konten tanpa izin</li>
              <li>Menggunakan logo atau merek dagang DanaMasjid</li>
              <li>Melakukan reverse engineering pada platform</li>
              <li>Membuat karya turunan dari platform kami</li>
            </ul>
          </motion.section>

          {/* Pembatasan Tanggung Jawab */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              Pembatasan Tanggung Jawab
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 mb-4">
                DanaMasjid tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Kerugian yang timbul dari penggunaan platform</li>
                <li>Gangguan layanan karena force majeure</li>
                <li>Tindakan atau kelalaian pihak ketiga</li>
                <li>Kehilangan data akibat kesalahan pengguna</li>
                <li>Penyalahgunaan dana oleh masjid</li>
              </ul>
            </div>
          </motion.section>

          {/* Penghentian Layanan */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Penghentian Layanan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Penghentian oleh Pengguna</h3>
                <p className="text-gray-700">
                  Anda dapat menghentikan penggunaan layanan kapan saja dengan menghapus akun 
                  melalui pengaturan profil atau menghubungi customer service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Penghentian oleh DanaMasjid</h3>
                <p className="text-gray-700 mb-2">
                  Kami berhak menghentikan atau menangguhkan akun Anda jika:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Melanggar Syarat & Ketentuan ini</li>
                  <li>Terlibat dalam aktivitas yang mencurigakan</li>
                  <li>Tidak merespons permintaan verifikasi</li>
                  <li>Atas permintaan otoritas yang berwenang</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Hukum yang Berlaku */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-green-600" />
              Hukum yang Berlaku
            </h2>
            <p className="text-gray-700">
              Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
              Setiap sengketa yang timbul akan diselesaikan melalui Pengadilan Negeri Jakarta Pusat 
              atau melalui mediasi jika memungkinkan.
            </p>
          </motion.section>

          {/* Perubahan Syarat */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perubahan Syarat & Ketentuan</h2>
            <p className="text-gray-700">
              DanaMasjid berhak mengubah Syarat & Ketentuan ini kapan saja. Perubahan akan 
              diberitahukan melalui email atau notifikasi di platform minimal 30 hari sebelum 
              berlaku efektif. Penggunaan berkelanjutan setelah perubahan menandakan persetujuan 
              Anda terhadap syarat yang diperbarui.
            </p>
          </motion.section>

          {/* Kontak */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-green-50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
            <p className="text-gray-700 mb-4">
              Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> legal@danamasjid.com</p>
              <p><strong>Telepon:</strong> +62 21 1234 5678</p>
              <p><strong>Alamat:</strong> Jl. Masjid Raya No. 123, Jakarta 12345</p>
              <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Spacer - 128px gap */}
      <div className="h-32"></div>

      <Footer />
    </div>
  )
}