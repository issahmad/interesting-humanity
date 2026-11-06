// Ported from the tech-explainer pipeline (pipeline/remotion/src/captionChunks.ts).
import type { Word } from "./types";

// Splits narration into short caption chunks (sentence, then clause, then word
// boundaries) of at most `maxChars` characters (about 2 lines of ~42).
export const MAX_CAPTION_CHARS = 84;

const packWords = (text: string, maxChars: number): string[] => {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && line.length + 1 + word.length > maxChars) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
};

const splitSentence = (sentence: string, maxChars: number): string[] => {
  if (sentence.length <= maxChars) return [sentence];
  const clauses = sentence.split(/(?<=[,;:])\s+/);
  const out: string[] = [];
  let acc = "";
  for (const clause of clauses) {
    if (clause.length > maxChars) {
      if (acc) out.push(acc);
      acc = "";
      out.push(...packWords(clause, maxChars));
    } else if (acc && acc.length + 1 + clause.length > maxChars) {
      out.push(acc);
      acc = clause;
    } else {
      acc = acc ? `${acc} ${clause}` : clause;
    }
  }
  if (acc) out.push(acc);
  return out;
};

export const splitCaptions = (
  narration: string,
  maxChars: number = MAX_CAPTION_CHARS,
): string[] =>
  narration
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .flatMap((s) => splitSentence(s, maxChars));

// Chunk index active at `frame`, with times proportional to character count.
// The last chunk holds to the end.
export const chunkAtFrame = (
  chunks: string[],
  frame: number,
  durationInFrames: number,
): { index: number; startFrame: number } => {
  const total = chunks.reduce((n, c) => n + c.length, 0) || 1;
  let acc = 0;
  for (let i = 0; i < chunks.length; i++) {
    const start = (acc / total) * durationInFrames;
    const end = ((acc + chunks[i].length) / total) * durationInFrames;
    if (frame < end || i === chunks.length - 1) {
      return { index: i, startFrame: start };
    }
    acc += chunks[i].length;
  }
  return { index: 0, startFrame: 0 };
};

// Start time (seconds) of each caption chunk, taken from the first word of the
// chunk. Chunks are built from the narration's words in order, so they map to
// `words` one to one; returns null if the counts disagree.
export const captionStarts = (
  chunks: string[],
  words: Word[],
): number[] | null => {
  const starts: number[] = [];
  let i = 0;
  for (const c of chunks) {
    if (i >= words.length) return null;
    starts.push(words[i].startMs / 1000);
    i += c.split(/\s+/).filter(Boolean).length;
  }
  return i === words.length ? starts : null;
};
