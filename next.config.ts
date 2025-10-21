import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimisations pour Vercel
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/',
        destination: '/catch',
        permanent: false,
      },
    ]
  },
  
  // Headers de sécurité
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
  
  // Optimisations des images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Optimisations du bundle
  experimental: {
    // optimizeCss: true, // Désactivé temporairement pour éviter les erreurs de build
  },
}

export default nextConfig
