import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['m.ftscrt.com'], // Add your hostname here
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
