import { projects } from "../../src/content/projects";

export const CONCEPT_DISCLOSURE = "Fictional business — a concept site by OFF/SHIFT Studio";
export const CONCEPT_URL = "https://offshiftstudio.com.au/concepts/cinder-arc";
export const STUDIO_CTA_URL = "https://offshiftstudio.com.au/?concept=cinder-arc#contact";

export const routes = ["/", "/projects", ...projects.map((p) => `/projects/${p.slug}`)];
