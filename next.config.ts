import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['sharp'],
  // Local Kiro's configurable work directory must not pull development evidence,
  // private runtime files or static CDN assets into serverless function bundles.
  outputFileTracingExcludes: {
    '/*': ['.data/**/*', '.env*', '.kiro/**/*', 'docs/**/*', 'tests/**/*',
      'reference/**/*', 'dist/**/*', 'test-results/**/*', 'playwright-report/**/*', 'public/**/*'],
  },
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'same-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ] }]; },
};
export default config;
