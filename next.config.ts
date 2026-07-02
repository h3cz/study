import type { NextConfig } from "next";

// Safe security headers — applied to every route. These do NOT risk breaking
// YouTube embeds (Sources tab), Google Fonts, or WebRTC. A full Content-Security-
// Policy was intentionally NOT added here: it needs per-path testing against the
// YouTube iframe embeds + fonts + OpenAI WebRTC before it can ship without
// breaking the app. Track CSP as its own tested change.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app. Without this, Next can infer a parent
  // folder when it sees lockfiles above the repo and emits a workspace-root warning.
  turbopack: {
    root: process.cwd(),
  },
  // next-pwa is not used — we register a hand-written SW in layout.tsx.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
