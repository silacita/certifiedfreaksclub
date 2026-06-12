"use client";

import { useCallback, useState } from "react";

import { CrtOverlay } from "./CrtOverlay";
import { HotelLobby } from "./HotelLobby";
import { LoadingTransition } from "./LoadingTransition";
import { StartScreen } from "./StartScreen";

type GamePhase = "title" | "loading" | "lobby";

const FADE_MS = 300;

export function FreakHotelGame() {
  const [phase, setPhase] = useState<GamePhase>("title");
  const [fadeBlack, setFadeBlack] = useState(false);
  const [fadeFast, setFadeFast] = useState(false);

  const beginGame = useCallback(() => {
    setFadeFast(true);
    setFadeBlack(true);
    window.setTimeout(() => {
      setPhase("loading");
      setFadeBlack(false);
      setFadeFast(false);
    }, FADE_MS);
  }, []);

  const enterLobby = useCallback(() => {
    setPhase("lobby");
  }, []);

  return (
    <div className="fh-game">
      {phase === "title" && (
        <>
          <StartScreen onStart={beginGame} />
          <CrtOverlay variant="title" />
        </>
      )}

      {phase === "loading" && (
        <>
          <LoadingTransition onComplete={enterLobby} />
          <CrtOverlay />
        </>
      )}

      {phase === "lobby" && <HotelLobby />}

      {fadeBlack && (
        <div
          className={`fh-fade-overlay ${fadeFast ? "fh-fade-overlay--fast" : "fh-fade-overlay--in"}`}
          aria-hidden
        />
      )}
    </div>
  );
}
