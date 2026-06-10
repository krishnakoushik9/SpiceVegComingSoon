/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Optimized for Cloudflare Pages
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@spiceveg/types"],
  // Allow the large LiteRT-LM model file to be served
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cache-Control', value: 'public, max-age=604800, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
