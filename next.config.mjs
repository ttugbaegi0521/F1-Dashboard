/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/track/corners/:circuitId/:year',
                destination: 'https://api.multiviewer.app/api/v1/circuits/:circuitId/:year',
            },
            {
                source: '/api/:path*',
                destination: 'https://livetiming.formula1.com/:path*',
            },
        ];
    },
};

export default nextConfig;
