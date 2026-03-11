/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Complex Security Headers Configuration
  async headers() {
    // Only apply strict security headers in production
    if (process.env.NODE_ENV !== 'production') {
      return []
    }
    
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
          // Comprehensive CSP with Trusted Types
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.google.com https://www.recaptcha.net https://apis.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://www.google.com https://www.recaptcha.net https://recaptcha.net https://danamasjid.firebaseapp.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
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
      // Cache static assets aggressively
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig

// Cloudflare integration - uncomment after installing @opennextjs/cloudflare
// import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev())
