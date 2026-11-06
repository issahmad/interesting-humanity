# Remotion project

Assembles a video from its folder in `videos/NNN-slug/`: the narration, one image per transcript line, and the cues in `overlays.txt` (Stage 3). Everything is drawn in the channel's v2 style (palette, boil on twos, squash-and-stretch pop-ins, 3-frame colour wipes).

## Per video

From the repo root:

```bash
python3 -I tools/build_timeline.py videos/001-why-you-cant-stop-checking-your-phone
```

This writes `timeline.json` (scenes, timings, image paths, overlays, word timings). Re-run it after adding images or editing `image_prompts.txt`. Scenes without an image show a placeholder with their line, so timing can be checked before any image exists.

Then from `remotion/`:

```bash
V=../videos/001-why-you-cant-stop-checking-your-phone
npx remotion studio --props=$V/timeline.json --public-dir=$V
npx remotion render Video out/001/draft.mp4 --props=$V/timeline.json --public-dir=$V
```

`--public-dir` points Remotion at the video folder, so `audio/narration.wav` and `images/s001.png` resolve without copying files.

Final upload version in 4K: add `--scale=2` and write `final-4k.mp4` next to the draft.

## Images

Save each scene's image as `videos/NNN-slug/images/sNNN.png` (`.jpg`/`.webp` also work), numbered like the transcript lines: line 1 is `s001`. 16:9, ideally 1920x1080 or larger. The still gets a slow push-in and a soft line boil.

## Compositions

- `Video`: the real video, driven by `--props`.
- `OverlayDemo`: test only. Every overlay type on placeholders plus `public/test/still.png`.

## Code map

| File | What it does |
| --- | --- |
| `src/Video.tsx` | Places each scene at its time, colour wipes at cuts, narration audio |
| `src/SceneView.tsx` | Image (drift + boil) or placeholder, then the overlays |
| `src/overlays/` | `Headline` (swipe + caps), `Label`, `Arrow` (looping doodle), `Bubble` (squircle + 3 dots) |
| `src/motion.tsx` | Boil filter (seed changes every 2 frames), pop-in, draw-on |
| `src/theme.ts` | Palette, fonts, off-register offset, 3x3 overlay zones, 24 fps |
| `src/cues.ts` | `cue="phrase"` lookup in the word timings |
| `src/Captions.tsx` | Optional burned-in captions (`"captions": true` in timeline.json), adapted from the tech-explainer pipeline |

Lint and type-check with `npm run lint`.

Scratch stills and clips go in `out/_scratch/`; `out/` is not committed.
