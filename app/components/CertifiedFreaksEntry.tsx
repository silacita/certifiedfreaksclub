"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { MirrorRoom } from "./MirrorRoom";

type EntryChoice = "idle" | "ringing";

/*
 * FUTURE ROOMS (routing / scenes):
 * — Mirror Room: built below as MirrorRoom overlay.
 * — Motel Hallway: carpet hush, keycard hum, wrong door energy.
 * — Elevator: descent ritual, floor numbers as omens, metal breath.
 * — Digital Shrine: votive glow on bone screens, offerings as clicks.
 */

const DUST_MOTES = [
  { left: "8%", top: "12%", dx: "18vw", dy: "14vh", dur: "26s", size: 2 },
  { left: "22%", top: "78%", dx: "-12vw", dy: "-18vh", dur: "32s", size: 1.5 },
  { left: "41%", top: "34%", dx: "10vw", dy: "22vh", dur: "38s", size: 1 },
  { left: "55%", top: "61%", dx: "-20vw", dy: "8vh", dur: "29s", size: 2.5 },
  { left: "68%", top: "19%", dx: "14vw", dy: "16vh", dur: "34s", size: 1.2 },
  { left: "76%", top: "72%", dx: "-9vw", dy: "-12vh", dur: "41s", size: 1.8 },
  { left: "88%", top: "44%", dx: "-16vw", dy: "20vh", dur: "36s", size: 1 },
  { left: "14%", top: "52%", dx: "22vw", dy: "-10vh", dur: "30s", size: 1.4 },
  { left: "63%", top: "88%", dx: "6vw", dy: "-24vh", dur: "44s", size: 2 },
  { left: "91%", top: "11%", dx: "-11vw", dy: "11vh", dur: "27s", size: 1.6 },
  { left: "33%", top: "91%", dx: "-14vw", dy: "-8vh", dur: "33s", size: 1 },
  { left: "50%", top: "8%", dx: "8vw", dy: "18vh", dur: "39s", size: 1.3 },
  { left: "4%", top: "38%", dx: "15vw", dy: "12vh", dur: "35s", size: 0.9 },
  { left: "47%", top: "63%", dx: "-8vw", dy: "-14vh", dur: "42s", size: 1.1 },
  { left: "72%", top: "48%", dx: "11vw", dy: "10vh", dur: "31s", size: 0.8 },
  { left: "18%", top: "22%", dx: "-14vw", dy: "18vh", dur: "46s", size: 1 },
  { left: "84%", top: "56%", dx: "-10vw", dy: "-9vh", dur: "40s", size: 1.2 },
  { left: "29%", top: "71%", dx: "9vw", dy: "-11vh", dur: "37s", size: 0.85 },
] as const;

