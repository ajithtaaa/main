# Malayalam attraction explainer — motion graphics pipeline

Vox-style paper-collage motion graphics rendered with Python (Pillow + NumPy) and ffmpeg,
synced to an ElevenLabs Malayalam voiceover (`vo.mp3`, not committed).

| File | Role |
|------|------|
| `chunks.txt` | Script split into caption lines, grouped by scene (`#n name`) |
| `align.py`, `align2.py` | Align caption lines to the voiceover using silence detection + dynamic programming → `timing.json` |
| `engine.py` | Sprites, icons, figures, Malayalam text (Baloo Chettan 2), photo cards, animated elements |
| `scenes.py` | The 16-scene timeline and SFX cues |
| `render.py` | Frame renderer (camera push, wipes, tracker, captions, grain) → mp4 segments |
| `audio.py` | Synthesized SFX + original music bed → `sfx.wav`, `music.wav` |
| `fetch_pins.py` | Puts Pinterest images into `pins/<slot>.jpg`; photo cards use them automatically |

Photo slots: `gym`, `trek`, `food`, `rain`, `couple`, `cafe`, `cinema`, `chat`.

## Build
```bash
# fonts: Baloo Chettan 2 from @fontsource (npm), converted to TTF into /tmp/claude-0/fonts/ttf
python3 align2.py                      # needs sil2.txt from ffmpeg silencedetect (see align2.py)
python3 render.py 0 7066 video.mp4     # or split the range across processes
python3 audio.py
ffmpeg -i vo.mp3 -i music.wav -i sfx.wav -filter_complex "[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,apad=pad_dur=2,asplit=2[vo][vosc];[1:a]volume=0.22[mus];[mus][vosc]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=450[musd];[2:a]volume=0.30[sfx];[vo][musd][sfx]amix=inputs=3:normalize=0:duration=shortest,loudnorm=I=-14:TP=-1.5:LRA=11" mix.wav
```
