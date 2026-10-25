import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { Picture, fallbackSrc } from "@/components/Picture";
import { PlanDrawing } from "@/components/PlanDrawing";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: `${project.summary} A fictional project by Cinder Arc.`,
    openGraph: { images: [{ url: fallbackSrc(project.images.hero.name), alt: project.images.hero.alt }] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="project-page page-light" aria-labelledby="project-title">
      <header className="project-header">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link prefetch={false} href="/">Home</Link>
              </li>
              <li>
                <Link prefetch={false} href="/projects">Projects</Link>
              </li>
              <li aria-current="page">{project.name}</li>
            </ol>
          </nav>
          <div className="project-header-grid">
            <div>
              <p className="eyebrow">
                {project.category} <span aria-hidden="true">·</span> {project.location}
              </p>
              <h1 id="project-title" className="display-1">
                {project.name}
              </h1>
            </div>
            <p className="project-feeling">
              <span className="project-feeling-label">The feeling</span>
              <span className="project-feeling-text">{project.feeling}</span>
            </p>
          </div>
        </div>
      </header>

      <figure className="project-hero">
        <Picture name={project.images.hero.name} alt={project.images.hero.alt} sizes="100vw" priority />
      </figure>

      <section className="section section-page section-tight" aria-labelledby="overview-title">
        <div className="wrap project-overview">
          <div>
            <h2 id="overview-title" className="eyebrow">
              Overview
            </h2>
            <p className="project-summary">{project.summary}</p>
          </div>
          <dl className="facts">
            <div>
              <dt>Location</dt>
              <dd>{project.location}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{project.scope}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{project.size}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Fictional concept project</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section section-page section-tight" aria-labelledby="brief-title">
        <div className="wrap project-story">
          <div className="project-story-text">
            <h2 id="brief-title" className="display-3">
              The brief
            </h2>
            <p>{project.brief}</p>
            <h2 className="display-3">The response</h2>
            {project.response.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
          <figure className="project-detail-figure">
            <Picture
              name={project.images.detail.name}
              alt={project.images.detail.alt}
              sizes="(min-width: 1024px) 40vw, 94vw"
            />
          </figure>
        </div>
      </section>

      <figure className="project-wide wrap">
        <Picture name={project.images.wide.name} alt={project.images.wide.alt} sizes="(min-width: 1440px) 1360px, 94vw" />
      </figure>

      <section className="section section-limestone" aria-labelledby="materials-title">
        <div className="wrap project-materials">
          <div>
            <h2 id="materials-title" className="display-3">
              Materials
            </h2>
            <ul className="materials">
              {project.materials.map((m) => (
                <li key={m.name}>
                  <span className="swatch" style={{ background: m.swatch }} aria-hidden="true" />
                  <span>
                    <strong>{m.name}</strong>
                    <span className="material-note">{m.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <figure className="plan-figure">
            <PlanDrawing plan={project.plan} title={project.name} />
            <figcaption>{project.plan.caption}</figcaption>
          </figure>
        </div>
      </section>

      <nav className="next-project" aria-label="Next project">
        <div className="wrap">
          <Link prefetch={false} href={`/projects/${next.slug}`} className="next-project-link">
            <span className="eyebrow">Next project</span>
            <span className="display-2">{next.name}</span>
            <span className="next-project-meta">
              {next.location} <span aria-hidden="true">·</span> {next.category}
            </span>
          </Link>
        </div>
      </nav>

      <section className="cta-band" aria-labelledby="project-cta-title">
        <div className="wrap cta-band-inner">
          <h2 id="project-cta-title" className="display-2">
            Imagine your own home this way.
          </h2>
          <Link prefetch={false} href="/#consultation" className="button button-light">
            Book a consultation
          </Link>
        </div>
      </section>
    </article>
  );
}
