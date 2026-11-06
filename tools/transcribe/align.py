"""Align Whisper word timings to the exact script text.

Usage: python3 -I align.py ../../videos/001-why-you-cant-stop-checking-your-phone

Reads <video>/script.txt and <video>/whisper_words.json (from transcribe.mjs).
Writes:
  <video>/words.json      every script word with startMs/endMs (Remotion Caption shape)
  <video>/transcript.txt  [MM:SS] lines for Stage 3, grouped at sentence ends

The script is the source of truth for the words, so names Whisper mishears
(Pirolli, Charnov, ...) still come out spelled correctly. Whisper only supplies timing.
"""

import difflib
import json
import re
import sys
from pathlib import Path

MIN_LINE_S = 5.0   # don't end a line before this, unless a paragraph ends
PARA_MIN_S = 2.5   # a paragraph end may close a line this short
MAX_LINE_S = 10.0  # past this, break at the next comma too


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower())


def ends_sentence(word: str) -> bool:
    w = word.rstrip("\"'”’")
    if re.fullmatch(r"[A-Z]\.", w):  # initials like "B." in "B. F. Skinner"
        return False
    return w.endswith((".", "?", "!"))


def main() -> None:
    video = Path(sys.argv[1]).resolve()
    paragraphs = [p.split() for p in (video / "script.txt").read_text().split("\n\n") if p.strip()]
    script_words, para_end = [], []
    for para in paragraphs:
        script_words += para
        para_end += [False] * (len(para) - 1) + [True]

    whisper = [w for w in json.loads((video / "whisper_words.json").read_text()) if norm(w["text"])]

    a = [norm(w) for w in script_words]
    b = [norm(w["text"]) for w in whisper]
    times: list = [None] * len(a)
    matcher = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for block in matcher.get_matching_blocks():
        for k in range(block.size):
            w = whisper[block.b + k]
            times[block.a + k] = (w["startMs"], w["endMs"])
    matched = sum(t is not None for t in times)

    # Fill unmatched words by spreading them evenly between their matched neighbors.
    i = 0
    while i < len(times):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(times) and times[j] is None:
            j += 1
        left = times[i - 1][1] if i > 0 else 0
        right = times[j][0] if j < len(times) else left + 400 * (j - i)
        step = max(right - left, 0) / (j - i)
        for k in range(i, j):
            times[k] = (round(left + step * (k - i)), round(left + step * (k - i + 1)))
        i = j

    words = [
        {"text": (" " if n else "") + w, "startMs": s, "endMs": e, "timestampMs": s, "confidence": None}
        for n, (w, (s, e)) in enumerate(zip(script_words, times))
    ]
    (video / "words.json").write_text(json.dumps(words, indent=2))

    lines, start = [], 0
    for n, w in enumerate(script_words):
        dur = (times[n][1] - times[start][0]) / 1000
        last = n == len(script_words) - 1
        if (
            last
            or (ends_sentence(w) and (dur >= MIN_LINE_S or (para_end[n] and dur >= PARA_MIN_S)))
            or (dur >= MAX_LINE_S and w.endswith(","))
        ):
            secs = times[start][0] // 1000
            lines.append(f"[{secs // 60:02d}:{secs % 60:02d}] " + " ".join(script_words[start : n + 1]))
            start = n + 1
    (video / "transcript.txt").write_text("\n".join(lines) + "\n")

    total = times[-1][1] / 1000
    print(f"Matched {matched}/{len(a)} script words to Whisper timings")
    print(f"Narration length {int(total // 60)}:{int(total % 60):02d}, {len(lines)} transcript lines")


if __name__ == "__main__":
    main()
