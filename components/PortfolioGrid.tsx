import type { Project } from "@/data/portfolio";

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="work-heading">
      <h2 id="work-heading" className="h2">
        Work close to what you need
      </h2>
      <div className="grid">
        {projects.map((p) => (
          <article key={p.id} className="project">
            <h3 className="project-title">{p.title}</h3>
            <p className="project-blurb">{p.blurb}</p>
            <ul className="chips">
              {p.stack.map((s) => (
                <li key={s} className="chip chip-soft">
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
