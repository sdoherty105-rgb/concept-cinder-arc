import type { Metadata, Viewport } from "next";
import { display, body } from "./fonts";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.demoUrl),
  title: {
    default: `${site.name} — Architecture and interiors, Perth`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Form follows feeling`,
    description: site.description,
    images: [{ url: "/images/hero-wide-1280.webp", width: 1280, height: 800, alt: "Cinder Arc pavilion at dusk" }],
    locale: "en_AU",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#121416",
  colorScheme: "light",
};

// Sets html[data-js] before first paint so no-JS and JS layouts never flash between each other.
const bootScript = `document.documentElement.dataset.js="1";`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
