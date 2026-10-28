#!/usr/bin/env bash
# Mix voiceover + ducked music + SFX and mux with the rendered video -> out/final.mp4
set -e
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -i public/audio/vo.mp3 -i out/music.wav -i out/sfx.wav -filter_complex \
 "[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,apad=pad_dur=2,asplit=2[vo][vosc];[1:a]volume=0.22[mus];[mus][vosc]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=450:makeup=1[musd];[2:a]volume=0.32[sfx];[vo][musd][sfx]amix=inputs=3:normalize=0:duration=shortest,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
 -t 235.55 out/mix.wav
ffmpeg -y -loglevel error -i out/video_silent.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 21 -maxrate 10M -bufsize 20M \
 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest out/final.mp4
ffprobe -v error -show_entries format=duration,size -of compact out/final.mp4
