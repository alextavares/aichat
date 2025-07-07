import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove dangerous build error suppression
  // All TypeScript and ESLint errors must be fixed before production deployment
  
  // Enable strict type checking and linting during builds
  eslint: {
    // Only ignore specific directories if needed (e.g., legacy code)
    // ignoreDuringBuilds: false, // This is the default
  },
  typescript: {
    // Ensure type safety in production
    // ignoreBuildErrors: false, // This is the default
  },
  
  // Add performance and security optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Enable webpack build cache for faster builds
    webpackBuildWorker: true,
  },
  
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    // Add image size limits for performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack optimization for better performance
  webpack: (config, { dev, isServer }) => {
    // Enable SWC minifier for better performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

export default nextConfig;
