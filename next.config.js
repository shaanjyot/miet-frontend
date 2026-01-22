const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  webpack: (config, { isServer }) => {
    // Fix for react-icons and other ESM packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ensure .mjs files are handled correctly (for react-icons)
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

module.exports = withNextIntl(nextConfig);
