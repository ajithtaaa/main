"""Synthesize SFX track + original music bed, write sfx.wav and music.wav (stereo, 44.1k)."""
import json, math, sys
import numpy as np
from scipy.signal import butter, lfilter, sosfilt
import scenes as SC

SR = 44100
DUR = SC.DUR
N = int(DUR * SR) + SR
rng = np.random.default_rng(11)

def place(buf, i, x, g=1.0):
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g

def tt(d): return np.arange(int(d * SR)) / SR
def env_exp(d, k): return np.exp(-tt(d) * k)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'hp', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lp', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'bp', fs=SR, output='sos'), x)
def noise(d): return rng.normal(0, 1, int(d * SR))
def norm(x, peak=1.0): m = np.max(np.abs(x)) + 1e-9; return x / m * peak
def sweep(f0, f1, d, curve=1.0):
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

# ------------------------------------------------------------------ SFX
def sfx_pop():
    d = 0.12; x = sweep(900, 320, d, 0.6) * env_exp(d, 38)
    return norm(x + 0.3 * hp(noise(d), 3000) * env_exp(d, 90), 0.7)
def sfx_whoosh(d=0.5):
    n = noise(d); t = tt(d)
    e = np.sin(np.pi * (t / d) ** 0.7) ** 2
    out = np.zeros_like(n); seg = 2048
    for i in range(0, len(n), seg):  # moving band-pass sweep
        f = 400 + 3200 * (i / len(n))
        out[i:i + seg] = bp(n[max(0, i - 4096):i + seg], f * 0.6, f * 1.6)[-len(n[i:i + seg]):]
    return norm(out * e, 0.6)
def sfx_swish(): return sfx_whoosh(0.32)
def sfx_stamp():
    d = 0.35
    x = sweep(160, 50, d, 0.4) * env_exp(d, 14) + 0.6 * lp(noise(d), 1800) * env_exp(d, 40)
    return norm(x, 0.95)
def sfx_boom():
    d = 1.1
    x = sweep(110, 32, d, 0.5) * env_exp(d, 4.5) + 0.5 * lp(noise(d), 600) * env_exp(d, 9)
    x[:int(0.02 * SR)] += hp(noise(0.02), 2000) * 0.4
    return norm(x, 1.0)
def sfx_thud():
    d = 0.3; return norm(sweep(140, 55, d, 0.5) * env_exp(d, 18) + 0.3 * lp(noise(d), 900) * env_exp(d, 30), 0.8)
def sfx_marker():
    d = 0.42; n = bp(noise(d), 2500, 7000) * (0.6 + 0.4 * np.sin(tt(d) * 2 * np.pi * 34)) * np.sin(np.pi * tt(d) / d)
    return norm(n, 0.35)
def sfx_heartbeat():
    out = np.zeros(int(1.3 * SR))
    for t0, a in [(0, 1.0), (0.26, 0.75), (0.75, 0.9), (1.0, 0.65)]:
        b = sweep(70, 40, 0.18, 0.5) * env_exp(0.18, 22) * a
        i = int(t0 * SR); out[i:i + len(b)] += b
    return norm(lp(out, 300), 0.9)
def sfx_riser():
    d = 1.8; t = tt(d)
    x = 0.5 * hp(noise(d), 800) * (t / d) ** 2 + 0.5 * sweep(200, 1400, d, 2) * (t / d) ** 2
    x[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
    return norm(x, 0.5)
def sfx_ping():
    out = np.zeros(int(0.45 * SR))
    for t0, f in [(0, 1318.5), (0.09, 1760)]:
        d = 0.32; b = (np.sin(2 * np.pi * f * tt(d)) + 0.3 * np.sin(4 * np.pi * f * tt(d))) * env_exp(d, 14)
        i = int(t0 * SR); out[i:i + len(b)] += b
    return norm(out, 0.45)
def sfx_ding():
    d = 1.2; f = 1567.98
    x = sum(a * np.sin(2 * np.pi * f * m * tt(d)) * env_exp(d, 4 + m * 2) for m, a in [(1, 1), (2.76, 0.4), (5.4, 0.2)])
    return norm(x, 0.45)
def sfx_chime():
    out = np.zeros(int(1.4 * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568, 2093]):
        d = 0.9; b = np.sin(2 * np.pi * f * tt(d)) * env_exp(d, 5)
        j = int(i * 0.06 * SR); out[j:j + len(b)] += b * 0.7
    return norm(out, 0.4)
def sfx_sparkle():
    out = np.zeros(int(1.0 * SR))
    for i in range(14):
        f = rng.uniform(2500, 6000); d = 0.25
        b = np.sin(2 * np.pi * f * tt(d)) * env_exp(d, 18)
        j = int(rng.uniform(0, 0.7) * SR); out[j:j + len(b)] += b
    return norm(out, 0.3)
def sfx_scratch():
    d = 0.55; t = tt(d)
    f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3.2 * t))
    x = bp(noise(d), 300, 3000) * 0.6 + 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return norm(x * np.sin(np.pi * t / d), 0.6)
