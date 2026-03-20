// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  UserCircle, Shield, Mail, KeyRound, Check, AlertCircle,
  Fingerprint, RefreshCw, Copy, Eye, EyeOff, Building2
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Step5Props {
  formData: any
  setFormData: (data: any) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
}

async function generatePassphrase(): Promise<string[]> {
  const { generateMnemonic } = await import("@scure/bip39")
  const { wordlist } = await import("@scure/bip39/wordlists/english.js")
  const mnemonic = generateMnemonic(wordlist, 128) // 12 kata
  return mnemonic.split(" ")
}

export default function Step5AkunAdmin({ formData, setFormData }: Step5Props) {
  const [userEmail, setUserEmail] = useState("")
  const [enable2FA, setEnable2FA] = useState(false)
  const [methods2FA, setMethods2FA] = useState<Set<string>>(new Set())
  const [appSetupStep, setAppSetupStep] = useState<"idle" | "setup" | "done">("idle")

  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [pinConfirm, setPinConfirm] = useState(["", "", "", "", "", ""])
  const [pinError, setPinError] = useState("")
  const [showPin, setShowPin] = useState(false)
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])
  const pinConfirmRefs = useRef<(HTMLInputElement | null)[]>([])

  const [passphrase, setPassphrase] = useState<string[]>([])
  const [passphraseCopied, setPassphraseCopied] = useState(false)
  const [passphraseRevealed, setPassphraseRevealed] = useState(false)

  const [totpSecret, setTotpSecret] = useState("")
  const [totpQR, setTotpQR] = useState("")
  const [totpVerifyCode, setTotpVerifyCode] = useState("")
  const [totpVerified, setTotpVerified] = useState(false)
  const [totpError, setTotpError] = useState("")
  // Whether the app setup panel is open (pending verification — not yet checked)
  const [appSetupOpen, setAppSetupOpen] = useState(false)

  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricStatus, setBiometricStatus] = useState("")

  useEffect(() => {
    // Priority: formData.adminEmail (from Firestore prefill) → formData.emailPerwakilan (from Step3) → localStorage
    const email = formData.adminEmail || formData.emailPerwakilan || localStorage.getItem("userEmail") || ""
    setUserEmail(email)
    generatePassphrase().then(words => setPassphrase(words))
    if (window.PublicKeyCredential) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((ok) => setBiometricSupported(ok)).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (userEmail || passphrase.length) {
      setFormData({ ...formData, adminEmail: userEmail, recoveryPassphrase: passphrase.join(" ") })
    }
  }, [userEmail, passphrase])

  // Sync email if formData gets updated after mount (e.g. Firestore prefill)
  useEffect(() => {
    const email = formData.adminEmail || formData.emailPerwakilan || ""
    if (email && email !== userEmail) {
      setUserEmail(email)
    }
  }, [formData.adminEmail, formData.emailPerwakilan])

  // appSetupStep is driven by toggleMethod — no auto-trigger needed

  const generateTOTP = async () => {
    try {
      const { TOTP, Secret } = await import("otpauth")
      const secret = new Secret({ size: 20 })
      const totp = new TOTP({ issuer: "DanaMasjid", label: userEmail || "admin@danamasjid.id", algorithm: "SHA1", digits: 6, period: 30, secret })
      const b32 = secret.base32
      setTotpSecret(b32)
      setFormData({ ...formData, totpSecret: b32 })
      const QRCode = (await import("qrcode")).default
      const qr = await QRCode.toDataURL(totp.toString(), { width: 180, margin: 1 })
      setTotpQR(qr)
    } catch (e) { console.error(e) }
  }

  const verifyTOTP = async () => {
    if (!totpSecret || totpVerifyCode.length !== 6) return
    try {
      const { TOTP, Secret } = await import("otpauth")
      const totp = new TOTP({ issuer: "DanaMasjid", label: userEmail, algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(totpSecret) })
      const delta = totp.validate({ token: totpVerifyCode, window: 1 })
      if (delta !== null) {
        const next = new Set(methods2FA)
        next.add("app")
        setTotpVerified(true)
        setTotpError("")
        setAppSetupStep("done")
        setAppSetupOpen(false)
        setMethods2FA(next)
        setFormData({ ...formData, totpVerified: true, totpSecret, methods2FA: Array.from(next) })
      } else {
        setTotpError("Kode salah, coba lagi")
      }
    } catch { setTotpError("Verifikasi gagal") }
  }

  const handlePinInput = (index: number, value: string, isConfirm = false) => {
    const val = value.replace(/\D/g, "").slice(-1)
    if (isConfirm) {
      const next = [...pinConfirm]; next[index] = val; setPinConfirm(next)
      if (val && index < 5) pinConfirmRefs.current[index + 1]?.focus()
      const fullPin = pin.join(""), fullConfirm = next.join("")
      if (fullConfirm.length === 6) {
        setPinError(fullPin !== fullConfirm ? "PIN tidak cocok" : "")
        if (fullPin === fullConfirm) setFormData({ ...formData, adminPin: fullPin })
      }
    } else {
      const next = [...pin]; next[index] = val; setPin(next)
      if (val && index < 5) pinRefs.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === "Backspace") {
      const refs = isConfirm ? pinConfirmRefs : pinRefs
      const arr = isConfirm ? [...pinConfirm] : [...pin]
      if (!arr[index] && index > 0) refs.current[index - 1]?.focus()
      else { arr[index] = ""; isConfirm ? setPinConfirm(arr) : setPin(arr) }
    }
  }

  const enableBiometric = async () => {
    try {
      setBiometricStatus("Meminta izin biometrik...")
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "DanaMasjid", id: window.location.hostname },
          user: { id: new TextEncoder().encode(userEmail || "admin"), name: userEmail || "admin@danamasjid.id", displayName: formData.mosqueName || "Admin Masjid" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      })
      if (cred) { setBiometricEnabled(true); setBiometricStatus("Berhasil didaftarkan"); setFormData({ ...formData, biometricEnabled: true }) }
    } catch (e: any) {
      setBiometricStatus(e.name === "NotAllowedError" ? "Izin ditolak" : "Gagal mendaftarkan")
    }
  }

  const toggleMethod = (id: string) => {
    if (id === "app") {
      if (methods2FA.has("app")) {
        // Already verified — uncheck and reset
        setMethods2FA(prev => { const next = new Set(prev); next.delete("app"); return next })
        setAppSetupStep("idle")
        setAppSetupOpen(false)
        setTotpSecret(""); setTotpQR(""); setTotpVerified(false); setTotpVerifyCode("")
        setFormData({ ...formData, methods2FA: Array.from(methods2FA).filter(m => m !== "app") })
      } else if (appSetupOpen) {
        // Panel already open — clicking again closes it (cancel)
        setAppSetupOpen(false)
        setTotpSecret(""); setTotpQR(""); setTotpVerifyCode(""); setTotpError("")
      } else {
        // Open setup panel — do NOT add to methods2FA yet
        setAppSetupOpen(true)
        setAppSetupStep("setup")
        generateTOTP()
      }
      return
    }
    // For other methods (email), toggle normally
    const next = new Set(methods2FA)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setMethods2FA(next)
    setFormData({ ...formData, methods2FA: Array.from(next) })
  }

  const copyPassphrase = () => {
    navigator.clipboard.writeText(passphrase.join(" "))
    setPassphraseCopied(true)
    setTimeout(() => setPassphraseCopied(false), 2000)
  }

  const regeneratePassphrase = async () => {
    const words = await generatePassphrase()
    setPassphrase(words)
    setPassphraseRevealed(false)
    setPassphraseCopied(false)
    setFormData({ ...formData, recoveryPassphrase: words.join(" ") })
  }

  const downloadPDF = () => {
    const words = passphrase
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Recovery Key - DanaMasjid</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
  .header { text-align: center; margin-bottom: 32px; }
  .header h1 { font-size: 24px; color: #1e3a8a; margin: 0 0 4px; }
  .header p { font-size: 13px; color: #6b7280; margin: 0; }
  .warning { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 12px; color: #92400e; }
  .info { margin-bottom: 24px; font-size: 13px; }
  .info span { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #1e3a8a; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
  td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .word { font-family: monospace; font-weight: bold; font-size: 14px; }
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
</style>
</head>
<body>
<div class="header">
  <h1>🔐 Recovery Key - DanaMasjid</h1>
  <p>Dokumen ini bersifat rahasia. Simpan di tempat yang aman.</p>
</div>
<div class="warning">
  ⚠️ <strong>PENTING:</strong> Jangan bagikan recovery key ini kepada siapapun. Gunakan hanya untuk pemulihan akun darurat.
</div>
<div class="info">
  <p>Email Admin: <span>${userEmail || '-'}</span></p>
  <p>Nama Masjid: <span>${formData.mosqueName || '-'}</span></p>
  <p>Tanggal Dibuat: <span>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
</div>
<table>
  <thead><tr><th>#</th><th>Kata</th><th>#</th><th>Kata</th><th>#</th><th>Kata</th></tr></thead>
  <tbody>
    ${[0,1,2,3].map(row => `
    <tr>
      <td>${row*3+1}</td><td class="word">${words[row*3] || ''}</td>
      <td>${row*3+2}</td><td class="word">${words[row*3+1] || ''}</td>
      <td>${row*3+3}</td><td class="word">${words[row*3+2] || ''}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="footer">
  DanaMasjid © ${new Date().getFullYear()} · Platform Donasi Masjid Transparan
</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recovery-key-danamasjid-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputCls = "w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
          <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          <span>Keamanan Akun Admin</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">Atur keamanan akun untuk mengelola masjid Anda</p>
      </div>

      {/* Akun Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-indigo-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
          <span>Akun Admin Terdaftar</span>
        </h3>
        <div className="space-y-3">
          {formData.mosqueName && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Nama Masjid</label>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl">
                <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-gray-900">{formData.mosqueName}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Admin</label>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl">
              <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-gray-900">{userEmail || "Memuat..."}</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500">Akun ini akan digunakan untuk mengelola masjid di platform DanaMasjid</p>
          {formData.mosqueImage && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Foto Masjid</label>
              <img
                src={URL.createObjectURL(formData.mosqueImage)}
                alt="Foto Masjid"
                className="w-full h-56 sm:h-72 object-cover rounded-lg sm:rounded-xl border-2 border-indigo-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* PIN */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-1 sm:mb-2">
          <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span>PIN Keamanan (6 Digit)</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4 sm:mb-5">Digunakan untuk konfirmasi transaksi dan aksi penting</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Buat PIN</label>
            <div className="flex gap-2 sm:gap-3">
              {pin.map((v, i) => (
                <input key={i} ref={(el) => (pinRefs.current[i] = el)}
                  type={showPin ? "text" : "password"} inputMode="numeric" maxLength={1} value={v}
                  onChange={(e) => handlePinInput(i, e.target.value, false)}
                  onKeyDown={(e) => handlePinKeyDown(i, e, false)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Konfirmasi PIN</label>
            <div className="flex gap-2 sm:gap-3">
              {pinConfirm.map((v, i) => (
                <input key={i} ref={(el) => (pinConfirmRefs.current[i] = el)}
                  type={showPin ? "text" : "password"} inputMode="numeric" maxLength={1} value={v}
                  onChange={(e) => handlePinInput(i, e.target.value, true)}
                  onKeyDown={(e) => handlePinKeyDown(i, e, true)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              ))}
            </div>
          </div>
          {pinError && <p className="text-xs text-red-500">{pinError}</p>}
          {!pinError && pin.join("").length === 6 && pinConfirm.join("") === pin.join("") && (
            <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> PIN cocok</p>
          )}
          <button type="button" onClick={() => setShowPin(!showPin)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
          </button>
        </div>
      </div>

      {/* Biometric */}
      {biometricSupported && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span>Biometrik / Fingerprint</span>
              </h3>
              <p className="text-xs text-gray-500">Login lebih cepat dengan sidik jari atau Face ID</p>
              {biometricStatus && (
                <p className={`text-xs mt-2 font-medium ${biometricEnabled ? "text-green-600" : "text-gray-500"}`}>{biometricStatus}</p>
              )}
            </div>
            {!biometricEnabled ? (
              <button type="button" onClick={enableBiometric}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold bg-white border-2 border-green-600 text-green-700 rounded-lg sm:rounded-xl hover:bg-green-50 transition-all flex-shrink-0">
                Aktifkan
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold flex-shrink-0">
                <Check className="w-4 h-4" /> Aktif
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recovery Passphrase (BIP39) */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-yellow-200">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-1 sm:mb-2">
          <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
          <span>Recovery Passphrase</span>
          <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-semibold ml-auto">BIP39 · 12 Kata</span>
        </h3>
        <p className="text-xs text-gray-500 mb-3 sm:mb-4">12 kata acak standar BIP39 untuk pemulihan akun darurat. Simpan di tempat yang aman.</p>

        {/* Grid 12 kata */}
        <div className="relative">
          <div className={`grid grid-cols-3 gap-1.5 sm:gap-2 ${!passphraseRevealed ? "blur-sm select-none pointer-events-none" : ""}`}>
            {passphrase.map((word, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white border-2 border-yellow-200 rounded-lg px-2 py-1.5">
                <span className="text-[10px] text-yellow-600 font-bold w-4 flex-shrink-0">{i + 1}.</span>
                <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900">{word}</span>
              </div>
            ))}
          </div>
          {!passphraseRevealed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button type="button" onClick={() => setPassphraseRevealed(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-xs font-semibold rounded-xl hover:bg-yellow-700 transition-colors shadow-lg">
                <Eye className="w-3.5 h-3.5" /> Tampilkan Passphrase
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {passphraseRevealed && (
            <button type="button" onClick={() => setPassphraseRevealed(false)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
            </button>
          )}
          <button type="button" onClick={copyPassphrase}
            className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 font-semibold transition-colors ml-auto">
            {passphraseCopied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
          </button>
          <button type="button" onClick={downloadPDF}
            className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download
          </button>
          <button type="button" onClick={regeneratePassphrase}
            className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 font-semibold transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Generate Ulang
          </button>
        </div>

        <p className="text-[10px] sm:text-xs text-yellow-700 mt-3 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          Passphrase ini hanya ditampilkan sekali. Pastikan sudah disimpan sebelum melanjutkan.
        </p>
      </div>

      {/* 2FA */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-100">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span>Two-Factor Authentication (2FA)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">Lapisan keamanan ekstra untuk akun masjid Anda</p>
          </div>
          <Switch checked={enable2FA} onCheckedChange={setEnable2FA} className="flex-shrink-0" />
        </div>

        {enable2FA && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}
            className="space-y-3 mt-4 pt-4 border-t border-blue-200">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700">Pilih Metode Verifikasi <span className="text-gray-400 font-normal">(boleh lebih dari 1)</span></label>
            <div className="space-y-2">
              {[
                { id: "app", icon: KeyRound, label: "Authenticator App", desc: "Google / Microsoft Authenticator", badge: "Recommended" },
                { id: "email", icon: Mail, label: "Email OTP", desc: "Kode dikirim ke email terdaftar" },
              ].map(({ id, icon: Icon, label, desc, badge }) => {
                const selected = methods2FA.has(id)
                // For "app": checked only after TOTP verified; pending = setup panel open but not yet verified
                const appPending = id === "app" && appSetupOpen && !selected
                return (
                  <div key={id}>
                    <button type="button" onClick={() => toggleMethod(id)}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        selected ? "border-blue-500 bg-white" : appPending ? "border-blue-300 bg-blue-50/50" : "border-gray-200 bg-white hover:border-blue-300"
                      }`}>
                      {/* Checkbox — locked for "app" until verified */}
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? "bg-blue-600 border-blue-600"
                        : appPending ? "border-blue-400 bg-white"
                        : "border-gray-400"
                      }`}>
                        {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        {appPending && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </div>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${selected || appPending ? "text-blue-600" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{label}</span>
                          {badge && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
                          {id === "app" && appPending && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                              Perlu verifikasi
                            </span>
                          )}
                          {id === "app" && selected && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Terverifikasi
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {id === "app" && appPending ? "Selesaikan setup di bawah untuk mengaktifkan" : desc}
                        </p>
                      </div>
                    </button>

                    {/* Authenticator App Setup — muncul saat panel terbuka, hilang setelah verified */}
                    {id === "app" && appSetupOpen && appSetupStep === "setup" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}
                        className="mt-2 p-3 sm:p-4 bg-white border-2 border-blue-300 rounded-lg sm:rounded-xl space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">!</div>
                          <p className="text-xs text-blue-700 font-semibold">Selesaikan setup untuk mengaktifkan metode ini</p>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">1. Scan QR code dengan Google / Microsoft Authenticator</p>
                        <div className="flex justify-center">
                          {totpQR
                            ? <img src={totpQR} alt="TOTP QR" className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl border-2 border-gray-200" />
                            : <div className="w-36 h-36 bg-gray-100 rounded-xl animate-pulse" />
                          }
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1 text-center">Atau masukkan secret key manual:</p>
                          <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <code className="text-xs font-mono text-gray-900 break-all">{totpSecret}</code>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">2. Masukkan kode 6 digit dari app untuk verifikasi</p>
                          <div className="flex gap-2">
                            <input type="text" inputMode="numeric" maxLength={6} value={totpVerifyCode}
                              onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              className="flex-1 px-3 sm:px-4 py-2.5 text-sm font-mono bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center tracking-widest" />
                            <button type="button" onClick={verifyTOTP}
                              disabled={totpVerifyCode.length !== 6}
                              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                              Verifikasi
                            </button>
                          </div>
                          {totpError && <p className="text-xs text-red-500">{totpError}</p>}
                        </div>
                        <button type="button" onClick={() => { setAppSetupOpen(false); setTotpSecret(""); setTotpQR(""); setTotpVerifyCode(""); setTotpError("") }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Batal
                        </button>
                      </motion.div>
                    )}

                    {/* Success state after verified */}
                    {id === "app" && selected && appSetupStep === "done" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}
                        className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs text-green-700 font-semibold">Authenticator App berhasil terhubung dan diverifikasi</p>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>


    </div>
  )
}
