"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createFreaklandAudio } from "../lib/freaklandAudio";

type Phase = "incoming" | "blackout" | "terminal" | "ready" | "declined";

const TERMINAL_LINES = [
  "connection established...",
  "building frequency...",
] as const;

export function FreaklandLanding() {
  const audioRef = useRef<ReturnType<typeof createFreaklandAudio> | null>(null);
  const timersRef = useRef<number[]>([]);
  const [phase, setPhase] = useState<Phase>("incoming");
  const [terminalLine, setTerminalLine] = useState(0);
  const [barFull, setBarFull] = useState(false);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const startRing = useCallback(() => {
    audioRef.current?.startRing();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("fl-page-lock");
    return () => {
      document.documentElement.classList.remove("fl-page-lock");
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    const audio = createFreaklandAudio();
    audioRef.current = audio;
    let ringStarted = false;

    const tryStart = () => {
      if (ringStarted) return;
      audio.startRing();
      ringStarted = true;
    };

    tryStart();

    const unlock = () => {
      tryStart();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };

    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      audio.dispose();
      audioRef.current = null;
    };
  }, []);

  const handleAnswer = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.stopRing();
    await audio.playPickup();

    setPhase("blackout");

    schedule(() => {
      setPhase("terminal");
      setTerminalLine(0);
      setBarFull(false);

      schedule(() => setTerminalLine(1), 1400);

      schedule(() => {
        window.requestAnimationFrame(() => setBarFull(true));
      }, 80);

      schedule(() => setPhase("ready"), 4800);
    }, 1500);
  };

  const handleDecline = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.stopRing();
    await audio.playHangup();
    setPhase("declined");
  };

  const handleRetry = () => {
    clearTimers();
    setTerminalLine(0);
    setBarFull(false);
    setPhase("incoming");
    startRing();
  };

  return (
    <div className="fl-root" aria-live="polite">
      <div
        className={`fl-blackout${phase === "blackout" || phase === "terminal" ? " fl-blackout--visible" : ""}`}
        aria-hidden
      />

      <section
        className={`fl-screen${phase === "incoming" ? " fl-screen--active" : ""}`}
        aria-label="Incoming call"
        aria-hidden={phase !== "incoming"}
      >
        <div className="fl-call" role="dialog" aria-modal="true" aria-labelledby="fl-call-title">
          <div className="fl-call__header">Incoming call</div>
          <div className="fl-call__body">
            <h1 id="fl-call-title" className="fl-call__title">
              THE FREAKLAND
            </h1>
            <p className="fl-call__subtitle">is calling...</p>
          </div>
          <div className="fl-call__actions">
            <button
              type="button"
              className="fl-call__btn fl-call__btn--decline"
              onClick={() => void handleDecline()}
            >
              Decline
            </button>
            <button type="button" className="fl-call__btn" onClick={() => void handleAnswer()}>
              Answer
            </button>
          </div>
        </div>
      </section>

      <section
        className={`fl-screen${phase === "terminal" ? " fl-screen--active" : ""}`}
        aria-label="Connecting"
        aria-hidden={phase !== "terminal"}
      >
        <div className="fl-terminal">
          {TERMINAL_LINES.map((line, index) => (
            <p
              key={line}
              className={`fl-terminal__line${index > terminalLine ? " fl-terminal__line--dim" : ""}`}
              aria-hidden={index > terminalLine}
            >
              {index <= terminalLine ? line : ""}
            </p>
          ))}
          <div className="fl-terminal__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={barFull ? 100 : 0}>
            <span className={`fl-terminal__bar-fill${barFull ? " fl-terminal__bar-fill--full" : ""}`} />
          </div>
        </div>
      </section>

      <section
        className={`fl-screen${phase === "ready" ? " fl-screen--active" : ""}`}
        aria-label="Under construction"
        aria-hidden={phase !== "ready"}
      >
        <div className="fl-ready">
          <h1 className="fl-ready__title">THE FREAKLAND</h1>
          <div className="fl-ready__body">
            <p>is currently under construction.</p>
            <p>We&apos;re rebuilding the frequency.</p>
            <p>Check in soon.</p>
          </div>
        </div>
        <p className="fl-ready__footer">Certified Freaks Club</p>
      </section>

      <section
        className={`fl-screen${phase === "declined" ? " fl-screen--active" : ""}`}
        aria-label="Access denied"
        aria-hidden={phase !== "declined"}
      >
        <div className="fl-error">
          <h1 className="fl-error__code">ERROR 404</h1>
          <div className="fl-error__message">
            <p>FREQUENCY NOT MATCHED.</p>
            <p>Access denied.</p>
            <p>Please try again when your signal changes.</p>
          </div>
          <button type="button" className="fl-error__retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </section>
    </div>
  );
}
