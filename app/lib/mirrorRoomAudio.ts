/** Ambient bed (plays once per start when interaction unlocks audio — not looped). */
export const AMBIENT_SRC = "/audio/ambient/freakquency-ambient.mp3";

/** Files live in `public/audio/voices/mirror room/` → served at `/audio/voices/mirror%20room/...` */
const MIRROR_ROOM_DIR = "/audio/voices/mirror room";

/** Non–wake-up mirror voice files (all used; none contain "wake up"). */
export const MIRROR_ROOM_VOICE_FILES = [
  "it was always you 2.mp3",
  "it was always you.mp3",
  "you werent looking for us.mp3",
  "interesting...you needed a response.mp3",
  "there you did it again.mp3",
  "still waiting to recognize yourself.mp3",
  "you thought this was about us.mp3",
  "you are watching yourself again.mp3",
] as const;

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
  /** Production URL under `/audio/voices/mirror room/` */
  audioPath: string;
  layout: HotspotLayout;
  /** Which mirror panel soft-lights while this hotspot is hovered. */
  glow: MirrorGlowFrame;
};

function mirrorVoiceUrl(filename: (typeof MIRROR_ROOM_VOICE_FILES)[number]): string {
  return `${MIRROR_ROOM_DIR}/${encodeURIComponent(filename)}`;
}

/**
 * 14 hotspots; 8 non–wake-up voices (each used ≥1×; 6 reused on non-adjacent hotspots).
 * Center: only `it was always you 2.mp3`. No "wake up" clips.
 */
export const MIRROR_VOICE_HOTSPOTS: readonly MirrorVoiceHotspot[] = [
  {
    id: "C1",
    label: "central mirror (it was always you 2)",
    audioPath: mirrorVoiceUrl("it was always you 2.mp3"),
    glow: "center",
    layout: { leftPct: 42, topPct: 36, widthPct: 16, heightPct: 26 },
  },
  {
    id: "L1",
    label: "left — you werent looking for us",
    audioPath: mirrorVoiceUrl("you werent looking for us.mp3"),
    glow: "left",
    layout: { leftPct: 4, topPct: 28, widthPct: 12, heightPct: 18 },
  },
  {
    id: "L2",
    label: "left — interesting fragment",
    audioPath: mirrorVoiceUrl("interesting...you needed a response.mp3"),
    glow: "left",
    layout: { leftPct: 16, topPct: 44, widthPct: 11, heightPct: 14 },
  },
  {
    id: "L3",
    label: "left — there you did it again",
    audioPath: mirrorVoiceUrl("there you did it again.mp3"),
    glow: "left",
    layout: { leftPct: 5, topPct: 58, widthPct: 13, heightPct: 13 },
  },
  {
    id: "L4",
    label: "left — still waiting",
    audioPath: mirrorVoiceUrl("still waiting to recognize yourself.mp3"),
    glow: "left",
    layout: { leftPct: 18, topPct: 72, widthPct: 12, heightPct: 15 },
  },
  {
    id: "L5",
    label: "left — you thought this was about us",
    audioPath: mirrorVoiceUrl("you thought this was about us.mp3"),
    glow: "left",
    layout: { leftPct: 8, topPct: 16, widthPct: 5, heightPct: 5 },
  },
  {
    id: "L6",
    label: "left — you are watching yourself again",
    audioPath: mirrorVoiceUrl("you are watching yourself again.mp3"),
    glow: "left",
    layout: { leftPct: 22, topPct: 52, widthPct: 5, heightPct: 5 },
  },
  {
    id: "L7",
    label: "left — it was always you",
    audioPath: mirrorVoiceUrl("it was always you.mp3"),
    glow: "left",
    layout: { leftPct: 9, topPct: 86, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R1",
    label: "right — interesting fragment",
    audioPath: mirrorVoiceUrl("interesting...you needed a response.mp3"),
    glow: "right",
    layout: { leftPct: 74, topPct: 30, widthPct: 13, heightPct: 22 },
  },
  {
    id: "R2",
    label: "right — you werent looking for us",
    audioPath: mirrorVoiceUrl("you werent looking for us.mp3"),
    glow: "right",
    layout: { leftPct: 82, topPct: 50, widthPct: 11, heightPct: 14 },
  },
  {
    id: "R3",
    label: "right — there you did it again",
    audioPath: mirrorVoiceUrl("there you did it again.mp3"),
    glow: "right",
    layout: { leftPct: 88, topPct: 18, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R4",
    label: "right — still waiting",
    audioPath: mirrorVoiceUrl("still waiting to recognize yourself.mp3"),
    glow: "right",
    layout: { leftPct: 91, topPct: 40, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R5",
    label: "right — you thought this was about us",
    audioPath: mirrorVoiceUrl("you thought this was about us.mp3"),
    glow: "right",
    layout: { leftPct: 76, topPct: 66, widthPct: 5, heightPct: 5 },
  },
  {
    id: "R6",
    label: "right — you are watching yourself again",
    audioPath: mirrorVoiceUrl("you are watching yourself again.mp3"),
    glow: "right",
    layout: { leftPct: 90, topPct: 80, widthPct: 5, heightPct: 5 },
  },
] as const;

/** Psych text engine attaches only to the sole central voice hotspot. */
export const CENTRAL_PSYCH_HOTSPOT_ID = "C1";
