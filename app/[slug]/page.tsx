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
  const combinedUrl = process.env.COMBINED_VIDEO_URL || null;
  const introSeconds = Number(process.env.INTRO_SECONDS || 0) || 0;
  const avatarUrl = process.env.AVATAR_URL || null;
  const profileUrl = process.env.UPWORK_PROFILE_URL || null;

  const jobText = [pitch.job_title, pitch.job_summary, ...(pitch.job_skills ?? [])].join(" ");
  const projects = pickProjects(jobText, 3);
  const greeting = pitch.client_name ? `Hi ${pitch.client_name},` : "Hi there,";

  return (
    <>
      <header className="bar">
        <div className="bar-inner">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="avatar" src={avatarUrl} alt="Henry Oropeza" />
          ) : (
            <span className="avatar avatar-initials" aria-hidden="true">
              H
            </span>
          )}
          <div className="bar-text">
            <span className="brand">Henry Oropeza</span>
            <span className="brand-sub">AI automation · n8n · WhatsApp · booking systems</span>
          </div>
          <span className="bar-badge">Proposal video</span>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">{greeting}</p>
          <h1 className="h1">I read your job post. Here&apos;s a quick look at how I&apos;d approach it.</h1>
          <p className="lead">
            A short walkthrough of similar work I&apos;ve built. If it&apos;s a fit, reply to my proposal on Upwork and
            we&apos;ll take it from there.
          </p>
        </section>

        <PitchPlayer
          slug={pitch.slug}
          introUrl={introUrl}
          mainUrl={mainUrl}
          combinedUrl={combinedUrl}
          introSeconds={introSeconds}
        >
          <JobCard pitch={pitch} />
        </PitchPlayer>

        <ul className="trust" aria-label="Why you can trust this page">
          <li>
            <strong>A real person</strong>
            <span>Recorded by me, for this job. No templates, no bots.</span>
          </li>
          <li>
            <strong>Real projects</strong>
            <span>Everything below is work I built, not mock-ups.</span>
          </li>
          <li>
            <strong>Everything stays on Upwork</strong>
            <span>Messages, contract and payment run through the platform.</span>
          </li>
        </ul>

        <PortfolioGrid projects={projects} />

        <section className="cta">
          <h2 className="cta-title">Ready to talk it through?</h2>
          <p className="cta-text">
            Reply to my proposal on Upwork. I&apos;m happy to start with a small, clearly scoped first task so you can
            judge the work before committing more.
          </p>
          {profileUrl ? (
            <a className="btn" href={profileUrl} target="_blank" rel="noopener noreferrer">
              View my Upwork profile
            </a>
          ) : (
            <p className="cta-hint">Look for my proposal in your Upwork inbox.</p>
          )}
        </section>

        <footer className="foot">Henry Oropeza · Synco Agency</footer>
      </main>
    </>
  );
}
