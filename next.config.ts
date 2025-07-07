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
  },
  
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig;
