/** The Cinder Arc mark: a round-headed arch drawn as a single bronze line, beside the name. */
export function ArchGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      className="arch-glyph"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 22V11a7 7 0 0 1 14 0v11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 22h20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <ArchGlyph />
      <span className="wordmark-name">Cinder Arc</span>
    </span>
  );
}
