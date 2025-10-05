const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProduction ? '/pr-metrics' : '',
  assetPrefix: isProduction ? '/pr-metrics/' : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
}

module.exports = nextConfig
