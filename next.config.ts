import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" مفيد لـ Docker/VPS لكن غير ضروري على Vercel
  // Vercel يدير النشر تلقائياً
  output: undefined,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // دعم الملفات الكبيرة (حتى 25MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
