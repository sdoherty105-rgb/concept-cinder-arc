import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected fictional projects by Cinder Arc: new homes, a renovation and an apartment interior in Western Australia.",
};

export default function ProjectsPage() {
  return (
    <div className="page-light">
      <section className="page-intro" aria-labelledby="projects-page-title">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link prefetch={false} href="/">Home</Link>
              </li>
              <li aria-current="page">Projects</li>
            </ol>
          </nav>
          <h1 id="projects-page-title" className="display-1">
            Selected projects
          </h1>
          <p className="page-lede">
            Four homes, each designed from a single sentence about how it should feel. These projects are fictional,
            created to demonstrate this concept site; the renders are original procedural models.
          </p>
        </div>
      </section>
      <section className="section section-page section-tight" aria-label="Project list">
        <div className="wrap project-grid project-grid-index">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} featured={i === 0} />
          ))}
        </div>
      </section>
      <section className="cta-band" aria-labelledby="projects-cta-title">
        <div className="wrap cta-band-inner">
          <h2 id="projects-cta-title" className="display-2">
            Have a site, a house or a feeling in mind?
          </h2>
          <Link prefetch={false} href="/#consultation" className="button button-light">
            Book a consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
