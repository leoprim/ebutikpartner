/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iozuanlnbqyykvkfwacl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'oamgbaobmctsptfgjidm.supabase.co'],
  },
  transpilePackages: ['date-fns'],
}

module.exports = nextConfig 