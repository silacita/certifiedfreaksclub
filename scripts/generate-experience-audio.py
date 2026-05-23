#!/usr/bin/env python3
"""Generate experience WAV assets (replace with mastered MP3s anytime; keep same basenames)."""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "audio" / "experience"
RATE = 44100


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s))
            frames.extend(struct.pack("<h", int(v * 32767 * 0.85)))
        w.writeframes(frames)


def gen_ring() -> None:
    duration = 4.0
    n = int(RATE * duration)
    samples: list[float] = []
    for i in range(n):
        t = i / RATE
        cycle = t % 2.0
        on = cycle < 0.9
        env = 0.22 * (0.6 + 0.4 * math.sin(t * 0.7))
        tone = math.sin(2 * math.pi * 440 * t) * 0.55 + math.sin(2 * math.pi * 480 * t) * 0.45
        fade = min(1.0, t / 0.08, (duration - t) / 0.12)
        samples.append(tone * env * fade if on else 0.0)
    write_wav(OUT / "distant-phone-ring-loop.wav", samples)


def gen_pickup() -> None:
    n = int(RATE * 0.55)
    samples: list[float] = []
    for i in range(n):
        t = i / RATE
        click = math.exp(-t * 120) * random.uniform(-0.4, 0.4)
        thump = math.sin(2 * math.pi * 180 * t) * math.exp(-t * 8) * 0.35
        line = math.sin(2 * math.pi * 320 * t) * 0.08 * (1 - math.exp(-t * 20))
        samples.append(click + thump + line)
    write_wav(OUT / "phone-pickup-connect.wav", samples)


def gen_disconnect() -> None:
    samples: list[float] = []
    for _ in range(2):
        for i in range(int(RATE * 0.35)):
            t = i / RATE
            env = math.sin(math.pi * t / 0.35) ** 2
            samples.append(math.sin(2 * math.pi * 425 * t) * env * 0.28)
        samples.extend([0.0] * int(RATE * 0.28))
    write_wav(OUT / "disconnect-tuut.wav", samples)


def gen_hiss() -> None:
    duration = 8.0
    n = int(RATE * duration)
    samples: list[float] = []
    pink = 0.0
    for _ in range(n):
        white = random.uniform(-1, 1)
        pink = pink * 0.92 + white * 0.08
        samples.append(pink * 0.06)
    write_wav(OUT / "tape-hiss-dead-line.wav", samples)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    gen_ring()
    gen_pickup()
    gen_disconnect()
    gen_hiss()
    print("Wrote experience WAVs to", OUT)


if __name__ == "__main__":
    main()
