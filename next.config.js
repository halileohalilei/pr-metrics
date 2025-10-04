/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/pr-metrics' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/pr-metrics/' : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
}

module.exports = nextConfig
