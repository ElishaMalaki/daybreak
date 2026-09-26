import { imageHosts } from './image-hosts.config.mjs';

const publicWebsiteHeaders = [
  {
    key: 'Cache-Control',
    value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  },
  {
    key: 'CDN-Cache-Control',
    value: 'no-store',
  },
  {
    key: 'Vercel-CDN-Cache-Control',
    value: 'no-store',
  },
  {
    key: 'X-Earth-AI-Version',
    value: 'public-site-2026-09-26',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
  async headers() {
    return [
      { source: '/', headers: publicWebsiteHeaders },
      { source: '/about', headers: publicWebsiteHeaders },
      { source: '/agriculture', headers: publicWebsiteHeaders },
      { source: '/finance', headers: publicWebsiteHeaders },
      { source: '/waitlist', headers: publicWebsiteHeaders },
      { source: '/login', headers: publicWebsiteHeaders },
      { source: '/privacy', headers: publicWebsiteHeaders },
      { source: '/terms', headers: publicWebsiteHeaders },
    ];
  },
  webpack(
    config,
    {
      dev: dev
    }
  ) {
    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    return config;
  },
};
export default nextConfig;
