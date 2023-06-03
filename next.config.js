/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  // experimental: {
  //   scrollRestoration: true,
  // },
}

// module.exports = nextConfig
module.exports = {
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  i18n: {
    locales: ['default', 'en', 'mm'],
    defaultLocale: 'default',
  },
};
