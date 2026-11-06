import type { Timeline } from "./types";

// Test-only timeline for the OverlayDemo composition: no images or audio,
// one scene per overlay type so the look can be checked in Studio.
const scene = (
  i: number,
  text: string,
  overlays: Timeline["scenes"][number]["overlays"],
): Timeline["scenes"][number] => ({
  id: `d${String(i + 1).padStart(2, "0")}`,
  startSec: i * 3,
  endSec: (i + 1) * 3,
  text,
  image: null,
  overlays,
  enter: "wipe",
});

export const demoTimeline: Timeline = {
  title: "Overlay demo",
  durationSec: 12,
  audio: null,
  captions: false,
  words: [],
  scenes: [
    scene(0, "A headline on a mustard swipe.", [
      { type: "headline", text: "Millions of years", swipe: "mustard" },
    ]),
    scene(1, "An arrow with a label pointing at the right side.", [
      { type: "arrow", to: "center-right", label: "your ancestors" },
    ]),
    scene(2, "A thought bubble and a small label.", [
      { type: "bubble", at: "top-right", content: "?" },
      { type: "label", text: "hmm, again?", at: "bottom-left" },
    ]),
    // Scene 4 uses a test still (public/test/still.png) to check drift and boil.
    scene(3, "Everything at once, on a tomato swipe.", [
      { type: "headline", text: "Variable reward", swipe: "tomato" },
      { type: "arrow", to: "bottom-center", label: "the pellet" },
      { type: "bubble", at: "top-right", content: "lightbulb" },
    ]),
  ].map((s, i) => (i === 3 ? { ...s, image: "test/still.png" } : s)),
};
