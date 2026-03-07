/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  
  // Enable source maps for production debugging
  productionBrowserSourceMaps: true,
  
  // Optimize build output
  swcMinify: true,
  
  // Generate unique build IDs to prevent cache issues
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  
  // Complex Security Headers Configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // DNS Prefetch Control - Allow DNS prefetching for performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // HSTS - Force HTTPS for 2 years including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS Protection (legacy but still useful)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy - Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
          },
          // COOP - Relaxed for GTM compatibility but still secure
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          // COEP - Allow cross-origin resources
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          // CORP - Allow same-site and cross-origin
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          // Comprehensive CSP - Relaxed for compatibility with Google services
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://maps.googleapis.com https://apis.google.com https://accounts.google.com https://ssl.gstatic.com https://www.google-analytics.com https://tagmanager.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://tagmanager.google.com",
              "img-src 'self' data: blob: https: *",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.workers.dev https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.emsifa.com wss://ws-us3.pusher.com wss://*.pusher.com",
              "frame-src 'self' https://www.google.com https://www.recaptcha.net https://recaptcha.net https://*.firebaseapp.com https://accounts.google.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "manifest-src 'self'",
              "media-src 'self' blob: data:",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Additional security headers
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'X-Download-Options',
            value: 'noopen'
          },
          {
            key: 'Expect-CT',
            value: 'max-age=86400, enforce'
          }
        ],
      },
    ]
  },
}

export default nextConfig
