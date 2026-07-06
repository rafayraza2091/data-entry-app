import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.100.20', 'www.beaconbridge.com'],
};

export default nextConfig;