def sfx_crack():
    d = 0.4; x = hp(noise(d), 1500) * env_exp(d, 25)
    for k in range(5):
        j = int(rng.uniform(0, 0.15) * SR); x[j:j + 300] += rng.normal(0, 1, 300) * 1.5
    return norm(x + 0.5 * sweep(200, 60, d) * env_exp(d, 12), 0.75)
def sfx_sad():
    out = np.zeros(int(1.6 * SR))
    for i, f in enumerate([392, 349.2, 311.1]):
        d = 0.7; b = (np.sin(2 * np.pi * f * tt(d)) + 0.4 * np.sin(2 * np.pi * f * 2 * tt(d))) * env_exp(d, 4)
        j = int(i * 0.32 * SR); out[j:j + len(b)] += b
    return norm(lp(out, 2500), 0.5)
def sfx_fall():
    d = 0.9; return norm(sweep(900, 120, d, 0.8) * np.sin(np.pi * tt(d) / d) * 0.6 + 0.4 * sfx_whoosh(d)[:int(d * SR)], 0.5)
def sfx_fire():
    d = 1.2; n = lp(noise(d), 1200) * 0.5
    for k in range(25):
        j = int(rng.uniform(0, d - 0.01) * SR); n[j:j + 120] += rng.normal(0, 1, 120) * rng.uniform(0.5, 1.5)
    return norm(n * np.minimum(1, tt(d) * 6) * np.minimum(1, (d - tt(d)) * 4), 0.4)
def sfx_tick():
    d = 0.04; return norm(hp(noise(d), 3500) * env_exp(d, 160), 0.35)
def sfx_clock():
    out = np.zeros(int(1.0 * SR))
    for i in range(4):
        b = sfx_tick() * (1.0 if i % 2 == 0 else 0.7); j = int(i * 0.25 * SR); out[j:j + len(b)] += b
    return out
def sfx_click():
    d = 0.06; return norm(hp(noise(d), 1500) * env_exp(d, 90) + np.sin(2 * np.pi * 1800 * tt(d)) * env_exp(d, 70), 0.6)
def sfx_unlock():
    out = np.zeros(int(0.6 * SR))
    for t0 in (0, 0.18):
        b = sfx_click(); j = int(t0 * SR); out[j:j + len(b)] += b
    m = sfx_chime()[:int(0.4 * SR)] * 0.8; j = int(0.2 * SR); out[j:j + len(m)] += m[:len(out) - j]
    return out
def sfx_rain():
    d = 2.2; return norm(bp(noise(d), 1500, 8000) * np.sin(np.pi * tt(d) / d), 0.25)
def sfx_transition():
    w = sfx_whoosh(0.7); b = np.zeros_like(w)
    p = sfx_thud() * 0.4; j = int(0.32 * SR); b[j:j + len(p)] += p[:len(b) - j]
    return w + b

SFXF = {k[4:]: v for k, v in globals().items() if k.startswith('sfx_')}
GAIN = {'pop': 0.5, 'whoosh': 0.55, 'swish': 0.5, 'stamp': 0.7, 'boom': 0.8, 'thud': 0.6, 'marker': 0.6, 'heartbeat': 0.9,
        'riser': 0.6, 'ping': 0.6, 'ding': 0.6, 'chime': 0.6, 'sparkle': 0.6, 'scratch': 0.7, 'crack': 0.7, 'sad': 0.6,
        'fall': 0.6, 'fire': 0.6, 'tick': 0.6, 'clock': 0.6, 'click': 0.7, 'unlock': 0.7, 'rain': 0.6, 'transition': 0.6}

def build_sfx():
    L = np.zeros(N); R = np.zeros(N)
    cache = {}
    last = {}
    for t, kind, g in sorted(SC.SFX):
        if kind not in SFXF: print('missing sfx', kind); continue
        # avoid machine-gun repeats of the same sound
        if kind in ('pop', 'whoosh', 'stamp') and t - last.get(kind, -9) < 0.09: continue
        last[kind] = t
        if kind not in cache or kind in ('pop', 'sparkle', 'crack', 'fire'):
            cache[kind] = SFXF[kind]()
        x = cache[kind] * g * GAIN.get(kind, 0.6)
        if kind == 'pop': x = x * rng.uniform(0.8, 1.0)
        pan = rng.uniform(-0.35, 0.35)
        i = int(max(0, t) * SR); j = min(N, i + len(x))
        L[i:j] += x[:j - i] * (1 - pan) * 0.85; R[i:j] += x[:j - i] * (1 + pan) * 0.85
    return np.stack([L, R], 1)

