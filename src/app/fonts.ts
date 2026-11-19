import localFont from "next/font/local";

/** Urbanist: a light, open geometric face with the airy, drawn quality of architectural lettering. */
export const display = localFont({
  src: "../fonts/urbanist-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Century Gothic", "Avenir Next", "Trebuchet MS", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const body = localFont({
  src: "../fonts/public-sans-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
