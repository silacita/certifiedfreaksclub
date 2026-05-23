"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AMBIENT_SRC,
  CENTRAL_PSYCH_HOTSPOT_ID,
  MIRROR_VOICE_HOTSPOTS,
  type MirrorVoiceHotspot,
} from "../lib/mirrorRoomAudio";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MirrorLiftId = "left" | "center" | "right";

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

export function MirrorRoom({ visible, onClose }: Props) {
  const onBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  /** Per-hotspot: voice already fired for current pointer dwell (cleared on leave). */
  const playedWhileInsideRef = useRef<Set<string>>(new Set());
  const voicePlayGenRef = useRef(0);

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

  const tryStartAmbientOnInteraction = useCallback(() => {
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
  }, []);

  const onVoiceHotspotEnter = useCallback(
    (h: MirrorVoiceHotspot) => {
      tryStartAmbientOnInteraction();
      setHoveredHotspotId(h.id);

      if (playedWhileInsideRef.current.has(h.id)) {
        return;
      }
      playedWhileInsideRef.current.add(h.id);

      if (h.id === CENTRAL_PSYCH_HOTSPOT_ID) {
        onCentralMirrorHitEnterRef.current();
      }

      const v = ensureVoiceEl();
      const gen = ++voicePlayGenRef.current;
      v.pause();
      v.currentTime = 0;
      v.loop = false;
      v.src = h.audioPath;

      void v.play().catch(() => {
        if (voicePlayGenRef.current === gen) {
          playedWhileInsideRef.current.delete(h.id);
        }
      });
    },
    [ensureVoiceEl, tryStartAmbientOnInteraction],
  );

  const onVoiceHotspotLeave = useCallback((h: MirrorVoiceHotspot) => {
    playedWhileInsideRef.current.delete(h.id);
    setHoveredHotspotId((cur) => (cur === h.id ? null : cur));
    if (h.id === CENTRAL_PSYCH_HOTSPOT_ID) {
      onCentralMirrorHitLeaveRef.current();
    }
  }, []);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

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
      ambientStartedRef.current = false;
      hoverCountRef.current = 0;
      setHoverCount(0);
      setHoveredHotspotId(null);
      setCurrentMessage(null);
      setIsMessageVisible(false);
      setDiscoveryAwake(false);
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
      onMouseDown={() => {
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

      <div className="mir-psych__mirror-audio-hits" aria-hidden>
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
