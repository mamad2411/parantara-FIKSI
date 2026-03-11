'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface RecaptchaProviderProps {
  children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  // reCAPTCHA v3 Site Key (public key - aman untuk di frontend)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Disable reCAPTCHA di development atau kalau key masih placeholder / belum diisi benar
  const isDev = process.env.NODE_ENV === 'development';
  const isPlaceholder =
    !recaptchaSiteKey ||
    recaptchaSiteKey === 'your_recaptcha_site_key_here' ||
    recaptchaSiteKey.startsWith('your_recaptcha_site_key');

  if (isDev || isPlaceholder) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      container={{
        parameters: {
          badge: 'bottomright', // Position of reCAPTCHA badge
          theme: 'light',
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
