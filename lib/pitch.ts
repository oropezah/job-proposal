import { createClient } from "@supabase/supabase-js";

export type Pitch = {
  slug: string;
  client_name: string | null;
  job_title: string;
  job_summary: string;
  job_skills: string[] | null;
  job_budget: string | null;
  card_image_url: string | null;
  intro_video_url: string | null;
  main_video_url: string | null;
};

const SLUG_RE = /^[a-z0-9-]{4,40}$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Pitch de ejemplo para probar la página sin base de datos (solo si no hay Supabase configurado).
const DEMO: Pitch = {
  slug: "demo",
  client_name: "Alex",
  job_title: "AI Agent for WhatsApp Appointment Booking",
  job_summary:
    "We run a small chain of clinics and need an AI agent that answers patients on WhatsApp, checks real availability and books the appointment in Google Calendar. n8n experience preferred.",
  job_skills: ["n8n", "WhatsApp", "Google Calendar", "AI Agent Development", "API Integration"],
  job_budget: "$25–$45/hr",
  card_image_url: null,
  intro_video_url: null,
  main_video_url: null,
};

export async function getPitch(slug: string): Promise<Pitch | null> {
  if (!isValidSlug(slug)) return null;
  const client = sb();
  if (!client) return slug === "demo" ? DEMO : null;
  const { data, error } = await client.rpc("get_pitch", { p_slug: slug });
  if (error || !data || data.length === 0) return null;
  return data[0] as Pitch;
}

export async function logEvent(slug: string, event: "view" | "play" | "finish"): Promise<void> {
  const client = sb();
  if (!client || !isValidSlug(slug)) return;
  await client.rpc("log_event", { p_slug: slug, p_event: event });
}
