"use client";

import { useCallback, useState } from "react";

import { CrtOverlay } from "./CrtOverlay";
import { HotelLobby } from "./HotelLobby";
import { LoadingTransition } from "./LoadingTransition";
import { StartScreen } from "./StartScreen";

type GamePhase = "title" | "loading" | "lobby";

export function FreakHotelGame() {
  const [phase, setPhase] = useState<GamePhase>("title");
  const [fadeBlack, setFadeBlack] = useState(false);

  const beginGame = useCallback(() => {
    setFadeBlack(true);
    window.setTimeout(() => {
      setPhase("loading");
      setFadeBlack(false);
    }, 1200);
  }, []);

  const enterLobby = useCallback(() => {
    setFadeBlack(true);
    window.setTimeout(() => {
      setPhase("lobby");
      setFadeBlack(false);
    }, 800);
  }, []);

  return (
    <div className="fh-game">
      {phase === "title" && (
        <>
          <StartScreen onStart={beginGame} />
          <CrtOverlay />
        </>
      )}

      {phase === "loading" && (
        <>
          <LoadingTransition onComplete={enterLobby} />
          <CrtOverlay />
        </>
      )}

      {phase === "lobby" && <HotelLobby />}

      {fadeBlack && <div className="fh-fade-overlay fh-fade-overlay--in" aria-hidden />}
    </div>
  );
}
