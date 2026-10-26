import type { Project } from "@/data/portfolio";
import Reveal from "@/components/Reveal";
import WorkImage from "@/components/WorkImage";

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="work-heading" className="section">
      <Reveal>
        <h2 id="work-heading" className="h2">
          Work close to what you need
        </h2>
        <p className="section-sub">Real projects I&apos;ve built. Each one is picked for what your job asks.</p>
      </Reveal>
      <div className="grid">
        {projects.map((p, n) => (
          <Reveal key={p.id} index={n}>
          <article className="project">
            <WorkImage src={p.image} alt={`Screenshot: ${p.title}`} fallback={p.stack[0]} />
            <div className="project-body">
              <h3 className="project-title">{p.title}</h3>
              <p className="project-blurb">{p.blurb}</p>
              <ul className="chips">
                {p.stack.map((s) => (
                  <li key={s} className="chip chip-soft">
                    {s}
                  </li>
                ))}
              </ul>
              {p.demoUrl && (
                <a className="project-link" href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                  See it live →
                </a>
              )}
            </div>
          </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
