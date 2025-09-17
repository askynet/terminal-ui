import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/workspace/:path*',
        destination: 'http://localhost:8080/:path*',
      },
      {
        source: '/stable-:hash/:path*',
        destination: 'http://localhost:8080/stable-:hash/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://localhost:8080/static/:path*',
      },
      {
        source: '/_static/:path*',
        destination: 'http://localhost:8080/_static/:path*',
      },
      {
        source: '/manifest.json',
        destination: 'http://localhost:8080/manifest.json',
      },
    ];
  },
  devIndicators: false
};

export default nextConfig;
