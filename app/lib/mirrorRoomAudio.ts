/** Ambient bed (plays once per start when interaction unlocks audio — not looped). */
export const AMBIENT_SRC = "/audio/ambient/freakquency-ambient.mp3";

/**
 * Production-safe paths: `public/audio/voices/mirror-room/*.mp3`
 * (no spaces; copied from `mirror room/` originals — wake-up clips excluded)
 */
const MIRROR_ROOM_DIR = "/audio/voices/mirror-room";

export const MIRROR_ROOM_VOICE = {
  IT_WAS_ALWAYS_YOU_2: "it-was-always-you-2.mp3",
  IT_WAS_ALWAYS_YOU: "it-was-always-you.mp3",
  YOU_WERENT_LOOKING: "you-werent-looking-for-us.mp3",
  INTERESTING_RESPONSE: "interesting-you-needed-a-response.mp3",
  THERE_YOU_DID_IT_AGAIN: "there-you-did-it-again.mp3",
  STILL_WAITING: "still-waiting-to-recognize-yourself.mp3",
  YOU_THOUGHT: "you-thought-this-was-about-us.mp3",
  YOU_ARE_WATCHING: "you-are-watching-yourself-again.mp3",
} as const;

export const MIRROR_ROOM_VOICE_FILES = Object.values(MIRROR_ROOM_VOICE);

export type MirrorGlowFrame = "left" | "center" | "right";

/** Percent of viewport (mirror room overlay). */
export type HotspotLayout = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

export type MirrorVoiceHotspot = {
  id: string;
  label: string;
  audioPath: string;
  layout: HotspotLayout;
  glow: MirrorGlowFrame;
};

function mirrorVoiceUrl(filename: (typeof MIRROR_ROOM_VOICE)[keyof typeof MIRROR_ROOM_VOICE]): string {
  return `${MIRROR_ROOM_DIR}/${filename}`;
}

/** 14 hotspots · 8 voices (no wake-up) · each file used ≥1× */
export const MIRROR_VOICE_HOTSPOTS: readonly MirrorVoiceHotspot[] = [
  {
    id: "C1",
    label: "central mirror (it was always you 2)",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.IT_WAS_ALWAYS_YOU_2),
    glow: "center",
    layout: { leftPct: 42, topPct: 36, widthPct: 16, heightPct: 26 },
  },
  {
    id: "L1",
    label: "left — you werent looking for us",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_WERENT_LOOKING),
    glow: "left",
    layout: { leftPct: 4, topPct: 28, widthPct: 12, heightPct: 18 },
  },
  {
    id: "L2",
    label: "left — interesting fragment",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.INTERESTING_RESPONSE),
    glow: "left",
    layout: { leftPct: 16, topPct: 44, widthPct: 11, heightPct: 14 },
  },
  {
    id: "L3",
    label: "left — there you did it again",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.THERE_YOU_DID_IT_AGAIN),
    glow: "left",
    layout: { leftPct: 5, topPct: 58, widthPct: 13, heightPct: 13 },
  },
  {
    id: "L4",
    label: "left — still waiting",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.STILL_WAITING),
    glow: "left",
    layout: { leftPct: 18, topPct: 72, widthPct: 12, heightPct: 15 },
  },
  {
    id: "L5",
    label: "left — you thought this was about us",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_THOUGHT),
    glow: "left",
    layout: { leftPct: 8, topPct: 16, widthPct: 5, heightPct: 5 },
  },
  {
    id: "L6",
    label: "left — you are watching yourself again",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_ARE_WATCHING),
    glow: "left",
    layout: { leftPct: 22, topPct: 52, widthPct: 5, heightPct: 5 },
  },
  {
    id: "L7",
    label: "left — it was always you",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.IT_WAS_ALWAYS_YOU),
    glow: "left",
    layout: { leftPct: 9, topPct: 86, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R1",
    label: "right — interesting fragment",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.INTERESTING_RESPONSE),
    glow: "right",
    layout: { leftPct: 74, topPct: 30, widthPct: 13, heightPct: 22 },
  },
  {
    id: "R2",
    label: "right — you werent looking for us",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_WERENT_LOOKING),
    glow: "right",
    layout: { leftPct: 82, topPct: 50, widthPct: 11, heightPct: 14 },
  },
  {
    id: "R3",
    label: "right — there you did it again",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.THERE_YOU_DID_IT_AGAIN),
    glow: "right",
    layout: { leftPct: 88, topPct: 18, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R4",
    label: "right — still waiting",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.STILL_WAITING),
    glow: "right",
    layout: { leftPct: 91, topPct: 40, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R5",
    label: "right — you thought this was about us",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_THOUGHT),
    glow: "right",
    layout: { leftPct: 76, topPct: 66, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R6",
    label: "right — you are watching yourself again",
    audioPath: mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_ARE_WATCHING),
    glow: "right",
    layout: { leftPct: 90, topPct: 80, widthPct: 5, heightPct: 5 },
  },
] as const;

export const CENTRAL_PSYCH_HOTSPOT_ID = "C1";

/** Known-good clip for debug test hotspot (non–wake-up). */
export const MIRROR_DEBUG_TEST_SRC = mirrorVoiceUrl(MIRROR_ROOM_VOICE.YOU_WERENT_LOOKING);

export const MIRROR_DEBUG_PROBE_SRC = mirrorVoiceUrl(MIRROR_ROOM_VOICE.IT_WAS_ALWAYS_YOU_2);
