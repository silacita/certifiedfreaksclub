"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DISCONNECT_TONE_SRC,
  MANIFESTO_GAP_MS_MAX,
  MANIFESTO_GAP_MS_MIN,
  MANIFESTO_SEQUENCE,
  PHONE_PICKUP_SRC,
  POST_PICKUP_PAUSE_MS,
  TAPE_HISS_SRC,
  UNHEARD_AUDIO_SRCS,
} from "../lib/unheardMessageAudio";
import {
  createSequentialAudioPlayer,
  preloadAudioSources,
  randomGapMs,
  wait,
} from "../lib/sequentialAudioPlayer";

type Phase = "idle" | "pickup" | "message" | "disconnect" | "hiss" | "open";

const BAR_COUNT_DESKTOP = 48;
const BAR_COUNT_MOBILE = 28;

function useBarCount(): number {
  const [count, setCount] = useState(BAR_COUNT_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const apply = () => setCount(mq.matches ? BAR_COUNT_MOBILE : BAR_COUNT_DESKTOP);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return count;
}

export function UnheardMessageExperience() {
  const barCount = useBarCount();
  const playerRef = useRef<ReturnType<typeof createSequentialAudioPlayer> | null>(null);
  const runIdRef = useRef(0);

  const [needsTap, setNeedsTap] = useState(false);
  const [entering, setEntering] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [manifestoIndex, setManifestoIndex] = useState(-1);
  const [counter, setCounter] = useState("00:00");
  const [endingVisible, setEndingVisible] = useState(false);
  const [statusLine, setStatusLine] = useState(" ");
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    const cancelPreload = preloadAudioSources([PHONE_PICKUP_SRC]);
    return cancelPreload;
  }, []);

  useEffect(() => {
    const tick = () => {
      if (startedAt.current === null) return;
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      const m = Math.floor(s / 60);
      const r = s % 60;
      setCounter(`${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`);
    };
    const counterId = window.setInterval(tick, 500);
    return () => window.clearInterval(counterId);
  }, []);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  const runSequence = useCallback(async () => {
    const runId = ++runIdRef.current;
    const player = createSequentialAudioPlayer();
    playerRef.current = player;

    const cancelled = () => runId !== runIdRef.current;

    const preloadRest = preloadAudioSources(UNHEARD_AUDIO_SRCS);

    try {
      const ok = await player.unlock();
      if (cancelled()) return;
      if (!ok) {
        setEntering(false);
        setNeedsTap(true);
        return;
      }

      setNeedsTap(false);
      setEntering(false);
      setPhase("pickup");
      setStatusLine("connecting…");
      await player.play(PHONE_PICKUP_SRC);
      if (cancelled()) return;

      await wait(POST_PICKUP_PAUSE_MS);
      if (cancelled()) return;

      setPhase("message");
      startedAt.current = Date.now();

      for (let i = 0; i < MANIFESTO_SEQUENCE.length; i++) {
        if (cancelled()) return;
        setManifestoIndex(i);
        setStatusLine(`message ${i + 1} / ${MANIFESTO_SEQUENCE.length}`);
        await player.play(MANIFESTO_SEQUENCE[i]!);
        if (cancelled()) return;
        if (i < MANIFESTO_SEQUENCE.length - 1) {
          await wait(randomGapMs(MANIFESTO_GAP_MS_MIN, MANIFESTO_GAP_MS_MAX));
        }
      }

      if (cancelled()) return;
      setPhase("disconnect");
      setStatusLine("signal lost");
      await player.play(DISCONNECT_TONE_SRC);
      if (cancelled()) return;

      setPhase("hiss");
      setStatusLine("line open");
      await player.playLoop(TAPE_HISS_SRC, 0.08);
      await player.fadeVolume(0.08, 12, 100);
      if (cancelled()) return;

      setPhase("open");
      setStatusLine(" ");
      setEndingVisible(true);
    } catch {
      if (!cancelled()) {
        setPhase("open");
        setStatusLine(" ");
        setEndingVisible(true);
      }
    } finally {
      preloadRest();
    }
  }, []);

  const onEnter = useCallback(() => {
    setEntering(true);
    setNeedsTap(false);
    void runSequence();
  }, [runSequence]);

  useEffect(() => {
    setEntering(true);
    void runSequence().finally(() => {
      /* needsTap set inside runSequence if unlock fails */
    });
  }, [runSequence]);

  return (
    <div className="cfc-unheard relative min-h-dvh w-full overflow-hidden bg-[#050608] text-cfc-off-white">
      <div className="pointer-events-none absolute inset-0 cfc-unheard__grain" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70"
        aria-hidden
      />

      {needsTap && phase === "idle" && !entering ? (
        <button
          type="button"
          className="cfc-unheard-enter absolute inset-0 z-30 flex items-center justify-center bg-black/25 px-6 backdrop-blur-[2px]"
          onClick={onEnter}
          aria-label="Tap to enter the message"
        >
          <span className="max-w-xs text-center font-[family-name:var(--font-eb-garamond)] text-[0.95rem] italic leading-relaxed text-white/42 transition-colors hover:text-white/58">
            tap to enter
          </span>
        </button>
      ) : null}

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(4.5rem+env(safe-area-inset-top)))] sm:px-10 sm:pt-28">
        <header className="mb-8 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] pb-4 sm:mb-10">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span
              className="cfc-unheard__rec size-2 shrink-0 rounded-full bg-red-600/85 shadow-[0_0_12px_rgba(220,38,38,0.45)]"
              aria-hidden
            />
            <span className="truncate font-[family-name:var(--font-playfair)] text-[0.52rem] uppercase tracking-[0.28em] text-white/35 sm:text-[0.58rem] sm:tracking-[0.35em]">
              incoming
            </span>
          </div>
          <time
            className="shrink-0 font-mono text-[0.62rem] tabular-nums tracking-widest text-white/28 sm:text-[0.65rem]"
            dateTime="PT0S"
          >
            {counter}
          </time>
        </header>

        <div className="cfc-unheard__wave mb-10 flex h-9 w-full max-w-full items-end justify-center gap-px overflow-hidden opacity-50 sm:mb-12 sm:h-10">
          {Array.from({ length: barCount }).map((_, i) => (
            <span
              key={i}
              className="cfc-unheard__bar w-px shrink-0 rounded-full bg-white/25"
              style={{ animationDelay: `${i * 40}ms` }}
              aria-hidden
            />
          ))}
        </div>

        <div className="flex min-h-[6rem] flex-1 flex-col justify-center px-1">
          <p className="break-words text-center font-[family-name:var(--font-eb-garamond)] text-[0.9rem] italic leading-relaxed text-white/32 sm:text-sm">
            {statusLine}
          </p>
        </div>

        <footer
          className={`mt-auto shrink-0 border-t border-white/[0.05] pt-6 text-center transition-opacity duration-[2.4s] ease-out sm:pt-8 ${
            endingVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="mx-auto max-w-[16rem] font-[family-name:var(--font-eb-garamond)] text-[0.75rem] italic leading-snug tracking-[0.04em] text-white/42 sm:max-w-none sm:text-[0.8rem]">
            The line is still open.
          </p>
        </footer>
      </main>
    </div>
  );
}
