import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import PitchPlayer from "@/components/PitchPlayer";
import PortfolioGrid from "@/components/PortfolioGrid";
import { pickProjects } from "@/data/portfolio";
import { getPitch } from "@/lib/pitch";

export const dynamic = "force-dynamic";

// Metadatos genéricos a propósito: nada del job aparece en previews de links.
export const metadata: Metadata = {
  title: "A short video for you",
  robots: { index: false, follow: false, noarchive: true },
  openGraph: { title: "A short video for you" },
};

export default async function PitchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pitch = await getPitch(slug);
  if (!pitch) notFound();

  const introUrl = pitch.intro_video_url || process.env.INTRO_VIDEO_URL || null;
  const mainUrl = pitch.main_video_url || process.env.MAIN_VIDEO_URL || null;

  const jobText = [pitch.job_title, pitch.job_summary, ...(pitch.job_skills ?? [])].join(" ");
  const projects = pickProjects(jobText, 3);
  const greeting = pitch.client_name ? `Hi ${pitch.client_name},` : "Hi there,";

  return (
    <main className="wrap">
      <header className="top">
        <span className="brand">Henry Oropeza</span>
        <span className="brand-sub">AI automation · n8n · WhatsApp · booking</span>
      </header>

      <section className="hero">
        <p className="eyebrow">{greeting}</p>
        <h1 className="h1">
          I read your job post. Here&apos;s a quick look at how I&apos;d approach it.
        </h1>
        <p className="lead">
          This is a short walkthrough of similar work I&apos;ve built. If it&apos;s a fit, reply to my proposal on
          Upwork and we can talk it through.
        </p>
      </section>

      <PitchPlayer slug={pitch.slug} introUrl={introUrl} mainUrl={mainUrl}>
        <JobCard pitch={pitch} />
      </PitchPlayer>

      <PortfolioGrid projects={projects} />

      <section className="cta">
        <h2 className="h2">Next step</h2>
        <p className="lead">
          Reply to my proposal on Upwork. I&apos;m happy to start with a small, clearly scoped first task so you can
          judge the work before committing more.
        </p>
      </section>

      <footer className="foot">Synco Agency</footer>
    </main>
  );
}
