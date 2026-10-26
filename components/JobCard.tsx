import type { Pitch } from "@/lib/pitch";

/**
 * Tarjeta con el texto real del job del cliente, con un look limpio de marketplace.
 * Es diseño propio: sin logos ni marcas de Upwork.
 * Si el pitch trae card_image_url (una captura auténtica que subiste tú), se muestra esa imagen.
 */
export default function JobCard({ pitch }: { pitch: Pitch }) {
  if (pitch.card_image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="card-image" src={pitch.card_image_url} alt="Your job post" />;
  }

  const skills = pitch.job_skills ?? [];

  return (
    <article className="jobcard">
      <p className="jobcard-label">Your job post</p>
      <h2 className="jobcard-title">{pitch.job_title}</h2>
      <p className="jobcard-summary">{pitch.job_summary}</p>
      {pitch.job_budget && (
        <p className="jobcard-budget">
          <span className="jobcard-k">Budget</span> {pitch.job_budget}
        </p>
      )}
      {skills.length > 0 && (
        <>
          <p className="jobcard-k jobcard-skills-h">Skills and expertise</p>
          <ul className="chips" aria-label="Skills requested">
            {skills.slice(0, 8).map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
