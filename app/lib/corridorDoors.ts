export type CorridorDoorSide = "left" | "right";

export type CorridorDoor = {
  id: string;
  side: CorridorDoorSide;
  /** Vertical segment index (0 = nearest the viewer) */
  segment: number;
  number: string;
  name: string;
  hint: string;
  /** Future room route — unset until rooms exist */
  href?: string;
};

/** Emotional doors along the corridor — experiences not built yet */
export const CORRIDOR_DOORS: CorridorDoor[] = [
  {
    id: "L-712",
    side: "left",
    segment: 0,
    number: "712",
    name: "The Longing Suite",
    hint: "someone left the light on",
  },
  {
    id: "R-713",
    side: "right",
    segment: 0,
    number: "713",
    name: "Residual Heat",
    hint: "warm where they stood",
  },
  {
    id: "L-514",
    side: "left",
    segment: 1,
    number: "514",
    name: "Nostalgia Wing",
    hint: "smells like someone else's memory",
  },
  {
    id: "R-515",
    side: "right",
    segment: 1,
    number: "515",
    name: "Almost Said It",
    hint: "words still in the carpet",
  },
  {
    id: "L-416",
    side: "left",
    segment: 2,
    number: "416",
    name: "Mirror Adjacent",
    hint: "do not knock twice",
    href: undefined,
  },
  {
    id: "R-417",
    side: "right",
    segment: 2,
    number: "417",
    name: "Unheard Voicemail",
    hint: "one message, never played",
    href: "/unheard-message",
  },
  {
    id: "L-318",
    side: "left",
    segment: 3,
    number: "318",
    name: "Soft Rage",
    hint: "velvet over something sharp",
  },
  {
    id: "R-319",
    side: "right",
    segment: 3,
    number: "319",
    name: "The Almost",
    hint: "you know which almost",
  },
  {
    id: "L-220",
    side: "left",
    segment: 4,
    number: "220",
    name: "Limbo Lobby",
    hint: "check-in was never real",
  },
  {
    id: "R-221",
    side: "right",
    segment: 4,
    number: "221",
    name: "Afterimage",
    hint: "their face when you looked away",
  },
  {
    id: "L-122",
    side: "left",
    segment: 5,
    number: "122",
    name: "Dried Roses",
    hint: "romance turned to dust",
  },
  {
    id: "R-123",
    side: "right",
    segment: 5,
    number: "123",
    name: "The Performance",
    hint: "you were good at wanting",
  },
  {
    id: "L-024",
    side: "left",
    segment: 6,
    number: "024",
    name: "Basement Feeling",
    hint: "elevator won't stop here",
  },
  {
    id: "R-025",
    side: "right",
    segment: 6,
    number: "025",
    name: "Static Prayer",
    hint: "faith on a dead channel",
  },
];

export const CORRIDOR_SEGMENT_COUNT = 8;
export const CORRIDOR_SEGMENT_VH = 92;
