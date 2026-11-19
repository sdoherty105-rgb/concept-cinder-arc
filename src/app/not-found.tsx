import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-light">
      <section className="page-intro not-found" aria-labelledby="not-found-title">
        <div className="wrap">
          <p className="eyebrow">Page not found</p>
          <h1 id="not-found-title" className="display-1">
            This room hasn&rsquo;t been drawn yet.
          </h1>
          <p className="page-lede">The page you were looking for doesn&rsquo;t exist or has moved.</p>
          <p className="hero-actions">
            <Link prefetch={false} href="/" className="button">
              Back to the home page
            </Link>
            <Link prefetch={false} href="/projects" className="text-link">
              See projects
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
