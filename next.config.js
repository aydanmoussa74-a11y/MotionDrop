/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Optimized for Vercel (App Router). Standard config — no static export hacks.
};

module.exports = nextConfig;
