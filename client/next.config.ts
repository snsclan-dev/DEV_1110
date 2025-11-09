import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: ["127.0.0.1", "localhost"],
    reactStrictMode: false,
    sassOptions: {
        logger: {
            debug: (message: string) => {
                console.log(message);
            },
        },
    },
    async rewrites() {
        return [
            {
                source: `/${process.env.NEXT_PUBLIC_FOLDER}/:path*`, // /data/:path
                destination: `${process.env.NEXT_PUBLIC_SERVER_PORT}/${process.env.NEXT_PUBLIC_FOLDER}/:path*`,
            },
        ];
    },
};

export default nextConfig;