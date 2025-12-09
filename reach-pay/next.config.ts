import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-wallets",
    "@solana/web3.js",
    "@coral-xyz/anchor",
  ],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Add Turbopack config to silence Next.js 16 warning
  // Most apps work fine with Turbopack without configuration
  turbopack: {
    root: process.cwd(), // Use current working directory as root
  },
};

export default nextConfig;
