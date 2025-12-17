/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to FastAPI backend
  async rewrites() {
    return [
      {
        source: '/generate',
        destination: 'http://localhost:8000/generate',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8000/health',
      },
    ];
  },
};

export default nextConfig;
