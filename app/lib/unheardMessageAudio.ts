/** Distant loop — `public/audio/experience/distant-phone-ring-loop.wav` */
export const DISTANT_RING_SRC = "/audio/experience/distant-phone-ring-loop.wav";

/** After opening the unheard page — `public/audio/experience/phone-pickup-connect.wav` */
export const PHONE_PICKUP_SRC = "/audio/experience/phone-pickup-connect.wav";

/** End of call — `public/audio/experience/disconnect-tuut.wav` */
export const DISCONNECT_TONE_SRC = "/audio/experience/disconnect-tuut.wav";

/** Very quiet bed after disconnect — `public/audio/experience/tape-hiss-dead-line.wav` */
export const TAPE_HISS_SRC = "/audio/experience/tape-hiss-dead-line.wav";

const manifestoDir = "/audio/voices/manifesto";

/** Must match files in `public/audio/voices/manifesto/` exactly. */
export const manifestoBasenames = [
  "hey i was waiting for you.mp3",
  "i know ur wondering.mp3",
  "certified freaks club is a place.mp3",
  "its the one.mp3",
  "not bcs its distant.mp3",
  "a place where you hold.mp3",
  "a freakquency.mp3",
  "the words you almost.mp3",
  "the feelings you disowned.mp3",
  "the one that leaks thru.mp3",
  "it was never a club.mp3",
] as const;

export type ManifestoBasename = (typeof manifestoBasenames)[number];

export function manifestoTrackUrl(basename: ManifestoBasename): string {
  return `${manifestoDir}/${encodeURIComponent(basename)}`;
}

export const MANIFESTO_SEQUENCE: readonly string[] = manifestoBasenames.map((b) =>
  manifestoTrackUrl(b),
);

/** All experience + manifesto URLs (for preload / validation). */
export const UNHEARD_AUDIO_SRCS: readonly string[] = [
  PHONE_PICKUP_SRC,
  DISCONNECT_TONE_SRC,
  TAPE_HISS_SRC,
  ...MANIFESTO_SEQUENCE,
] as const;

/** Small silence between manifesto clips (ms). */
export const MANIFESTO_GAP_MS_MIN = 380;
export const MANIFESTO_GAP_MS_MAX = 720;

/** Pause after pickup before first line (ms). */
export const POST_PICKUP_PAUSE_MS = 900;
