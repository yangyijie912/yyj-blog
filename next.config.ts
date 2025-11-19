import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Register next-intl plugin so it can discover next-intl.config.js
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Add any Next.js config options here as needed
};

export default withNextIntl(nextConfig);
