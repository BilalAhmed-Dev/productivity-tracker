import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    // Don't set assetPrefix as it can cause issues with static asset paths
    // Remove the assetPrefix setting for standard deployment scenarios

    // Enable static image import
    images: {
        domains: []
    },

    // Use standalone output for better performance
    output: 'standalone'
};

export default withBundleAnalyzer(nextConfig);
