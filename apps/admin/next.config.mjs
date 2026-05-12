/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Optimized for Cloudflare Pages
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@spiceveg/types"],
};

export default nextConfig;
