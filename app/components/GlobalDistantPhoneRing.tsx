"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { DISTANT_RING_SRC } from "../lib/unheardMessageAudio";

const UNHEARD_PATH = "/unheard-message";

/**
 * Distant vintage phone ring on every route except the unheard page.
 * Single instance, no overlap; unlocks on first user gesture if autoplay blocks.
 */
export function GlobalDistantPhoneRing() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const panAnimRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const startingRef = useRef(false);

  useEffect(() => {
    const onUnheard = pathname === UNHEARD_PATH;

    const teardown = () => {
      if (panAnimRef.current !== null) {
        cancelAnimationFrame(panAnimRef.current);
        panAnimRef.current = null;
      }
      try {
        void ctxRef.current?.close();
      } catch {
        /* ignore */
      }
      ctxRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }
      startingRef.current = false;
    };

    if (onUnheard) {
      teardown();
      return;
    }

    let cancelled = false;
    let removeUnlock: (() => void) | undefined;

    const startRing = async () => {
      if (cancelled || startingRef.current || audioRef.current) return;
      startingRef.current = true;

      const audio = new Audio(DISTANT_RING_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      audio.volume = 1;

      const ctx = new AudioContext();
      const src = ctx.createMediaElementSource(audio);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 2400;
      low.Q.value = 0.7;

      const wet = ctx.createGain();
      wet.gain.value = 0.42;

      const pan = ctx.createStereoPanner();
      pan.pan.value = 0;

      const master = ctx.createGain();
      master.gain.value = 0.55;

      src.connect(low);
      low.connect(wet);
      wet.connect(pan);
      pan.connect(master);
      master.connect(ctx.destination);

      const wander = () => {
        if (cancelled) return;
        phaseRef.current += 0.011 + Math.random() * 0.006;
        const t = phaseRef.current;
        const base = Math.sin(t * 0.35) * 0.42;
        const wobble = Math.sin(t * 1.7) * 0.12 + (Math.random() - 0.5) * 0.06;
        pan.pan.value = Math.max(-1, Math.min(1, base + wobble));
        panAnimRef.current = requestAnimationFrame(wander);
      };
      panAnimRef.current = requestAnimationFrame(wander);

      try {
        await ctx.resume();
        await audio.play();
        if (cancelled) {
          audio.pause();
          void ctx.close();
          startingRef.current = false;
          return;
        }
        audioRef.current = audio;
        ctxRef.current = ctx;
      } catch {
        void ctx.close();
        startingRef.current = false;

        const unlock = () => {
          window.removeEventListener("pointerdown", unlock, true);
          window.removeEventListener("touchend", unlock, true);
          void startRing();
        };
        window.addEventListener("pointerdown", unlock, { once: true, capture: true });
        window.addEventListener("touchend", unlock, { once: true, capture: true });
        removeUnlock = () => {
          window.removeEventListener("pointerdown", unlock, true);
          window.removeEventListener("touchend", unlock, true);
        };
      }
    };

    void startRing();

    return () => {
      cancelled = true;
      removeUnlock?.();
      teardown();
    };
  }, [pathname]);

  return null;
}
