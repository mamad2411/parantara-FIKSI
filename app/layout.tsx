import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { CookieConsentBanner } from "@/components/cookie-consent"
import { QueryProvider } from "@/components/providers"
import { RecaptchaProvider } from "@/components/providers"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "DanaMasjid - Platform Donasi Masjid Transparan & Amanah",
  description: "Platform donasi masjid yang transparan dan terpercaya. Salurkan zakat, infaq, dan sedekah Anda dengan amanah. Gratis 3 bulan pertama untuk masjid yang mendaftar.",
  keywords: ["donasi masjid", "zakat", "infaq", "sedekah", "masjid", "donasi online", "transparansi donasi"],
  authors: [{ name: "DanaMasjid" }],
  creator: "DanaMasjid",
  publisher: "DanaMasjid",
  generator: 'v0.app',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
      </head>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <RecaptchaProvider>
              {children}
              <CookieConsentBanner />
              <Analytics />
            </RecaptchaProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
