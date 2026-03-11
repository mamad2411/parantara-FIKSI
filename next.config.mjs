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
  
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: false, // Disable to reduce bundle size
  
  // Generate unique build IDs to prevent cache issues
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'lottie-react'],
    optimizeCss: true,
    // Optimize server components
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    },
  },
  
  // Move serverComponentsExternalPackages to root level
  serverExternalPackages: ['sharp'],
  
  // Enable Turbopack (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable SWC minification
    styledComponents: true,
  },
  
  // Optimize webpack
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 10000, // Smaller minimum size
          maxSize: 50000, // Much smaller chunks for faster loading
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React, Next.js) - keep very small
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
              maxSize: 50000,
            },
            // Animation libraries - completely async and small
            animations: {
              name: 'animations',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](framer-motion|lottie-react|motion-dom|lottie-web)[\\/]/,
              priority: 30,
              enforce: true,
              maxSize: 30000,
            },
            // UI libraries - async and small
            ui: {
              name: 'ui',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](lucide-react|recharts|@radix-ui)[\\/]/,
              priority: 25,
              enforce: true,
              maxSize: 25000,
            },
            // Firebase - separate async chunk
            firebase: {
              name: 'firebase',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              priority: 28,
              enforce: true,
              maxSize: 40000,
            },
            // Utilities - async and very small
            utils: {
              name: 'utils',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority|tailwind-merge)[\\/]/,
              priority: 22,
              enforce: true,
              maxSize: 20000,
            },
            // React ecosystem - separate chunk
            reactEcosystem: {
              name: 'react-ecosystem',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](react-hook-form|react-hot-toast|react-query|@tanstack)[\\/]/,
              priority: 24,
              enforce: true,
              maxSize: 30000,
            },
            // Vendor chunk - much smaller pieces
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              minChunks: 1,
              maxSize: 40000,
            },
            // Common chunk - very small
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
              maxSize: 20000,
            }
          }
        },
        // Aggressive tree shaking
        usedExports: true,
        sideEffects: false,
        // Module concatenation for better tree shaking
        concatenateModules: true,
        // Minimize bundle size
        minimize: true,
        // Remove unused modules
        providedExports: true,
      }

      // Add aggressive module replacement for smaller alternatives
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use smaller alternatives where possible
        'react/jsx-runtime': 'react/jsx-runtime',
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
      }

      // Ignore large modules that aren't needed
      config.externals = {
        ...config.externals,
        // Externalize large libraries if they're not critical
        canvas: 'canvas',
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      }
    }

    // Add module concatenation for better tree shaking
    if (!isServer && !dev) {
      config.optimization.concatenateModules = true;
    }

    // Optimize module resolution
    config.resolve.modules = ['node_modules'];
    config.resolve.symlinks = false;

    return config
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
