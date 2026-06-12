"use client";

const AMBIENT_SRC = "/audio/ambient/hotel-corridor-loop.wav";

type CorridorAudioHandle = {
  unlock: () => Promise<void>;
  setIntensity: (n: number) => void;
  doorHover: () => void;
  dispose: () => void;
};

export function createHotelCorridorAudio(): CorridorAudioHandle {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let ambientGain: GainNode | null = null;
  let ambientEl: HTMLAudioElement | null = null;
  let proceduralStarted = false;
  let disposed = false;
  let hoverOsc: OscillatorNode | null = null;
  let hoverGain: GainNode | null = null;

  const ensureCtx = () => {
    if (disposed) return null;
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.42;
      ambientGain.connect(master);
    }
    return ctx;
  };

  const startProceduralBed = (context: AudioContext, dest: AudioNode) => {
    if (proceduralStarted) return;
    proceduralStarted = true;

    const vent = context.createBufferSource();
    const bufferSize = context.sampleRate * 4;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.98 + white * 0.02;
      data[i] = last * 0.35;
    }
    vent.buffer = buffer;
    vent.loop = true;
    const ventFilter = context.createBiquadFilter();
    ventFilter.type = "lowpass";
    ventFilter.frequency.value = 180;
    const ventGain = context.createGain();
    ventGain.gain.value = 0.08;
    vent.connect(ventFilter);
    ventFilter.connect(ventGain);
    ventGain.connect(dest);
    vent.start();

    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 52;
    const humGain = context.createGain();
    humGain.gain.value = 0.018;
    hum.connect(humGain);
    humGain.connect(dest);
    hum.start();

    const scheduleElevator = () => {
      if (disposed || !ctx) return;
      const delay = 22000 + Math.random() * 38000;
      window.setTimeout(() => {
        if (disposed || !ctx) return;
        const ding = ctx.createOscillator();
        const dingGain = ctx.createGain();
        ding.type = "sine";
        ding.frequency.setValueAtTime(880, ctx.currentTime);
        ding.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.4);
        dingGain.gain.setValueAtTime(0, ctx.currentTime);
        dingGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.08);
        dingGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        ding.connect(dingGain);
        dingGain.connect(dest);
        ding.start();
        ding.stop(ctx.currentTime + 1.3);
        scheduleElevator();
      }, delay);
    };
    scheduleElevator();

    const scheduleWhisper = () => {
      if (disposed || !ctx) return;
      const delay = 45000 + Math.random() * 70000;
      window.setTimeout(() => {
        if (disposed || !ctx) return;
        const noise = ctx.createBufferSource();
        const nSize = Math.floor(ctx.sampleRate * 0.35);
        const nBuf = ctx.createBuffer(1, nSize, ctx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let i = 0; i < nSize; i++) {
          nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nSize * 0.22));
        }
        noise.buffer = nBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 420 + Math.random() * 280;
        bp.Q.value = 4;
        const wGain = ctx.createGain();
        wGain.gain.value = 0.006;
        noise.connect(bp);
        bp.connect(wGain);
        wGain.connect(dest);
        noise.start();
        scheduleWhisper();
      }, delay);
    };
    scheduleWhisper();
  };

  const fadeMaster = (to: number, ms: number) => {
    const c = ensureCtx();
    if (!c || !master) return;
    const now = c.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(to, now + ms / 1000);
  };

  return {
    unlock: async () => {
      const c = ensureCtx();
      if (!c || !master || !ambientGain) return;
      if (c.state === "suspended") await c.resume();

      startProceduralBed(c, ambientGain);

      if (!ambientEl) {
        ambientEl = new Audio(AMBIENT_SRC);
        ambientEl.loop = true;
        ambientEl.preload = "auto";
        const src = c.createMediaElementSource(ambientEl);
        src.connect(ambientGain);
        ambientEl.play().catch(() => {
          /* WAV may be missing — procedural bed still runs */
        });
      }

      fadeMaster(0.55, 3200);
    },

    setIntensity: (n: number) => {
      if (!ambientGain) return;
      const clamped = Math.max(0, Math.min(1, n));
      ambientGain.gain.setTargetAtTime(0.28 + clamped * 0.22, ensureCtx()?.currentTime ?? 0, 0.6);
    },

    doorHover: () => {
      const c = ensureCtx();
      if (!c || !master || disposed) return;
      if (hoverOsc) {
        try {
          hoverOsc.stop();
        } catch {
          /* ignore */
        }
        hoverOsc.disconnect();
        hoverGain?.disconnect();
      }
      hoverOsc = c.createOscillator();
      hoverGain = c.createGain();
      hoverOsc.type = "sine";
      hoverOsc.frequency.value = 92 + Math.random() * 18;
      hoverGain.gain.setValueAtTime(0, c.currentTime);
      hoverGain.gain.linearRampToValueAtTime(0.014, c.currentTime + 0.12);
      hoverGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.85);
      hoverOsc.connect(hoverGain);
      hoverGain.connect(master);
      hoverOsc.start();
      hoverOsc.stop(c.currentTime + 0.9);
      hoverOsc.onended = () => {
        hoverOsc = null;
        hoverGain = null;
      };
    },

    dispose: () => {
      disposed = true;
      if (ambientEl) {
        ambientEl.pause();
        ambientEl.src = "";
        ambientEl = null;
      }
      try {
        void ctx?.close();
      } catch {
        /* ignore */
      }
      ctx = null;
      master = null;
      ambientGain = null;
    },
  };
}
