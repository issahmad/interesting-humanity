// Transcribe a video's narration locally with Whisper.cpp and write
// word-level timings to <video>/whisper_words.json.
//
// Usage: node transcribe.mjs ../../videos/001-why-you-cant-stop-checking-your-phone
// Expects the narration at <video>/audio/narration.(mp3|wav|m4a), or as parts
// narration_01.mp3, narration_02.mp3, ... which it joins into narration.wav.
// Then run align.py to produce words.json and transcript.txt.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const MODEL = "medium.en";

const here = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(process.argv[2] ?? "");
if (!process.argv[2] || !fs.existsSync(videoDir)) {
  console.error("Usage: node transcribe.mjs <path to video folder>");
  process.exit(1);
}

const audioDir = path.join(videoDir, "audio");
const PART_GAP_S = 0.5; // silence added after each part when joining

// ElevenLabs v4 caps a request at 5,000 characters, so long scripts arrive as
// narration_01.mp3, narration_02.mp3, ... Join them into narration.wav first.
const parts = fs
  .readdirSync(audioDir)
  .filter((f) => /^narration_\d+\.(mp3|wav|m4a)$/.test(f))
  .sort();
if (parts.length > 0) {
  const inputs = parts.flatMap((f) => ["-i", path.join(audioDir, f)]);
  const pads = parts.map((_, i) => `[${i}:a]apad=pad_dur=${PART_GAP_S}[a${i}]`).join(";");
  const joined = parts.map((_, i) => `[a${i}]`).join("") + `concat=n=${parts.length}:v=0:a=1[out]`;
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", ...inputs,
    "-filter_complex", `${pads};${joined}`, "-map", "[out]",
    path.join(audioDir, "narration.wav"),
  ]);
  console.log(`Joined ${parts.join(", ")} into narration.wav`);
}

const source = ["narration.wav", "narration.mp3", "narration.m4a"]
  .map((f) => path.join(audioDir, f))
  .find((f) => fs.existsSync(f));
if (!source) {
  console.error(`No narration_NN.mp3 parts or narration.mp3/.wav/.m4a found in ${audioDir}`);
  process.exit(1);
}

// Whisper.cpp needs 16 kHz mono WAV.
const wav = path.join(audioDir, "narration_16k.wav");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", source, "-ar", "16000", "-ac", "1", wav]);

const whisperPath = path.join(here, "whisper.cpp");
await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
await downloadWhisperModel({ model: MODEL, folder: whisperPath });

const whisperCppOutput = await transcribe({
  model: MODEL,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: wav,
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput });
const out = path.join(videoDir, "whisper_words.json");
fs.writeFileSync(out, JSON.stringify(captions, null, 2));
console.log(`Wrote ${captions.length} words to ${out}`);
