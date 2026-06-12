"use client";

import { useEffect, useRef, useState } from "react";

import { createLobbyAudio } from "../../lib/lobbyAudio";
import { CrtOverlay } from "./CrtOverlay";
import { PixelCharacter } from "./PixelCharacter";
import { useLobbyPlayer, WORLD_H, WORLD_W } from "./useLobbyPlayer";

function getDialogText(proximity: {
  doorLeft: boolean;
  doorRight: boolean;
  phone: boolean;
}) {
  if (proximity.phone) return "The phone won't stop ringing.";
  if (proximity.doorLeft) return "Room 101. The lock hums.";
  if (proximity.doorRight) return "Room 102. Something moved inside.";
  return "You were expected.";
}

export function HotelLobby() {
  const { pos, facing, walking, proximity } = useLobbyPlayer();
  const [scale, setScale] = useState(1);
  const [introDone, setIntroDone] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<ReturnType<typeof createLobbyAudio> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 2200);
    viewportRef.current?.focus();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    audioRef.current = createLobbyAudio();
    void audioRef.current.start();
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const resize = () => {
      const { clientWidth, clientHeight } = el;
      const sx = clientWidth / WORLD_W;
      const sy = clientHeight / WORLD_H;
      setScale(Math.floor(Math.min(sx, sy)));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dialog = getDialogText(proximity);
  const zIndex = Math.floor(pos.y);

  return (
    <div className="fh-lobby">
      <div className="fh-lobby__viewport" ref={viewportRef} tabIndex={0}>
        <div
          className="fh-lobby__world"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="fh-lobby__ambient-flicker" aria-hidden />

          <div className="fh-lobby__ceiling" />
          <div className="fh-lobby__wall-left" />
          <div className="fh-lobby__wall-right" />
          <div className="fh-lobby__back-wall" />

          <div className="fh-lobby__exit-sign fh-pixel-font fh-exit-sign">EXIT</div>
          <div className="fh-lobby__bulb" aria-hidden />

          <div className="fh-lobby__door fh-lobby__door--left">
            <span className="fh-pixel-font fh-lobby__door-number">101</span>
            <span className="fh-lobby__door-frame" />
          </div>
          <div className="fh-lobby__door fh-lobby__door--right">
            <span className="fh-pixel-font fh-lobby__door-number">102</span>
            <span className="fh-lobby__door-frame" />
          </div>

          <div className="fh-lobby__desk">
            <div className="fh-lobby__desk-top" />
            <div className="fh-lobby__desk-front" />
            <div className="fh-lobby__desk-leg fh-lobby__desk-leg--l" />
            <div className="fh-lobby__desk-leg fh-lobby__desk-leg--r" />
            <div className="fh-lobby__phone fh-phone-ring">
              <div className="fh-lobby__phone-handset" />
              <div className="fh-lobby__phone-cord" />
              <div className="fh-lobby__phone-base" />
              <div className="fh-lobby__phone-light" />
            </div>
          </div>

          <div className="fh-lobby__floor" />
          <div className="fh-lobby__floor-shade" aria-hidden />

          <PixelCharacter
            x={pos.x}
            y={pos.y}
            facing={facing}
            walking={walking}
            zIndex={zIndex}
          />
        </div>
      </div>

      <div className={`fh-dialog-box ${introDone ? "fh-dialog-box--ready" : ""}`}>
        <p className="fh-pixel-font fh-dialog-box__text">
          {introDone ? dialog : "You were expected."}
          <span className="fh-dialog-box__cursor">▌</span>
        </p>
        <p className="fh-pixel-font fh-dialog-box__hint">WASD / ARROWS — MOVE</p>
      </div>

      <CrtOverlay />
    </div>
  );
}
