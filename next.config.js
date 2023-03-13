// next.config.js
/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      reactStrictMode: true,
      swcMinify: true,
    }
  }

  return {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      loader: 'custom',
      loaderFile: './cfImageLoader.js'
    },
  }
}