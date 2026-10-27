"""Paper-collage motion graphics engine: sprites, icons, text, animated elements."""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

W, H, FPS = 1920, 1080, 30
FONT_DIR = '/tmp/claude-0/fonts/ttf'
PROJ = os.path.dirname(os.path.abspath(__file__))

PAPER = (239, 230, 213); INK = (27, 27, 31); RED = (226, 61, 45); YEL = (245, 183, 49)
TEAL = (36, 123, 130); PINK = (232, 120, 140); BLUE = (52, 92, 168); CREAM = (252, 248, 238)
GREY = (160, 154, 146); WHITE = (255, 255, 255); GREEN = (54, 160, 96); NAVY = (24, 30, 52)
ORANGE = (240, 128, 48); PURPLE = (120, 84, 170)

_fonts = {}
def font(size, w=800):
    k = (size, w)
    if k not in _fonts:
        name = 'BalooChettan2-800.ttf' if w >= 700 else 'BalooChettan2-600.ttf'
        _fonts[k] = ImageFont.truetype(os.path.join(FONT_DIR, name), size, layout_engine=ImageFont.Layout.RAQM)
    return _fonts[k]

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def ease_out_cubic(p): return 1 - (1 - p) ** 3
def ease_in_out(p): return p * p * (3 - 2 * p)
def ease_out_back(p, s=1.9):
    p -= 1
    return p * p * ((s + 1) * p + s) + 1
def ease_out_elastic(p):
    if p <= 0: return 0
    if p >= 1: return 1
    return 2 ** (-10 * p) * math.sin((p * 10 - 0.75) * (2 * math.pi) / 3) + 1

# ---------------------------------------------------------------- sprite helpers
SS = 3  # supersample factor for vector drawing

def canvas(w, h):
    im = Image.new('RGBA', (w * SS, h * SS), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)

def finish(im):
    return im.resize((im.width // SS, im.height // SS), Image.LANCZOS)

def S(v):  # scale coordinates for supersampled drawing
    if isinstance(v, (list, tuple)): return [S(x) for x in v]
    return v * SS

def trim(im, pad=4):
    bb = im.getbbox()
    if not bb: return im
    x0, y0, x1, y1 = bb
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))

