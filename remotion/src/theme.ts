import { loadFont as loadHeadline } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as loadHand } from "@remotion/google-fonts/PatrickHand";
import type { Swipe, Zone } from "./types";

// Channel palette (Instructions.txt, VISUAL STYLE DNA v2). Use only these.
export const palette = {
  navy: "#1E2240",
  cream: "#FFF3DC",
  tomato: "#FF5B45",
  mustard: "#FFB81C",
  teal: "#12A594",
  violet: "#6E4BEB",
  blush: "#FFB5A7",
  sky: "#9ADBF0",
  sand: "#D9A66B",
} as const;

export const swipeColor: Record<Swipe, string> = {
  mustard: palette.mustard,
  tomato: palette.tomato,
  teal: palette.teal,
};

// Scene-change wipes cycle through these.
export const wipeColors = [
  palette.mustard,
  palette.tomato,
  palette.teal,
  palette.violet,
  palette.sky,
];

export const fonts = {
  // Chunky hand-lettered caps for headlines.
  headline: loadHeadline("normal", { weights: ["400"], subsets: ["latin"] })
    .fontFamily,
  // Lowercase handwriting for labels and captions.
  hand: loadHand("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

export const stroke = { main: 7, detail: 3 } as const;

// Off-register fill: every colour fill sits this far down-right of its outline.
export const offRegister = 10;

export const FPS = 24; // "on twos" boil = 12 fps look
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Centre point of each overlay zone on a 3x3 grid, inset from the frame edges.
// The bottom row sits above the caption band.
const COLS = [330, 960, 1590];
const ROWS = [250, 540, 800];
export const zonePoint = (zone: Zone): { x: number; y: number } => {
  const [row, col] = zone.split("-") as [string, string | undefined];
  const r = row === "top" ? 0 : row === "center" ? 1 : 2;
  const c = zone === "center" ? 1 : col === "left" ? 0 : col === "center" ? 1 : 2;
  return { x: COLS[c], y: ROWS[r] };
};
