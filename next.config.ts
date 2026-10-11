import type { NextConfig } from "next";

/*
 * Sicherheits-Header. Die ersten sechs sind „Brot und Butter" und können nichts
 * kaputt machen – sie schalten Standard-Schutzmechanismen scharf (HTTPS erzwingen,
 * Clickjacking verhindern, MIME-Sniffing aus, Kamera/Mikro/Standort sperren).
 *
 * Die Content-Security-Policy läuft bewusst erst im REPORT-ONLY-Modus: Sie blockiert
 * noch nichts, meldet aber, was sie blockieren WÜRDE. So sieht man in der Browser-
 * Konsole, ob etwas Legitimes getroffen würde, bevor man sie scharf schaltet
 * (Header-Name dann zu "Content-Security-Policy" ändern). Genau so rollt man CSP
 * professionell aus, ohne die Seite zu riskieren.
 */
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
