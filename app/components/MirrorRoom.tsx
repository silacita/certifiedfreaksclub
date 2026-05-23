"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AMBIENT_SRC,
  CENTRAL_PSYCH_HOTSPOT_ID,
  MIRROR_DEBUG_PROBE_SRC,
  MIRROR_DEBUG_TEST_SRC,
  MIRROR_VOICE_HOTSPOTS,
  type MirrorVoiceHotspot,
} from "../lib/mirrorRoomAudio";

/** Temporary — remove after Mirror Room audio is confirmed on production. */
const MIRROR_AUDIO_DEBUG = true;

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MirrorLiftId = "left" | "center" | "right";

type AudioDebugLine = {
  at: string;
  hotspotId: string;
  event: string;
  src: string;
  playResult: string;
  error: string;
};

const INTRO_DELAY_MS = 1800;
const LONG_DWELL_MS = 5000;
const NOTICE_MS = 1600;
const DISCOVER_START_MS = 36000;
const DISCOVER_BRIGHTEN_MS = 22000;
const DISCOVER_TEXT_PAUSE_MS = 1800;

function clearTimeouts(ref: { current: ReturnType<typeof setTimeout>[] }) {
  for (const t of ref.current) {
    clearTimeout(t);
  }
  ref.current = [];
}

function logMirrorAudio(message: string, detail?: Record<string, unknown>) {
  if (!MIRROR_AUDIO_DEBUG) return;
  if (detail) {
    console.log(`[MirrorRoom audio] ${message}`, detail);
  } else {
    console.log(`[MirrorRoom audio] ${message}`);
  }
}

