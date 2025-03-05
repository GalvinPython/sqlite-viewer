import type { NextConfig } from "next";

import MillionLint from "@million/lint";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
        };

        return config;
    },
};

export default MillionLint.next({
    enabled: true,
})(nextConfig);
