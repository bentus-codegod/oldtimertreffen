"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "section" | "li" | "article" | "header" | "p" | "span";

/**
 * Blendet seinen Inhalt sanft ein, sobald er in den sichtbaren Bereich scrollt
 * (bzw. sofort, wenn er beim Laden schon sichtbar ist). Bewusst dezent und
 * kurz – respektiert „prefers-reduced-motion“ über die CSS-Regeln in globals.css.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  once = true,
  ...rest
}: {
  children: ReactNode;
  as?: Tag;
  delay?: number;
  className?: string;
  once?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Component = Tag as "div";
  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${shown ? "is-visible" : ""} ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Component>
  );
}
