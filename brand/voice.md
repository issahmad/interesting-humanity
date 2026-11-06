# Narrator voice

Keep one voice for every video.

- Tool: ElevenLabs
- Voice name / ID: bTw8AqIDQenIK3kFqvhT (picked over UGTtbzgh3HObxRjWaSpr after a v4 test of the video 001 opening, 2026-11-06)
- Model: eleven_v4 (picked over eleven_multilingual_v2 after an A/B test of the video 001 opening, 2026-11-06)
- Settings: defaults. v4 has no speed setting, so pace with punctuation, ellipses and `[pause]` / `[short pause]` tags.
- Audio tags: optional and sparing. Keep `script.txt` clean; put any tags and IPA pronunciation fixes in a separate `voiceover.txt`.
- Limit: 5,000 characters per request. Split the script at paragraph breaks into parts, save them as `audio/narration_01.mp3`, `narration_02.mp3`, ..., and `tools/transcribe` joins them.
- Cost: about 1 credit per character (a ~2,000-word script is roughly 12,000 credits per take).
- Tone: calm, intelligent, second-person ("you")
