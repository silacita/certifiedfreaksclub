"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useState } from "react";

import type { CorridorDoor } from "../../lib/corridorDoors";

type HotelDoorProps = {
  door: CorridorDoor;
  depthFade: number;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

export function HotelDoor({ door, depthFade, onHoverStart, onHoverEnd }: HotelDoorProps) {
  const [hovered, setHovered] = useState(false);
  const sideClass =
    door.side === "left" ? "hotel-corridor__door-col--left" : "hotel-corridor__door-col--right";

  const handleEnter = useCallback(() => {
    setHovered(true);
    onHoverStart?.();
  }, [onHoverStart]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  const inner = (
    <>
      <span className="hotel-corridor__door-glow" aria-hidden />
      <span className="hotel-corridor__door-frame">
        <span className="hotel-corridor__door-panel" />
        <span className="hotel-corridor__door-knob" aria-hidden />
        <span className="hotel-corridor__door-number">{door.number}</span>
      </span>
      <span className="hotel-corridor__door-meta">
        <span className="hotel-corridor__door-name">{door.name}</span>
        <span className="hotel-corridor__door-hint">{door.hint}</span>
      </span>
    </>
  );

  const className = `hotel-corridor__door${hovered ? " hotel-corridor__door--hovered" : ""}`;

  const motionProps = {
    style: { opacity: 0.35 + depthFade * 0.65 },
    whileHover: { scale: 1.02, z: 36 },
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  };

  if (door.href) {
    return (
      <div className={`hotel-corridor__door-col ${sideClass}`}>
        <motion.div {...motionProps}>
          <Link
            href={door.href}
            className={className}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
            aria-label={`Room ${door.number}, ${door.name}`}
          >
            {inner}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`hotel-corridor__door-col ${sideClass}`}>
      <motion.div {...motionProps}>
        <button
          type="button"
          className={className}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={handleEnter}
          onBlur={handleLeave}
          aria-label={`Room ${door.number}, ${door.name}. Not yet open.`}
        >
          {inner}
        </button>
      </motion.div>
    </div>
  );
}
