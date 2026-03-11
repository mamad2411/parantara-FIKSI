import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { QueryProvider, RecaptchaProvider, SecurityProvider } from "@/components/providers"
import { AuthProvider } from "@/lib/auth-context"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { BackToTop } from "@/components/ui/back-to-top"
import { PageLoadingTransition } from "@/components/ui/page-loading-transition"
import { SuppressExtensionErrors } from "@/components/suppress-extension-errors"
import { TrustedTypesSetup } from "@/components/security/trusted-types"
import "./globals.css"

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
    <html lang="id">
      <head>
        {/* DNS prefetch for external domains we actually use */}
        <link rel="dns-prefetch" href="//danamasjid.firebaseapp.com" />
        <link rel="dns-prefetch" href="//identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="//apis.google.com" />
        
        {/* Preconnect only for critical external resources */}
        <link rel="preconnect" href="https://danamasjid.firebaseapp.com" />
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="" />
        
        {/* Critical CSS inline - moved from globals.css */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html{scroll-behavior:auto;overflow-x:hidden;overflow-y:scroll}
            body{overflow-x:hidden;position:relative;background-color:white;margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif}
            html,body{max-width:100vw;background-color:white}
            #__next{overflow:visible}
            body{overflow:visible!important}
            .min-h-screen{min-height:100vh}
            .bg-white{background-color:white}
            .flex{display:flex}
            .items-center{align-items:center}
            .justify-center{justify-content:center}
            .w-full{width:100%}
            .relative{position:relative}
            .loading-spinner{width:2rem;height:2rem;border:2px solid #e5e7eb;border-top:2px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite}
            @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            .font-sans{font-family:system-ui,-apple-system,sans-serif}
            .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
          `
        }} />
        
        {/* Meta Description */}
        <meta name="description" content="Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah. Gratis 3 bulan pertama untuk masjid yang mendaftar." />
      </head>
      <body className={`font-sans antialiased`}>
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
        
        {/* Performance Monitoring */}
        <Script
          src="/performance-monitor.js"
          strategy="afterInteractive"
        />
        
        <SuppressExtensionErrors />
        <TrustedTypesSetup />
        <ScrollProgress />
        <PageLoadingTransition />
        <SecurityProvider>
          <AuthProvider>
            <QueryProvider>
              <RecaptchaProvider>
                {children}
                <CookieConsentBanner />
                <BackToTop />
              </RecaptchaProvider>
            </QueryProvider>
          </AuthProvider>
        </SecurityProvider>
      </body>
    </html>
  )
}
