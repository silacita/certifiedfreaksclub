"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CORRIDOR_DOORS,
  CORRIDOR_SEGMENT_COUNT,
  CORRIDOR_SEGMENT_VH,
} from "../../lib/corridorDoors";
import { createHotelCorridorAudio } from "../../lib/hotelCorridorAudio";
import { CorridorAtmosphere } from "./CorridorAtmosphere";
import { HotelDoor } from "./HotelDoor";

export function HotelCorridor() {
  const audioRef = useRef<ReturnType<typeof createHotelCorridorAudio> | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    audioRef.current = createHotelCorridorAudio();
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      audioRef.current?.setIntensity(v);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const unlockAudio = useCallback(async () => {
    await audioRef.current?.unlock();
    setAudioReady(true);
  }, []);

  const onDoorHover = useCallback(() => {
    audioRef.current?.doorHover();
  }, []);

  const segments = useMemo(() => {
    return Array.from({ length: CORRIDOR_SEGMENT_COUNT }, (_, segmentIndex) => {
      const doors = CORRIDOR_DOORS.filter((d) => d.segment === segmentIndex);
      const left = doors.find((d) => d.side === "left");
      const right = doors.find((d) => d.side === "right");
      const depthFade = 1 - segmentIndex / CORRIDOR_SEGMENT_COUNT;
      return { segmentIndex, left, right, depthFade };
    });
  }, []);

  const cameraMotion = reduceMotion
    ? {}
    : {
        animate: {
          scale: [1, 1.006, 1.002, 1],
          y: [0, -4, -1, 0],
          rotateZ: [0, 0.12, -0.06, 0],
        },
        transition: {
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const trackMotion = reduceMotion
    ? {}
    : {
        style: { y: parallaxY },
      };

  return (
    <div className="hotel-corridor">
      <div className="hotel-corridor__stage" aria-hidden>
        <CorridorAtmosphere />
        <div className="hotel-corridor__vanishing" aria-hidden>
          <div className="hotel-corridor__vanishing-rail hotel-corridor__vanishing-rail--left" />
          <div className="hotel-corridor__vanishing-rail hotel-corridor__vanishing-rail--right" />
          <div className="hotel-corridor__vanishing-core" />
        </div>
        <motion.div className="hotel-corridor__camera" {...cameraMotion} />
      </div>

      <header className="hotel-corridor__plaque">
        <p className="hotel-corridor__plaque-eyebrow">est. somewhere between sleep and wanting</p>
        <h1 className="hotel-corridor__plaque-title">Certified Freaks Club</h1>
        <p className="hotel-corridor__plaque-sub">Emotional Luxury · Floor ∞</p>
      </header>

      <button
        type="button"
        className={`hotel-corridor__listen${audioReady ? " hotel-corridor__listen--hidden" : ""}`}
        onClick={() => void unlockAudio()}
        aria-label="Enter the corridor and enable sound"
      >
        <span className="hotel-corridor__listen-label">Cross the threshold</span>
        <span className="hotel-corridor__listen-hint">sound recommended · headphones if you have them</span>
      </button>

      <div className="hotel-corridor__scroll">
        <motion.div className="hotel-corridor__perspective" {...trackMotion}>
          <div
            className="hotel-corridor__track"
            style={{ ["--segment-vh" as string]: `${CORRIDOR_SEGMENT_VH}vh` } as CSSProperties}
          >
            {segments.map(({ segmentIndex, left, right, depthFade }) => {
              const segmentStyle = {
                ["--depth-fade" as string]: depthFade,
                ["--segment-vh" as string]: `${CORRIDOR_SEGMENT_VH}vh`,
              } as CSSProperties;
              const sconceStyle = (dur: number, delay: number) =>
                ({
                  ["--flicker-dur" as string]: `${dur}s`,
                  ["--flicker-delay" as string]: `${delay}s`,
                }) as CSSProperties;

              return (
                <section
                  key={segmentIndex}
                  className="hotel-corridor__segment"
                  style={segmentStyle}
                  aria-label={`Corridor segment ${segmentIndex + 1}`}
                >
                  <div
                    className="hotel-corridor__floor"
                    style={{ ["--depth-fade" as string]: depthFade } as CSSProperties}
                    aria-hidden
                  />
                  <div
                    className="hotel-corridor__ceiling"
                    style={{ ["--depth-fade" as string]: depthFade } as CSSProperties}
                    aria-hidden
                  />

                  <div className="hotel-corridor__segment-inner">
                    <div className="hotel-corridor__side hotel-corridor__side--left">
                      <div
                        className="hotel-corridor__wall hotel-corridor__wall--left"
                        style={{ opacity: 0.35 + depthFade * 0.65 }}
                        aria-hidden
                      />
                      <span
                        className="hotel-corridor__sconce hotel-corridor__sconce--left"
                        style={sconceStyle(6 + (segmentIndex % 4), segmentIndex * 0.7)}
                        aria-hidden
                      />
                      {left ? (
                        <HotelDoor door={left} depthFade={depthFade} onHoverStart={onDoorHover} />
                      ) : null}
                    </div>

                    <div className="hotel-corridor__center-void" aria-hidden />

                    <div className="hotel-corridor__side hotel-corridor__side--right">
                      <div
                        className="hotel-corridor__wall hotel-corridor__wall--right"
                        style={{ opacity: 0.35 + depthFade * 0.65 }}
                        aria-hidden
                      />
                      <span
                        className="hotel-corridor__sconce hotel-corridor__sconce--right"
                        style={sconceStyle(7 + (segmentIndex % 3), segmentIndex * 0.9 + 0.3)}
                        aria-hidden
                      />
                      {right ? (
                        <HotelDoor door={right} depthFade={depthFade} onHoverStart={onDoorHover} />
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </motion.div>
      </div>

      <p className="hotel-corridor__descend" aria-hidden>
        descend
      </p>
    </div>
  );
}
