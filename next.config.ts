import type { NextConfig } from 'next';

const API_URL = process.env.API_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  /**
   * The browser calls "/api/..." on this app and Next forwards the request to
   * the Express server. One origin for the frontend means the httpOnly session
   * cookie stays first party, so there is no CORS dance and no
   * SameSite=None cookie in production.
   *
   * On Vercel set API_URL to the deployed backend URL.
   */
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