# ------------------------------------------------------------------ MUSIC
BPM = 86; BEAT = 60 / BPM; BAR = BEAT * 4
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
# section intensity: (start, pad, arp, drums, bass, hats, bright)
SECTIONS = [(0, 1, 0.6, 0, 0, 0, 0.4), (9.2, 1, 0.8, 0.5, 1, 0, 0.5), (17.35, 1, 1, 0.6, 1, 0.6, 0.6),
            (30.3, 1, 0.5, 0, 0.6, 0, 0.3), (43.9, 1, 1, 1, 1, 1, 0.7), (125.0, 0.8, 0.6, 0.4, 0.6, 0, 0.35),
            (130.45, 1, 1, 1, 1, 1, 0.8), (184.9, 1, 0.7, 0, 0.5, 0, 0.45), (206.35, 1, 1, 0.8, 1, 0.8, 0.75),
            (221.0, 1, 1, 1, 1, 1, 0.8)]
def sec_at(t):
    s = SECTIONS[0]
    for x in SECTIONS:
        if t >= x[0]: s = x
    return s

def smooth_param(idx):
    t = np.arange(N) / SR
    v = np.zeros(N)
    for i, s in enumerate(SECTIONS):
        a = int(s[0] * SR); b = int(SECTIONS[i + 1][0] * SR) if i + 1 < len(SECTIONS) else N
        v[a:b] = s[idx]
    k = int(0.8 * SR)  # 0.8s crossfades between sections
    c = np.cumsum(np.insert(v, 0, 0)); sm = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k - 1, v[0]), sm])[:N]

def build_music():
    t_all = np.arange(N) / SR
    pad = np.zeros(N); arp = np.zeros(N); bass = np.zeros(N); kick = np.zeros(N); clap = np.zeros(N); hat = np.zeros(N)
    nch = int(DUR / (BAR * 2)) + 2
    for ci in range(nch):
        t0 = ci * BAR * 2; ch = CHORDS[ci % 4]
        d = BAR * 2 + 0.6; t = tt(d)
        e = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
        for m in ch + [ch[0] + 12]:
            f = mtof(m)
            for det in (-0.12, 0.12):
                ph = 2 * np.pi * f * (1 + det / 100) * t
                pad_v = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
                place(pad, int(t0 * SR), pad_v * e, 0.12)
        # bass on beats 1 and 3
        for b in range(8):
            if b % 2: continue
            bt = t0 + b * BEAT; dd = BEAT * 1.6; x = np.sin(2 * np.pi * mtof(ch[0] - 24) * tt(dd)) * env_exp(dd, 2.5)
            x *= np.minimum(1, tt(dd) / 0.01)
            place(bass, int(bt * SR), x, 0.5)
        # arpeggio 8ths
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        notes = ch + [ch[0] + 12]
        for s8 in range(16):
            bt = t0 + s8 * BEAT / 2
            m = notes[pattern[s8 % 8]] + 12
            dd = 0.6; f = mtof(m); tx = tt(dd)
            x = (np.sin(2 * np.pi * f * tx) + 0.25 * np.sin(2 * np.pi * 2 * f * tx) + 0.08 * np.sin(2 * np.pi * 3 * f * tx)) * env_exp(dd, 7)
            x *= np.minimum(1, tx / 0.004)
            place(arp, int(bt * SR), x, (0.16 if s8 % 2 == 0 else 0.11))
        # drums
        for b in range(8):
            bt = t0 + b * BEAT; i = int(bt * SR)
            if b % 2 == 0:
                place(kick, i, sweep(120, 42, 0.35, 0.4) * env_exp(0.35, 10), 0.9)
            else:
                place(clap, i, bp(noise(0.25), 900, 4000) * env_exp(0.25, 18), 0.35)
            for h in range(2):
                ih = int((bt + h * BEAT / 2) * SR)
                place(hat, ih, hp(noise(0.06), 7000) * env_exp(0.06, 70), 0.22 if h else 0.14)
    P = {k: smooth_param(i) for i, k in enumerate(['_', 'pad', 'arp', 'drums', 'bass', 'hats', 'bright'])}
    arp_f = lp(arp, 3500)
    mix = pad * P['pad'] * 0.9 + arp_f * P['arp'] + bass * P['bass'] + (kick + clap) * P['drums'] + hat * P['hats']
    # brightness: blend lowpassed and full versions
    dark = lp(mix, 900)
    mix = dark * (1 - P['bright']) + mix * P['bright']
    # simple stereo reverb (multi-tap feedback delays)
    L = mix.copy(); R = mix.copy()
    for dl, g in [(0.031, 0.35), (0.047, 0.3), (0.071, 0.25), (0.113, 0.2), (0.173, 0.15), (0.241, 0.1)]:
        k = int(dl * SR)
        L[k:] += lp(mix, 4000)[:-k] * g; k2 = int(dl * 1.13 * SR); R[k2:] += lp(mix, 4000)[:-k2] * g
    out = np.stack([L, R], 1)
    # fade in/out
    fi = int(1.0 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(3.0 * SR); end = int(DUR * SR); out[end - fo:end] *= np.linspace(1, 0, fo)[:, None]; out[end:] = 0
    return norm(out, 0.9)

def wav(path, x):
    import wave
    x = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())

if __name__ == '__main__':
    s = build_sfx(); wav('sfx.wav', norm(s, 0.9) if np.max(np.abs(s)) > 0.9 else s)
    m = build_music(); wav('music.wav', m)
    print('done', s.shape, m.shape)
