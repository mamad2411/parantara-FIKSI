'use client';

import CookieConsent from 'react-cookie-consent';
import { Cookie } from 'lucide-react';

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Terima Semua"
      declineButtonText="Tolak"
      enableDeclineButton
      cookieName="danamasjid-cookie-consent"
      containerClasses="cookie-consent-container"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        alignItems: 'center',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        borderBottom: 'none',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      buttonStyle={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        pointerEvents: 'auto',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        pointerEvents: 'auto',
      }}
      contentStyle={{
        flex: '1 0 300px',
        margin: '0 20px',
        color: '#374151',
      }}
      expires={365}
      onAccept={() => {
        console.log('Cookies accepted');
        // Initialize analytics here
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'granted',
          });
        }
      }}
      onDecline={() => {
        console.log('Cookies declined');
        // Disable analytics here
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
          });
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
          <Cookie className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            🍪 Kami menggunakan cookies untuk meningkatkan pengalaman Anda
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Dengan melanjutkan, Anda menyetujui penggunaan cookies kami.{' '}
            <a
              href="https://www.cookiesandyou.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Pelajari lebih lanjut →
            </a>
          </p>
        </div>
      </div>
    </CookieConsent>
  );
}
