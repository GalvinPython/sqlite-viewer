import type { NextConfig } from "next";

import { execSync } from "child_process";

import MillionLint from "@million/lint";

// Show git commit hash in the website

// Fetch the short Git SHA at build time
const gitSha = execSync("git rev-parse --short HEAD").toString().trim();

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
    env: {
        // Prefix with NEXT_PUBLIC_ to make it accessible in the browser
        NEXT_PUBLIC_GIT_SHA: gitSha,
    },
};

export default MillionLint.next({
    enabled: true,
})(nextConfig);
