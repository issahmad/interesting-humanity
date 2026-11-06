import type { Word } from "./types";

const norm = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9']+/g, "");

// Start (ms, from the start of the narration) of the first time `phrase` is
// spoken between fromMs and toMs, ignoring case and punctuation.
export const findCueMs = (
  words: Word[],
  phrase: string,
  fromMs: number,
  toMs: number,
): number | undefined => {
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  if (target.length === 0) return undefined;
  for (let i = 0; i + target.length <= words.length; i++) {
    if (words[i].startMs < fromMs - 50) continue;
    if (words[i].startMs > toMs) break;
    if (target.every((t, j) => norm(words[i + j].text) === t)) {
      return words[i].startMs;
    }
  }
  return undefined;
};

// Words spoken inside [fromMs, toMs).
export const wordsIn = (words: Word[], fromMs: number, toMs: number): Word[] =>
  words.filter((w) => w.startMs >= fromMs - 50 && w.startMs < toMs);
