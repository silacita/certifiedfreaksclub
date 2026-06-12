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
  let creakTimer: number | null = null;
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

  const fadeIn = (context: AudioContext, gain: GainNode, target: number, dur = 3) => {
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(target, context.currentTime + dur);
  };

  const makeNoiseLoop = (context: AudioContext, dest: AudioNode, cutoff: number, gainVal: number) => {
    const bufferSize = context.sampleRate * 4;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.988 + white * 0.012;
      data[i] = last * 0.45;
    }
    const src = context.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = context.createGain();
    gain.gain.value = gainVal;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start();
    sources.push(src);
  };

  const startVentilation = (context: AudioContext, dest: AudioNode) => {
    makeNoiseLoop(context, dest, 95, 0.038);

    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 42;
    const humGain = context.createGain();
    humGain.gain.value = 0.012;
    hum.connect(humGain);
    humGain.connect(dest);
    hum.start();
    oscillators.push(hum);
  };

  const startElectricalBuzz = (context: AudioContext, dest: AudioNode) => {
    const buzz = context.createOscillator();
    buzz.type = "sawtooth";
    buzz.frequency.value = 58;
    const buzzGain = context.createGain();
    buzzGain.gain.value = 0.004;
    const buzzFilter = context.createBiquadFilter();
    buzzFilter.type = "lowpass";
    buzzFilter.frequency.value = 180;
    buzz.connect(buzzFilter);
    buzzFilter.connect(buzzGain);
    buzzGain.connect(dest);
    buzz.start();
    oscillators.push(buzz);
  };

  const startRoomTone = (context: AudioContext, dest: AudioNode) => {
    const pad = context.createOscillator();
    pad.type = "triangle";
    pad.frequency.value = 110;
    const padGain = context.createGain();
    padGain.gain.value = 0.006;
    const padFilter = context.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 220;
    pad.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(dest);
    pad.start();
    oscillators.push(pad);
  };

  const playChandelierCreak = (context: AudioContext, dest: AudioNode) => {
    if (disposed) return;
    const t = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.35);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.018, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.45);
  };

  const scheduleCreak = (context: AudioContext, dest: AudioNode) => {
    if (disposed) return;
    const delay = 18000 + Math.random() * 27000;
    creakTimer = window.setTimeout(() => {
      if (!disposed && ctx) {
        playChandelierCreak(context, dest);
        scheduleCreak(context, dest);
      }
    }, delay);
  };

  const playPhoneRing = (context: AudioContext, dest: AudioNode) => {
    if (disposed) return;
    const t = context.currentTime;
    for (let ring = 0; ring < 3; ring++) {
      const offset = ring * 0.9;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = 480;
      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.022, t + offset + 0.05);
      gain.gain.setValueAtTime(0.022, t + offset + 0.55);
      gain.gain.linearRampToValueAtTime(0, t + offset + 0.65);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t + offset);
      osc.stop(t + offset + 0.7);
    }
  };

  const schedulePhone = (context: AudioContext, dest: AudioNode) => {
    if (disposed) return;
    const delay = 30000 + Math.random() * 30000;
    phoneTimer = window.setTimeout(() => {
      if (!disposed && ctx) {
        playPhoneRing(context, dest);
        schedulePhone(context, dest);
      }
    }, delay);
  };

  return {
    async start() {
      const context = ensureCtx();
      if (!context || !master) return;
      if (context.state === "suspended") await context.resume();

      const ambientGain = context.createGain();
      ambientGain.connect(master);
      fadeIn(context, ambientGain, 0.5, 4);
      startVentilation(context, ambientGain);
      startElectricalBuzz(context, ambientGain);
      startRoomTone(context, ambientGain);
      scheduleCreak(context, ambientGain);

      const phoneGain = context.createGain();
      phoneGain.connect(master);
      fadeIn(context, phoneGain, 0.85, 3);
      window.setTimeout(() => schedulePhone(context, phoneGain), 8000);

      fadeIn(context, master, 1, 3.5);
    },

    dispose() {
      disposed = true;
      if (phoneTimer !== null) window.clearTimeout(phoneTimer);
      if (creakTimer !== null) window.clearTimeout(creakTimer);
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* stopped */
        }
      });
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* stopped */
        }
      });
      void ctx?.close();
      ctx = null;
      master = null;
    },
  };
}
