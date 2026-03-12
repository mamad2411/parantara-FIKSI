"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Shield, Eye, Lock, Users, Database, Mail } from "lucide-react"
import Link from "next/link"
import { SimpleHero } from "@/components/sections/simple-hero"

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <SimpleHero
        title={
          <>
            Kebijakan <br className="hidden md:block" />
            Privasi
          </>
        }
        subtitle="Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda"
      />

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Last Updated */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm text-gray-500 text-center mb-12"
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
          {/* Pendahuluan */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              Pendahuluan
            </h2>
            <p className="text-gray-700 leading-relaxed">
              DanaMasjid berkomitmen untuk melindungi privasi dan keamanan informasi pribadi Anda. 
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan 
              melindungi informasi yang Anda berikan saat menggunakan platform kami.
            </p>
          </section>

          {/* Informasi yang Dikumpulkan */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              Informasi yang Kami Kumpulkan
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Informasi Pribadi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Nama lengkap</li>
                  <li>Alamat email</li>
                  <li>Nomor telepon</li>
                  <li>Alamat tempat tinggal</li>
                  <li>Informasi pembayaran (dienkripsi)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Informasi Masjid</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Nama masjid</li>
                  <li>Alamat masjid</li>
                  <li>Informasi pengurus</li>
                  <li>Rekening bank masjid</li>
                  <li>Program donasi</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Informasi Teknis</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Alamat IP</li>
                  <li>Jenis browser dan perangkat</li>
                  <li>Aktivitas penggunaan platform</li>
                  <li>Cookies dan teknologi pelacakan</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Penggunaan Informasi */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Penggunaan Informasi
            </h2>
            <p className="text-gray-700 mb-4">Kami menggunakan informasi Anda untuk:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Memproses donasi dan transaksi keuangan</li>
              <li>Mengelola akun pengguna dan masjid</li>
              <li>Menyediakan layanan customer support</li>
              <li>Mengirim notifikasi penting terkait layanan</li>
              <li>Meningkatkan keamanan platform</li>
              <li>Menganalisis penggunaan untuk perbaikan layanan</li>
              <li>Mematuhi kewajiban hukum dan regulasi</li>
            </ul>
          </section>

          {/* Keamanan Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              Keamanan Data
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi data Anda:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Enkripsi SSL/TLS untuk semua transmisi data</li>
                <li>Enkripsi database untuk data sensitif</li>
                <li>Autentikasi dua faktor (2FA)</li>
                <li>Monitoring keamanan 24/7</li>
                <li>Audit keamanan berkala</li>
                <li>Akses terbatas berdasarkan prinsip least privilege</li>
              </ul>
            </div>
          </section>

          {/* Berbagi Informasi */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Berbagi Informasi</h2>
            <p className="text-gray-700 mb-4">
              Kami tidak menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga, 
              kecuali dalam situasi berikut:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Dengan persetujuan eksplisit dari Anda</li>
              <li>Untuk memproses pembayaran melalui gateway pembayaran terpercaya</li>
              <li>Ketika diwajibkan oleh hukum atau otoritas yang berwenang</li>
              <li>Untuk melindungi hak, properti, atau keamanan DanaMasjid dan pengguna</li>
            </ul>
          </section>

          {/* Hak Pengguna */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hak Anda</h2>
            <p className="text-gray-700 mb-4">Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mengakses dan melihat data pribadi yang kami simpan</li>
              <li>Memperbarui atau mengoreksi informasi yang tidak akurat</li>
              <li>Menghapus akun dan data pribadi Anda</li>
              <li>Membatasi pemrosesan data tertentu</li>
              <li>Memindahkan data ke platform lain (portabilitas data)</li>
              <li>Menarik persetujuan kapan saja</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies dan Teknologi Pelacakan</h2>
            <p className="text-gray-700 mb-4">
              Kami menggunakan cookies dan teknologi serupa untuk:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Menjaga sesi login Anda</li>
              <li>Mengingat preferensi Anda</li>
              <li>Menganalisis penggunaan website</li>
              <li>Meningkatkan keamanan</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi optimal.
            </p>
          </section>

          {/* Perubahan Kebijakan */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perubahan Kebijakan</h2>
            <p className="text-gray-700">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material 
              akan diberitahukan melalui email atau notifikasi di platform. Penggunaan berkelanjutan 
              setelah perubahan menandakan persetujuan Anda terhadap kebijakan yang diperbarui.
            </p>
          </section>

          {/* Kontak */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              Hubungi Kami
            </h2>
            <p className="text-gray-700 mb-4">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menggunakan hak Anda, 
              silakan hubungi kami:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@danamasjid.com</p>
              <p><strong>Telepon:</strong> +62 21 1234 5678</p>
              <p><strong>Alamat:</strong> Jl. Masjid Raya No. 123, Jakarta 12345</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}