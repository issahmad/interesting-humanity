# Interesting Humanity

Hand-drawn doodle explainer videos about human history, evolution, anthropology and psychology.

## Repository layout

```
.
├── Instructions.txt        # The video engine: channel style DNA + Stages 1–4
├── brand/
│   ├── reference/          # Locked character reference images (hero, sidekick)
│   └── voice.md            # Chosen narrator voice and settings
├── videos/
│   ├── _template/          # Copy this to start a new video
│   └── 001-<slug>/         # One folder per video, numbered in release order
└── remotion/               # (planned) Remotion project that assembles each video
```

## Per-video folder

| File / folder | Produced in | Tracked in git? |
| --- | --- | --- |
| `script.txt` | Stage 2 — narration script | yes |
| `transcript.txt` | Timestamped transcript (`[00:00] line`) | yes |
| `image_prompts.txt` | Stage 3 — one prompt per timestamp | yes |
| `metadata.md` | Stage 4 — title, description, tags | yes |
| `notes.md` | Decisions, rerolls, what worked | yes |
| `thumbnail/` | Final thumbnail(s) | yes |
| `images/` | Generated scene images | no (too large) |
| `audio/` | Voiceover exports | no (too large) |

Final renders (`*.mp4`, `*.mov`) are never committed.

## Starting a new video

```bash
cp -R videos/_template videos/001-why-you-cant-stop-checking-your-phone
```

Then run the stages in `Instructions.txt` and save each output into that folder.
