import { projects } from "../../src/content/projects";

export const CONCEPT_LABEL = "An OFF/SHIFT concept — fictional demonstration";
export const CONCEPT_URL = "https://offshiftstudio.com.au/concepts/cinder-arc";

export const routes = ["/", "/projects", ...projects.map((p) => `/projects/${p.slug}`)];
