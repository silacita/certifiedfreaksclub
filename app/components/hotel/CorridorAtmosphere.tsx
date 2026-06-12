"use client";

import type { CSSProperties } from "react";

const DUST = [
  { left: "12%", top: "18%", dx: "14vw", dy: "10vh", dur: "28s", size: 1.2 },
  { left: "78%", top: "24%", dx: "-11vw", dy: "12vh", dur: "34s", size: 1 },
  { left: "44%", top: "62%", dx: "8vw", dy: "-14vh", dur: "31s", size: 1.5 },
  { left: "6%", top: "71%", dx: "18vw", dy: "-8vh", dur: "39s", size: 0.9 },
  { left: "91%", top: "58%", dx: "-16vw", dy: "-10vh", dur: "36s", size: 1.1 },
  { left: "33%", top: "38%", dx: "-9vw", dy: "16vh", dur: "42s", size: 0.8 },
  { left: "67%", top: "82%", dx: "10vw", dy: "-18vh", dur: "27s", size: 1.3 },
] as const;

export function CorridorAtmosphere() {
  return (
    <>
      <div className="corridor-atmo corridor-atmo__top-fog" aria-hidden />
      <div className="corridor-atmo corridor-atmo__infinity-fog" aria-hidden />
      <div className="corridor-atmo corridor-atmo__vignette" aria-hidden />
      <div className="corridor-atmo corridor-atmo__leak" aria-hidden />
      <div className="corridor-atmo corridor-atmo__grain" aria-hidden />
      <div className="corridor-atmo corridor-atmo__vhs" aria-hidden />
      <div className="corridor-atmo corridor-atmo__dust" aria-hidden>
        {DUST.map((mote, i) => (
          <span
            key={i}
            style={
              {
                left: mote.left,
                top: mote.top,
                width: mote.size,
                height: mote.size,
                ["--dx" as string]: mote.dx,
                ["--dy" as string]: mote.dy,
                ["--dur" as string]: mote.dur,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
