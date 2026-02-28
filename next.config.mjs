/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  // Optimize production build
  compress: true,
  poweredByHeader: false,
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // XSS Protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS Filter
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Cross-Origin-Opener-Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          // Cross-Origin-Embedder-Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          // Cross-Origin-Resource-Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com https://vercel.live https://apis.google.com https://accounts.google.com https://*.firebaseapp.com https://*.googleapis.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.google.com https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com https://danamasjid-api.danamsjid-api.workers.dev https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com wss://*.pusher.com https://www.emsifa.com",
              "frame-src 'self' https://www.google.com https://vercel.live https://accounts.google.com https://*.firebaseapp.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; ')
          }
        ],
      },
    ]
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
}

export default nextConfig
