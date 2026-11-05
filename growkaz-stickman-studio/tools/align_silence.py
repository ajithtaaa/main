"""tools/align_silence.py — offline script-to-audio alignment without Whisper.

  python tools/align_silence.py --project projects/<slug>

Finds speech segments with ffmpeg silencedetect, then assigns contiguous runs of script words to each segment
with dynamic programming (word length ~ speaking time, bonus for segments ending on punctuation).
Within a segment, word times are spread by character count. Works for any language/script.
"""
import argparse, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import load_json, write_timeline, sentences_from_words, probe_duration

ap = argparse.ArgumentParser(); ap.add_argument("--project", required=True)
ap.add_argument("--noise", default="-35dB"); ap.add_argument("--min-sil", type=float, default=0.35)
a = ap.parse_args()
cfg = load_json(os.path.join(a.project, "config.json"))
audio = os.path.join(a.project, cfg["voiceover"]); dur = probe_duration(audio)
log = subprocess.run(["ffmpeg", "-v", "info", "-i", audio, "-af", f"silencedetect=noise={a.noise}:d={a.min_sil}", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
segs, t = [], 0.0
for s, e in zip(starts, ends + [dur]):
    if s - t > 0.15: segs.append((t, s))
    t = e
if dur - t > 0.15: segs.append((t, dur))
words = open(os.path.join(a.project, cfg["script"]), encoding="utf-8").read().split()
L = [len(w) + 1 for w in words]; P = [bool(re.search(r"[.?!,]$", w)) for w in words]
rate = sum(L) / sum(e - s for s, e in segs)
N, M, INF = len(segs), len(words), float("inf")
pre = [0]
for x in L: pre.append(pre[-1] + x)
dp = [[INF] * (M + 1) for _ in range(N + 1)]; bk = [[0] * (M + 1) for _ in range(N + 1)]; dp[0][0] = 0
for i in range(N):
    d = segs[i][1] - segs[i][0]
    for j in range(M):
        if dp[i][j] == INF: continue
        for k in range(j + 1, min(M, j + 60) + 1):
            est = (pre[k] - pre[j]) / rate
            c = dp[i][j] + (est - d) ** 2 / max(d, 0.5) - (0.8 if P[k - 1] else 0)
            if c < dp[i + 1][k]: dp[i + 1][k] = c; bk[i + 1][k] = j
            if est > d * 3 + 3: break
out, k = [], M
for i in range(N, 0, -1):
    j = bk[i][k]; s, e = segs[i - 1]; tot = pre[k] - pre[j]; acc = 0
    chunk = []
    for w in range(j, k):
        ws = s + (e - s) * acc / tot; acc += L[w]; chunk.append({"word": words[w], "start": round(ws, 3), "end": round(s + (e - s) * acc / tot, 3)})
    out = chunk + out; k = j
print(f"{N} speech segments, {M} words, rate {rate:.1f} chars/s")
write_timeline(os.path.join(a.project, "timeline"), out, sentences_from_words(out), "silence-align")
