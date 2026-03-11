import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { QueryProvider, SecurityProvider } from "@/components/providers"
import { AuthProvider } from "@/lib/auth-context"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { BackToTop } from "@/components/ui/back-to-top"
import { PageLoadingTransition } from "@/components/ui/page-loading-transition"
import { SuppressExtensionErrors } from "@/components/suppress-extension-errors"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
})

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
        {/* Meta Description */}
        <meta name="description" content="Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah. Gratis 3 bulan pertama untuk masjid yang mendaftar." />
        {/* Preload LCP image */}
        <link rel="preload" href="/images/iphone.webp" as="image" fetchPriority="high" />
      </head>
      <body className={`${fontSans.variable} ${fontSerif.variable} font-sans antialiased`}>
        {/* Defer structured data */}
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
        
        <SuppressExtensionErrors />
        <ScrollProgress />
        <PageLoadingTransition />
        <SecurityProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <CookieConsentBanner />
              <BackToTop />
            </QueryProvider>
          </AuthProvider>
        </SecurityProvider>
      </body>
    </html>
  )
}
