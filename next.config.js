// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        BASE_URL: process.env.BASE_URL,
        API_BASE_URL: process.env.API_BASE_URL,
        GRAPHQL_API_ENDPOINT: process.env.GRAPHQL_API_ENDPOINT,
        FILE_BASE_URL: process.env.FILE_BASE_URL,
        STORMGLASS_API_KEY: process.env.STORMGLASS_API_KEY,
    },
    reactStrictMode: false,
    experimental: {
        serverMinification: true,
    },
    // output: 'export', // for app24, this should be commented out. This is only used for building desktop and mobile applications
    images: {
        unoptimized: true,
    },
}

const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    cacheStartUrl: true,
    register: true,
    reloadOnOnline: true,
    disable: false,
    workboxOptions: {
        disableDevLogs: true,
    },
})

module.exports = withPWA(nextConfig)
