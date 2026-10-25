"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Phase = "idle" | "intro" | "main";

function send(slug: string, event: "view" | "play" | "finish") {
  try {
    const body = JSON.stringify({ slug, event });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
      return;
    }
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* las métricas nunca rompen la página */
  }
}

type Props = {
  slug: string;
  introUrl: string | null;
  mainUrl: string | null;
  children: ReactNode; // la tarjeta del job
};

export default function PitchPlayer({ slug, introUrl, mainUrl, children }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const introRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(introUrl || mainUrl);

  useEffect(() => {
    send(slug, "view");
  }, [slug]);

  useEffect(() => {
    if (phase === "intro") introRef.current?.play().catch(() => {});
    if (phase === "main") mainRef.current?.play().catch(() => {});
  }, [phase]);

  const start = () => {
    send(slug, "play");
    if (introUrl) setPhase("intro");
    else if (mainUrl) setPhase("main");
  };

  const afterIntro = () => {
    if (mainUrl) setPhase("main");
    else setPhase("idle");
  };

  return (
    <div className="stage" data-phase={phase}>
      {phase !== "main" && <div className="stage-card">{children}</div>}

      {phase === "idle" && (
        <div className="stage-overlay">
          {hasVideo ? (
            <button type="button" className="play" onClick={start}>
              <span className="play-icon" aria-hidden="true">
                ▶
              </span>
              Watch (about 1 min)
            </button>
          ) : (
            <p className="muted">Video coming soon.</p>
          )}
        </div>
      )}

      {phase === "intro" && introUrl && (
        <div className="pip">
          <video
            ref={introRef}
            src={introUrl}
            playsInline
            autoPlay
            onEnded={afterIntro}
            onError={afterIntro}
          />
          <button type="button" className="skip" onClick={afterIntro}>
            Skip intro
          </button>
        </div>
      )}

      {phase === "main" && mainUrl && (
        <video
          ref={mainRef}
          className="main-video"
          src={mainUrl}
          controls
          playsInline
          autoPlay
          onEnded={() => send(slug, "finish")}
        />
      )}
    </div>
  );
}
