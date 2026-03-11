'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode, useState, useEffect } from 'react';

interface RecaptchaProviderProps {
  children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const [shouldLoadRecaptcha, setShouldLoadRecaptcha] = useState(false);
  
  // reCAPTCHA v3 Site Key (public key - aman untuk di frontend)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Disable reCAPTCHA di development atau kalau key masih placeholder / belum diisi benar
  const isDev = process.env.NODE_ENV === 'development';
  const isPlaceholder =
    !recaptchaSiteKey ||
    recaptchaSiteKey === 'your_recaptcha_site_key_here' ||
    recaptchaSiteKey.startsWith('your_recaptcha_site_key');

  // Load reCAPTCHA only when user interacts with forms
  useEffect(() => {
    const handleUserInteraction = () => {
      setShouldLoadRecaptcha(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  if (isDev || isPlaceholder || !shouldLoadRecaptcha) {
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
