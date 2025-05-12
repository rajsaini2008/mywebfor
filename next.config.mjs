/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static data caching for API routes
  experimental: {
    // This will help avoid stale data issues
    serverExternalPackages: ['mongoose'],
  },
  // Configure HTTP response headers
  async headers() {
    return [
      {
        // Apply to all routes, especially API routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ]
  },
}

export default nextConfig
