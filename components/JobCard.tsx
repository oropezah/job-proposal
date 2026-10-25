import type { Pitch } from "@/lib/pitch";

/**
 * Tarjeta con el texto real del job del cliente. Diseño propio: no imita la interfaz de Upwork.
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
      {skills.length > 0 && (
        <ul className="chips" aria-label="Skills requested">
          {skills.slice(0, 8).map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      )}
      {pitch.job_budget && <p className="jobcard-budget">{pitch.job_budget}</p>}
    </article>
  );
}
