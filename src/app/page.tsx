import Link from "next/link";
import { HeroStage } from "@/components/HeroStage";
import { HeroPoster } from "@/components/HeroPoster";
import { Picture } from "@/components/Picture";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProjectCard } from "@/components/ProjectCard";
import { principles, processSteps, services, site } from "@/content/site";
import { projects } from "@/content/projects";

const principleFigures: Record<string, { name: string; alt: string; caption: string } | undefined> = {
  light: {
    name: "pavilion-arch",
    alt: "Rendered view through a round-headed arch in a concrete wall, framing a narrow slot of warm light in the limestone wall beyond.",
    caption: "The slot of light, seen through the arch.",
  },
  proportion: {
    name: "pavilion-plan",
    alt: "Rendered view from directly above the pavilion, showing the long roof, the limestone wing, the arched wall and the pool as a composition of rectangles.",
    caption: "The pavilion from above: one roof, one mass, one wall, one pool.",
  },
};

export default function HomePage() {
  const [featured, ...rest] = projects;

  return (
    <>
      <div className="opening">
        <HeroStage>
          <HeroPoster />
        </HeroStage>

        <div className="opening-content">
          <section className="hero" aria-labelledby="hero-title" data-camera-stop="0">
            <div className="wrap hero-inner">
              <p className="eyebrow eyebrow-dark">Architecture and interiors · Perth, WA</p>
              <h1 id="hero-title" className="hero-title">
                <span>Form</span> <span>follows</span> <em>feeling.</em>
              </h1>
              <div className="hero-foot">
                <p className="hero-lede">
                  We design homes, renovations and interiors around how you want to feel in them: calm in the
                  morning, open at dusk, held at night. Then we make the form follow.
                </p>
                <div className="hero-actions">
                  <Link prefetch={false} href="#consultation" className="button button-light">
                    Book a consultation
                  </Link>
                  <Link prefetch={false} href="#projects" className="button button-outline-light">
                    View projects
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="approach" className="approach" aria-labelledby="approach-title">
            <div className="wrap">
              <div className="approach-intro">
                <p className="eyebrow eyebrow-dark">Approach</p>
                <h2 id="approach-title" className="display-2">
                  We start with how a home should feel, and design until the building can hold it.
                </h2>
              </div>
              <ol className="principles">
                {principles.map((p, i) => {
                  const figure = principleFigures[p.id];
                  return (
                    <li key={p.id} className="principle" aria-labelledby={`principle-${p.id}`}>
                      <div
                        className="principle-card"
                        data-camera-stop={p.id === "light" ? 1 : p.id === "proportion" ? 2 : undefined}
                      >
                        <p className="principle-number" aria-hidden="true">
                          {p.number}
                        </p>
                        <h3 id={`principle-${p.id}`} className="display-3">
                          <span className="visually-hidden">Principle {i + 1}: </span>
                          {p.title}
                        </h3>
                        <p>{p.body}</p>
                        {figure ? (
                          <figure className="principle-figure">
                            <Picture
                              name={figure.name}
                              alt={figure.alt}
                              sizes="(min-width: 34rem) 26rem, calc(100vw - 3rem)"
                              layoutWidth={600}
                            />
                            <figcaption>{figure.caption}</figcaption>
                          </figure>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </div>
      </div>

      <section id="projects" className="section section-page projects" aria-labelledby="projects-title">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Selected projects</p>
              <h2 id="projects-title" className="display-2">
                Homes shaped around a feeling.
              </h2>
            </div>
            <div className="section-head-aside">
              <p>
                A new pavilion, a courtyard house, a cottage renovation and an apartment interior. Each began with
                a single sentence about how it should feel.
              </p>
              <p className="fiction-note">All projects shown are fictional and were created for this concept.</p>
            </div>
          </header>

          <div className="project-grid">
            <ProjectCard project={featured} featured />
            {rest.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>

          <p className="section-link">
            <Link prefetch={false} href="/projects" className="text-link">
              View all projects
            </Link>
          </p>
        </div>
      </section>

      <section id="services" className="section section-limestone services" aria-labelledby="services-title">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Services</p>
              <h2 id="services-title" className="display-2">
                Architecture, interiors and renovation, under one roof.
              </h2>
            </div>
            <div className="section-head-aside">
              <p>
                Most of our clients use more than one. Designing the building and the rooms inside it together is
                how the details end up feeling inevitable rather than added on.
              </p>
            </div>
          </header>

          <div className="service-grid">
            {services.map((s, i) => (
              <article key={s.id} id={`service-${s.id}`} className="service" aria-labelledby={`service-title-${s.id}`}>
                <p className="service-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 id={`service-title-${s.id}`} className="display-3">
                  {s.title}
                </h3>
                <p className="service-summary">{s.summary}</p>
                <ul className="service-list">
                  {s.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="service-fee">{s.fee}</p>
                <Link prefetch={false} href={`/?service=${s.id}#consultation`} className="text-link">
                  Enquire about {s.title.toLowerCase()}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="section section-page process" aria-labelledby="process-title">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Process</p>
              <h2 id="process-title" className="display-2">
                Five steps, one conversation at a time.
              </h2>
            </div>
            <div className="section-head-aside">
              <p>
                Every project starts the same way: a paid, unhurried consultation, with no obligation to continue.
                Timeframes below are typical for a new home.
              </p>
            </div>
          </header>
          <ol className="process-list">
            {processSteps.map((step) => (
              <li key={step.number} className="process-step">
                <p className="process-number" aria-hidden="true">
                  {step.number}
                </p>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-duration">{step.duration}</p>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="consultation" className="section section-dark consultation" aria-labelledby="consultation-title">
        <div className="wrap consultation-grid">
          <div className="consultation-copy">
            <p className="eyebrow eyebrow-dark">Consultation</p>
            <h2 id="consultation-title" className="display-2">
              Start with a conversation.
            </h2>
            <p className="consultation-lede">
              Tell us about your site, your home and how you want it to feel. The first step is a 90 minute
              consultation at your site or our studio, for a fee of $450 that is credited to your first stage.
            </p>
            <h3 className="consultation-sub">What happens next</h3>
            <ol className="next-steps">
              <li>We read your enquiry and reply within two working days.</li>
              <li>We arrange a time to meet, at your site, the studio or on a video call.</li>
              <li>After we meet you receive a short written note with our thoughts and a fee proposal.</li>
            </ol>
            <p className="consultation-contact">
              Prefer to talk? Call <a href={`tel:${site.phoneHref}`}>{site.phone}</a> or email{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
          <div className="consultation-form">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
