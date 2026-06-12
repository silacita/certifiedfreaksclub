"use client";

type LobbyAudioHandle = {
  start: () => Promise<void>;
  dispose: () => void;
};

export function createLobbyAudio(): LobbyAudioHandle {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let disposed = false;
  let phoneTimer: number | null = null;
  const oscillators: OscillatorNode[] = [];
  const sources: AudioBufferSourceNode[] = [];

  const ensureCtx = () => {
    if (disposed) return null;
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    return ctx;
  };

  const fadeIn = (context: AudioContext, gain: GainNode, target: number, dur = 2.5) => {
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(target, context.currentTime + dur);
  };

  const startAmbientHum = (context: AudioContext, dest: AudioNode) => {
    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 47;
    const humGain = context.createGain();
    humGain.gain.value = 0.022;
    hum.connect(humGain);
    humGain.connect(dest);
    hum.start();
    oscillators.push(hum);

    const hum2 = context.createOscillator();
    hum2.type = "sine";
    hum2.frequency.value = 94;
    const hum2Gain = context.createGain();
    hum2Gain.gain.value = 0.008;
    hum2.connect(hum2Gain);
    hum2Gain.connect(dest);
    hum2.start();
    oscillators.push(hum2);

    const bufferSize = context.sampleRate * 3;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[i] = last * 0.4;
    }
    const vent = context.createBufferSource();
    vent.buffer = buffer;
    vent.loop = true;
    const ventFilter = context.createBiquadFilter();
    ventFilter.type = "lowpass";
    ventFilter.frequency.value = 120;
    const ventGain = context.createGain();
    ventGain.gain.value = 0.045;
    vent.connect(ventFilter);
    ventFilter.connect(ventGain);
    ventGain.connect(dest);
    vent.start();
    sources.push(vent);
  };

  const ringPhone = (context: AudioContext, dest: AudioNode) => {
    if (disposed) return;

    const ring = () => {
      if (disposed || !ctx) return;
      const t = ctx.currentTime;

      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 440 + i * 20;
        gain.gain.setValueAtTime(0, t + i * 0.45);
        gain.gain.linearRampToValueAtTime(0.035, t + i * 0.45 + 0.02);
        gain.gain.setValueAtTime(0.035, t + i * 0.45 + 0.35);
        gain.gain.linearRampToValueAtTime(0, t + i * 0.45 + 0.38);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t + i * 0.45);
        osc.stop(t + i * 0.45 + 0.4);
      }
    };

    ring();
    phoneTimer = window.setInterval(ring, 2800);
  };

  return {
    async start() {
      const context = ensureCtx();
      if (!context || !master) return;
      if (context.state === "suspended") await context.resume();

      const ambientGain = context.createGain();
      ambientGain.connect(master);
      fadeIn(context, ambientGain, 0.55);
      startAmbientHum(context, ambientGain);

      const phoneGain = context.createGain();
      phoneGain.connect(master);
      fadeIn(context, phoneGain, 0.7, 1.5);
      ringPhone(context, phoneGain);

      fadeIn(context, master, 1, 1.8);
    },

    dispose() {
      disposed = true;
      if (phoneTimer !== null) window.clearInterval(phoneTimer);
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      void ctx?.close();
      ctx = null;
      master = null;
    },
  };
}