export function MirrorRoom({ visible, onClose }: Props) {
  const onBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const playedWhileInsideRef = useRef<Set<string>>(new Set());
  const voicePlayGenRef = useRef(0);

  const [debugLines, setDebugLines] = useState<AudioDebugLine[]>([]);
  const [debugProbe, setDebugProbe] = useState("not run");
  const [debugUnlock, setDebugUnlock] = useState("locked");
  const [debugRoomState, setDebugRoomState] = useState("hidden");

  const pushDebug = useCallback((line: Omit<AudioDebugLine, "at">) => {
    if (!MIRROR_AUDIO_DEBUG) return;
    const entry: AudioDebugLine = { ...line, at: new Date().toISOString().slice(11, 23) };
    setDebugLines((prev) => [entry, ...prev].slice(0, 8));
    logMirrorAudio(`${line.event} · ${line.hotspotId}`, {
      src: line.src,
      playResult: line.playResult,
      error: line.error,
    });
  }, []);

  const glowFrame = useMemo<MirrorLiftId | null>(() => {
    if (!hoveredHotspotId) return null;
    const row = MIRROR_VOICE_HOTSPOTS.find((h) => h.id === hoveredHotspotId);
    return row ? row.glow : null;
  }, [hoveredHotspotId]);

  const [discoveryAwake, setDiscoveryAwake] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [hoverCount, setHoverCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const hoverCountRef = useRef(0);
  const engineTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const discoveryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const visibleRef = useRef(false);

  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const ambientStartedRef = useRef(false);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const voiceUnlockedRef = useRef(false);

  const clearEngineTimers = useCallback(() => {
    clearTimeouts(engineTimersRef);
  }, []);

  const clearDiscoveryTimers = useCallback(() => {
    clearTimeouts(discoveryTimersRef);
  }, []);

  const ensureVoiceEl = useCallback((): HTMLAudioElement => {
    if (!voiceRef.current) {
      const v = new Audio();
      v.preload = "none";
      v.loop = false;
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      voiceRef.current = v;
    }
    return voiceRef.current;
  }, []);

  const probeAudioFile = useCallback(async (src: string) => {
    try {
      const res = await fetch(src, { method: "HEAD", cache: "no-store" });
      const result = `HEAD ${src} → ${res.status} ${res.statusText}`;
      setDebugProbe(result);
      logMirrorAudio("file probe", { result });
      return res.ok;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const result = `HEAD ${src} → FAILED (${msg})`;
      setDebugProbe(result);
      logMirrorAudio("file probe failed", { result });
      return false;
    }
  }, []);

  const playMirrorClip = useCallback(
    async (hotspotId: string, src: string, opts?: { skipPsych?: boolean }) => {
      pushDebug({
        hotspotId,
        event: "pointer enter / tap",
        src,
        playResult: "attempting…",
        error: "",
      });

      const v = ensureVoiceEl();
      const gen = ++voicePlayGenRef.current;
      v.pause();
      v.currentTime = 0;
      v.loop = false;
      v.volume = 1;
      v.src = src;

      const onError = () => {
        if (voicePlayGenRef.current !== gen) return;
        const code = v.error?.code ?? "unknown";
        const msg = v.error?.message ?? "MediaElement error event";
        pushDebug({
          hotspotId,
          event: "audio error",
          src,
          playResult: "FAILED (load/decode)",
          error: `${code}: ${msg}`,
        });
      };

      v.addEventListener("error", onError, { once: true });

      try {
        await v.play();
        if (voicePlayGenRef.current !== gen) return;
        pushDebug({
          hotspotId,
          event: "audio.play()",
          src,
          playResult: "SUCCESS",
          error: "",
        });
      } catch (e) {
        if (voicePlayGenRef.current !== gen) return;
        const msg = e instanceof Error ? e.message : String(e);
        pushDebug({
          hotspotId,
          event: "audio.play()",
          src,
          playResult: "FAILED (play rejected)",
          error: msg,
        });
        playedWhileInsideRef.current.delete(hotspotId);
      } finally {
        v.removeEventListener("error", onError);
      }

      if (!opts?.skipPsych && hotspotId === CENTRAL_PSYCH_HOTSPOT_ID) {
        onCentralMirrorHitEnterRef.current();
      }
    },
    [ensureVoiceEl, pushDebug],
  );

  const onCentralMirrorHitEnter = useCallback(() => {
    clearEngineTimers();

    const snap = hoverCountRef.current;

    const introTimer = setTimeout(() => {
      if (!visibleRef.current) return;
      const msg =
        snap === 0 ? "interesting. you needed a response." : "you came back.";
      setCurrentMessage(msg);
      setIsMessageVisible(true);
    }, INTRO_DELAY_MS);

    const longTimer = setTimeout(() => {
      if (!visibleRef.current) return;
      setCurrentMessage("still looking?");
      setIsMessageVisible(true);
    }, LONG_DWELL_MS);

    engineTimersRef.current.push(introTimer, longTimer);
  }, [clearEngineTimers]);

  const onCentralMirrorHitLeave = useCallback(() => {
    clearEngineTimers();
    setCurrentMessage("the room noticed you.");
    setIsMessageVisible(true);

    const hideTimer = setTimeout(() => {
      setIsMessageVisible(false);
      const clearTimer = setTimeout(() => {
        setCurrentMessage(null);
        setHoverCount((c) => c + 1);
      }, 900);
      engineTimersRef.current.push(clearTimer);
    }, NOTICE_MS);
    engineTimersRef.current.push(hideTimer);
  }, [clearEngineTimers]);

  const onCentralMirrorHitEnterRef = useRef(onCentralMirrorHitEnter);
  const onCentralMirrorHitLeaveRef = useRef(onCentralMirrorHitLeave);
  onCentralMirrorHitEnterRef.current = onCentralMirrorHitEnter;
  onCentralMirrorHitLeaveRef.current = onCentralMirrorHitLeave;

  const unlockMirrorVoice = useCallback(async () => {
    if (voiceUnlockedRef.current) {
      setDebugUnlock("already unlocked");
      return true;
    }
    const v = ensureVoiceEl();
    const prevVol = v.volume;
    v.volume = 0.001;
    v.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    try {
      await v.play();
      v.pause();
      v.removeAttribute("src");
      v.load();
      v.volume = prevVol;
      voiceUnlockedRef.current = true;
      setDebugUnlock("SUCCESS (silent unlock played)");
      logMirrorAudio("voice unlock success");
      return true;
    } catch (e) {
      v.volume = prevVol;
      const msg = e instanceof Error ? e.message : String(e);
      setDebugUnlock(`FAILED (${msg})`);
      logMirrorAudio("voice unlock failed", { error: msg });
      return false;
    }
  }, [ensureVoiceEl]);

  const tryStartAmbientOnInteraction = useCallback(() => {
    void unlockMirrorVoice();
    if (ambientStartedRef.current) return;
    ambientStartedRef.current = true;

    const a = new Audio(AMBIENT_SRC);
    a.loop = false;
    a.preload = "none";
    a.volume = 0.14;
    ambientRef.current = a;

    void a.play().catch(() => {
      ambientStartedRef.current = false;
      ambientRef.current = null;
    });
  }, [unlockMirrorVoice]);

  const onVoiceHotspotEnter = useCallback(
    (h: MirrorVoiceHotspot) => {
      tryStartAmbientOnInteraction();
      setHoveredHotspotId(h.id);

      if (playedWhileInsideRef.current.has(h.id)) {
        pushDebug({
          hotspotId: h.id,
          event: "pointer enter (skipped)",
          src: h.audioPath,
          playResult: "skipped — already played this dwell",
          error: "",
        });
        return;
      }
      playedWhileInsideRef.current.add(h.id);

      void playMirrorClip(h.id, h.audioPath);
    },
    [playMirrorClip, pushDebug, tryStartAmbientOnInteraction],
  );

  const onVoiceHotspotLeave = useCallback(
    (h: MirrorVoiceHotspot) => {
      playedWhileInsideRef.current.delete(h.id);
      setHoveredHotspotId((cur) => (cur === h.id ? null : cur));
      pushDebug({
        hotspotId: h.id,
        event: "pointer leave",
        src: h.audioPath,
        playResult: "—",
        error: "",
      });
      if (h.id === CENTRAL_PSYCH_HOTSPOT_ID) {
        onCentralMirrorHitLeaveRef.current();
      }
    },
    [pushDebug],
  );

  const onDebugTestTap = useCallback(() => {
    tryStartAmbientOnInteraction();
    setHoveredHotspotId("DEBUG-TEST");
    playedWhileInsideRef.current.delete("DEBUG-TEST");
    playedWhileInsideRef.current.add("DEBUG-TEST");
    void playMirrorClip("DEBUG-TEST", MIRROR_DEBUG_TEST_SRC, { skipPsych: true });
  }, [playMirrorClip, tryStartAmbientOnInteraction]);

  useEffect(() => {
    visibleRef.current = visible;
    setDebugRoomState(visible ? "visible (pointer-events on)" : "hidden (pointer-events off)");
    logMirrorAudio("room visibility", { visible });
  }, [visible]);

  useEffect(() => {
    if (!visible || !MIRROR_AUDIO_DEBUG) return;
    void probeAudioFile(MIRROR_DEBUG_PROBE_SRC);
  }, [visible, probeAudioFile]);

  useEffect(() => {
    hoverCountRef.current = hoverCount;
  }, [hoverCount]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!visible) {
      clearDiscoveryTimers();
      clearEngineTimers();
      playedWhileInsideRef.current.clear();
      voicePlayGenRef.current += 1;
      voiceUnlockedRef.current = false;
      ambientStartedRef.current = false;
      hoverCountRef.current = 0;
      setHoverCount(0);
      setHoveredHotspotId(null);
      setCurrentMessage(null);
      setIsMessageVisible(false);
      setDiscoveryAwake(false);
      setDebugLines([]);
      setDebugProbe("not run");
      setDebugUnlock("locked");
      ambientRef.current?.pause();
      ambientRef.current = null;
      voiceRef.current?.pause();
      voiceRef.current = null;
      return;
    }

    const tAwake = setTimeout(() => {
      setDiscoveryAwake(true);
    }, DISCOVER_START_MS);
    const tStay = setTimeout(() => {
      if (!visibleRef.current) return;
      clearEngineTimers();
      setCurrentMessage("you stayed.");
      setIsMessageVisible(true);
    }, DISCOVER_START_MS + DISCOVER_BRIGHTEN_MS + DISCOVER_TEXT_PAUSE_MS);
    discoveryTimersRef.current.push(tAwake, tStay);

    return () => {
      clearDiscoveryTimers();
    };
  }, [visible, clearDiscoveryTimers, clearEngineTimers]);

  const psychRootClass =
    `mir-psych${reduceMotion ? " mir-psych--reduce-motion" : ""}` +
    `${discoveryAwake ? " mir-psych--discovery-awake" : ""}`;

  return (
    <div
      className={`cfc-mirror-root ${psychRootClass} fixed inset-0 z-[40] overflow-hidden transition-opacity duration-[2600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!visible}
      onPointerDown={() => {
        tryStartAmbientOnInteraction();
      }}
    >
      <div className="mir-psych__photo-deep">
        <div className="mir-env__photo-bg mir-psych__photo-base" aria-hidden />
        <div className="mir-psych__photo-echo" aria-hidden />
      </div>

      <div className="mir-env__readability-overlay mir-psych__readability mir-psych__readability--breath" aria-hidden />

      <div className="mir-psych__atmosphere mir-psych__atmosphere--pulse" aria-hidden />

      <div className="mir-psych__lift mir-psych__lift--distant" aria-hidden />

      <div
        className={`mir-psych__lift mir-psych__lift--left ${glowFrame === "left" ? "mir-psych__lift--on" : ""}`}
        aria-hidden
      />
      <div
        className={`mir-psych__lift mir-psych__lift--center ${glowFrame === "center" ? "mir-psych__lift--on" : ""}`}
        aria-hidden
      />
      <div
        className={`mir-psych__lift mir-psych__lift--right ${glowFrame === "right" ? "mir-psych__lift--on" : ""}`}
        aria-hidden
      />

      <div className="mir-psych__reflection-fx">
        <div className="mir-psych__depth-plane mir-psych__depth-plane--far" aria-hidden />
        <div className="mir-psych__depth-plane mir-psych__depth-plane--near" aria-hidden />

        <div className="mir-psych__cinema-field" aria-hidden>
          <div className="mir-psych__cinema-field__sheet mir-psych__cinema-field__sheet--a" />
          <div className="mir-psych__cinema-field__sheet mir-psych__cinema-field__sheet--b" />
        </div>

        <div className="mir-psych__env-light" aria-hidden>
          <div className="mir-psych__env-light__sheet mir-psych__env-light__sheet--a" />
          <div className="mir-psych__env-light__sheet mir-psych__env-light__sheet--b" />
        </div>

        <div className="mir-psych__mirror-live mir-psych__mirror-live--left" aria-hidden>
          <div className="mir-psych__mirror-live__reflection" />
          <div className="mir-psych__mirror-live__sheen" />
        </div>
        <div className="mir-psych__mirror-live mir-psych__mirror-live--center" aria-hidden>
          <div className="mir-psych__mirror-live__reflection" />
          <div className="mir-psych__mirror-live__sheen" />
        </div>
        <div className="mir-psych__mirror-live mir-psych__mirror-live--right" aria-hidden>
          <div className="mir-psych__mirror-live__reflection" />
          <div className="mir-psych__mirror-live__sheen" />
        </div>

        <div
          className={`mir-psych__mirror-surface mir-psych__mirror-surface--left ${glowFrame === "left" ? "mir-psych__mirror-surface--active" : ""}`}
          aria-hidden
        />
        <div
          className={`mir-psych__mirror-surface mir-psych__mirror-surface--center ${glowFrame === "center" ? "mir-psych__mirror-surface--active" : ""}`}
          aria-hidden
        />
        <div
          className={`mir-psych__mirror-surface mir-psych__mirror-surface--right ${glowFrame === "right" ? "mir-psych__mirror-surface--active" : ""}`}
          aria-hidden
        />
        <div className="mir-psych__photo-grain" aria-hidden />
        <div className="mir-psych__ambient-gloss" aria-hidden />
      </div>

      <div className="mir-psych__veil-drift" aria-hidden />

      <div className="mir-psych__mirror-audio-hits">
        {MIRROR_VOICE_HOTSPOTS.map((h) => (
          <div
            key={h.id}
            className="mir-psych__voice-spot"
            style={{
              left: `${h.layout.leftPct}%`,
              top: `${h.layout.topPct}%`,
              width: `${h.layout.widthPct}%`,
              height: `${h.layout.heightPct}%`,
            }}
            onPointerEnter={() => {
              onVoiceHotspotEnter(h);
            }}
            onPointerLeave={() => {
              onVoiceHotspotLeave(h);
            }}
          />
        ))}

        {MIRROR_AUDIO_DEBUG ? (
          <button
            type="button"
            className="mir-psych__voice-spot mir-psych__debug-test-spot"
            style={{
              left: "38%",
              top: "42%",
              width: "24%",
              height: "18%",
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onDebugTestTap();
            }}
          >
            DEBUG AUDIO TEST
          </button>
        ) : null}
      </div>

      {currentMessage !== null ? (
        <p
          role="status"
          aria-live="polite"
          className={`mir-psych__psych-text font-[family-name:var(--font-eb-garamond)] ${
            isMessageVisible ? "mir-psych__psych-text--visible" : ""
          }`}
        >
          {currentMessage}
        </p>
      ) : null}

      {MIRROR_AUDIO_DEBUG ? (
        <div className="mir-psych__audio-debug pointer-events-none absolute left-2 top-2 z-[55] max-h-[50vh] max-w-[min(92vw,22rem)] overflow-y-auto rounded border border-red-500/40 bg-black/85 p-2 font-mono text-[0.58rem] leading-snug text-red-100/90 sm:left-4 sm:top-4 sm:text-[0.62rem]">
          <p className="mb-1 font-semibold text-red-300">MIRROR AUDIO DEBUG (temp)</p>
          <p>room: {debugRoomState}</p>
          <p>hotspot: {hoveredHotspotId ?? "—"}</p>
          <p>unlock: {debugUnlock}</p>
          <p className="break-all">probe: {debugProbe}</p>
          <p className="mt-2 text-red-200/70">test file: {MIRROR_DEBUG_TEST_SRC}</p>
          <ul className="mt-2 space-y-1 border-t border-red-500/20 pt-2">
            {debugLines.length === 0 ? (
              <li className="text-white/40">hover a mirror or tap DEBUG AUDIO TEST</li>
            ) : (
              debugLines.map((line, i) => (
                <li key={`${line.at}-${i}`} className="break-all">
                  [{line.at}] {line.hotspotId} · {line.event}
                  <br />
                  src: {line.src}
                  <br />
                  play: {line.playResult}
                  {line.error ? (
                    <>
                      <br />
                      err: {line.error}
                    </>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      <p className="cfc-mirror-room-label pointer-events-none absolute left-1/2 top-[9%] z-30 -translate-x-1/2 text-center text-[0.6rem] uppercase tracking-[0.62em] text-cfc-bone/28 sm:top-[11%] sm:text-[0.66rem]">
        MIRROR ROOM
      </p>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-8 right-6 z-40 max-w-[15rem] text-left font-[family-name:var(--font-eb-garamond)] text-[0.8125rem] font-normal italic leading-snug text-cfc-off-white/34 transition-all duration-1000 ease-out hover:text-cfc-cream/72 sm:bottom-10 sm:right-10 sm:text-[0.875rem]"
      >
        return to freakquency
      </button>
    </div>
  );
}