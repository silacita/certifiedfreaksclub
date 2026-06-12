"use client";

import { useEffect, useRef } from "react";

import { createLobbyAudio } from "../../lib/lobbyAudio";
import { CrtOverlay } from "./CrtOverlay";
import { LobbyCharacter } from "./LobbyCharacter";
import { useLobbyPlayer } from "./useLobbyPlayer";

function getDialogText(proximity: {
  doorLeft: boolean;
  doorRight: boolean;
  phone: boolean;
  reception: boolean;
}) {
  if (proximity.phone) return "The phone is ringing.";
  if (proximity.doorLeft) return "Room 101.";
  if (proximity.doorRight) return "Room 102.";
  if (proximity.reception) return "Reception.";
  return "You were expected.";
}

export function HotelLobby() {
  const { pos, facing, walking, proximity } = useLobbyPlayer();
  const viewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<ReturnType<typeof createLobbyAudio> | null>(null);

  useEffect(() => {
    viewportRef.current?.focus();
  }, []);

  useEffect(() => {
    audioRef.current = createLobbyAudio();
    void audioRef.current.start();
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const dialog = getDialogText(proximity);

  return (
    <div className="fh-lobby">
      <div className="fh-lobby__viewport" ref={viewportRef} tabIndex={0}>
        <div className="fh-lobby__scene">
          <div className="fh-lobby__atmosphere" aria-hidden>
            <div className="fh-lobby__red-glow" />
            <div className="fh-lobby__vignette" />
            <div className="fh-lobby__dust" />
          </div>

          <div className="fh-lobby__architecture">
            <div className="fh-lobby__ceiling" />
            <div className="fh-lobby__back-wall" />

            <div className="fh-lobby__exit-sign">EXIT</div>

            <div className="fh-lobby__chandelier" aria-hidden>
              <span className="fh-lobby__chandelier-chain" />
              <span className="fh-lobby__chandelier-body" />
              <span className="fh-lobby__chandelier-glow" />
            </div>

            <div className="fh-lobby__door fh-lobby__door--101">
              <span className="fh-lobby__door-label">ROOM 101</span>
              <span className="fh-lobby__door-panel" />
            </div>
            <div className="fh-lobby__door fh-lobby__door--102">
              <span className="fh-lobby__door-label">ROOM 102</span>
              <span className="fh-lobby__door-panel" />
            </div>

            <div className="fh-lobby__sofa fh-lobby__sofa--left" aria-hidden />
            <div className="fh-lobby__sofa fh-lobby__sofa--right" aria-hidden />

            <div className="fh-lobby__reception" aria-hidden>
              <div className="fh-lobby__desk">
                <div className="fh-lobby__desk-surface" />
                <div className="fh-lobby__desk-front" />
                <div className="fh-lobby__desk-reflection" />
              </div>
              <div className="fh-lobby__phone">
                <span className="fh-lobby__phone-base" />
                <span className="fh-lobby__phone-handset" />
                <span className="fh-lobby__phone-cord" />
              </div>
            </div>

            <div className="fh-lobby__marble" aria-hidden />
            <div className="fh-lobby__carpet" aria-hidden />

            <div className="fh-lobby__light fh-lobby__light--center" aria-hidden />
            <div className="fh-lobby__light fh-lobby__light--left" aria-hidden />
            <div className="fh-lobby__light fh-lobby__light--right" aria-hidden />
          </div>

          <LobbyCharacter x={pos.x} y={pos.y} facing={facing} walking={walking} />
        </div>
      </div>

      <div className="fh-dialog-box">
        <p className="fh-pixel-font fh-dialog-box__text">
          {dialog}
          <span className="fh-dialog-box__cursor">▌</span>
        </p>
      </div>

      <CrtOverlay variant="title" />
    </div>
  );
}