export function CertifiedFreaksEntry() {
  const [choice, setChoice] = useState<EntryChoice>("idle");
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [mirrorVisible, setMirrorVisible] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [cursorOn, setCursorOn] = useState(false);

  const landingFaded = mirrorOpen && mirrorVisible;

  useEffect(() => {
    if (!mirrorOpen) return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setMirrorVisible(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [mirrorOpen]);

  const onAnswer = useCallback(() => {
    setMirrorOpen(true);
  }, []);

  const onMirrorClose = useCallback(() => {
    setMirrorVisible(false);
    window.setTimeout(() => {
      setMirrorOpen(false);
    }, 2600);
  }, []);

  const onLetRing = useCallback(() => setChoice("ringing"), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setCursorOn(true);
    };
    const onLeave = () => setCursorOn(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const cursorGlowStyle: CSSProperties = {
    background: `radial-gradient(ellipse 260px 220px at ${cursor.x}px ${cursor.y}px,
      color-mix(in srgb, var(--color-cfc-burgundy) 14%, transparent) 0%,
      color-mix(in srgb, var(--color-cfc-off-white) 3.5%, transparent) 38%,
      transparent 58%)`,
    opacity: landingFaded ? 0 : cursorOn ? 0.55 : 0,
    transition: "opacity 1.4s ease",
  };

  return (
    <div className="relative min-h-dvh w-full">
      <div
        className={`cfc-scene-enter relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-cfc-smoky transition-opacity duration-[2600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          landingFaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {/* Base void */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cfc-black via-cfc-smoky to-cfc-black" />

        {/* Burgundy light leaks — dual layer, different tempos */}
        <div
          className="cfc-light-leak pointer-events-none absolute -inset-[22%] opacity-[0.58]"
          aria-hidden
        />
        <div
          className="cfc-light-leak-b pointer-events-none absolute -inset-[25%]"
          aria-hidden
        />

        {/* Faint edge vignette + soft core falloff */}
        <div className="cfc-vignette-edge pointer-events-none absolute inset-0" aria-hidden />
        <div className="cfc-vignette-core pointer-events-none absolute inset-0" aria-hidden />

        {/* Drifting dust — dim, slow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {DUST_MOTES.map((m, i) => (
            <span
              key={i}
              className="cfc-dust-mote absolute rounded-full bg-cfc-bone/50 blur-[1px]"
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: m.size,
                  height: m.size,
                  "--dx": m.dx,
                  "--dy": m.dy,
                  "--dur": m.dur,
                  animationDelay: `${i * 1.4}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* Moving film grain — two depths */}
        <div
          className="cfc-grain-layer-a pointer-events-none absolute inset-0 scale-110"
          aria-hidden
        />
        <div
          className="cfc-grain-layer-b pointer-events-none absolute inset-0"
          aria-hidden
        />

        {/* Subtle cursor-follow ambience (burgundy / off-white, matte) */}
        <div
          className="cfc-cursor-glow pointer-events-none fixed inset-0 z-[6] mix-blend-soft-light"
          style={cursorGlowStyle}
          aria-hidden
        />

        {/* Content */}
        <main className="relative z-10 flex min-h-dvh flex-1 flex-col justify-between px-6 pb-14 pt-24 sm:px-10 sm:pb-16 sm:pt-28 md:px-14">
          <div
            className={`flex flex-1 flex-col items-center justify-center transition-opacity duration-[1.4s] ease-out ${
              choice === "ringing" ? "opacity-35" : "opacity-100"
            }`}
          >
            <h1
              className="cfc-hero-title will-change-transform"
              style={{ fontFamily: '"Tan Buster", serif' }}
            >
              <span
                className="cfc-title-line cfc-hero-line cfc-hero-line--certified"
                style={{ fontFamily: '"Tan Buster", serif' }}
              >
                CERTIFIED
              </span>
              <span
                className="cfc-title-line cfc-hero-line cfc-hero-line--freaks"
                style={{ fontFamily: '"Tan Buster", serif' }}
              >
                FREAKS
              </span>
              <span
                className="cfc-title-line cfc-hero-line cfc-hero-line--club"
                style={{ fontFamily: '"Tan Buster", serif' }}
              >
                CLUB
              </span>
            </h1>
          </div>

          <section
            className={`mx-auto w-full max-w-md transition-all duration-1000 ease-out ${
              choice === "ringing" ? "opacity-40" : ""
            }`}
            aria-label="Entry"
          >
            <p
              className={`lowercase font-[family-name:var(--font-eb-garamond)] text-center text-[0.9375rem] font-normal italic leading-[1.85] tracking-[0.03em] text-cfc-off-white/78 sm:text-[1.0625rem] ${
                choice === "idle" && !mirrorOpen ? "cfc-transmission-breathe" : ""
              }`}
            >
              scanning for matching freakquency
            </p>

            {choice === "ringing" && (
              <p className="mt-5 text-center font-[family-name:var(--font-eb-garamond)] text-sm italic leading-relaxed text-cfc-tarnished sm:text-base">
                The signal thins. Nothing owes you an entrance.
              </p>
            )}

            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <button
                type="button"
                onClick={onAnswer}
                disabled={choice !== "idle" || mirrorOpen}
                className="cfc-btn-primary group relative overflow-hidden border border-cfc-bone/35 bg-cfc-black/40 px-8 py-4 text-center font-[family-name:var(--font-playfair)] text-xs uppercase tracking-[0.35em] text-cfc-off-white hover:border-cfc-bone/50 hover:bg-cfc-dark-red/25 disabled:cursor-default disabled:opacity-50 sm:min-w-[11rem]"
              >
                <span className="relative z-10">ANSWER</span>
                <span
                  className="cfc-btn-primary-gleam pointer-events-none absolute inset-0 z-[1]"
                  aria-hidden
                >
                  <span className="cfc-btn-primary-gleam-inner" />
                </span>
              </button>
              <button
                type="button"
                onClick={onLetRing}
                disabled={choice !== "idle" || mirrorOpen}
                className="cfc-btn-ghost border border-transparent px-8 py-4 text-center font-[family-name:var(--font-playfair)] text-xs uppercase tracking-[0.35em] text-cfc-tarnished underline-offset-[0.35em] hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50 sm:min-w-[11rem]"
              >
                LET IT RING
              </button>
            </div>
          </section>
        </main>
      </div>

      {mirrorOpen ? <MirrorRoom visible={mirrorVisible} onClose={onMirrorClose} /> : null}
    </div>
  );
}
