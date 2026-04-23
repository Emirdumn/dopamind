/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a standalone build that bundles only the Node runtime files we
  // need, so the production Docker image can be ~150 MB instead of ~500 MB.
  // Docs: https://nextjs.org/docs/pages/api-reference/next-config-js/output
  output: "standalone",
};

export default nextConfig;
