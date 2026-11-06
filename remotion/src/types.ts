// Data shapes for one video. A video's timeline.json is written by
// tools/build_timeline.py from transcript.txt, words.json and image_prompts.txt.

export type Zone =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type Swipe = "mustard" | "tomato" | "teal";

// Every overlay may carry `cue`: a phrase from the scene's narration. The
// overlay pops in when that phrase is spoken; without it, shortly after the cut.
export type Overlay =
  | { type: "headline"; text: string; swipe: Swipe; cue?: string }
  | { type: "label"; text: string; at: Zone; cue?: string }
  | { type: "arrow"; to: Zone; label?: string; cue?: string }
  | { type: "bubble"; at: Zone; content: string; cue?: string };

export type Scene = {
  id: string; // "s001", matches images/s001.png
  startSec: number;
  endSec: number;
  text: string; // narration spoken in this scene
  image: string | null; // path under the video folder, null until generated
  overlays: Overlay[];
  enter: "wipe" | "cut"; // how this scene comes in
};

// One spoken word, times from the start of the narration.
export type Word = { text: string; startMs: number; endMs: number };

export type Timeline = {
  title: string;
  durationSec: number;
  audio: string | null; // path under the video folder
  captions?: boolean; // burned-in captions, default off
  scenes: Scene[];
  words: Word[];
};
