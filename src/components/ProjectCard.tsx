import Link from "next/link";
import type { Project } from "@/content/projects";
import { Picture } from "./Picture";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <article className={`project-card${featured ? " project-card-featured" : ""}`}>
      <Link prefetch={false} href={`/projects/${project.slug}`} className="project-card-link">
        <div className="project-card-media">
          <Picture
            name={project.images.hero.name}
            alt=""
            sizes={featured ? "(min-width: 1024px) 62vw, 94vw" : "(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 94vw"}
          />
        </div>
        <div className="project-card-body">
          <h3 className="project-card-title">{project.name}</h3>
          <p className="project-card-meta">
            {project.location}, {project.category.toLowerCase()}
          </p>
          <p className="project-card-feeling">{project.feeling}</p>
          <p className="project-card-light">At its best around {project.bestLight.time}</p>
        </div>
      </Link>
    </article>
  );
}
