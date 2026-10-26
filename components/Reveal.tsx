"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Aparece suavemente la primera vez que entra en pantalla (una sola vez, nunca se repite).
 * Solo transform + opacity. El escalonado viene de `index` (70 ms por paso, ver globals.css).
 * Sin JavaScript el contenido se ve normal: el estado oculto solo existe cuando <html> tiene la clase "js".
 */
export default function Reveal({
  children,
  index = 0,
  tag = "div",
  className = "",
}: {
  children: ReactNode;
  index?: number;
  tag?: "div" | "li" | "section" | "article" | "header";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = tag as ElementType;
  return (
    <Tag
      ref={ref}
      className={`reveal${seen ? " in" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
