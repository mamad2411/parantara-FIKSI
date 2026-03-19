"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, CheckCircle2, XCircle, Mail, RefreshCw, AlertCircle } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type Status = "pending" | "approved" | "rejected"

interface RegistrationStatus {
  status: Status
  mosqueName?: string
  rejectionReason?: string
  fieldFeedback?: Record<string, { status: string; reason?: string; imageUrl?: string }>
}

export default function MenungguPage() {
  const [mounted, setMounted] = useState(false)
  const [lottieData, setLottieData] = useState<Record<string, unknown> | null>(null)
  const [regStatus, setRegStatus] = useState<RegistrationStatus>({ status: "pending" })
  const [checking, setChecking] = useState(false)

  const fetchStatus = async () => {
    setChecking(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setChecking(false)
        return
      }

      const res = await fetch(`/api/masjid-registration?userId=${userId}`)
      if (res.ok) {
        const json = await res.json()
        // findMany returns array — get latest
        const list = Array.isArray(json.data) ? json.data : [json.data]
        const latest = list[0]
        if (latest) {
          setRegStatus({
            status: latest.status ?? "pending",
            mosqueName: latest.mosqueName,
            rejectionReason: latest.rejectionReason,
            fieldFeedback: latest.fieldFeedback,
          })
        }
      }
    } catch {
      // silently fail — keep showing pending
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchStatus()
  }, [])

  // Load lottie based on status
  useEffect(() => {
    const file =
      regStatus.status === "approved"
        ? import("@/lotie/Document Icon Lottie Animation.json")
        : regStatus.status === "rejected"
        ? import("@/lotie/Stressed Woman at work.json")
        : import("@/lotie/contact us.json")

    file.then((d) => setLottieData(d.default as Record<string, unknown>))
  }, [regStatus.status])

  const rejectedFields = regStatus.fieldFeedback
    ? Object.entries(regStatus.fieldFeedback).filter(([, v]) => v.status === "rejected")
    : []

  const fieldLabels: Record<string, string> = {
    mosqueName: "Nama Masjid", mosqueAddress: "Alamat Masjid", province: "Provinsi",
    regency: "Kota/Kabupaten", district: "Kecamatan", village: "Kelurahan/Desa",
    postalCode: "Kode Pos", mosqueImage: "Foto Masjid", aktaPendirian: "Akta Pendirian",
    skKemenkumham: "SK Kemenkumham", npwpMasjid: "NPWP Masjid",
    namaDepan: "Nama Depan", namaBelakang: "Nama Belakang", fotoKTP: "Foto KTP",
    nomorKTP: "Nomor KTP", emailPerwakilan: "Email Perwakilan",
    nomorHandphone: "No. Handphone", skKepengurusan: "SK Kepengurusan",
    fotoTampakDepan: "Foto Tampak Depan", fotoInterior: "Foto Interior",
  }


  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (mounted && regStatus.status === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-56 h-56 mx-auto mb-4">
            {lottieData
              ? <Lottie animationData={lottieData} loop className="w-full h-full" />
              : <div className="w-full h-full bg-green-100 rounded-full animate-pulse" />}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Pendaftaran Disetujui
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Selamat! 🎉
          </h1>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Pendaftaran masjid <strong>{regStatus.mosqueName || "Anda"}</strong> telah{" "}
            <span className="text-green-600 font-semibold">disetujui</span> oleh tim DanaMasjid.
            Sekarang Anda bisa mulai mengelola donasi masjid.
          </p>

          <div className="space-y-3 mb-8 text-left">
            {[
              { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", title: "Akun Aktif", desc: "Akun admin masjid Anda sudah aktif dan siap digunakan." },
              { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", title: "Email Konfirmasi", desc: "Detail akses telah dikirimkan ke email Anda." },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-start gap-3 p-4 ${bg} rounded-xl`}
              >
                <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Masuk ke Dashboard →
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── REJECTED ──────────────────────────────────────────────────────────────
  if (mounted && regStatus.status === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-56 h-56 mx-auto mb-4">
            {lottieData
              ? <Lottie animationData={lottieData} loop className="w-full h-full" />
              : <div className="w-full h-full bg-red-100 rounded-full animate-pulse" />}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-5"
          >
            <XCircle className="w-4 h-4" />
            Pendaftaran Ditolak
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Mohon Maaf 😔
          </h1>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Pendaftaran masjid <strong>{regStatus.mosqueName || "Anda"}</strong> belum dapat kami setujui.
            Silakan perbaiki data berikut dan daftar kembali.
          </p>

          {/* Global reason */}
          {regStatus.rejectionReason && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4 text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Alasan Penolakan</p>
                <p className="text-red-700 text-sm mt-0.5">{regStatus.rejectionReason}</p>
              </div>
            </motion.div>
          )}

          {/* Per-field feedback */}
          {rejectedFields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-left mb-6"
            >
              <p className="text-sm font-semibold text-gray-700 mb-3">Field yang perlu diperbaiki:</p>
              <div className="space-y-3">
                {rejectedFields.map(([key, val], i) => (
                  <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-800">
                      ❌ {fieldLabels[key] ?? key}
                    </p>
                    {val.reason && (
                      <p className="text-sm text-red-700 mt-1">{val.reason}</p>
                    )}
                    {val.imageUrl && (
                      <img
                        src={val.imageUrl}
                        alt="bukti"
                        className="mt-2 max-h-40 rounded-lg border border-red-200 cursor-pointer"
                        onClick={() => window.open(val.imageUrl, "_blank")}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/daftar-masjid"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors text-sm"
            >
              Daftar Ulang
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── PENDING (default) ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <div className="w-64 h-64 mx-auto mb-4">
          {lottieData
            ? <Lottie animationData={lottieData} loop className="w-full h-full" />
            : <div className="w-full h-full bg-blue-100 rounded-full animate-pulse" />}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-5"
        >
          <Clock className="w-4 h-4" />
          Sedang Ditinjau
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Pendaftaran Berhasil Dikirim
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          Terima kasih telah mendaftarkan masjid Anda. Tim kami sedang meninjau data yang Anda kirimkan.
          Proses verifikasi biasanya memakan waktu <strong>1–3 hari kerja</strong>.
        </p>

        <div className="space-y-3 mb-8 text-left">
          {[
            { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", title: "Data Diterima", desc: "Formulir pendaftaran masjid Anda telah berhasil kami terima." },
            { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", title: "Proses Verifikasi", desc: "Tim admin DanaMasjid sedang memverifikasi kelengkapan dokumen Anda." },
            { icon: Mail, color: "text-purple-600", bg: "bg-purple-50", title: "Notifikasi Email", desc: "Kami akan mengirimkan email konfirmasi setelah proses verifikasi selesai." },
          ].map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-start gap-3 p-4 ${bg} rounded-xl`}
            >
              <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={fetchStatus}
            disabled={checking}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            Cek Status
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors text-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
