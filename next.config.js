/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow API routes to work properly
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude MongoDB and Node.js modules from browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        timers: false,
        'timers/promises': false,
        buffer: false,
        events: false,
        querystring: false,
        punycode: false,
        encoding: false,
        'node-fetch': false,
        'teeny-request': false,
      };
    } else {
      // Server-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
