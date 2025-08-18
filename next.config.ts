import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    transpilePackages: ['@mui/x-date-pickers', '@mui/material', '@mui/utils'],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.pinimg.com",  // any subdomain of pinimg.com
            },
            {
                protocol: "https",
                hostname: "**.unsplash.com", // any subdomain of unsplash.com
            },
        ],
    }, eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
