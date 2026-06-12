"use client";

import type { PlayerFacing } from "./useLobbyPlayer";

type PixelCharacterProps = {
  x: number;
  y: number;
  facing: PlayerFacing;
  walking: boolean;
  zIndex: number;
};

export function PixelCharacter({ x, y, facing, walking, zIndex }: PixelCharacterProps) {
  const step = walking ? "fh-player--walk" : "";

  return (
    <div
      className={`fh-player fh-player--${facing} ${step}`}
      style={{ left: x, top: y, zIndex }}
      aria-hidden
    >
      <div className="fh-player__sprite">
        <span className="fh-player__head" />
        <span className="fh-player__body" />
        <span className="fh-player__leg fh-player__leg--l" />
        <span className="fh-player__leg fh-player__leg--r" />
      </div>
      <span className="fh-player__shadow" />
    </div>
  );
}
