/**
 * Synthesized analog phone tones — no external assets required.
 */

export type FreaklandAudio = {
  startRing: () => void;
  stopRing: () => void;
  playPickup: () => Promise<void>;
  playHangup: () => Promise<void>;
  dispose: () => void;
};

export function createFreaklandAudio(): FreaklandAudio {
  let ctx: AudioContext | null = null;
  let ringTimer: ReturnType<typeof setInterval> | null = null;
  let ringNodes: OscillatorNode[] = [];
  let ringGain: GainNode | null = null;
  let disposed = false;

  const ensureCtx = (): AudioContext => {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
    }
    return ctx;
  };

  const stopRing = () => {
    if (ringTimer) {
      clearInterval(ringTimer);
      ringTimer = null;
    }
    for (const node of ringNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        /* already stopped */
      }
    }
    ringNodes = [];
    if (ringGain) {
      ringGain.disconnect();
      ringGain = null;
    }
  };

  const pulseRing = () => {
    if (disposed) return;
    const audio = ensureCtx();
    void audio.resume();

    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, audio.currentTime + 0.04);
    gain.gain.setValueAtTime(0.22, audio.currentTime + 1.6);
    gain.gain.linearRampToValueAtTime(0, audio.currentTime + 1.85);
    gain.connect(audio.destination);
    ringGain = gain;

    const freqs = [440, 480];
    for (const freq of freqs) {
      const osc = audio.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(audio.currentTime);
      osc.stop(audio.currentTime + 1.9);
      ringNodes.push(osc);
    }
  };

  const startRing = () => {
    stopRing();
    pulseRing();
    ringTimer = setInterval(pulseRing, 4000);
  };

  const playPickup = (): Promise<void> =>
    new Promise((resolve) => {
      if (disposed) {
        resolve();
        return;
      }
      const audio = ensureCtx();
      void audio.resume();

      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.35, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
      gain.connect(audio.destination);

      const click = audio.createOscillator();
      click.type = "square";
      click.frequency.setValueAtTime(1200, audio.currentTime);
      click.frequency.exponentialRampToValueAtTime(200, audio.currentTime + 0.08);
      click.connect(gain);
      click.start();
      click.stop(audio.currentTime + 0.12);

      setTimeout(resolve, 140);
    });

  const playHangup = (): Promise<void> =>
    new Promise((resolve) => {
      if (disposed) {
        resolve();
        return;
      }
      const audio = ensureCtx();
      void audio.resume();

      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.18, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.55);
      gain.connect(audio.destination);

      const tone = audio.createOscillator();
      tone.type = "sine";
      tone.frequency.setValueAtTime(480, audio.currentTime);
      tone.frequency.setValueAtTime(620, audio.currentTime + 0.08);
      tone.connect(gain);
      tone.start();
      tone.stop(audio.currentTime + 0.55);

      setTimeout(resolve, 580);
    });

  const dispose = () => {
    disposed = true;
    stopRing();
    if (ctx && ctx.state !== "closed") {
      void ctx.close();
    }
    ctx = null;
  };

  return { startRing, stopRing, playPickup, playHangup, dispose };
}