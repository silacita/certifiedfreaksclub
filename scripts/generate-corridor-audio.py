#!/usr/bin/env python3
"""Generate hotel corridor ambient loop (ventilation hum + room tone)."""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "audio" / "ambient" / "hotel-corridor-loop.wav"
RATE = 44100
DURATION = 24.0


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s))
            frames.extend(struct.pack("<h", int(v * 32767 * 0.72)))
        w.writeframes(frames)


def main() -> None:
    n = int(RATE * DURATION)
    samples: list[float] = []
    pink = 0.0
    for i in range(n):
        t = i / RATE
        white = random.uniform(-1, 1)
        pink = pink * 0.965 + white * 0.035
        vent = pink * 0.11
        hum = math.sin(2 * math.pi * 52 * t) * 0.028
        hum += math.sin(2 * math.pi * 104 * t) * 0.012
        room = math.sin(2 * math.pi * 31 * t + 0.4) * 0.009
        cycle = (t % DURATION) / DURATION
        fade = min(1.0, cycle * 8, (1 - cycle) * 8)
        distant = 0.0
        if int(t) % 11 == 0 and (t % 1.0) < 0.04:
            distant = math.sin(2 * math.pi * 720 * t) * 0.004 * math.exp(-(t % 1.0) * 40)
        samples.append((vent + hum + room + distant) * fade)
    write_wav(OUT, samples)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
