import type { NextConfig } from "next";

import MillionLint from "@million/lint";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    output: "export",
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
        };

        return config;
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

if (process.env.NODE_ENV === "production") {
    nextConfig.eslint = {
        ...nextConfig.eslint,
        ignoreDuringBuilds: true,
    };
}

export default MillionLint.next({
    enabled: true,
})(nextConfig);
