"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, X, AlertTriangle } from "lucide-react";

interface DeviceVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onResendEmail: () => Promise<void>;
}

export function DeviceVerificationModal({
  isOpen,
  email,
  onClose,
  onResendEmail,
}: DeviceVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      await onResendEmail();
      setResendSuccess(true);
      setResendCooldown(60); // 60 detik cooldown

      // Countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Perangkat Tidak Dikenali
                </h2>
                <p className="text-gray-600 text-sm">
                  Kami mendeteksi login dari perangkat baru. Untuk keamanan akun Anda,
                  silakan verifikasi perangkat ini melalui email.
                </p>
              </div>

              {/* Email info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Email Verifikasi Terkirim
                    </p>
                    <p className="text-xs text-blue-700">
                      Kami telah mengirim link verifikasi ke{" "}
                      <span className="font-semibold">{email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Buka email Anda dan cari email dari DanaMasjid
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Klik link verifikasi dalam email
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Setelah verifikasi, Anda dapat login kembali
                  </p>
                </div>
              </div>

              {/* Resend button */}
              <div className="text-center">
                {resendSuccess ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Email berhasil dikirim ulang!
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending
                      ? "Mengirim..."
                      : resendCooldown > 0
                      ? `Kirim ulang dalam ${resendCooldown}s`
                      : "Tidak menerima email? Kirim ulang"}
                  </button>
                )}
              </div>

              {/* Security note */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>
                    Verifikasi perangkat membantu melindungi akun Anda dari akses tidak sah
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
