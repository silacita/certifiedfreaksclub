"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const WORLD_W = 320;
export const WORLD_H = 180;
export const PLAYER_W = 8;
export const PLAYER_H = 12;
const SPEED = 52;

type Rect = { x: number; y: number; w: number; h: number };

const WALK_BOUNDS: Rect = { x: 16, y: 98, w: 288, h: 72 };

const COLLIDERS: Rect[] = [
  { x: 108, y: 78, w: 104, h: 38 },
  { x: 0, y: 0, w: 22, h: 110 },
  { x: 298, y: 0, w: 22, h: 110 },
];

const DOOR_LEFT: Rect = { x: 34, y: 62, w: 26, h: 48 };
const DOOR_RIGHT: Rect = { x: 260, y: 62, w: 26, h: 48 };
const PHONE_ZONE: Rect = { x: 168, y: 72, w: 22, h: 18 };

function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clampPlayer(rect: Rect): Rect {
  return {
    x: Math.max(WALK_BOUNDS.x, Math.min(rect.x, WALK_BOUNDS.x + WALK_BOUNDS.w - PLAYER_W)),
    y: Math.max(WALK_BOUNDS.y, Math.min(rect.y, WALK_BOUNDS.y + WALK_BOUNDS.h - PLAYER_H)),
    w: PLAYER_W,
    h: PLAYER_H,
  };
}

function canMoveTo(next: Rect, ignore?: Rect) {
  const bounds = clampPlayer(next);
  if (bounds.x !== next.x || bounds.y !== next.y) return false;
  for (const c of COLLIDERS) {
    if (ignore && c === ignore) continue;
    if (intersects(bounds, c)) return false;
  }
  return true;
}

export type PlayerFacing = "down" | "up" | "left" | "right";

export type LobbyProximity = {
  doorLeft: boolean;
  doorRight: boolean;
  phone: boolean;
};

export function useLobbyPlayer() {
  const [pos, setPos] = useState({ x: 156, y: 148 });
  const [facing, setFacing] = useState<PlayerFacing>("up");
  const [walking, setWalking] = useState(false);
  const [proximity, setProximity] = useState<LobbyProximity>({
    doorLeft: false,
    doorRight: false,
    phone: false,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const posRef = useRef(pos);
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const updateProximity = useCallback((p: { x: number; y: number }) => {
    const player: Rect = { x: p.x, y: p.y, w: PLAYER_W, h: PLAYER_H };
    const pad = 10;
    const near = (zone: Rect) =>
      intersects(
        { x: player.x - pad, y: player.y - pad, w: player.w + pad * 2, h: player.h + pad * 2 },
        zone,
      );

    setProximity({
      doorLeft: near(DOOR_LEFT),
      doorRight: near(DOOR_RIGHT),
      phone: near(PHONE_ZONE),
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    const onBlur = () => keysRef.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    const tick = (now: number) => {
      const last = lastRef.current ?? now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastRef.current = now;

      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
      if (keys.has("arrowright") || keys.has("d")) dx += 1;
      if (keys.has("arrowup") || keys.has("w")) dy -= 1;
      if (keys.has("arrowdown") || keys.has("s")) dy += 1;

      const moving = dx !== 0 || dy !== 0;
      setWalking(moving);

      if (moving) {
        const len = Math.hypot(dx, dy) || 1;
        dx = (dx / len) * SPEED * dt;
        dy = (dy / len) * SPEED * dt;

        if (Math.abs(dx) > Math.abs(dy)) {
          setFacing(dx < 0 ? "left" : "right");
        } else {
          setFacing(dy < 0 ? "up" : "down");
        }

        const cur = posRef.current;
        const nextX = { x: cur.x + dx, y: cur.y, w: PLAYER_W, h: PLAYER_H };
        const nextY = { x: cur.x, y: cur.y + dy, w: PLAYER_W, h: PLAYER_H };
        const nextXY = { x: cur.x + dx, y: cur.y + dy, w: PLAYER_W, h: PLAYER_H };

        let nx = cur.x;
        let ny = cur.y;

        if (canMoveTo(nextX)) nx += dx;
        if (canMoveTo(nextY)) ny += dy;
        if (canMoveTo(nextXY)) {
          nx += dx;
          ny += dy;
        }

        nx = Math.round(nx);
        ny = Math.round(ny);

        if (nx !== cur.x || ny !== cur.y) {
          posRef.current = { x: nx, y: ny };
          setPos({ x: nx, y: ny });
          updateProximity({ x: nx, y: ny });
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    updateProximity(posRef.current);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [updateProximity]);

  return { pos, facing, walking, proximity };
}
