const path = require("path");
const { loadEnvConfig } = require("@next/env");

// Monorepo: load repo-root `.env` so `apps/web` picks up API_URL / NEXT_PUBLIC_API_URL.
loadEnvConfig(path.join(__dirname, "../.."));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
};

module.exports = nextConfig;