def cutout(im, border=9, shadow=True, border_col=WHITE, shadow_off=(10, 14), shadow_blur=10, shadow_alpha=95):
    """Paper cutout: white border around alpha shape + soft drop shadow."""
    pad = border + shadow_blur * 2 + max(abs(shadow_off[0]), abs(shadow_off[1])) + 4
    base = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    base.paste(im, (pad, pad), im)
    a = base.getchannel('A')
    if border > 0:
        border_a = a.filter(ImageFilter.MaxFilter(border * 2 + 1 if border * 2 + 1 <= 25 else 25))
        if border * 2 + 1 > 25:  # repeat dilation for big borders
            for _ in range((border * 2 + 1) // 25):
                border_a = border_a.filter(ImageFilter.MaxFilter(25))
        border_a = border_a.filter(ImageFilter.GaussianBlur(0.8))
    else:
        border_a = a
    out = Image.new('RGBA', base.size, (0, 0, 0, 0))
    if shadow:
        sh = Image.new('RGBA', base.size, (20, 16, 12, 0))
        sa = border_a.point(lambda v: v * shadow_alpha // 255)
        sh.putalpha(sa)
        sh = sh.filter(ImageFilter.GaussianBlur(shadow_blur))
        out.alpha_composite(sh, (shadow_off[0], shadow_off[1]))
    if border > 0:
        bl = Image.new('RGBA', base.size, border_col + (255,))
        bl.putalpha(border_a)
        out.alpha_composite(bl)
    out.alpha_composite(base)
    return trim(out, 2)

def halftone_patch(w, h, color, spacing=18, rmax=6, falloff='radial', alpha=255):
    im, d = canvas(w, h)
    cx, cy = w / 2, h / 2
    for y in range(0, h + spacing, spacing):
        off = (spacing // 2) if (y // spacing) % 2 else 0
        for x in range(-spacing, w + spacing, spacing):
            xx = x + off
            if falloff == 'radial':
                k = 1 - math.hypot((xx - cx) / (w / 2), (y - cy) / (h / 2))
            else:
                k = 1 - xx / w
            r = rmax * clamp(k * 1.3)
            if r > 0.6:
                d.ellipse(S([xx - r, y - r, xx + r, y + r]), fill=color + (alpha,))
    return finish(im)

def tape(w=150, h=44, col=(250, 236, 190), alpha=190, rot=0):
    im, d = canvas(w, h)
    pts = [(0, 3), (w, 0), (w - 4, h), (3, h - 2)]
    # jagged ends
    jag_l = [(0 if i % 2 == 0 else 6, h * i / 6) for i in range(7)]
    jag_r = [(w - (0 if i % 2 == 0 else 6), h * (6 - i) / 6) for i in range(7)]
    d.polygon(S(jag_l + jag_r), fill=col + (alpha,))
    t = finish(im)
    return t.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else t

# ---------------------------------------------------------------- text
def text_sprite(text, size, color=INK, w=800, stroke=0, stroke_col=WHITE, maxw=None, align='center', spacing=None):
    f = font(size, w)
    lines = [text] if not maxw else wrap(text, f, maxw)
    sp = spacing if spacing is not None else int(size * 0.22)
    dummy = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    boxes = [dummy.textbbox((0, 0), l, font=f, stroke_width=stroke) for l in lines]
    lw = [b[2] - b[0] for b in boxes]
    lh = int(size * 1.45)
    tw = max(lw) + 8; th = lh * len(lines) + sp * (len(lines) - 1) + 8
    im = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        b = boxes[i]
        x = (tw - lw[i]) / 2 - b[0] if align == 'center' else 4 - b[0]
        y = i * (lh + sp) + 4 + int(size * 0.12)
        d.text((x, y), l, font=f, fill=color, stroke_width=stroke, stroke_fill=stroke_col)
    return trim(im, 3)

def wrap(text, f, maxw):
    words = text.split(' ')
    lines, cur = [], ''
    dummy = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if dummy.textlength(t, font=f) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = wd
    if cur: lines.append(cur)
    # balance two lines
    if len(lines) == 2:
        allw = text.split(' ')
        best = None
        for k in range(1, len(allw)):
            a, b = ' '.join(allw[:k]), ' '.join(allw[k:])
            m = max(dummy.textlength(a, font=f), dummy.textlength(b, font=f))
            if m <= maxw and (best is None or m < best[0]): best = (m, [a, b])
        if best: lines = best[1]
    return lines

def label_card(text, size=64, fg=INK, bg=CREAM, padx=36, pady=18, rot=0, border=8, radius=14, maxw=None):
    t = text_sprite(text, size, fg, maxw=maxw)
    w, h = t.width + padx * 2, t.height + pady * 2
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(radius), fill=bg + (255,))
    im = finish(im)
    im.alpha_composite(t, (padx, pady))
    im = cutout(im, border=border)
    return im.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else im

def marker_text(text, size, fg=INK, hl=YEL, maxw=None):
    """Static text with marker highlight behind (used with wipe anim)."""
    t = text_sprite(text, size, fg, maxw=maxw)
    w, h = t.width + 40, t.height + 30
    im, d = canvas(w, h)
    rnd = random.Random(text)
    pts = [(6, h * 0.42 + rnd.uniform(-4, 4)), (w - 4, h * 0.30 + rnd.uniform(-4, 4)),
           (w - 10, h * 0.94 + rnd.uniform(-4, 4)), (2, h * 0.98)]
    d.polygon(S(pts), fill=hl + (235,))
    im = finish(im)
    im.alpha_composite(t, (20, 12))
    return im

# ---------------------------------------------------------------- icons (all return RGBA, no border)
def icon_heart(s=200, col=RED):
    im, d = canvas(s, s)
    r = s * 0.27
    d.ellipse(S([s * 0.5 - 2 * r + 4, s * 0.12, s * 0.5 + 4, s * 0.12 + 2 * r]), fill=col)
    d.ellipse(S([s * 0.5 - 4, s * 0.12, s * 0.5 + 2 * r - 4, s * 0.12 + 2 * r]), fill=col)
    d.polygon(S([(s * 0.5 - 2 * r + 6, s * 0.12 + r * 1.25), (s * 0.5 + 2 * r - 6, s * 0.12 + r * 1.25), (s * 0.5, s * 0.92)]), fill=col)
    d.ellipse(S([s * 0.27, s * 0.22, s * 0.37, s * 0.32]), fill=(255, 255, 255, 120))
    return finish(im)

def icon_heart_half(s=200, col=RED, side='L'):
    h = icon_heart(s, col)
    m = Image.new('L', h.size, 0); d = ImageDraw.Draw(m)
    # zigzag crack
    zz = [(s * 0.5, 0), (s * 0.44, s * 0.3), (s * 0.56, s * 0.45), (s * 0.45, s * 0.62), (s * 0.55, s * 0.78), (s * 0.5, s)]
    poly = ([(0, 0)] + zz + [(0, s)]) if side == 'L' else ([(s, 0)] + zz + [(s, s)])
    d.polygon(poly, fill=255)
    out = Image.new('RGBA', h.size, (0, 0, 0, 0)); out.paste(h, (0, 0), ImageChops.multiply(h.getchannel('A'), m))
    return out

def icon_x(s=200, col=RED, wd=0.17):
    im, d = canvas(s, s); w = s * wd
    for a, b in [((s * .15, s * .15), (s * .85, s * .85)), ((s * .85, s * .15), (s * .15, s * .85))]:
        d.line(S([a, b]), fill=col, width=S(int(w)))
        for p in (a, b): d.ellipse(S([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2]), fill=col)
    return finish(im)

def icon_check(s=200, col=GREEN, wd=0.16):
    im, d = canvas(s, s); w = s * wd
    pts = [(s * .15, s * .55), (s * .4, s * .8), (s * .87, s * .22)]
    d.line(S(pts), fill=col, width=S(int(w)), joint='curve')
    for p in (pts[0], pts[2]): d.ellipse(S([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2]), fill=col)
    return finish(im)

def icon_circle_badge(s, inner, bg):
    im, d = canvas(s, s)
    d.ellipse(S([0, 0, s, s]), fill=bg)
    im = finish(im)
    k = inner.resize((int(s * 0.62), int(s * 0.62)), Image.LANCZOS)
    im.alpha_composite(k, ((s - k.width) // 2, (s - k.height) // 2))
    return im

def icon_sunglasses(s=260):
    im, d = canvas(s, int(s * 0.5))
    h = s * 0.5
    d.line(S([(s * 0.08, h * 0.28), (s * 0.92, h * 0.28)]), fill=INK, width=S(int(s * 0.05)))
    d.rounded_rectangle(S([s * 0.06, h * 0.22, s * 0.46, h * 0.85]), radius=S(int(s * 0.1)), fill=INK)
    d.rounded_rectangle(S([s * 0.54, h * 0.22, s * 0.94, h * 0.85]), radius=S(int(s * 0.1)), fill=INK)
    d.polygon(S([(s * 0.12, h * 0.35), (s * 0.2, h * 0.35), (s * 0.13, h * 0.6)]), fill=(255, 255, 255, 110))
    d.polygon(S([(s * 0.6, h * 0.35), (s * 0.68, h * 0.35), (s * 0.61, h * 0.6)]), fill=(255, 255, 255, 110))
    return finish(im)

def icon_money(s=300):
    h = int(s * 0.52)
    im, d = canvas(s, h)
    d.rounded_rectangle(S([0, 0, s, h]), radius=S(14), fill=(96, 168, 104))
    d.rounded_rectangle(S([12, 12, s - 12, h - 12]), radius=S(10), outline=(220, 245, 220), width=S(4))
    d.ellipse(S([s / 2 - h * 0.3, h * 0.2, s / 2 + h * 0.3, h * 0.8]), fill=(220, 245, 220))
    im = finish(im)
    t = text_sprite('₹', int(h * 0.42), (60, 120, 70))
    im.alpha_composite(t, (s // 2 - t.width // 2, h // 2 - t.height // 2))
    return im

def icon_lock(s=220, col=YEL, open_=0.0):
    im, d = canvas(s, int(s * 1.25))
    lift = s * 0.25 * open_
    d.arc(S([s * 0.22, s * 0.05 - lift, s * 0.78, s * 0.65 - lift]), 180, 360, fill=GREY, width=S(int(s * 0.1)))
    d.line(S([(s * 0.27, s * 0.35 - lift), (s * 0.27, s * 0.55 - lift)]), fill=GREY, width=S(int(s * 0.1)))
    if open_ < 0.5:
        d.line(S([(s * 0.73, s * 0.35 - lift), (s * 0.73, s * 0.55)]), fill=GREY, width=S(int(s * 0.1)))
    d.rounded_rectangle(S([s * 0.08, s * 0.5, s * 0.92, s * 1.2]), radius=S(int(s * 0.08)), fill=col)
    d.ellipse(S([s * 0.42, s * 0.7, s * 0.58, s * 0.86]), fill=INK)
    d.polygon(S([(s * 0.46, s * 0.8), (s * 0.54, s * 0.8), (s * 0.56, s * 1.0), (s * 0.44, s * 1.0)]), fill=INK)
    return finish(im)

def icon_phone(s=360):
    w, h = int(s * 0.55), s
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(int(w * 0.14)), fill=INK)
    d.rounded_rectangle(S([w * 0.06, h * 0.06, w * 0.94, h * 0.94]), radius=S(int(w * 0.08)), fill=(236, 240, 246))
    d.rounded_rectangle(S([w * 0.38, h * 0.025, w * 0.62, h * 0.045]), radius=S(4), fill=(70, 70, 76))
    return finish(im)

def bubble(text, size=40, bg=(66, 133, 244), fg=WHITE, tail='L', maxw=520):
    t = text_sprite(text, size, fg, maxw=maxw, w=600)
    w, h = t.width + 44, t.height + 26
    im, d = canvas(w + 20, h + 16)
    ox = 10 if tail == 'L' else 10
    d.rounded_rectangle(S([10, 0, 10 + w, h]), radius=S(26), fill=bg)
    if tail == 'L': d.polygon(S([(14, h - 26), (0, h + 12), (40, h - 4)]), fill=bg)
    else: d.polygon(S([(w + 6, h - 26), (w + 20, h + 12), (w - 20, h - 4)]), fill=bg)
    im = finish(im)
    im.alpha_composite(t, (10 + 22, 13))
    return im

def icon_clock(s=240, hh=2, mm=0, face=CREAM, rim=INK):
    im, d = canvas(s, s)
    d.ellipse(S([0, 0, s, s]), fill=rim)
    d.ellipse(S([s * 0.07, s * 0.07, s * 0.93, s * 0.93]), fill=face)
    c = s / 2
    for i in range(12):
        a = i / 12 * 2 * math.pi
        r0, r1 = s * 0.36, s * 0.41
        d.line(S([(c + r0 * math.sin(a), c - r0 * math.cos(a)), (c + r1 * math.sin(a), c - r1 * math.cos(a))]), fill=rim, width=S(5))
    ah = ((hh % 12) + mm / 60) / 12 * 2 * math.pi; am = mm / 60 * 2 * math.pi
    d.line(S([(c, c), (c + s * 0.22 * math.sin(ah), c - s * 0.22 * math.cos(ah))]), fill=rim, width=S(12))
    d.line(S([(c, c), (c + s * 0.33 * math.sin(am), c - s * 0.33 * math.cos(am))]), fill=RED, width=S(7))
    d.ellipse(S([c - 10, c - 10, c + 10, c + 10]), fill=rim)
    return finish(im)

def icon_eye(s=320, iris=TEAL):
    h = int(s * 0.55)
    im, d = canvas(s, h)
    pts = []
    for i in range(41):
        x = i / 40
        pts.append((x * s, h / 2 - math.sin(x * math.pi) * h * 0.48))
    for i in range(40, -1, -1):
        x = i / 40
        pts.append((x * s, h / 2 + math.sin(x * math.pi) * h * 0.48))
    d.polygon(S(pts), fill=WHITE, outline=INK, width=S(8))
    r = h * 0.36
    d.ellipse(S([s / 2 - r, h / 2 - r, s / 2 + r, h / 2 + r]), fill=iris)
    d.ellipse(S([s / 2 - r * 0.45, h / 2 - r * 0.45, s / 2 + r * 0.45, h / 2 + r * 0.45]), fill=INK)
    d.ellipse(S([s / 2 + r * 0.15, h / 2 - r * 0.6, s / 2 + r * 0.45, h / 2 - r * 0.3]), fill=WHITE)
    return finish(im)

def icon_flame(s=220, t=0.0):
    im, d = canvas(s, int(s * 1.3))
    h = s * 1.3
    def drop(cx, base, wdt, ht, col, wob):
        pts = []
        for i in range(60):
            a = i / 59 * 2 * math.pi
            x = math.sin(a) * wdt * (0.5 + 0.5 * math.cos(a / 2) ** 2)
            y = -math.cos(a) * ht * 0.5
            yy = base - ht * 0.5 + y
            k = (base - yy) / ht
            x = x * (1 - k * 0.75) * 1.0 + wob * math.sin(t * 9 + k * 4) * k * 8
            pts.append((cx + x, yy))
        d.polygon(S(pts), fill=col)
    drop(s / 2, h * 0.97, s * 0.46, h * 0.92, ORANGE, 1.4)
    drop(s / 2, h * 0.97, s * 0.30, h * 0.62, YEL, 1.0)
    drop(s / 2, h * 0.97, s * 0.15, h * 0.32, (255, 245, 210), 0.6)
    return finish(im)

def icon_dumbbell(s=300, col=INK):
    h = int(s * 0.42)
    im, d = canvas(s, h)
    d.rounded_rectangle(S([s * 0.2, h * 0.42, s * 0.8, h * 0.58]), radius=S(6), fill=GREY)
    for x0 in (0.04, 0.82):
        d.rounded_rectangle(S([s * x0, h * 0.1, s * (x0 + 0.14), h * 0.9]), radius=S(10), fill=col)
    for x0 in (0.15, 0.74):
        d.rounded_rectangle(S([s * x0, h * 0.22, s * (x0 + 0.1), h * 0.78]), radius=S(8), fill=col)
    return finish(im)

def icon_briefcase(s=280, col=(150, 92, 52)):
    h = int(s * 0.78)
    im, d = canvas(s, h)
    d.rounded_rectangle(S([s * 0.34, 0, s * 0.66, h * 0.3]), radius=S(14), outline=INK, width=S(14))
    d.rounded_rectangle(S([0, h * 0.2, s, h]), radius=S(22), fill=col)
    d.rectangle(S([0, h * 0.5, s, h * 0.56]), fill=(110, 64, 34))
    d.rounded_rectangle(S([s * 0.44, h * 0.44, s * 0.56, h * 0.62]), radius=S(5), fill=YEL)
    return finish(im)

def icon_chart(s=300, p=1.0, col=TEAL):
    im, d = canvas(s, s)
    d.line(S([(s * 0.08, s * 0.05), (s * 0.08, s * 0.92), (s * 0.95, s * 0.92)]), fill=INK, width=S(10))
    hs = [0.25, 0.4, 0.55, 0.8]
    for i, hh in enumerate(hs):
        x0 = s * (0.16 + i * 0.2)
        hv = hh * clamp(p * 1.6 - i * 0.2) * s * 0.85
        d.rectangle(S([x0, s * 0.9 - hv, x0 + s * 0.14, s * 0.9]), fill=col if i < 3 else RED)
    return finish(im)

def icon_music(s=220, col=PURPLE):
    im, d = canvas(s, s)
    d.ellipse(S([s * 0.08, s * 0.66, s * 0.38, s * 0.9]), fill=col)
    d.ellipse(S([s * 0.58, s * 0.56, s * 0.88, s * 0.8]), fill=col)
    d.rectangle(S([s * 0.3, s * 0.12, s * 0.37, s * 0.78]), fill=col)
    d.rectangle(S([s * 0.8, s * 0.02, s * 0.87, s * 0.68]), fill=col)
    d.polygon(S([(s * 0.3, s * 0.12), (s * 0.87, s * 0.02), (s * 0.87, s * 0.16), (s * 0.3, s * 0.26)]), fill=col)
    return finish(im)

def icon_target(s=240):
    im, d = canvas(s, s)
    for i, c in enumerate([RED, WHITE, RED, WHITE, RED]):
        r = s / 2 * (1 - i * 0.19)
        d.ellipse(S([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r]), fill=c)
    return finish(im)

def icon_flag(s=200, col=RED):
    im, d = canvas(s, s)
    d.rectangle(S([s * 0.18, s * 0.05, s * 0.24, s * 0.98]), fill=INK)
    d.polygon(S([(s * 0.24, s * 0.08), (s * 0.92, s * 0.25), (s * 0.24, s * 0.48)]), fill=col)
    return finish(im)

def icon_ear(s=240, col=(232, 180, 150)):
    im, d = canvas(s, int(s * 1.3))
    h = s * 1.3
    d.ellipse(S([s * 0.1, 0, s * 0.9, h * 0.75]), fill=col)
    d.polygon(S([(s * 0.12, h * 0.45), (s * 0.55, h * 0.98), (s * 0.75, h * 0.6)]), fill=col)
    d.ellipse(S([s * 0.5, h * 0.75, s * 0.75, h]), fill=col)
    d.arc(S([s * 0.28, h * 0.12, s * 0.75, h * 0.6]), 160, 400, fill=(180, 120, 96), width=S(16))
    d.arc(S([s * 0.38, h * 0.3, s * 0.6, h * 0.5]), 200, 420, fill=(180, 120, 96), width=S(12))
    return finish(im)

def icon_waves(s=200, p=1.0, col=TEAL):
    im, d = canvas(s, s)
    for i in range(3):
        if p * 3 > i:
            r = s * (0.2 + i * 0.16)
            d.arc(S([s * 0.1 - r, s / 2 - r, s * 0.1 + r, s / 2 + r]), -45, 45, fill=col, width=S(14))
    return finish(im)

def icon_calendar(s=240, num='3', top=RED):
    im, d = canvas(s, int(s * 1.05))
    h = s * 1.05
    d.rounded_rectangle(S([0, s * 0.08, s, h]), radius=S(18), fill=WHITE, outline=INK, width=S(6))
    d.rounded_rectangle(S([0, s * 0.08, s, s * 0.34]), radius=S(18), fill=top)
    d.rectangle(S([0, s * 0.24, s, s * 0.34]), fill=top)
    for x in (0.28, 0.72):
        d.rounded_rectangle(S([s * x - 8, 0, s * x + 8, s * 0.18]), radius=S(6), fill=INK)
    im = finish(im)
    t = text_sprite(num, int(s * 0.46), INK)
    im.alpha_composite(t, (s // 2 - t.width // 2, int(s * 0.42)))
    return im

def icon_shield(s=260, col=TEAL, inner=None):
    im, d = canvas(s, int(s * 1.18))
    h = s * 1.18
    pts = [(s * 0.5, 0), (s, h * 0.14), (s * 0.95, h * 0.55), (s * 0.5, h), (s * 0.05, h * 0.55), (0, h * 0.14)]
    d.polygon(S(pts), fill=col)
    pts2 = [(s * 0.5, h * 0.08), (s * 0.9, h * 0.19), (s * 0.85, h * 0.54), (s * 0.5, h * 0.9), (s * 0.15, h * 0.54), (s * 0.1, h * 0.19)]
    d.polygon(S(pts2), outline=(255, 255, 255, 160), width=S(6))
    im = finish(im)
    if inner is not None:
        k = inner.resize((int(s * 0.5), int(s * 0.5 * inner.height / inner.width)), Image.LANCZOS)
        im.alpha_composite(k, ((s - k.width) // 2, int(h * 0.48 - k.height / 2)))
    return im

def icon_house(s=260, col=YEL, glow=False):
    im, d = canvas(s, s)
    d.polygon(S([(s * 0.5, s * 0.05), (s * 0.98, s * 0.48), (s * 0.02, s * 0.48)]), fill=RED)
    d.rectangle(S([s * 0.14, s * 0.46, s * 0.86, s * 0.97]), fill=col)
    d.rounded_rectangle(S([s * 0.4, s * 0.62, s * 0.6, s * 0.97]), radius=S(10), fill=INK)
    d.rectangle(S([s * 0.2, s * 0.56, s * 0.34, s * 0.7]), fill=(255, 240, 180))
    d.rectangle(S([s * 0.66, s * 0.56, s * 0.8, s * 0.7]), fill=(255, 240, 180))
    return finish(im)

def icon_star(s=120, col=YEL, n=4, inner=0.28):
    im, d = canvas(s, s)
    pts = []
    for i in range(n * 2):
        a = i / (n * 2) * 2 * math.pi - math.pi / 2
        r = s / 2 if i % 2 == 0 else s / 2 * inner
        pts.append((s / 2 + r * math.cos(a), s / 2 + r * math.sin(a)))
    d.polygon(S(pts), fill=col)
    return finish(im)

def icon_bell(s=200, col=YEL):
    im, d = canvas(s, s)
    d.pieslice(S([s * 0.18, s * 0.1, s * 0.82, s * 0.9]), 180, 360, fill=col)
    d.polygon(S([(s * 0.18, s * 0.5), (s * 0.82, s * 0.5), (s * 0.94, s * 0.78), (s * 0.06, s * 0.78)]), fill=col)
    d.ellipse(S([s * 0.4, s * 0.74, s * 0.6, s * 0.94]), fill=col)
    d.ellipse(S([s * 0.44, s * 0.02, s * 0.56, s * 0.14]), fill=col)
    return finish(im)

def icon_share(s=200, col=TEAL):
    im, d = canvas(s, s)
    pts = [(s * 0.78, s * 0.2), (s * 0.24, s * 0.5), (s * 0.78, s * 0.8)]
    d.line(S(pts), fill=col, width=S(16))
    for x, y in pts:
        d.ellipse(S([x - s * 0.13, y - s * 0.13, x + s * 0.13, y + s * 0.13]), fill=col)
    return finish(im)

def icon_megaphone(s=240, col=RED):
    im, d = canvas(s, s)
    d.polygon(S([(s * 0.15, s * 0.38), (s * 0.85, s * 0.08), (s * 0.85, s * 0.92), (s * 0.15, s * 0.62)]), fill=col)
    d.rectangle(S([s * 0.05, s * 0.36, s * 0.2, s * 0.64]), fill=INK)
    d.polygon(S([(s * 0.22, s * 0.6), (s * 0.38, s * 0.66), (s * 0.34, s * 0.92), (s * 0.24, s * 0.92)]), fill=INK)
    return finish(im)

def icon_mirror(s=260, glow=0.0):
    im, d = canvas(s, int(s * 1.35))
    h = s * 1.35
    d.ellipse(S([0, 0, s, h * 0.86]), fill=(196, 150, 90))
    d.ellipse(S([s * 0.08, h * 0.05, s * 0.92, h * 0.81]), fill=(205, 228, 236))
    d.polygon(S([(s * 0.25, h * 0.2), (s * 0.4, h * 0.12), (s * 0.18, h * 0.55), (s * 0.12, h * 0.45)]), fill=(255, 255, 255, 150))
    d.rectangle(S([s * 0.44, h * 0.84, s * 0.56, h * 0.98]), fill=(196, 150, 90))
    d.rounded_rectangle(S([s * 0.25, h * 0.95, s * 0.75, h]), radius=S(6), fill=(196, 150, 90))
    return finish(im)

def icon_volume(s=280, level=0.3, col=TEAL):
    im, d = canvas(s, int(s * 0.7))
    h = s * 0.7
    n = 8
    for i in range(n):
        bh = h * (0.15 + 0.85 * i / (n - 1))
        on = i / (n - 1) <= level + 1e-6
        c = (col if i < 5 else RED) if on else (210, 204, 194)
        x0 = s * (0.02 + i * 0.123)
        d.rounded_rectangle(S([x0, h - bh, x0 + s * 0.09, h]), radius=S(6), fill=c)
    return finish(im)

def icon_bowl(s=260, col=ORANGE):
    im, d = canvas(s, s)
    d.chord(S([s * 0.05, s * 0.15, s * 0.95, s * 0.95]), 0, 180, fill=col)
    d.rectangle(S([s * 0.02, s * 0.52, s * 0.98, s * 0.58]), fill=RED)
    for i, x in enumerate((0.35, 0.5, 0.65)):
        pts = [(s * x + math.sin(k * 0.7 + i) * 10, s * 0.45 - k * 6) for k in range(10)]
        d.line(S(pts), fill=GREY, width=S(8), joint='curve')
    return finish(im)

def icon_bike(s=320, col=RED):
    h = int(s * 0.62)
    im, d = canvas(s, h)
    for cx in (0.2, 0.8):
        d.ellipse(S([s * cx - h * 0.3, h * 0.38, s * cx + h * 0.3, h * 0.98]), outline=INK, width=S(14))
    d.polygon(S([(s * 0.3, h * 0.45), (s * 0.68, h * 0.4), (s * 0.6, h * 0.7), (s * 0.35, h * 0.7)]), fill=col)
    d.line(S([(s * 0.2, h * 0.68), (s * 0.4, h * 0.5)]), fill=INK, width=S(12))
    d.line(S([(s * 0.8, h * 0.68), (s * 0.66, h * 0.2), (s * 0.58, h * 0.18)]), fill=INK, width=S(12))
    d.rounded_rectangle(S([s * 0.32, h * 0.32, s * 0.55, h * 0.42]), radius=S(8), fill=INK)
    return finish(im)

def icon_cloud(s=300, col=(120, 132, 150)):
    h = int(s * 0.6)
    im, d = canvas(s, h)
    for x, y, r in [(0.3, 0.6, 0.22), (0.5, 0.45, 0.3), (0.72, 0.6, 0.22)]:
        d.ellipse(S([s * (x - r), h * y - s * r, s * (x + r), h * y + s * r]), fill=col)
    d.rounded_rectangle(S([s * 0.1, h * 0.55, s * 0.92, h * 0.98]), radius=S(int(h * 0.2)), fill=col)
    return finish(im)

def icon_comment_box(w=760, h=170, text='', cursor=True):
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(24), fill=WHITE)
    d.ellipse(S([24, 30, 104, 110]), fill=TEAL)
    d.line(S([(130, 120), (w - 40, 120)]), fill=INK, width=S(4))
    im = finish(im)
    t = text_sprite(text + ('|' if cursor else ''), 54, INK, w=600) if text or cursor else None
    if t: im.alpha_composite(t, (134, 40))
    return im

def person(kind='man', col=None, s=420, grey=False):
    """Flat pictogram figure (head + shoulders/torso)."""
    if col is None: col = BLUE if kind == 'man' else RED
    if grey: col = (176, 170, 160)
    w, h = int(s * 0.62), s
    im, d = canvas(w, h)
    skin = (226, 180, 150) if not grey else (198, 192, 182)
    hair = INK if not grey else (150, 144, 136)
    cx = w / 2
    hr = s * 0.13
    if kind == 'woman':
        d.rounded_rectangle(S([cx - hr * 1.35, s * 0.07, cx + hr * 1.35, s * 0.47]), radius=S(int(hr * 1.2)), fill=hair)
    # torso
    d.rounded_rectangle(S([cx - w * 0.46, s * 0.47, cx + w * 0.46, s * 1.08]), radius=S(int(s * 0.17)), fill=col)
    d.polygon(S([(cx - s * 0.06, s * 0.47), (cx + s * 0.06, s * 0.47), (cx, s * 0.56)]), fill=skin)
    d.rectangle(S([cx - s * 0.045, s * 0.36, cx + s * 0.045, s * 0.49]), fill=skin)
    d.ellipse(S([cx - hr, s * 0.1, cx + hr, s * 0.1 + hr * 2.2]), fill=skin)
    if kind == 'man':
        d.chord(S([cx - hr * 1.05, s * 0.08, cx + hr * 1.05, s * 0.08 + hr * 1.5]), 180, 360, fill=hair)
        d.rectangle(S([cx - hr * 1.02, s * 0.08 + hr * 0.7, cx - hr * 0.8, s * 0.1 + hr * 1.1]), fill=hair)
    else:
        d.chord(S([cx - hr * 1.1, s * 0.07, cx + hr * 1.1, s * 0.07 + hr * 1.5]), 180, 360, fill=hair)
    im = finish(im)
    return im.crop((0, 0, w, h))

def runner(s=360, col=BLUE, phase=0.0):
    """Simple running stick-ish figure, animated by phase."""
    im, d = canvas(s, s)
    cx = s * 0.5
    th = math.sin(phase) * 0.7
    skin = (226, 180, 150)
    lw = int(s * 0.07)
    hip = (cx, s * 0.58); neck = (cx + s * 0.05, s * 0.3)
    def limb(p, a1, l1, a2, l2, c):
        k = (p[0] + math.sin(a1) * l1, p[1] + math.cos(a1) * l1)
        e = (k[0] + math.sin(a2) * l2, k[1] + math.cos(a2) * l2)
        d.line(S([p, k, e]), fill=c, width=S(lw), joint='curve')
        d.ellipse(S([e[0] - lw / 2, e[1] - lw / 2, e[0] + lw / 2, e[1] + lw / 2]), fill=c)
    limb(hip, th, s * 0.2, th - 0.6 - abs(th) * 0.3, s * 0.2, INK)
    limb(neck, -th * 0.9, s * 0.15, -th * 0.9 + 1.2, s * 0.13, col)
    d.line(S([hip, neck]), fill=col, width=S(int(lw * 1.6)))
    limb(hip, -th, s * 0.2, -th - 0.6 - abs(th) * 0.3, s * 0.2, INK)
    limb(neck, th * 0.9, s * 0.15, th * 0.9 + 1.2, s * 0.13, col)
    d.ellipse(S([neck[0] - s * 0.02, s * 0.1, neck[0] + s * 0.14, s * 0.26]), fill=skin)
    d.chord(S([neck[0] - s * 0.02, s * 0.095, neck[0] + s * 0.14, s * 0.2]), 180, 360, fill=INK)
    return finish(im)

# ---------------------------------------------------------------- photo slots (Pinterest later)
PHOTO_DIR = os.path.join(PROJ, 'pins')

def _grad(w, h, top, bot):
    a = np.linspace(0, 1, h)[:, None, None]
    arr = (np.array(top)[None, None, :] * (1 - a) + np.array(bot)[None, None, :] * a)
    arr = np.repeat(arr, w, axis=1).astype(np.uint8)
    return Image.fromarray(arr, 'RGB').convert('RGBA')

def illustrated(key, w, h):
    """Stylised illustration used when no Pinterest photo exists for the slot."""
    rnd = random.Random(key)
    if key == 'trek':
        im = _grad(w, h, (255, 170, 110), (255, 226, 170)); d = ImageDraw.Draw(im)
        d.ellipse([w * 0.4, h * 0.38, w * 0.62, h * 0.38 + w * 0.22], fill=(255, 245, 210))
        d.polygon([(0, h), (w * 0.3, h * 0.45), (w * 0.55, h * 0.8), (w * 0.75, h * 0.5), (w, h * 0.85), (w, h)], fill=(110, 70, 90))
        d.polygon([(0, h), (w * 0.2, h * 0.7), (w * 0.5, h), ], fill=(70, 46, 70))
        d.polygon([(w * 0.5, h), (w * 0.85, h * 0.72), (w, h * 0.9), (w, h)], fill=(70, 46, 70))
        for x in (0.66, 0.71):
            d.ellipse([w * x, h * 0.6, w * x + 16, h * 0.6 + 16], fill=INK)
            d.rectangle([w * x + 4, h * 0.6 + 14, w * x + 12, h * 0.6 + 44], fill=INK)
    elif key == 'food':
        im = _grad(w, h, (40, 28, 70), (120, 50, 80)); d = ImageDraw.Draw(im)
        for i in range(40):
            x, y, r = rnd.uniform(0, w), rnd.uniform(0, h * 0.6), rnd.uniform(6, 22)
            c = rnd.choice([(255, 200, 90), (255, 120, 90), (255, 230, 160)])
            d.ellipse([x - r, y - r, x + r, y + r], fill=c + (160,))
        d.rectangle([0, h * 0.62, w, h], fill=(60, 30, 40))
        for i in range(4):
            x0 = w * (0.05 + i * 0.24)
            d.rectangle([x0, h * 0.5, x0 + w * 0.18, h * 0.62], fill=rnd.choice([RED, YEL, TEAL, ORANGE]))
            d.polygon([(x0 - 10, h * 0.5), (x0 + w * 0.09, h * 0.4), (x0 + w * 0.18 + 10, h * 0.5)], fill=(240, 230, 210))
    elif key == 'rain':
        im = _grad(w, h, (70, 90, 120), (140, 160, 180)); d = ImageDraw.Draw(im)
        for i in range(140):
            x, y = rnd.uniform(0, w), rnd.uniform(0, h)
            d.line([(x, y), (x - 8, y + 30)], fill=(220, 235, 250, 200), width=2)
        d.rectangle([0, h * 0.8, w, h], fill=(50, 60, 80))
        b = icon_bike(int(w * 0.5), RED)
        im.alpha_composite(b, (int(w * 0.25), int(h * 0.8 - b.height * 0.95)))
    elif key == 'gym':
        im = _grad(w, h, (50, 52, 60), (90, 92, 100)); d = ImageDraw.Draw(im)
        db = icon_dumbbell(int(w * 0.6), (230, 230, 230))
        im.alpha_composite(db, (int(w * 0.2), int(h * 0.45)))
        d.rectangle([0, h * 0.85, w, h], fill=(30, 30, 36))
    elif key == 'couple':
        im = _grad(w, h, (255, 140, 100), (255, 210, 150)); d = ImageDraw.Draw(im)
        d.ellipse([w * 0.3, h * 0.25, w * 0.7, h * 0.25 + w * 0.4], fill=(255, 236, 190))
        d.rectangle([0, h * 0.78, w, h], fill=(90, 50, 60))
        m = person('man', INK, int(h * 0.62)); f = person('woman', INK, int(h * 0.56))
        im.alpha_composite(m, (int(w * 0.48), int(h * 0.82 - m.height)))
        im.alpha_composite(f, (int(w * 0.26), int(h * 0.82 - f.height)))
    elif key == 'cafe':
        im = _grad(w, h, (190, 160, 130), (150, 120, 96)); d = ImageDraw.Draw(im)
        d.rounded_rectangle([w * 0.3, h * 0.45, w * 0.62, h * 0.8], radius=18, fill=WHITE)
        d.arc([w * 0.56, h * 0.5, w * 0.72, h * 0.7], -90, 90, fill=WHITE, width=12)
        d.rectangle([0, h * 0.8, w, h], fill=(110, 80, 60))
    elif key == 'cinema':
        im = _grad(w, h, (30, 20, 30), (70, 30, 40)); d = ImageDraw.Draw(im)
        d.rectangle([w * 0.1, h * 0.12, w * 0.9, h * 0.55], fill=(230, 230, 240))
        for i in range(5):
            d.ellipse([w * (0.08 + i * 0.18), h * 0.75, w * (0.22 + i * 0.18), h * 1.05], fill=(20, 12, 18))
    elif key == 'chat':
        im = _grad(w, h, (220, 226, 236), (200, 210, 225)); d = ImageDraw.Draw(im)
        for i in range(4):
            y = h * (0.1 + i * 0.22)
            if i % 2: d.rounded_rectangle([w * 0.35, y, w * 0.92, y + h * 0.15], radius=20, fill=(66, 133, 244))
            else: d.rounded_rectangle([w * 0.08, y, w * 0.6, y + h * 0.15], radius=20, fill=WHITE)
    else:
        im = _grad(w, h, (200, 190, 180), (160, 150, 140))
    return im

def photo_card(key, w=520, h=380, rot=0, caption=None, tape_on=True, grade=True):
    """Polaroid-style cutout. Uses pins/<key>.jpg (from Pinterest) if present."""
    path = None
    for ext in ('.jpg', '.jpeg', '.png', '.webp'):
        p = os.path.join(PHOTO_DIR, key + ext)
        if os.path.exists(p): path = p; break
    if path:
        src = Image.open(path).convert('RGB')
        sw, sh = src.size; k = max(w / sw, h / sh)
        src = src.resize((int(sw * k) + 1, int(sh * k) + 1), Image.LANCZOS)
        x0, y0 = (src.width - w) // 2, (src.height - h) // 3
        ph = src.crop((x0, y0, x0 + w, y0 + h)).convert('RGBA')
        if grade:  # warm, slightly faded print look to sit in the collage
            arr = np.asarray(ph).astype(np.float32)
            arr[..., :3] = arr[..., :3] * 0.9 + np.array([22, 14, 4])
            ph = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')
    else:
        ph = illustrated(key, w, h)
    bw, bt, bb = 18, 18, 18 if not caption else 70
    card = Image.new('RGBA', (w + bw * 2, h + bt + bb), CREAM + (255,))
    card.paste(ph, (bw, bt))
    if caption:
        t = text_sprite(caption, 40, INK, w=600)
        card.alpha_composite(t, ((card.width - t.width) // 2, h + bt + (bb - t.height) // 2))
    card = cutout(card, border=0, shadow=True, shadow_off=(12, 16), shadow_blur=12)
    if tape_on:
        tp = tape(170, 46, rot=random.Random(key).uniform(-12, 12))
        out = Image.new('RGBA', (card.width, card.height + 30), (0, 0, 0, 0))
        out.alpha_composite(card, (0, 30))
        out.alpha_composite(tp, ((card.width - tp.width) // 2, 0))
        card = out
    return card.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else card

# ---------------------------------------------------------------- element system
class El:
    def __init__(self, sprite, t0, t1, x, y, enter='pop', exit='pop', z=0, rot=0.0, scale=1.0,
                 dur_in=0.45, dur_out=0.3, float_amp=6, rot_amp=0.8, sfx=True, fn=None, alpha=1.0,
                 drift=(0, 0), spin=0.0, pulse=0.0):
        self.sprite = sprite; self.fn = fn
        self.t0, self.t1, self.x, self.y = t0, t1, x, y
        self.enter, self.exit, self.z, self.rot, self.scale = enter, exit, z, rot, scale
        self.dur_in, self.dur_out = dur_in, dur_out
        self.float_amp, self.rot_amp = float_amp, rot_amp
        self.phase = random.Random(id(self)).uniform(0, 6.28)
        self.sfx = sfx; self.alpha = alpha; self.drift = drift; self.spin = spin; self.pulse = pulse
        self._cache = {}

    def state(self, t):
        if t < self.t0 or t > self.t1: return None
        pi = clamp((t - self.t0) / self.dur_in) if self.dur_in > 0 else 1
        po = clamp((self.t1 - t) / self.dur_out) if self.dur_out > 0 else 1
        x, y, s, r, a = self.x, self.y, self.scale, self.rot, self.alpha
        lt = t - self.t0
        x += self.drift[0] * lt; y += self.drift[1] * lt; r += self.spin * lt
        x += 0; y += math.sin(lt * 1.6 + self.phase) * self.float_amp
        r += math.sin(lt * 1.1 + self.phase) * self.rot_amp
        if self.pulse: s *= 1 + self.pulse * math.sin(lt * 6) ** 2
        e = self.enter
        if pi < 1:
            if e == 'pop': s *= max(0.01, ease_out_back(pi)); a *= clamp(pi * 3)
            elif e == 'stamp':
                s *= 1 + 1.3 * (1 - ease_out_cubic(pi)); a *= clamp(pi * 4); r += (1 - pi) * 10
            elif e == 'slam':
                s *= 1 + 2.5 * (1 - ease_out_cubic(pi)) ** 2; a *= clamp(pi * 5)
            elif e == 'slide_l': x -= (1 - ease_out_cubic(pi)) * 1300
            elif e == 'slide_r': x += (1 - ease_out_cubic(pi)) * 1300
            elif e == 'slide_u': y += (1 - ease_out_cubic(pi)) * 900
            elif e == 'slide_d': y -= (1 - ease_out_cubic(pi)) * 900
            elif e == 'drop': y -= (1 - ease_out_elastic(pi) if pi > 0 else 1) * 700; a *= clamp(pi * 4)
            elif e == 'fade': a *= ease_in_out(pi)
            elif e == 'spin': s *= max(0.01, ease_out_back(pi)); r += (1 - ease_out_cubic(pi)) * -200; a *= clamp(pi * 3)
            elif e == 'wipe': pass
        if po < 1:
            xo = self.exit
            if xo == 'pop': s *= max(0.01, ease_in_out(po)); a *= po
            elif xo == 'fade': a *= po
            elif xo == 'slide_l': x -= (1 - po) ** 2 * 1400
            elif xo == 'slide_r': x += (1 - po) ** 2 * 1400
            elif xo == 'slide_d': y += (1 - po) ** 2 * 1000
            elif xo == 'slide_u': y -= (1 - po) ** 2 * 1000
            elif xo == 'none': pass
        wipe = ease_out_cubic(pi) if e == 'wipe' else 1.0
        return x, y, s, r, a, wipe

    def get_sprite(self, t):
        if self.fn is not None:
            return self.fn(t - self.t0)
        return self.sprite

def blit(dst, im, cx, cy, scale=1.0, rot=0.0, alpha=1.0, wipe=1.0):
    if alpha <= 0.01 or scale <= 0.01: return
    if wipe < 1.0:
        ww = max(1, int(im.width * wipe))
        im = im.crop((0, 0, ww, im.height)); cx -= (im.width * (1 / wipe - 1)) / 2 * scale if wipe > 0 else 0
        cx = cx  # left-anchored reveal handled below
    if abs(scale - 1) > 0.003:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    if abs(rot) > 0.05:
        im = im.rotate(rot, expand=True, resample=Image.BILINEAR)
    if alpha < 0.999:
        a = im.getchannel('A').point(lambda v: int(v * alpha))
        im = im.copy(); im.putalpha(a)
    x0, y0 = int(cx - im.width / 2), int(cy - im.height / 2)
    sx0, sy0 = max(0, -x0), max(0, -y0)
    ex, ey = min(im.width, dst.width - x0), min(im.height, dst.height - y0)
    if ex <= sx0 or ey <= sy0: return
    if sx0 or sy0 or ex < im.width or ey < im.height:
        im = im.crop((sx0, sy0, ex, ey))
    dst.alpha_composite(im, (x0 + sx0, y0 + sy0))
