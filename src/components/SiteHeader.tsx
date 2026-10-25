import Link from "next/link";
import { nav } from "@/content/site";
import { ConceptLabel } from "./ConceptLabel";
import { Wordmark } from "./Wordmark";
import { MenuEnhancer } from "./MenuEnhancer";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="concept-strip">
        <ConceptLabel />
      </div>
      <div className="site-bar">
        <div className="site-bar-inner wrap">
          <Link prefetch={false} href="/" className="brand" aria-label="Cinder Arc, home">
            <Wordmark />
          </Link>

          <nav className="primary-nav" aria-label="Primary">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link prefetch={false} href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link prefetch={false} href="/#consultation" className="button button-light header-cta">
            Book a consultation
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Menu">
              <span className="mobile-menu-label">Menu</span>
              <span className="mobile-menu-icon" aria-hidden="true" />
            </summary>
            <nav className="mobile-menu-panel" aria-label="Mobile">
              <ul>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link prefetch={false} href={item.href}>{item.label}</Link>
                  </li>
                ))}
                <li>
                  <Link prefetch={false} href="/#consultation" className="mobile-menu-cta">
                    Book a consultation
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
          <MenuEnhancer />
        </div>
      </div>
    </header>
  );
}
