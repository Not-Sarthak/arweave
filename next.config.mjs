/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.liteseed.xyz',
                port: '',
                pathname: '/data/*',
            },
        ],
    },
};

export default nextConfig;
