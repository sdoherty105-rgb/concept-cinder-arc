import { site } from "@/content/site";

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" width="12" height="10" viewBox="0 0 12 10" className="concept-arrow">
      <path
        d={back ? "M11 5H1.5M5 1.5 1.5 5 5 8.5" : "M1 5h9.5M7 1.5 10.5 5 7 8.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

/**
 * The OFF/SHIFT studio links shared by every concept site: a plain
 * fictional-business disclosure, a return link to the concept page and the
 * "Want a website like this?" enquiry link. Same tab, no tracking.
 */
export function ConceptLinks({ variant }: { variant: "strip" | "footer" }) {
  return (
    <div className={`concept-links concept-links-${variant}`}>
      {variant === "strip" ? (
        <p className="concept-disclosure" data-concept-disclosure>
          {site.conceptDisclosure}
        </p>
      ) : null}
      <ul className="concept-actions">
        <li>
          <a className="concept-link" href={site.conceptUrl} data-concept-return>
            <Arrow back />
            {site.conceptReturnLabel}
          </a>
        </li>
        <li>
          <a className="concept-link concept-cta" href={site.studioCtaUrl} data-concept-cta>
            {site.studioCtaLabel}
            <Arrow />
          </a>
        </li>
      </ul>
    </div>
  );
}
