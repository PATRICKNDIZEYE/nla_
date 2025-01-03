/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config");

const nextConfig = {
  i18n,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Configure static file serving
  images: {
    domains: ['localhost'],
  },
  
  // Allow serving files from /public/uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },

  // Add transpilePackages configuration for antd and handle ESM modules
  transpilePackages: [
    'antd', 
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ant-design/cssinjs',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-notification',
    'rc-tooltip'
  ],

  // Handle ESM modules
  experimental: {
    esmExternals: false,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };
    }

    // Handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Add resolve.extensions configuration
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

    // Force antd icons to use CommonJS
    config.module.rules.push({
      test: /\.js$/,
      include: [/@ant-design\/icons-svg/],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-transform-modules-commonjs'
          ]
        }
      }
    });

    return config;
  },

  env: {
    NEXT_PUBLIC_API_URL: 'http://nla.dtecsoftwaresolutions.com/api',
    NEXT_PUBLIC_BASE_URL: 'http://nla.dtecsoftwaresolutions.com',
    NEXT_PUBLIC_APP_URL: 'http://nla.dtecsoftwaresolutions.com'
  }
};

module.exports = nextConfig;
