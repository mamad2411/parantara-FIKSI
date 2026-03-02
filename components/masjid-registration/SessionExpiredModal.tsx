"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionExpiredModalProps {
  isOpen: boolean;
}

export function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-red-600" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Sesi Telah Berakhir
              </h2>
              <p className="text-gray-600 mb-6">
                Waktu pendaftaran Anda telah habis (24 jam). Silakan login kembali
                untuk melanjutkan pendaftaran masjid.
              </p>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Data Anda Tersimpan
                    </p>
                    <p className="text-xs text-blue-700">
                      Jangan khawatir, data yang sudah Anda isi akan tersimpan.
                      Anda dapat melanjutkan dari langkah terakhir setelah login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                Login Sekarang
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
