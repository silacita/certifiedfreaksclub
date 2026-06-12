"use client";

import type { PlayerFacing } from "./useLobbyPlayer";

type LobbyCharacterProps = {
  x: number;
  y: number;
  facing: PlayerFacing;
  walking: boolean;
};

export function LobbyCharacter({ x, y, facing, walking }: LobbyCharacterProps) {
  const depth = 0.72 + y * 0.0032;
  const zIndex = Math.floor(y * 10);

  return (
    <div
      className={`fh-lobby-avatar fh-lobby-avatar--${facing} ${walking ? "fh-lobby-avatar--walk" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex,
        transform: `translate(-50%, -50%) scale(${depth})`,
      }}
      aria-hidden
    >
      <span className="fh-lobby-avatar__figure" />
      <span className="fh-lobby-avatar__shadow" />
    </div>
  );
}
