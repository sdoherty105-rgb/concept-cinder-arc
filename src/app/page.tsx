import Link from "next/link";
import { HeroPoster } from "@/components/HeroPoster";
import { HeroStageOverlay } from "@/components/HeroStageOverlay";
import { LightIndex } from "@/components/LightIndex";
import { Picture } from "@/components/Picture";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ProjectCard } from "@/components/ProjectCard";
import { principles, processSteps, services, site } from "@/content/site";
import { projects } from "@/content/projects";

const serviceFigures: Record<string, { name: string; alt: string; hour: string }> = {
  architecture: {
    name: "pavilion-hero",
    alt: "The Wilyabrup Pavilion in clear morning light along its long concrete roof line.",
    hour: "7:00 am",
  },
  interiors: {
    name: "interior-hero",
    alt: "The Fremantle apartment kitchen with soft midday light across limestone and timber.",
    hour: "12:00 pm",
  },
  renovation: {
    name: "cottage-hero",
    alt: "The Cottesloe cottage front garden in warm late-afternoon sun.",
    hour: "3:30 pm",
  },
};

const principleFigures: Record<string, { name: string; alt: string; caption: string } | undefined> = {
  light: {
    name: "pavilion-arch",
    alt: "Rendered view through a round-headed arch in a concrete wall, framing a narrow slot of light in the limestone wall beyond.",
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
  const lightEntries = [...projects]
    .sort((a, b) => a.bestLight.t - b.bestLight.t)
    .map((p) => ({ slug: p.slug, name: p.name, ...p.bestLight }));

  return (
    <>
      <div className="opening">
        <div className="stage">
          <HeroPoster />
          <HeroStageOverlay />
        </div>

        <div className="opening-content">
          <section className="hero" aria-labelledby="hero-title" data-camera-stop="0">
            <div className="hero-pitch">
              <h1 id="hero-title" className="hero-title">
                Houses drawn by the <span className="hero-sun">sun</span>.
              </h1>
              <p className="hero-lede">
                Cinder Arc designs homes, renovations and interiors in Western Australia. We begin with where the
                light falls at eight in the morning and at four in the afternoon, and let the rooms follow it.
              </p>
            </div>
            <div className="hero-index">
              <h2 className="hero-index-title">Our projects, by the hour they look best</h2>
              <LightIndex entries={lightEntries} />
              <p className="fiction-note">All projects shown are fictional and were created for this concept.</p>
            </div>
          </section>

          <section id="approach" className="approach" aria-labelledby="approach-title">
            <h2 id="approach-title" className="display-2">
              We start with how a home should feel, and design until the building can hold it.
            </h2>
            <ul className="principles">
              {principles.map((p) => {
                const figure = principleFigures[p.id];
                return (
                  <li key={p.id} className="principle" aria-labelledby={`principle-${p.id}`}>
                    <div
                      className="principle-card"
                      data-camera-stop={p.id === "light" ? 1 : p.id === "proportion" ? 2 : undefined}
                    >
                      <h3 id={`principle-${p.id}`} className="display-3">
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
            </ul>
          </section>
        </div>
      </div>

      <section id="projects" className="section projects" aria-labelledby="projects-title">
        <div className="wrap">
          <header className="section-head">
            <h2 id="projects-title" className="display-2">
              Homes shaped around a feeling.
            </h2>
            <p>
              A new pavilion, a courtyard house, a cottage renovation and an apartment interior. Each began with a
              single sentence about how it should feel.
            </p>
          </header>

          <div className="project-sheet">
            <ProjectCard project={featured} featured />
            {rest.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>

          <p className="section-link">
            <Link prefetch={false} href="/projects" className="text-link">
              See every project
            </Link>
          </p>
        </div>
      </section>

      <section id="services" className="section services" aria-labelledby="services-title">
        <div className="wrap">
          <header className="section-head">
            <h2 id="services-title" className="display-2">
              Architecture, interiors and renovation, under one roof.
            </h2>
            <p>
              Most of our clients use more than one. Designing the building and the rooms inside it together is how
              the details end up fitting the house from the first sketch.
            </p>
          </header>

          <ol className="service-sunlist">
            {services.map((s, index) => {
              const figure = serviceFigures[s.id];
              return (
                <li key={s.id} id={`service-${s.id}`} className={`service-row service-${s.id}`}>
                  <article aria-labelledby={`service-title-${s.id}`}>
                    <div className="service-row-head">
                      <span className="service-num" data-numeric aria-hidden="true">
                        {index + 1}
                      </span>
                      <p className="service-hour">
                        <span className="visually-hidden">Typical brief time: </span>
                        {figure.hour}
                      </p>
                    </div>
                    <div className="service-row-body">
                      <figure className="service-figure">
                        <Picture
                          name={figure.name}
                          alt={figure.alt}
                          sizes="(min-width: 48rem) 14rem, 7.5rem"
                          layoutWidth={800}
                        />
                      </figure>
                      <div className="service-copy">
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
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="process" className="section process" aria-labelledby="process-title">
        <div className="wrap">
          <header className="section-head">
            <h2 id="process-title" className="display-2">
              Five stops between the first visit and the front door.
            </h2>
            <p>
              Every project starts the same way: a paid, unhurried consultation, with no obligation to continue.
              Timeframes below are typical for a new home.
            </p>
          </header>
          <ul className="process-arc">
            {processSteps.map((step) => (
              <li key={step.title} className="process-step">
                <p className="process-duration">{step.duration}</p>
                <h3 className="process-title">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="consultation" className="section consultation" aria-labelledby="consultation-title">
        <div className="wrap consultation-grid">
          <div className="consultation-copy">
            <h2 id="consultation-title" className="display-2">
              Start with a conversation.
            </h2>
            <p className="consultation-lede">
              Tell us about your site, your home and how you want it to feel. The first step is a 90 minute
              consultation at your site or our studio, for a fee of $450 that is credited to your first stage.
            </p>
            <h3 className="consultation-sub">What happens next</h3>
            <ul className="next-steps">
              <li>We read your enquiry and reply within two working days.</li>
              <li>We arrange a time to meet, at your site, the studio or on a video call.</li>
              <li>After we meet you receive a short written note with our thoughts and a fee proposal.</li>
            </ul>
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
