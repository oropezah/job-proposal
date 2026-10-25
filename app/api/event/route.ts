import { NextResponse } from "next/server";
import { isValidSlug, logEvent } from "@/lib/pitch";

export const dynamic = "force-dynamic";

const EVENTS = ["view", "play", "finish"] as const;

export async function POST(req: Request) {
  try {
    const { slug, event } = await req.json();
    if (typeof slug === "string" && isValidSlug(slug) && EVENTS.includes(event)) {
      await logEvent(slug, event);
    }
  } catch {
    // Las métricas nunca deben romper la página.
  }
  return new NextResponse(null, { status: 204 });
}
