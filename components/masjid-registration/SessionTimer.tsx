"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSessionTimeRemaining,
  formatTimeRemaining,
  clearRegistrationSession,
  isSessionExpiringSoon,
} from "@/lib/registration-session";
import { AlertCircle, Clock } from "lucide-react";

export function SessionTimer() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Update timer setiap 1 menit
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);
      setShowWarning(isSessionExpiringSoon());

      // Jika session expired, redirect ke login
      if (remaining === 0) {
        clearRegistrationSession();
        router.push("/login?expired=true");
      }
    }, 60000); // Check every minute

    // Initial check
    const remaining = getSessionTimeRemaining();
    setTimeRemaining(remaining);
    setShowWarning(isSessionExpiringSoon());

    return () => clearInterval(interval);
  }, [router]);

  if (timeRemaining === 0) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        showWarning
          ? "bg-red-50 border border-red-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {showWarning ? (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3
            className={`font-semibold text-sm ${
              showWarning ? "text-red-900" : "text-blue-900"
            }`}
          >
            {showWarning ? "Sesi Akan Berakhir!" : "Waktu Pendaftaran"}
          </h3>
          <p
            className={`text-xs mt-1 ${
              showWarning ? "text-red-700" : "text-blue-700"
            }`}
          >
            {showWarning
              ? "Segera selesaikan pendaftaran Anda"
              : "Selesaikan dalam"}{" "}
            <span className="font-semibold">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
