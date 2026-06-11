const withPWA = require('next-pwa')({
  dest:         'public',
  register:     true,
  skipWaiting:  true,
  disable:      process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // ── Next.js static chunks ─────────────────────────────────────────────
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler:    'CacheFirst',
      options:    { cacheName: 'next-static', expiration: { maxEntries: 256 } },
    },
    // ── Next.js image optimisation ────────────────────────────────────────
    {
      urlPattern: /^\/_next\/image\?.*/i,
      handler:    'CacheFirst',
      options:    {
        cacheName:  'next-images',
        expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // ── Universities data — serve stale, revalidate in background ─────────
    // Matches Supabase REST calls for the universities table
    {
      urlPattern: /\/rest\/v1\/universities/i,
      handler:    'StaleWhileRevalidate',
      options:    {
        cacheName:  'universities-api',
        expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // ── POST /api/* — queue when offline, retry when back online ─────────
    {
      urlPattern: /\/api\/.*/i,
      handler:    'NetworkOnly',
      method:     'POST',
      options:    {
        backgroundSync: {
          name:    'applywise-sync-queue',
          options: { maxRetentionTime: 24 * 60 }, // 24 h in minutes
        },
      },
    },
    // ── Supabase auth + REST (non-universities) — NetworkFirst ────────────
    {
      urlPattern: /supabase\.co\/.*/i,
      handler:    'NetworkFirst',
      options:    {
        cacheName:            'supabase-api',
        networkTimeoutSeconds: 5,
        expiration:           { maxEntries: 32, maxAgeSeconds: 60 * 60 },
      },
    },
    // ── Everything else — NetworkFirst with 10 s timeout ─────────────────
    {
      urlPattern: /^https?.*/i,
      handler:    'NetworkFirst',
      options:    {
        cacheName:            'others',
        networkTimeoutSeconds: 10,
        expiration:           { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      // University logos (if hosted externally)
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

module.exports = withPWA(nextConfig);
