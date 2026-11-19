"use client";

import Link from "next/link";

export type LightEntry = { slug: string; name: string; time: string; t: number; note: string };

/**
 * The project index, ordered by the hour each house is at its best. Choosing
 * an hour moves the sun in the hero; the name opens the project.
 */
export function LightIndex({ entries }: { entries: LightEntry[] }) {
  const setTime = (t: number) => window.dispatchEvent(new CustomEvent("cinder:set-time", { detail: { t } }));
  return (
    <ul className="light-index">
      {entries.map((e) => (
        <li key={e.slug} className="light-item">
          <button type="button" className="light-time" onClick={() => setTime(e.t)} aria-label={`Show the sun at ${e.time}`}>
            {e.time}
          </button>
          <Link prefetch={false} href={`/projects/${e.slug}`} className="light-name">
            {e.name}
          </Link>
          <span className="light-note">{e.note}</span>
        </li>
      ))}
    </ul>
  );
}
