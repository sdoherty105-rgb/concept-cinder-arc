import { site } from "@/content/site";

export function ConceptLabel({ className = "" }: { className?: string }) {
  return (
    <a className={`concept-label ${className}`} href={site.conceptUrl} data-concept-label>
      <span>{site.conceptLabel}</span>
      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" focusable="false">
        <path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </a>
  );
}
