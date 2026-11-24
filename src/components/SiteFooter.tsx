import Link from "next/link";
import { nav, site } from "@/content/site";
import { ConceptLinks } from "./ConceptLinks";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link prefetch={false} href="/" className="brand" aria-label="Cinder Arc, home">
            <Wordmark />
          </Link>
          <p className="footer-statement">
            Architecture and interiors for homes that are shaped around how they feel to live in.
          </p>
          <p className="footer-credit" data-footer-credit>
            <span>Designed by</span>
            <a href="https://offshiftstudio.com.au" rel="noopener">
              {/* eslint-disable-next-line @next/next/no-img-element -- canonical SVG, served unaltered */}
              <img src="/brand/offshift-wordmark-dark.svg" alt="OFF/SHIFT Studio" width={88} height={24} />
            </a>
          </p>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">Studio</h2>
          <address>
            <p>{site.location}</p>
            <p>Studio visits by appointment</p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p>
              <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            </p>
          </address>
        </div>

        <nav className="footer-col" aria-label="Footer">
          <h2 className="footer-heading">Explore</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link prefetch={false} href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/#consultation">Book a consultation</Link>
            </li>
          </ul>
        </nav>

        <div className="footer-col footer-country">
          <h2 className="footer-heading">Country</h2>
          <p>
            We work on Whadjuk Noongar boodja and acknowledge the Traditional Custodians of the lands on which
            we design and build, and their continuing connection to land, water and community.
          </p>
        </div>
      </div>

      <div className="wrap footer-base">
        <p>
          © {new Date().getFullYear()} Cinder Arc is a fictional studio. Projects, people, prices and contact
          details on this site are invented for demonstration.
        </p>
        <ConceptLinks variant="footer" />
      </div>
    </footer>
  );
}
