"use client";

import { useEffect, useState } from "react";

/**
 * Captura de un proyecto real. Mientras no exista el archivo (o mientras carga) muestra un bloque
 * neutro, así nunca se ve el icono de imagen rota.
 */
export default function WorkImage({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (!src) return;
    const probe = new window.Image();
    probe.onload = () => setReady(true);
    probe.onerror = () => setReady(false);
    probe.src = src;
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src]);

  if (!src || !ready) {
    return (
      <div className="work-thumb work-thumb-empty" aria-hidden="true">
        <span>{fallback}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="work-thumb" src={src} alt={alt} loading="lazy" />;
}
