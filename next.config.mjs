import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  webpack(config) {
    config.cache = false
    return config
  },

  // Enable standalone output for easier deployment
  output: 'standalone',

  async rewrites() {
    return []
  },

  // CORS for API routes is handled dynamically in middleware.ts (allowlist-based)
  // Avoid setting wildcard headers here to prevent overexposure
  // Legacy CORS headers preserved for compatibility but can be removed once middleware is fully tested
  async headers() {
    // CORS defaults for dev; production enforced via middleware.ts
    const allowOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: allowOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Trace-ID' },
        ]
      }
    ]
  },

  // Bundle optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}'
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}'
    }
  },

  // Experimental features
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [],
    // Optimize package imports
    optimizePackageImports: ['framer-motion', 'lucide-react', '@radix-ui/react-icons']
  }
}

export default withBundleAnalyzer(nextConfig)
