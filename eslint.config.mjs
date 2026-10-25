import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      ".lighthouseci/**",
      "node_modules/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
      "scripts/.render/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default config;
