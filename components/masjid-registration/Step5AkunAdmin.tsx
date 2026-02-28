// @ts-nocheck
import { UserCircle, Eye, EyeOff, Shield, Lock, Mail } from "lucide-react"

interface Step5Props {
  formData: any
  setFormData: (data: any) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
}

export default function Step6AkunAdmin({ formData, setFormData, showPassword, setShowPassword }: Step5Props) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
          <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          <span>Buat Akun Admin</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Akun ini akan digunakan untuk mengelola masjid Anda di platform DanaMasjid
        </p>
      </div>

      {/* Security Info */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg sm:rounded-xl">
        <div className="flex items-start gap-2 sm:gap-3">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-blue-900 mb-1.5 sm:mb-2">🔐 Keamanan Akun:</p>
            <ul className="space-y-0.5 sm:space-y-1 text-blue-800">
              <li>• Password minimal 8 karakter</li>
              <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
              <li>• Jangan gunakan password yang mudah ditebak</li>
              <li>• Password akan dienkripsi dengan bcrypt (12 salt rounds)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-indigo-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
          <span>Email Admin</span>
        </h3>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Email Admin <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.adminEmail}
            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="admin@masjid.com"
            required
          />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">Email ini akan digunakan untuk login ke dashboard admin</p>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-100">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span>Password</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.adminPassword}
                onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10 sm:pr-12"
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.adminConfirmPassword}
                onChange={(e) => setFormData({...formData, adminConfirmPassword: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-10 sm:pr-12"
                placeholder="Ketik ulang password"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {formData.adminPassword && formData.adminConfirmPassword && formData.adminPassword !== formData.adminConfirmPassword && (
              <p className="text-[10px] sm:text-xs text-red-600 mt-1.5 sm:mt-2 flex items-center gap-1">
                <span>❌</span> Password tidak cocok
              </p>
            )}
            {formData.adminPassword && formData.adminConfirmPassword && formData.adminPassword === formData.adminConfirmPassword && (
              <p className="text-[10px] sm:text-xs text-green-600 mt-1.5 sm:mt-2 flex items-center gap-1">
                <span>✅</span> Password cocok
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl">
        <p className="text-xs sm:text-sm text-yellow-800">
          <span className="font-semibold">⚠️ Penting:</span> Simpan email dan password Anda dengan aman. 
          Anda akan memerlukan kredensial ini untuk mengakses dashboard admin masjid.
        </p>
      </div>
    </div>
  )
}
