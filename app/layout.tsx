import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { QueryProvider, RecaptchaProvider, SecurityProvider } from "@/components/providers"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { BackToTop } from "@/components/ui/back-to-top"
import { SuppressExtensionErrors } from "@/components/suppress-extension-errors"
import "./globals.css"
import { PageLoadingTransition } from "@/components/ui/page-loading-transition"

export const metadata: Metadata = {
  title: "DanaMasjid - Platform Donasi Masjid Transparan & Amanah",
  description: "Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah. Gratis 3 bulan pertama untuk masjid yang mendaftar.",
  keywords: ["donasi masjid", "zakat", "infaq", "sedekah", "masjid", "donasi online", "transparansi donasi"],
  authors: [{ name: "DanaMasjid" }],
  creator: "DanaMasjid",
  publisher: "DanaMasjid",
  generator: 'byHidupTebe',
  manifest: '/favicon_io/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://danamasjid.com',
    title: 'DanaMasjid - Platform Donasi Masjid Transparan & Amanah',
    description: 'Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah.',
    siteName: 'DanaMasjid',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DanaMasjid - Platform Donasi Masjid Transparan & Amanah',
    description: 'Platform donasi masjid yang transparan dan terpercaya.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico' },
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon_io/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  metadataBase: new URL('https://danamasjid.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Viewport - required to avoid 300ms tap delay on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Console ASCII art */}
        <script src="/console-art.js" />
        
        {/* Only preconnect to origins that will actually be used on login page */}
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://danamasjid.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        
        {/* Meta Description */}
        <meta name="description" content="Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah. Gratis 3 bulan pertama untuk masjid yang mendaftar." />

        {/* Scroll restoration — keep position on refresh */}
        <script
          id="scroll-restoration"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                var key = 'sr_' + location.pathname;
                var saved = sessionStorage.getItem(key);
                if (saved) {
                  requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                      window.scrollTo(0, parseInt(saved, 10));
                    });
                  });
                }
                window.addEventListener('beforeunload', function() {
                  sessionStorage.setItem(key, String(window.scrollY));
                });
              })();
            `
          }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {/* Defer all structured data to after interactive */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DanaMasjid",
              "url": "https://danamasjid.com",
              "logo": "https://danamasjid.com/favicon_io/android-chrome-512x512.png",
              "description": "Platform donasi masjid yang transparan dan terpercaya",
              "sameAs": [
                "https://www.facebook.com/danamasjid",
                "https://www.instagram.com/danamasjid",
                "https://twitter.com/danamasjid"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "info@danamasjid.com"
              }
            })
          }}
        />
        
        {/* Structured Data for WebSite */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DanaMasjid",
              "url": "https://danamasjid.com",
              "description": "Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://danamasjid.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Service Worker Registration */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
        
        <SuppressExtensionErrors />
        <ScrollProgress />
        <PageLoadingTransition />
        <SecurityProvider>
          <QueryProvider>
            <RecaptchaProvider>
              {children}
              <CookieConsentBanner />
              {/* <BackToTop /> - Temporarily disabled to fix hydration issues */}
            </RecaptchaProvider>
          </QueryProvider>
        </SecurityProvider>
      </body>
    </html>
  )
}
