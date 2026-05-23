/**
 * Single-channel HTMLAudio playback — no overlap, mobile-safe unlock.
 */

export type SequentialAudioPlayer = {
  play: (src: string) => Promise<void>;
  playLoop: (src: string, targetVolume: number) => Promise<void>;
  fadeVolume: (targetVolume: number, steps: number, stepMs: number) => Promise<void>;
  stop: () => void;
  unlock: () => Promise<boolean>;
  dispose: () => void;
};

export function createSequentialAudioPlayer(): SequentialAudioPlayer {
  const el = new Audio();
  el.preload = "auto";
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");

  let playToken = 0;
  let unlocked = false;

  const stop = () => {
    playToken += 1;
    el.pause();
    el.loop = false;
    el.currentTime = 0;
    el.removeAttribute("src");
    el.load();
  };

  const unlock = async (): Promise<boolean> => {
    if (unlocked) return true;
    const prev = el.src;
    const prevVol = el.volume;
    el.volume = 0.001;
    el.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    try {
      await el.play();
      el.pause();
      el.currentTime = 0;
      unlocked = true;
      if (prev) {
        el.src = prev;
        el.volume = prevVol;
      } else {
        el.removeAttribute("src");
        el.load();
        el.volume = prevVol;
      }
      return true;
    } catch {
      if (!prev) {
        el.removeAttribute("src");
        el.load();
      }
      el.volume = prevVol;
      return false;
    }
  };

  const play = (src: string): Promise<void> => {
    const token = ++playToken;
    el.loop = false;
    el.pause();
    el.currentTime = 0;
    el.volume = 1;
    el.src = src;

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onErr);
      };
      const onEnded = () => {
        if (token !== playToken) return;
        cleanup();
        resolve();
      };
      const onErr = () => {
        if (token !== playToken) return;
        cleanup();
        reject(new Error(`audio failed: ${src}`));
      };
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onErr);
      void el.play().catch((e) => {
        if (token !== playToken) return;
        cleanup();
        reject(e);
      });
    });
  };

  const playLoop = async (src: string, targetVolume: number): Promise<void> => {
    const token = ++playToken;
    el.loop = true;
    el.pause();
    el.currentTime = 0;
    el.volume = 0;
    el.src = src;
    await el.play();
    if (token !== playToken) return;
    el.volume = targetVolume;
  };

  const fadeVolume = async (
    targetVolume: number,
    steps: number,
    stepMs: number,
  ): Promise<void> => {
    const start = el.volume;
    for (let i = 1; i <= steps; i++) {
      await new Promise<void>((r) => setTimeout(r, stepMs));
      el.volume = start + ((targetVolume - start) * i) / steps;
    }
  };

  const dispose = () => {
    stop();
  };

  return { play, playLoop, fadeVolume, stop, unlock, dispose };
}

/** Preload URLs without playing (stops after `canplaythrough` or timeout). */
export function preloadAudioSources(
  sources: readonly string[],
  timeoutMs = 12000,
): () => void {
  const elements: HTMLAudioElement[] = [];
  const timers: number[] = [];

  for (const src of sources) {
    const a = new Audio();
    a.preload = "auto";
    a.src = src;
    elements.push(a);
    const t = window.setTimeout(() => {
      a.src = "";
      a.load();
    }, timeoutMs);
    timers.push(t);
    const done = () => {
      window.clearTimeout(t);
      a.removeEventListener("canplaythrough", done);
      a.removeEventListener("error", done);
    };
    a.addEventListener("canplaythrough", done, { once: true });
    a.addEventListener("error", done, { once: true });
    a.load();
  }

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    elements.forEach((a) => {
      a.pause();
      a.removeAttribute("src");
      a.load();
    });
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomGapMs(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
