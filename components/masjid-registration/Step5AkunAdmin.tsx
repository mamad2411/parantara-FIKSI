// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCircle, Shield, Mail, Smartphone, Key, Check, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Step5Props {
  formData: any
  setFormData: (data: any) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
}

export default function Step5AkunAdmin({ formData, setFormData, showPassword, setShowPassword }: Step5Props) {
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get logged in user email from localStorage
    const email = localStorage.getItem('userEmail') || ""
    setUserEmail(email)
    setFormData({...formData, adminEmail: email})
  }, [])
  const [enable2FA, setEnable2FA] = useState(false)
  const [method2FA, setMethod2FA] = useState<"email" | "sms" | "app">("email")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setBackupCodes(codes)
    setShowBackupCodes(true)
  }
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
          <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          <span>Keamanan Akun Admin</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Tingkatkan keamanan akun masjid Anda dengan Two-Factor Authentication
        </p>
      </div>

      {/* Current Account Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-indigo-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
          <span>Akun Admin Terdaftar</span>
        </h3>
        <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-indigo-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Email Admin:</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{userEmail || "Loading..."}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
            Akun ini akan digunakan untuk mengelola masjid di platform DanaMasjid
          </p>
        </div>
      </div>

      {/* 2FA Security Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-sm sm:text-base font-semibold">Two-Factor Authentication (2FA)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Tambahkan lapisan keamanan ekstra untuk melindungi akun masjid Anda
            </p>
          </div>
          <Switch
            checked={enable2FA}
            onCheckedChange={setEnable2FA}
            className="ml-4 flex-shrink-0"
          />
        </div>

        {enable2FA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-4 mt-4 pt-4 border-t border-blue-200"
          >
            {/* 2FA Method Selection */}
            <div>
              <Label className="text-xs sm:text-sm font-semibold mb-3 block">
                Pilih Metode Verifikasi
              </Label>
              <div className="grid gap-3">
                {/* Email Method */}
                <button
                  type="button"
                  onClick={() => setMethod2FA("email")}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    method2FA === "email"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <Mail className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${method2FA === "email" ? "text-blue-600" : "text-slate-400"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold">Email OTP</span>
                      {method2FA === "email" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-1">
                      Kode verifikasi akan dikirim ke email terdaftar
                    </p>
                  </div>
                </button>

                {/* SMS Method */}
                <button
                  type="button"
                  onClick={() => setMethod2FA("sms")}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    method2FA === "sms"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <Smartphone className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${method2FA === "sms" ? "text-blue-600" : "text-slate-400"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold">SMS OTP</span>
                      {method2FA === "sms" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-1">
                      Kode verifikasi akan dikirim via SMS
                    </p>
                  </div>
                </button>

                {/* Authenticator App Method */}
                <button
                  type="button"
                  onClick={() => setMethod2FA("app")}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    method2FA === "app"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <Key className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${method2FA === "app" ? "text-blue-600" : "text-slate-400"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold">Authenticator App</span>
                      {method2FA === "app" && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 mt-1">
                      Gunakan Google Authenticator atau Microsoft Authenticator
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone Number Input for SMS */}
            {method2FA === "sms" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="phone2fa" className="text-xs sm:text-sm">Nomor Telepon</Label>
                <input
                  id="phone2fa"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </motion.div>
            )}

            {/* Generate Backup Codes Button */}
            {!showBackupCodes && (
              <button
                type="button"
                onClick={generateBackupCodes}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Generate Backup Codes
              </button>
            )}

            {/* Backup Codes Display */}
            {showBackupCodes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-yellow-900">Backup Codes</h4>
                    <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">
                      Simpan kode-kode ini di tempat aman. Gunakan jika Anda kehilangan akses ke metode 2FA.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-yellow-200 font-mono text-[10px] sm:text-xs text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = backupCodes.join("\n")
                    navigator.clipboard.writeText(text)
                  }}
                  className="mt-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Copy All Codes
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-900">
            <p className="font-semibold mb-1">Mengapa 2FA Penting?</p>
            <ul className="space-y-0.5 sm:space-y-1 text-blue-800">
              <li>• Melindungi akun dari akses tidak sah</li>
              <li>• Mencegah pencurian data donasi</li>
              <li>• Meningkatkan kepercayaan donatur</li>
              <li>• Dapat dinonaktifkan kapan saja dari dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
