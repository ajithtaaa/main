# Malayalam attraction explainer — high-motion version (Remotion)

A new animated shot for every sentence of the voiceover (100 shots): spring-physics kinetic type,
self-drawing SVG icons, punch-in / whip / blur transitions, camera shake on impacts, bursts,
shockwave rings, particles, stripe wipes between story sections, a 1–6 progress tracker and
word-by-word karaoke captions in Malayalam (Baloo Chettan 2).

## Layout
| Path | What |
|---|---|
| `src/data/timing.json` | Caption lines with start/end seconds (aligned to the voiceover) |
| `tools/make_shots.py` | Picks a template + props for every line → `src/data/shots.json` |
| `src/templates.tsx` | ~45 animated shot templates |
| `src/Main.tsx` | Composition: backgrounds, shots, Veo layer, wipes, tracker, captions, grain |
| `tools/cues.py` + `tools/sfx_music.py` | SFX cues from the shot list + synthesized SFX and music |
| `tools/veo_scenes.py` | Gemini **Veo** background clip per story section → `public/veo/scene<k>.mp4` |
| `tools/media_manifest.py` | Lists Veo clips / Pinterest photos for the renderer |
| `tools/mux.sh` | Voice + ducked music + SFX mix, muxed into `out/final.mp4` |

## Build
```bash
npm install
cp <voiceover>.mp3 public/audio/vo.mp3          # not committed (public repo)
python3 tools/make_shots.py && python3 tools/cues.py && python3 tools/sfx_music.py && mv sfx.wav music.wav out/
GEMINI_API_KEY=... python3 tools/veo_scenes.py   # optional: AI backgrounds (billed to the key)
python3 tools/media_manifest.py
npx remotion render src/index.ts Main out/video_silent.mp4 --concurrency=4 --crf=20
tools/mux.sh
```
`remotion.config.ts` points Remotion at the pre-installed Chromium headless shell in the cloud
environment; remove that line to let Remotion download its own browser elsewhere.
Pinterest photos: drop `public/pins/<slot>.jpg` (`trek`, `food`, `rain`, `couple`) and re-run the manifest.
