export type Project = {
  id: string;
  title: string;
  blurb: string;
  stack: string[];
  /** Captura real del proyecto: guarda el archivo en public/work/<id>.jpg y pon "/work/<id>.jpg". */
  image?: string;
  /** Link público a una demo en vivo (solo si es tuya y no tiene tus datos de contacto). */
  demoUrl?: string;
  /** Palabras (en minúscula) que, si aparecen en el job, hacen que este proyecto se muestre. */
  keywords: string[];
};

// Edita estos textos libremente. Solo afirma lo que está terminado.
export const PROJECTS: Project[] = [
  {
    id: "whatsapp-booking",
    image: "/work/whatsapp-booking.jpg",
    title: "WhatsApp AI booking agent for a medical clinic",
    blurb:
      "Books, cancels and reschedules patient appointments 24/7. The agent checks real doctor availability through tool calls and writes the event to Google Calendar.",
    stack: ["n8n", "WhatsApp", "Google Calendar", "LLM agent"],
    keywords: ["whatsapp", "booking", "appointment", "schedul", "calendar", "clinic", "medical", "chatbot", "agent", "n8n", "reservation"],
  },
  {
    id: "instagram-crm",
    image: "/work/instagram-crm.jpg",
    title: "Instagram DM lead-qualification agent + custom CRM",
    blurb:
      "Answers Instagram DMs coming from ads, qualifies each lead and logs it to Sheets. A React + Supabase CRM adds inbox, tags and pipeline, synced through webhooks.",
    stack: ["n8n", "Meta Graph API", "React", "Supabase"],
    keywords: ["instagram", "dm", "lead", "crm", "qualif", "sales", "supabase", "react", "meta", "pipeline", "social"],
  },
  {
    id: "rag-chatbot",
    image: "/work/rag-chatbot.jpg",
    title: "RAG knowledge-base chatbot for a restaurant",
    blurb:
      "Answers customer questions from the business's own documents instead of guessing. Documents are vectorized into Pinecone and retrieved by an n8n AI agent.",
    stack: ["n8n", "Pinecone", "RAG", "LLM"],
    keywords: ["rag", "pinecone", "knowledge", "vector", "document", "faq", "support", "embedding", "retrieval", "chatbot"],
  },
  {
    id: "booking-platform",
    image: "/work/booking-platform.jpg",
    demoUrl: "https://synco-agency.com/crear-bookings",
    title: "Self-service booking platform (React + FastAPI)",
    blurb:
      "Clinics create their own scheduling page through a setup wizard. React frontend, Python FastAPI backend, PostgreSQL and Google Calendar.",
    stack: ["Python", "FastAPI", "React", "PostgreSQL"],
    keywords: ["fastapi", "python", "backend", "api", "postgres", "web app", "saas", "react", "booking"],
  },
  {
    id: "event-registration",
    image: "/work/event-registration.jpg",
    title: "Event registration with payment-receipt upload",
    blurb:
      "Step-by-step animated registration for a university conference. Data goes to Google Sheets, receipts to Google Drive, confirmation by email.",
    stack: ["Next.js", "FastAPI", "Google Sheets", "Drive"],
    keywords: ["next", "landing", "form", "registration", "payment", "sheets", "drive", "frontend", "website"],
  },
  {
    id: "synco-tower",
    image: "/work/synco-tower.jpg",
    title: "Animated multi-agent dashboard",
    blurb:
      "A dashboard where AI agents live as characters in a building, each floor a department. Drawn entirely in code with React and TypeScript.",
    stack: ["React", "TypeScript", "Python"],
    keywords: ["dashboard", "agents", "typescript", "ui", "visualization", "frontend", "react"],
  },
];

const DEFAULT_ORDER = ["whatsapp-booking", "instagram-crm", "rag-chatbot"];

/** Elige los n proyectos más relevantes para el texto del job. */
export function pickProjects(jobText: string, n = 3): Project[] {
  const text = jobText.toLowerCase();
  const scored = PROJECTS.map((p, index) => ({
    p,
    index,
    score: p.keywords.filter((k) => text.includes(k)).length,
  }));
  if (scored.every((s) => s.score === 0)) {
    return DEFAULT_ORDER.map((id) => PROJECTS.find((p) => p.id === id)!).slice(0, n);
  }
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, n).map((s) => s.p);
}
