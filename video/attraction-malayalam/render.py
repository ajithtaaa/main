"""Render frames [a, b) to an mp4 segment: python3 render.py a b out.mp4"""
import sys, subprocess, math
import numpy as np
from engine import *
import scenes as SC

rng = np.random.default_rng(3)

def make_bg(base, accent, dark, seed):
    r = random.Random(seed)
    bw, bh = W + 160, H + 100
    im = Image.new('RGBA', (bw, bh), base + (255,))
    ov = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    # big soft accent shapes
    for i in range(3):
        cx, cy, rr = r.uniform(0, bw), r.uniform(0, bh), r.uniform(260, 520)
        a = 46 if not dark else 60
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=accent + (a,))
    # faint grid
    gc = (255, 255, 255, 12) if dark else (0, 0, 0, 9)
    for x in range(0, bw, 80): d.line([(x, 0), (x, bh)], fill=gc, width=2)
    for y in range(0, bh, 80): d.line([(0, y), (bw, y)], fill=gc, width=2)
    im.alpha_composite(ov.filter(ImageFilter.GaussianBlur(2)))
    ht = halftone_patch(520, 420, accent, 20, 7, alpha=70 if not dark else 90)
    im.alpha_composite(ht, (bw - 560, bh - 450)); im.alpha_composite(ht.transpose(Image.ROTATE_180), (20, 10))
    # paper fibre texture
    n = rng.normal(0, 1, (bh // 2, bw // 2)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 18) + 128).clip(0, 255).astype(np.uint8)).resize((bw, bh), Image.BICUBIC)).astype(np.float32)
    arr = np.asarray(im).astype(np.float32)
    k = (n - 128) / 128 * (0.06 if not dark else 0.12)
    arr[..., :3] = arr[..., :3] * (1 + k[..., None])
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')

BGS = [make_bg(s[2], s[3], s[4], i) for i, s in enumerate(SC.SCENES)]

# vignette + grain
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.28 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) ** 1.4
vig = vig.clip(0.6, 1).astype(np.float32)[..., None]
GRAIN = [rng.normal(0, 5.5, (H, W, 1)).astype(np.float32) for _ in range(6)]

def scene_at(t):
    k = 0
    for i, s in enumerate(SC.SCENES):
        if t >= s[1]: k = i
    return k

_cap_cache = {}
def cap_sprite(text):
    if text not in _cap_cache:
        _cap_cache[text] = text_sprite(text, 62, WHITE, w=800, stroke=8, stroke_col=INK, maxw=1760)
    return _cap_cache[text]

def transition(frame, t):
    for T in SC.TRANS:
        if T - 0.4 <= t <= T + 0.4:
            p = (t - (T - 0.4)) / 0.8  # 0..1
            k = scene_at(T)
            ca, cb = SC.SCENES[k][3], SC.SCENES[k - 1][3]
            d = ImageDraw.Draw(frame)
            span = W + H + 900
            x = -H - 450 + span * ease_in_out(p)
            for off, col, wd in [(0, cb, 760), (520, ca, 900), (1150, INK, 120)]:
                xa = x - off
                d.polygon([(xa, 0), (xa + wd, 0), (xa + wd - H * 0.6, H), (xa - H * 0.6, H)], fill=col + (255,))

def render_frame(fi):
    t = fi / FPS
    k = scene_at(t)
    s0 = SC.SCENES[k][1]; s1 = SC.scene_end(k)
    lt = t - s0
    bg = BGS[k]
    ox = 80 + math.sin(t * 0.21) * 60; oy = 50 + math.cos(t * 0.17) * 36
    frame = bg.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))
    for el in SC.ELS:
        if el.t1 < s0 - 0.01 or el.t0 > t: continue
        if el.t0 < s0 - 0.5 and k > 0 and el.t1 > s0 and False: continue
        stt = el.state(t)
        if stt is None: continue
        sp = el.get_sprite(t)
        if sp is None: continue
        x, y, sc, r, a, wipe = stt
        if wipe < 1:
            ww = max(1, int(sp.width * wipe)); sp = sp.crop((0, 0, ww, sp.height)); x -= (sp.width * (1 / max(wipe, 1e-3) - 1)) / 2 * sc
        blit(frame, sp, x, y, sc, r, a)
    # camera push-in per scene
    z = 1.0 + 0.04 * clamp(lt / max(1.0, s1 - s0))
    if z > 1.001:
        cw, ch = W / z, H / z
        frame = frame.resize((W, H), Image.BILINEAR, box=((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2))
    # progress tracker
    if SC.POINTS_RANGE[0] <= t < SC.POINTS_RANGE[1]:
        cur = sum(1 for ps in SC.POINT_STARTS if t >= ps - 0.05)
        ta = clamp((t - SC.POINTS_RANGE[0]) / 0.4) * clamp((SC.POINTS_RANGE[1] - t) / 0.4)
        blit(frame, TR := SC.TRACKERS[cur], 1680, 70, 1.0, 0, ta)
    # captions
    for c0, c1, text in SC.CAPS:
        if c0 <= t <= c1:
            sp = cap_sprite(text)
            p = clamp((t - c0) / 0.18); q = clamp((c1 - t) / 0.12)
            blit(frame, sp, W / 2, 1010 - sp.height / 2 + 30 * (1 - ease_out_cubic(p)), 0.96 + 0.04 * ease_out_back(p), 0, min(p * 2, 1) * q)
            break
    transition(frame, t)
    arr = np.asarray(frame.convert('RGB')).astype(np.float32)
    arr = arr * vig + GRAIN[fi % 6]
    return arr.clip(0, 255).astype(np.uint8)

if __name__ == '__main__':
    a, b, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    if out.endswith('.png'):
        Image.fromarray(render_frame(a)).save(out); sys.exit()
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for fi in range(a, b):
        p.stdin.write(render_frame(fi).tobytes())
    p.stdin.close(); p.wait()
