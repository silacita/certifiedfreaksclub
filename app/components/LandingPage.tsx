"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "work",
    label: "WORK",
    note: "Selected experiments in image, sound and spatial narrative.",
  },
  {
    id: "projects",
    label: "PROJECTS",
    note: "Long-form worlds built for the subconscious.",
  },
  {
    id: "about",
    label: "ABOUT",
    note: "A private creative collective. Invitation only.",
  },
  {
    id: "contact",
    label: "CONTACT",
    note: "For commissions and collaborations — silence is also a reply.",
  },
] as const;

export function LandingPage() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("cfc-landing__section--visible");
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cfc-landing">
      <div className="cfc-landing__grain" aria-hidden />
      <div className="cfc-landing__vignette" aria-hidden />
      <div className="cfc-landing__chrome-sheen" aria-hidden />

      <section className="cfc-landing__hero" aria-label="Certified Freaks Club">
        <h1 className="cfc-landing__title">
          <span className="cfc-landing__title-line">CERTIFIED</span>
          <span className="cfc-landing__title-line">FREAKS</span>
          <span className="cfc-landing__title-line">CLUB</span>
        </h1>

        <p className="cfc-landing__subtitle">private creative collective</p>

        <div className="cfc-landing__cta-wrap">
          <Link href="/hotel" className="cfc-landing__cta">
            ENTER
          </Link>
        </div>
      </section>

      <div className="cfc-landing__sections">
        {SECTIONS.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className="cfc-landing__section"
            aria-label={section.label}
          >
            <h2 className="cfc-landing__section-label">{section.label}</h2>
            <span className="cfc-landing__section-rule" aria-hidden />
            <p className="cfc-landing__section-note">{section.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
