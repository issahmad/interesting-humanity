"""Build a video's timeline.json for Remotion.

Usage: python3 -I tools/build_timeline.py videos/001-why-you-cant-stop-checking-your-phone

Reads from the video folder:
  transcript.txt     [MM:SS] lines; one line = one scene (required)
  words.json         word timings from tools/transcribe (required)
  audio/narration.*  the joined narration (for the total length)
  image_prompts.txt  Stage 3 prompts with OVERLAY lines (optional)
  images/sNNN.*      one image per scene, numbered from s001 (optional)

Writes timeline.json. Scenes without an image render as a placeholder, so this
can run before any image exists. Safe to re-run after adding images or prompts.

OVERLAY cue grammar (one line under each prompt, cues separated by " | "):
  headline "TEXT" swipe=mustard|tomato|teal
  label "text" at=<zone>
  arrow to=<zone> label="text"
  bubble at=<zone> content="?"
  cut                         no colour wipe into this scene (it continues the last one)
Any cue may add cue="a phrase from the line" to pop in when that phrase is spoken.
"""

from __future__ import annotations

import json
import re
import shlex
import subprocess
import sys
from pathlib import Path

TAIL_SEC = 1.0  # hold the last frame this long after the narration ends
ZONES = {
    f"{r}-{c}" for r in ("top", "center", "bottom") for c in ("left", "center", "right")
} - {"center-center"} | {"center"}
SWIPES = {"mustard", "tomato", "teal"}
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp")


def fail(msg: str) -> None:
    sys.exit(f"build_timeline: {msg}")


def audio_duration(video: Path) -> tuple[str | None, float | None]:
    for name in ("narration.wav", "narration.mp3", "narration.m4a"):
        path = video / "audio" / name
        if path.exists():
            out = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                capture_output=True, text=True, check=True,
            )
            return f"audio/{name}", float(out.stdout.strip())
    return None, None


def parse_overlay(line: str, where: str) -> tuple[list[dict], str]:
    body = line.split(":", 1)[1].strip()
    if body.lower() in ("", "none"):
        return [], "wipe"
    overlays, enter = [], "wipe"
    for cue in body.split(" | "):
        parts = shlex.split(cue.strip())
        if not parts:
            continue
        kind, rest = parts[0].lower(), parts[1:]
        if kind == "cut":
            enter = "cut"
            continue
        text = rest[0] if rest and "=" not in rest[0] else None
        attrs = dict(p.split("=", 1) for p in rest if "=" in p)
        o: dict = {"type": kind}
        if kind == "headline":
            o.update(text=text or "", swipe=attrs.get("swipe", "mustard"))
            if o["swipe"] not in SWIPES:
                fail(f"{where}: unknown swipe {o['swipe']!r}")
        elif kind == "label":
            o.update(text=text or "", at=attrs.get("at", "center"))
        elif kind == "arrow":
            o.update(to=attrs.get("to", "center"))
            if "label" in attrs:
                o["label"] = attrs["label"]
        elif kind == "bubble":
            o.update(at=attrs.get("at", "top-right"), content=attrs.get("content", text or "?"))
        else:
            fail(f"{where}: unknown overlay {kind!r} in: {cue}")
        for key in ("at", "to"):
            if key in o and o[key] not in ZONES:
                fail(f"{where}: unknown zone {o[key]!r}")
        if "cue" in attrs:
            o["cue"] = attrs["cue"]
        overlays.append(o)
    return overlays, enter


def read_prompts(video: Path) -> list[tuple[str, list[dict], str]]:
    path = video / "image_prompts.txt"
    if not path.exists() or not path.read_text().strip():
        return []
    entries = []
    for block in re.split(r"\n\s*\n", path.read_text().strip()):
        lines = [ln for ln in block.strip().splitlines() if ln.strip()]
        stamp = re.match(r"\[(\d\d:\d\d)\]", lines[0])
        if not stamp:
            fail(f"image_prompts.txt: entry does not start with [MM:SS]: {lines[0][:60]}")
        overlay_line = next((ln for ln in lines[1:] if ln.startswith("OVERLAY:")), "OVERLAY: none")
        overlays, enter = parse_overlay(overlay_line, f"prompt [{stamp.group(1)}]")
        entries.append((stamp.group(1), overlays, enter))
    return entries


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: build_timeline.py <video folder>")
    video = Path(sys.argv[1]).resolve()
    lines = [ln.strip() for ln in (video / "transcript.txt").read_text().splitlines() if ln.strip()]
    words = json.loads((video / "words.json").read_text())

    # Each transcript line is a run of script words in order: map it onto words.json.
    scenes, w = [], 0
    for n, line in enumerate(lines, 1):
        m = re.match(r"\[(\d\d:\d\d)\]\s*(.*)", line)
        if not m:
            fail(f"transcript.txt line {n} has no [MM:SS]: {line[:60]}")
        text = m.group(2)
        count = len(text.split())
        if w + count > len(words):
            fail("transcript.txt has more words than words.json; re-run tools/transcribe/align.py")
        scenes.append({"id": f"s{n:03d}", "stamp": m.group(1), "text": text, "startMs": words[w]["startMs"]})
        w += count
    if w != len(words):
        fail(f"transcript.txt has {w} words, words.json {len(words)}; re-run tools/transcribe/align.py")

    audio, audio_sec = audio_duration(video)
    end_sec = (audio_sec if audio_sec else words[-1]["endMs"] / 1000) + TAIL_SEC

    prompts = read_prompts(video)
    if prompts and len(prompts) != len(scenes):
        print(f"warning: {len(prompts)} prompts for {len(scenes)} scenes; overlays matched by order")

    out_scenes, missing = [], 0
    for i, s in enumerate(scenes):
        start = 0.0 if i == 0 else s["startMs"] / 1000
        end = end_sec if i == len(scenes) - 1 else scenes[i + 1]["startMs"] / 1000
        image = next(
            (f"images/{s['id']}{ext}" for ext in IMAGE_EXTS if (video / "images" / f"{s['id']}{ext}").exists()),
            None,
        )
        missing += image is None
        overlays, enter = [], "wipe"
        if i < len(prompts):
            stamp, overlays, enter = prompts[i]
            if stamp != s["stamp"]:
                print(f"warning: {s['id']} transcript [{s['stamp']}] but prompt [{stamp}]")
        out_scenes.append({
            "id": s["id"], "startSec": round(start, 3), "endSec": round(end, 3), "text": s["text"],
            "image": image, "overlays": overlays, "enter": enter,
        })

    title = video.name.split("-", 1)[1].replace("-", " ").capitalize()
    timeline = {
        "title": title,
        "durationSec": round(end_sec, 3),
        "audio": audio,
        "captions": False,
        "scenes": out_scenes,
        "words": [{"text": x["text"].strip(), "startMs": x["startMs"], "endMs": x["endMs"]} for x in words],
    }
    (video / "timeline.json").write_text(json.dumps(timeline, indent=1))
    print(
        f"timeline.json: {len(out_scenes)} scenes, {end_sec:.1f}s, "
        f"{len(out_scenes) - missing} images, {sum(len(s['overlays']) for s in out_scenes)} overlays"
    )


if __name__ == "__main__":
    main()
