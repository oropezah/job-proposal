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
  /** Un solo archivo con intro + principal pegados (ver tools/make_combined.py). */
  combinedUrl: string | null;
  /** Duración del intro dentro del archivo combinado, en segundos. */
  introSeconds: number;
  children: ReactNode; // la tarjeta del job
};

export default function PitchPlayer({ slug, introUrl, mainUrl, combinedUrl, introSeconds, children }: Props) {
  const combined = Boolean(combinedUrl && introSeconds > 0);
  return combined ? (
    <CombinedStage slug={slug} url={combinedUrl!} introSeconds={introSeconds}>
      {children}
    </CombinedStage>
  ) : (
    <TwoFileStage slug={slug} introUrl={introUrl} mainUrl={mainUrl}>
      {children}
    </TwoFileStage>
  );
}

/* ------------------------------------------------------------------ */
/* Modo A: UN solo video (intro + principal). Sin cortes ni esperas.   */
/* ------------------------------------------------------------------ */
function CombinedStage({
  slug,
  url,
  introSeconds,
  children,
}: {
  slug: string;
  url: string;
  introSeconds: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [inIntro, setInIntro] = useState(true);

  useEffect(() => {
    send(slug, "view");
  }, [slug]);

  const start = () => {
    send(slug, "play");
    setStarted(true);
    const v = ref.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  const onTime = () => {
    const v = ref.current;
    if (v) setInIntro(v.currentTime < introSeconds);
  };

  const skip = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = introSeconds + 0.05;
    setInIntro(false);
  };

  const mode = !started ? "idle" : inIntro ? "intro" : "main";

  return (
    <div className="stage" data-phase={mode}>
      <div className="stage-card">{children}</div>

      {!started && (
        <div className="stage-overlay">
          <button type="button" className="play" onClick={start}>
            <span className="play-icon" aria-hidden="true">
              ▶
            </span>
            Watch (about 1 min)
          </button>
        </div>
      )}

      <video
        ref={ref}
        className={`solo ${mode}`}
        src={url}
        preload="auto"
        playsInline
        controls={mode === "main"}
        onTimeUpdate={onTime}
        onSeeked={onTime}
        onEnded={() => send(slug, "finish")}
        style={{ visibility: started ? "visible" : "hidden" }}
      />

      {mode === "intro" && (
        <button type="button" className="skip" onClick={skip}>
          Skip intro
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modo B: dos archivos. El principal se precarga mientras suena el     */
/* intro para que el cambio sea lo más rápido posible.                  */
/* ------------------------------------------------------------------ */
function TwoFileStage({
  slug,
  introUrl,
  mainUrl,
  children,
}: {
  slug: string;
  introUrl: string | null;
  mainUrl: string | null;
  children: ReactNode;
}) {
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
    // empieza a bajar el principal ya, mientras suena el intro
    const m = mainRef.current;
    if (m) {
      m.preload = "auto";
      m.load();
    }
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
        <>
          <div className="pip">
            <video
              ref={introRef}
              src={introUrl}
              playsInline
              autoPlay
              onEnded={afterIntro}
              onError={afterIntro}
            />
          </div>
          <button type="button" className="skip" onClick={afterIntro}>
            Skip intro
          </button>
        </>
      )}

      {mainUrl && (
        <video
          ref={mainRef}
          className="main-video"
          src={mainUrl}
          preload="metadata"
          controls
          playsInline
          onEnded={() => send(slug, "finish")}
          style={{ visibility: phase === "main" ? "visible" : "hidden" }}
        />
      )}
    </div>
  );
}
