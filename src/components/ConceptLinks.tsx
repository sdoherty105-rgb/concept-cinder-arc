import { site } from "@/content/site";

/**
 * The OFF/SHIFT studio links shared by every concept site: a plain
 * fictional-business disclosure, a return link to the concept page and the
 * "Want a website like this?" enquiry link. Same tab, no tracking. Here they
 * are set as a sun-yellow notice with underlined text links.
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
            {site.conceptReturnLabel}
          </a>
        </li>
        <li>
          <a className="concept-link concept-cta" href={site.studioCtaUrl} data-concept-cta>
            {site.studioCtaLabel}
          </a>
        </li>
      </ul>
    </div>
  );
}
