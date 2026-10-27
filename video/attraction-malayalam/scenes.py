"""Timeline: 16 scenes of paper-collage motion graphics synced to the voiceover."""
import json, math, random
from engine import *

C = json.load(open(os.path.join(PROJ, 'timing.json')))
def st(i): return C[i]['start']
def en(i): return C[i]['end']

AUDIO_END = 233.95
DUR = AUDIO_END + 1.6
SCENES = [  # name, start, bg, accent, dark
    ('hook', 0.0, PAPER, RED, False),
    ('tease', 9.2, NAVY, YEL, True),
    ('arjun', 17.35, PAPER, BLUE, False),
    ('reject', 30.3, (214, 208, 198), GREY, False),
    ('mistake', 43.9, PAPER, TEAL, False),
    ('six', 60.85, (247, 204, 96), RED, False),
    ('p1', 67.1, PAPER, ORANGE, False),
    ('p2', 86.7, (232, 238, 236), TEAL, False),
    ('p3', 109.1, PAPER, PINK, False),
    ('comment', 125.0, TEAL, YEL, True),
    ('p4', 130.45, NAVY, RED, True),
    ('p5', 153.1, (236, 232, 244), PURPLE, False),
    ('p6', 172.4, PAPER, YEL, False),
    ('secret', 184.9, (30, 22, 40), PINK, True),
    ('after', 206.35, (250, 230, 208), PINK, False),
    ('outro', 221.0, PAPER, RED, False),
]
def scene_end(k): return SCENES[k + 1][1] if k + 1 < len(SCENES) else DUR

ELS = []      # all elements
SFX = []      # (time, kind, gain)
def add(el, z=None, sfx=None):
    if z is not None: el.z = z
    ELS.append(el)
    kind = sfx if sfx is not None else {'pop': 'pop', 'stamp': 'stamp', 'slam': 'boom', 'slide_l': 'whoosh',
            'slide_r': 'whoosh', 'slide_u': 'whoosh', 'slide_d': 'whoosh', 'drop': 'thud', 'spin': 'swish',
            'wipe': 'marker'}.get(el.enter)
    if kind and el.sfx: SFX.append((el.t0, kind, 1.0))
    return el
def fx(t, kind, g=1.0): SFX.append((t, kind, g))

def big_num(n, col=RED):
    t = text_sprite(str(n), 330, col, stroke=0)
    return cutout(t, border=14, shadow_off=(14, 18))

def title(text, size=78, fg=INK, bg=CREAM, rot=-2, maxw=1300):
    return label_card(text, size, fg, bg, rot=rot, maxw=maxw)

def word(text, size=96, fg=INK, border=10, maxw=None):
    return cutout(text_sprite(text, size, fg, maxw=maxw), border=border)

random.seed(7)
# =========================================================== 1 HOOK
k = 0; S0, S1 = SCENES[k][1], scene_end(k)
add(El(cutout(person('woman', s=470)), 0.2, st(1) - 0.1, 610, 520, 'slide_l', 'slide_l', z=2))
add(El(cutout(person('man', s=500)), 0.5, st(1) - 0.1, 1310, 505, 'slide_r', 'slide_r', z=2))
add(El(cutout(icon_heart(230)), 1.3, st(1) - 0.1, 960, 380, 'pop', z=3, pulse=0.08), sfx='pop')
fx(1.9, 'heartbeat', 0.9)
add(El(title('ഭ്രാന്തമായി ആഗ്രഹിക്കാൻ...?', 70, INK, CREAM, rot=-3), 2.2, 5.8, 960, 140, 'stamp', 'pop', z=4))
add(El(halftone_patch(520, 520, RED, 22, 8), 0.0, S1, 960, 470, 'fade', 'fade', z=0, float_amp=0, rot_amp=0, spin=4))
# looks -> X
add(El(cutout(icon_circle_badge(300, icon_sunglasses(260), YEL)), st(1) - 0.1, S1, 660, 420, 'pop', z=5))
add(El(word('സൗന്ദര്യം', 58), st(1) + 0.1, S1, 660, 640, 'pop', z=5, sfx=False))
add(El(icon_x(300), st(1) + 0.75, S1, 660, 440, 'stamp', z=6))
add(El(cutout(icon_money(300)), st(2) - 0.15, S1, 1260, 420, 'drop', z=5))
add(El(word('പണം', 58), st(2), S1, 1260, 600, 'pop', z=5, sfx=False))
add(El(icon_x(300), st(2) + 0.5, S1, 1260, 430, 'stamp', z=6))

# =========================================================== 2 TEASE (secret at the end)
k = 1; S0, S1 = SCENES[k][1], scene_end(k)
def lock_fn(lt):
    return cutout(icon_lock(250, YEL, 0.0))
add(El(None, S0 + 0.3, S1, 960, 420, 'drop', z=3, fn=lock_fn, rot_amp=3))
add(El(title('രഹസ്യം', 92, CREAM, RED, rot=3), st(3) + 1.0, S1, 960, 140, 'stamp', z=4))
for i in range(10):
    a = i / 10 * 2 * math.pi
    add(El(icon_star(70, YEL), S0 + 0.6 + i * 0.05, S1, 960 + math.cos(a) * 330, 420 + math.sin(a) * 260, 'pop', z=2, spin=30, sfx=False))
# timeline bar with END marker
def tl_fn(lt):
    w, h = 1300, 90
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 30, w, 60]), radius=S(15), fill=(70, 74, 100))
    p = clamp(lt / 3.0)
    d.rounded_rectangle(S([0, 30, max(40, w * 0.12 + w * 0.86 * ease_in_out(p)), 60]), radius=S(15), fill=RED)
    x = w * 0.12 + w * 0.86 * ease_in_out(p)
    d.ellipse(S([x - 30, 15, x + 30, 75]), fill=WHITE)
    return finish(im)
add(El(None, st(4) - 0.2, S1, 960, 760, 'slide_u', z=3, fn=tl_fn, float_amp=0, rot_amp=0), sfx='whoosh')
add(El(label_card('END', 44, WHITE, RED, padx=20, pady=6), st(4), S1, 1580, 690, 'pop', z=4))
fx(st(4) + 0.3, 'riser', 0.7)
add(El(title('SKIP ചെയ്യരുത്!', 96, WHITE, RED, rot=-4), st(5) - 0.1, S1, 960, 600, 'slam', z=8))

# =========================================================== 3 ARJUN STORY
k = 2; S0, S1 = SCENES[k][1], scene_end(k)
add(El(title('ആദ്യം ഒരു കഥ', 80, INK, CREAM, rot=-2), S0 + 0.2, st(7), 960, 470, 'stamp', 'pop', z=3))
# ID card
def id_card():
    w, h = 720, 400
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(26), fill=CREAM)
    d.rounded_rectangle(S([0, 0, w, 80]), radius=S(26), fill=BLUE)
    d.rectangle(S([0, 50, w, 80]), fill=BLUE)
    im = finish(im)
    p = person('man', s=280); im.alpha_composite(p, (40, 100))
    im.alpha_composite(text_sprite('അർജുൻ', 86, INK), (280, 120))
    im.alpha_composite(text_sprite('വയസ്സ്: 26', 56, (90, 90, 96), w=600), (285, 250))
    im.alpha_composite(text_sprite('STORY', 34, WHITE), (36, 18))
    return cutout(im, border=6)
add(El(id_card(), st(7) - 0.2, st(9) + 0.3, 960, 450, 'drop', 'slide_l', z=3))
fx(st(8), 'pop', 0.8)
add(El(cutout(person('man', s=420)), st(9), st(11) - 0.1, 470, 520, 'slide_l', 'slide_l', z=3))
add(El(cutout(person('woman', s=400)), st(9) + 0.1, st(11) - 0.1, 1450, 530, 'slide_r', 'slide_r', z=3))
add(El(cutout(icon_heart(150)), st(9) + 0.6, st(10), 960, 330, 'pop', z=4, pulse=0.1))
fx(st(9) + 0.7, 'heartbeat', 0.8)
add(El(title('അവൾ ചോദിച്ചതെല്ലാം', 60, INK, YEL, rot=2), st(10), st(11), 960, 230, 'stamp', 'pop', z=5))
for i, (dx, dy) in enumerate([(-120, 0), (0, 40), (120, 0)]):
    add(El(icon_check(110), st(10) + 0.3 + i * 0.25, st(11), 960 + dx, 380 + dy, 'pop', z=5))
# phone + 2AM clock + fast replies
add(El(cutout(icon_phone(560)), st(11) - 0.1, S1, 960, 500, 'slide_u', z=5, rot_amp=0.3))
def clock_fn(lt):
    m = int(min(lt * 25, 59)); return cutout(icon_clock(220, 2, m))
add(El(None, st(11), S1, 1290, 280, 'pop', z=6, fn=clock_fn))
add(El(label_card('2:00 AM', 48, WHITE, INK, padx=18, pady=6), st(11) + 0.3, S1, 1290, 430, 'pop', z=7))
for i, m in enumerate(['ഹായ്', 'ഉറങ്ങിയില്ലേ?', 'ഇല്ല!', 'ഓക്കെ', 'ശരി ശരി!']):
    t0 = st(11) + 0.4 + i * 0.55
    left = i % 2 == 0
    add(El(bubble(m, 34, WHITE if left else (66, 133, 244), INK if left else WHITE, 'L' if left else 'R', 380),
           t0, S1, 905 + (-40 if left else 40), 340 + i * 72, 'pop', z=7, float_amp=0, rot_amp=0, sfx=False))
    fx(t0, 'ping', 0.55)
add(El(title('ഉടൻ മറുപടി', 64, WHITE, RED, rot=-4), st(12) + 0.2, S1, 520, 760, 'stamp', z=8))

# =========================================================== 4 REJECTION
k = 3; S0, S1 = SCENES[k][1], scene_end(k)
add(El(cutout(person('woman', s=460)), S0 + 0.2, st(15), 560, 540, 'slide_l', 'slide_l', z=2))
add(El(bubble('നീ നല്ലവനാണ്...', 52, CREAM, INK, 'L', 700), st(14) - 0.1, st(15), 1180, 360, 'pop', 'pop', z=4))
add(El(bubble('പക്ഷേ... ഫീലിംഗ് ഇല്ല', 52, INK, WHITE, 'L', 760), st(14) + 1.6, st(15), 1180, 560, 'pop', 'pop', z=4))
fx(st(14) + 1.6, 'scratch', 0.9)
# heart breaks
add(El(cutout(icon_heart_half(260, RED, 'L'), border=0), st(15) - 0.3, S1, 900, 430, 'pop', z=4, drift=(-40, 25), spin=-8))
add(El(cutout(icon_heart_half(260, RED, 'R'), border=0), st(15) - 0.3, S1, 1020, 430, 'pop', z=4, drift=(40, 25), spin=8, sfx=False))
fx(st(15) - 0.05, 'crack', 1.0); fx(st(15) + 0.1, 'sad', 0.7)
add(El(title('എന്താണ് തെറ്റിയത്?', 84, WHITE, RED, rot=-2), st(15) + 0.1, S1, 960, 160, 'stamp', z=6))
add(El(text_sprite('?', 260, RED, stroke=10), st(16), S1, 330, 520, 'spin', z=5))
add(El(text_sprite('?', 200, INK, stroke=10), st(16) + 0.3, S1, 1600, 560, 'spin', z=5))
add(El(title('പിന്നെ അവൻ എന്ത് മാറ്റി?', 62, INK, YEL, rot=3), st(16) + 0.1, S1, 960, 760, 'slide_u', z=6))

# =========================================================== 5 MISTAKE (she becomes the centre)
k = 4; S0, S1 = SCENES[k][1], scene_end(k)
add(El(title('നമ്മൾ മിക്കവരും ചെയ്യുന്ന തെറ്റ്', 62, WHITE, RED, rot=-2), S0 + 0.3, st(19), 960, 470, 'stamp', 'pop', z=6))
orbit_icons = [icon_dumbbell(230), icon_briefcase(190), icon_music(170), icon_ear(130), icon_target(170)]
def orbit_fn_factory(i, n):
    def f(lt): return None
    return f
cx, cy, R = 960, 450, 330
add(El(cutout(person('woman', s=330)), st(19) - 0.1, S1, cx, cy, 'pop', z=4))
add(El(title('കേന്ദ്രം', 56, INK, YEL, rot=0), st(19) + 0.5, st(20) + 1, cx, cy + 210, 'pop', 'pop', z=5))
class Orbit(El):
    def __init__(self, sprite, t0, t1, i, n, fall_t):
        super().__init__(sprite, t0, t1, 0, 0, 'pop', 'pop', z=3, float_amp=0, rot_amp=0)
        self.i, self.n, self.fall_t = i, n, fall_t
    def state(self, t):
        s = super().state(t)
        if s is None: return None
        x, y, sc, r, a, w = s
        ang = self.i / self.n * 2 * math.pi + (t - self.t0) * 0.6
        rr = R * (1 - 0.12 * math.sin((t - self.t0) * 2))
        X, Y = cx + math.cos(ang) * rr * 1.25, cy + math.sin(ang) * rr * 0.9
        if t > self.fall_t:  # his world falls away
            p = t - self.fall_t
            Y += 900 * p * p; r += p * 120 * (1 if self.i % 2 else -1)
        return X, Y, sc, r, a, w
for i, ic in enumerate(orbit_icons):
    add(Orbit(cutout(ic, border=7), st(19) + 0.2 + i * 0.15, S1, i, len(orbit_icons), st(21) + i * 0.12))
fx(st(21) + 0.1, 'fall', 0.9)
add(El(title('അവന്റെ ലോകം', 54, WHITE, BLUE, rot=-3), st(20), st(21) + 0.4, 360, 160, 'slide_l', 'pop', z=6))
add(El(title('ബാക്കി ഒന്നുമില്ല', 64, WHITE, INK, rot=2), st(21) + 0.4, st(22), 1500, 820, 'stamp', 'pop', z=7))
# mystery + depth
for i in range(6):
    add(El(text_sprite('?', 120 + i * 18, [RED, INK, TEAL][i % 3], stroke=8), st(22) + 0.1 + i * 0.12, S1,
           260 + i * 280, 230 + (i % 2) * 140, 'spin', z=6, sfx=i == 0))
add(El(marker_text('മിസ്റ്ററി', 120, INK, YEL), st(22) + 0.2, S1, 960, 760, 'wipe', z=8))
def depth_fn(lt):
    w, h = 520, 520
    im, d = canvas(w, h)
    for i in range(7):
        p = (i + (lt * 0.6) % 1) / 7
        r = w / 2 * (1 - p)
        c = tuple(int(TEAL[j] * (1 - p) + NAVY[j] * p) for j in range(3))
        d.ellipse(S([w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r]), fill=c)
    return finish(im)
add(El(None, st(23) - 0.2, S1, 960, 420, 'pop', z=9, fn=depth_fn))
add(El(title('ആഴം', 90, WHITE, NAVY, rot=-2), st(23), S1, 960, 420, 'stamp', z=10))

# =========================================================== 6 SIX THINGS
k = 5; S0, S1 = SCENES[k][1], scene_end(k)
add(El(title('ശരിക്കും വർക്ക് ചെയ്യുന്ന 6 കാര്യങ്ങൾ', 66, INK, CREAM, rot=-1), S0 + 0.2, S1, 960, 150, 'stamp', z=6))
for i in range(6):
    col = [RED, TEAL, ORANGE, INK, PURPLE, BLUE][i]
    x = 520 + (i % 3) * 440; y = 430 + (i // 3) * 300
    lab = '?' if i == 3 else str(i + 1)
    card = label_card(lab, 140, WHITE, col, padx=70, pady=10, rot=random.uniform(-5, 5))
    add(El(card, S0 + 0.6 + i * 0.18, S1, x, y, 'pop', z=4, pulse=0.05 if i == 3 else 0))
def ring_fn(lt):
    s = 360; im, d = canvas(s, s)
    p = clamp(lt / 0.8)
    d.arc(S([12, 12, s - 12, s - 12]), -90, -90 + 360 * ease_out_cubic(p), fill=RED, width=S(14))
    return finish(im)
add(El(None, st(25), S1, 520 + 0 * 440, 730, 'fade', z=7, fn=ring_fn, float_amp=0, rot_amp=0), sfx='marker')
add(El(title('മിക്കവർക്കും അറിയില്ല!', 56, WHITE, RED, rot=4), st(25) + 0.5, S1, 1100, 900, 'stamp', z=8))

# helper for point scenes
def point_intro(n, label, t_num, t_lab, S1, col=RED, num_x=300, lab_xy=(1050, 150)):
    add(El(big_num(n, col), t_num - 0.05, S1, num_x, 260, 'slam', z=9, rot=-6))
    add(El(title(label, 76, WHITE, col, rot=-2), t_lab, S1, lab_xy[0], lab_xy[1], 'slide_r', z=9))

# =========================================================== 7 POINT 1: MISSION
k = 6; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(1, 'സ്വന്തമായി ഒരു മിഷൻ', st(26), st(27) + 0.1, st(29) + 0.3, ORANGE)
items = [('gym', 'ജിം'), ('career', 'കരിയർ'), ('business', 'ബിസിനസ്'), ('music', 'മ്യൂസിക്')]
ics = {'gym': icon_dumbbell(220), 'career': icon_briefcase(170), 'business': icon_chart(190), 'music': icon_music(180)}
for i, (key, lab) in enumerate(items):
    t0 = st(28) + i * 0.62
    x = 330 + i * 420
    if key == 'gym':
        add(El(photo_card('gym', 300, 220, rot=-4), t0, st(29) + 0.2, x, 600, 'drop', 'pop', z=5))
    else:
        add(El(cutout(icon_circle_badge(260, ics[key], CREAM)), t0, st(29) + 0.2, x, 600, 'drop', 'pop', z=5))
    add(El(word(lab, 54), t0 + 0.15, st(29) + 0.2, x, 800, 'pop', 'pop', z=6, sfx=False))
# eye with fire
add(El(cutout(icon_eye(420)), st(29), st(31), 760, 470, 'pop', 'pop', z=5))
add(El(None, st(29) + 0.4, st(31), 1180, 450, 'pop', 'pop', z=5, fn=lambda lt: cutout(icon_flame(230, lt), border=6)))
fx(st(29) + 0.4, 'fire', 0.8)
add(El(title('കണ്ണുകളിൽ ഒരു തീ', 66, WHITE, RED, rot=2), st(29) + 0.8, st(31), 960, 780, 'stamp', 'pop', z=7))
add(El(cutout(person('woman', s=300)), st(30) - 0.1, st(31) + 0.3, 1580, 520, 'slide_r', 'slide_r', z=5))
add(El(cutout(icon_star(80, YEL)), st(30) + 0.2, st(31), 1500, 330, 'pop', 'pop', z=6, spin=40))
# runner going forward vs chasing
add(El(None, st(31), S1, 960, 470, 'slide_l', z=5, fn=lambda lt: cutout(runner(380, BLUE, lt * 9), border=6), float_amp=0, rot_amp=0))
def road_fn(lt):
    w, h = 1920, 140
    im, d = canvas(w, h)
    d.rectangle(S([0, 40, w, 110]), fill=(70, 70, 80))
    off = (lt * 600) % 160
    for x in range(-160, w + 160, 160):
        d.rectangle(S([x - off, 70, x - off + 80, 80]), fill=YEL)
    return finish(im)
add(El(None, st(31), S1, 960, 700, 'fade', z=4, fn=road_fn, float_amp=0, rot_amp=0), sfx=False)
add(El(cutout(icon_flag(200)), st(32) + 1.0, S1, 1680, 540, 'drop', z=4))
add(El(cutout(person('woman', s=260)), st(31) + 0.5, st(32) + 1.2, 260, 520, 'slide_l', 'slide_l', z=5))
add(El(title('അവളുടെ പിന്നാലെ', 52, WHITE, GREY, rot=-3), st(32), st(33), 520, 180, 'pop', 'pop', z=7))
add(El(icon_x(110), st(32) + 0.6, st(33), 790, 170, 'stamp', 'pop', z=8))
add(El(title('മുന്നോട്ട്!', 72, WHITE, ORANGE, rot=2), st(33) - 0.05, S1, 1300, 180, 'slide_r', z=7))

# =========================================================== 8 POINT 2: LISTEN
k = 7; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(2, 'ശരിക്കും കേൾക്കുക', st(34), st(35), st(36) + 0.2, TEAL)
add(El(cutout(icon_ear(220)), st(35) + 0.1, st(36) + 0.2, 1000, 540, 'pop', 'pop', z=5))
add(El(None, st(35) + 0.3, st(36) + 0.2, 1200, 520, 'fade', 'pop', z=5, fn=lambda lt: icon_waves(260, (lt * 1.5) % 1.34, TEAL)), sfx=False)
# reply vs understand
add(El(title('മറുപടി പറയാൻ', 62, WHITE, GREY, rot=-2), st(36) + 0.2, st(38), 560, 360, 'slide_l', 'pop', z=6))
add(El(icon_x(130), st(37) - 0.4, st(38), 860, 340, 'stamp', 'pop', z=7))
add(El(title('മനസ്സിലാക്കാൻ', 62, WHITE, TEAL, rot=2), st(37), st(38), 1360, 560, 'slide_r', 'pop', z=6))
add(El(icon_check(140), st(37) + 0.4, st(38), 1660, 530, 'stamp', 'pop', z=7))
# 3 days ago -> remembered detail
add(El(cutout(icon_calendar(240, '3', RED)), st(38), st(39) + 0.2, 520, 470, 'drop', 'pop', z=6))
add(El(word('ദിവസം മുൻപ്', 52), st(38) + 0.3, st(39) + 0.2, 520, 690, 'pop', 'pop', z=6, sfx=False))
add(El(cutout(person('woman', s=380)), st(38) + 0.6, st(41), 1400, 560, 'slide_r', 'slide_r', z=5))
add(El(bubble('അമ്മയുടെ ഡോക്ടർ അപ്പോയിന്റ്മെന്റ് എന്തായി?', 44, (66, 133, 244), WHITE, 'R', 640), st(39) - 0.1, st(41), 760, 520, 'pop', 'pop', z=7))
fx(st(39), 'ping', 0.6)
add(El(cutout(icon_heart(110)), st(40), st(41) + 0.3, 1400, 290, 'pop', 'pop', z=7, pulse=0.12))
for i in range(5):
    add(El(icon_star(60, YEL), st(40) + 0.1 + i * 0.07, st(41), 1400 + math.cos(i * 1.3) * 210, 400 + math.sin(i * 1.3) * 200, 'pop', 'pop', z=7, spin=60, sfx=i == 0))
fx(st(40), 'sparkle', 0.8)
# one different in a grey crowd
for i in range(7):
    special = i == 3
    add(El(cutout(person('man', s=300, grey=not special), border=6), st(41) + 0.1 + i * 0.08, S1, 240 + i * 240, 560, 'slide_u', z=5,
           scale=1.15 if special else 1.0, sfx=i == 0, pulse=0.04 if special else 0))
add(El(title('ആരും ശ്രദ്ധിക്കുന്നില്ല', 62, WHITE, GREY, rot=-2), st(41) + 0.2, st(42), 960, 170, 'stamp', 'pop', z=8))
add(El(title('നീ വ്യത്യസ്തൻ', 76, INK, YEL, rot=2), st(42), S1, 960, 170, 'stamp', z=8))
def spot_fn(lt):
    w, h = 520, 900
    im, d = canvas(w, h)
    d.polygon(S([(w * 0.4, 0), (w * 0.6, 0), (w, h), (0, h)]), fill=(255, 236, 160, 120))
    return finish(im).filter(ImageFilter.GaussianBlur(6))
add(El(None, st(42), S1, 960, 470, 'fade', z=4, fn=spot_fn, float_amp=0, rot_amp=0), sfx='sparkle')

# =========================================================== 9 POINT 3: NEW EXPERIENCES
k = 8; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(3, 'പുതിയ അനുഭവങ്ങൾ ഒരുമിച്ച്', st(43), st(44), st(45) + 0.2, PINK)
add(El(cutout(person('man', s=300)), st(44) + 0.3, st(45) + 0.2, 830, 600, 'pop', 'pop', z=5))
add(El(cutout(person('woman', s=280)), st(44) + 0.45, st(45) + 0.2, 1090, 610, 'pop', 'pop', z=5))
add(El(cutout(icon_heart(90)), st(44) + 0.8, st(45) + 0.2, 960, 430, 'pop', 'pop', z=6, pulse=0.1))
add(El(label_card('പഠനം', 56, WHITE, BLUE, rot=-3), st(45), st(47), 560, 230, 'stamp', 'pop', z=7))
add(El(None, st(45) + 0.2, st(47), 960, 480, 'pop', 'pop', z=6, fn=lambda lt: cutout(icon_chart(380, clamp(lt / 2.0), PINK))))
add(El(title('അടുപ്പം കൂടുന്നു', 76, WHITE, RED, rot=2), st(46), st(47), 1420, 300, 'stamp', 'pop', z=7))
fx(st(46), 'riser', 0.5)
# boring loop
for i, key in enumerate(['cafe', 'cinema', 'chat']):
    add(El(photo_card(key, 360, 250, rot=[-4, 2, -2][i], caption=['ഒരേ കഫേ', 'ഒരേ സിനിമ', 'ഒരേ ചാറ്റ്'][i], tape_on=False),
           st(47) + i * 0.35, st(49) - 0.05, 420 + i * 540, 470, 'pop', 'slide_d', z=6))
add(El(title('ബോർ!', 120, WHITE, GREY, rot=-8), st(48), st(49) - 0.05, 960, 520, 'stamp', 'pop', z=8))
# exciting alternatives (Pinterest slots)
for i, (key, cap) in enumerate([('trek', 'സൺറൈസ് ട്രെക്ക്'), ('food', 'ഫുഡ് സ്ട്രീറ്റ്'), ('rain', 'മഴയത്ത് ബൈക്ക്')]):
    t0 = [st(49), st(50), st(51)][i]
    add(El(photo_card(key, 440, 300, rot=[-5, 3, -2][i], caption=cap), t0, S1, 400 + i * 560, 470, 'drop', 'pop', z=6 + i))
fx(st(51) + 0.1, 'rain', 0.6)
add(El(cutout(icon_heart(160)), st(52) + 0.2, S1, 960, 760, 'pop', z=10, pulse=0.1))
add(El(title('ഓർമ്മകൾ = നിന്റെ മുഖം', 60, INK, YEL, rot=-2), st(52) + 0.4, S1, 960, 140, 'stamp', z=10))

# =========================================================== 10 COMMENT CTA
k = 9; S0, S1 = SCENES[k][1], scene_end(k)
add(El(title('ഏതാണ് നീ ചെയ്യാത്തത്?', 76, INK, CREAM, rot=-2), S0 + 0.2, S1, 960, 200, 'stamp', z=6))
def cbox_fn(lt):
    s = '1, 2, 3...'
    n = int(clamp((lt - 1.6) / 1.2) * len(s))
    return cutout(icon_comment_box(820, 170, s[:n], cursor=int(lt * 3) % 2 == 0), border=0)
add(El(None, st(53) + 0.6, S1, 960, 500, 'slide_u', z=6, fn=cbox_fn, float_amp=2, rot_amp=0))
for i in range(10): fx(st(54) + 0.45 + i * 0.12, 'tick', 0.5)
add(El(label_card('COMMENT', 44, WHITE, RED, padx=24, pady=8), st(54) + 0.2, S1, 1300, 650, 'pop', z=7))
add(El(text_sprite('4 ?', 260, YEL, stroke=12, stroke_col=INK), st(55), S1, 960, 820, 'slam', z=8))

# =========================================================== 11 POINT 4: EMOTIONAL SAFETY
k = 10; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(4, 'ഇമോഷണൽ സേഫ്റ്റി', st(56), st(57), st(58), RED)
add(El(cutout(icon_shield(300, TEAL, icon_heart(200, WHITE))), st(57) + 0.1, st(58), 1050, 560, 'pop', 'pop', z=6))
fx(st(57) + 0.2, 'boom', 0.5)
# internet tips crossed out
add(El(title('ഇന്റർനെറ്റ് ടിപ്സ്', 60, INK, YEL, rot=-2), st(58), st(62), 960, 150, 'stamp', 'pop', z=6))
for i, tip in enumerate(['അവഗണിക്കൂ', 'ജെലസി ഉണ്ടാക്കൂ', 'ഗെയിം കളിക്കൂ']):
    t0 = st(59) + i * 0.85
    add(El(label_card(tip, 58, INK, CREAM, rot=random.uniform(-3, 3)), t0, st(60) + 0.3, 960, 330 + i * 160, 'slide_l', 'slide_r', z=6))
    add(El(icon_x(120), t0 + 0.45, st(60) + 0.3, 1290, 330 + i * 160, 'stamp', 'pop', z=7))
def two_bar_fn(lt):
    w, h = 900, 420
    im, d = canvas(w, h)
    p = clamp(lt / 1.2)
    a = 0.82 * ease_out_cubic(p) * (1 - 0.6 * clamp((lt - 2.4) / 1.5))   # anxiety spikes then fades
    b = 0.22 * ease_out_cubic(p)
    d.rectangle(S([140, h - 40 - a * 330, 360, h - 40]), fill=ORANGE)
    d.rectangle(S([540, h - 40 - b * 330, 760, h - 40]), fill=PINK)
    d.line(S([(60, h - 40), (w - 60, h - 40)]), fill=WHITE, width=S(6))
    return finish(im)
add(El(None, st(60), st(62), 960, 420, 'fade', 'pop', z=6, fn=two_bar_fn, float_amp=0, rot_amp=0), sfx='whoosh')
add(El(word('ആകാംക്ഷ', 58), st(61), st(62), 710, 720, 'pop', 'pop', z=7))
add(El(word('സ്നേഹം', 58), st(61) + 1.0, st(62), 1210, 720, 'pop', 'pop', z=7))
add(El(icon_x(110), st(61) + 1.5, st(62), 1380, 640, 'stamp', 'pop', z=8))
# the right way
add(El(title('ശരിയായ വഴി', 84, INK, YEL, rot=-2), st(62) - 0.05, S1, 960, 150, 'slam', z=7))
add(El(label_card('വാക്ക്', 66, WHITE, BLUE, rot=-3), st(63), st(64) + 0.2, 620, 450, 'slide_l', 'pop', z=6))
add(El(text_sprite('=', 200, YEL), st(63) + 0.4, st(64) + 0.2, 960, 440, 'pop', 'pop', z=6))
add(El(label_card('പ്രവൃത്തി', 66, WHITE, TEAL, rot=3), st(63) + 0.2, st(64) + 0.2, 1320, 450, 'slide_r', 'pop', z=6))
add(El(None, st(64), st(65) + 0.2, 760, 470, 'pop', 'pop', z=6, fn=lambda lt: cutout(icon_clock(260, 7, 0))))
add(El(icon_check(160), st(64) + 0.5, st(65) + 0.2, 1100, 470, 'stamp', 'pop', z=7))
fx(st(64) + 0.1, 'clock', 0.6)
add(El(title('ദേഷ്യത്തിലും ബഹുമാനം', 66, WHITE, RED, rot=-2), st(65), st(66), 960, 520, 'stamp', 'pop', z=7))
add(El(cutout(icon_house(380, YEL)), st(66), S1, 960, 520, 'drop', z=6))
add(El(cutout(person('woman', s=230)), st(66) + 0.5, S1, 960, 600, 'pop', z=7))
def glow_fn(lt):
    s = 760; im, d = canvas(s, s)
    for i in range(10):
        r = s / 2 * (1 - i / 10)
        d.ellipse(S([s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r]), fill=(255, 210, 120, 14))
    return finish(im)
add(El(None, st(66) + 0.2, S1, 960, 520, 'fade', z=5, fn=glow_fn, pulse=0.04, float_amp=0, rot_amp=0), sfx='sparkle')
add(El(title('അവൾ അവളായിരിക്കാം', 66, INK, CREAM, rot=2), st(67), S1, 960, 860 - 40, 'stamp', z=8))

# =========================================================== 12 POINT 5: CALM CONFIDENCE
k = 11; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(5, 'ശാന്തമായ കോൺഫിഡൻസ്', st(68), st(69), st(70) + 0.1, PURPLE)
add(El(cutout(person('man', s=420)), st(69) + 0.1, S1, 960, 560, 'pop', z=5))
def vol_fn(lt):
    lvl = 0.25 + 0.75 * abs(math.sin(lt * 7)) if lt < 1.4 else 0.25
    return cutout(icon_volume(300, lvl, PURPLE), border=6)
add(El(None, st(70), st(71), 520, 460, 'pop', 'pop', z=6, fn=vol_fn))
add(El(cutout(icon_megaphone(220)), st(70) + 0.2, st(71), 1420, 430, 'pop', 'pop', z=6))
add(El(icon_x(180), st(70) + 0.9, st(71), 1420, 430, 'stamp', 'pop', z=7))
add(El(title('ഉറക്കെ സംസാരിക്കുന്നതല്ല', 56, WHITE, GREY, rot=-2), st(70) + 0.2, st(71), 960, 150, 'slide_d', 'pop', z=7))
for i, (txt, col, x, y, ti) in enumerate([('"അറിയില്ല"', TEAL, 480, 330, st(71)), ('"സോറി"', PINK, 1440, 330, st(72)), ('എന്റെ അഭിപ്രായം', ORANGE, 480, 700, st(73))]):
    add(El(bubble(txt, 52, col, WHITE, 'R' if x < 960 else 'L', 520), ti, S1, x, y, 'pop', z=7))
    add(El(icon_check(90), ti + 0.4, S1, x + 220, y - 60, 'stamp', z=8, sfx=False))
    fx(ti + 0.4, 'ding', 0.5)
add(El(title('ആഴത്തിലുള്ള ബഹുമാനം', 66, INK, YEL, rot=2), st(74) + 0.3, S1, 1360, 800, 'stamp', z=8))
for i in range(6):
    add(El(icon_star(60, YEL), st(74) + i * 0.08, S1, 960 + math.cos(i) * 260, 330 + math.sin(i) * 120, 'pop', z=6, spin=40, sfx=i == 0))

# =========================================================== 13 POINT 6: HER BIGGEST FAN
k = 12; S0, S1 = SCENES[k][1], scene_end(k)
point_intro(6, 'അവളുടെ സ്വപ്നങ്ങളുടെ ഫാൻ', st(75), st(76), st(77), ORANGE)
add(El(cutout(person('woman', s=380)), st(76) + 0.2, S1, 960, 560, 'pop', z=5))
add(El(cutout(icon_star(140, YEL, 5, 0.45)), st(76) + 0.6, st(77) + 0.3, 960, 300, 'pop', 'pop', z=6, spin=20))
for i, (x, y) in enumerate([(380, 360), (1540, 360), (420, 680), (1500, 700)]):
    add(El(bubble('നടക്കില്ല', 44, GREY, WHITE, 'R' if x < 960 else 'L', 400), st(78) + i * 0.22, st(79) + 0.2, x, y, 'pop', 'pop', z=6, sfx=True))
add(El(cutout(person('man', s=330)), st(79), S1, 1480, 600, 'slide_r', z=6))
add(El(bubble('നിനക്ക് പറ്റും. ഞാനുണ്ട് കൂടെ.', 54, YEL, INK, 'R', 760), st(80) - 0.05, S1, 980, 260, 'stamp', z=8))
fx(st(80), 'sparkle', 0.9)
add(El(cutout(icon_megaphone(160, YEL)), st(79) + 0.3, S1, 1650, 420, 'pop', z=7, rot=-20))

# =========================================================== 14 THE SECRET
k = 13; S0, S1 = SCENES[k][1], scene_end(k)
add(El(None, S0 + 0.2, st(82), 960, 450, 'pop', 'pop', z=5, fn=lambda lt: cutout(icon_lock(260, YEL, clamp((lt - 1.2) / 0.6)))))
fx(S0 + 1.4, 'unlock', 0.9); fx(S0 + 0.1, 'riser', 0.6)
add(El(title('രഹസ്യം', 100, CREAM, RED, rot=-2), S0 + 0.4, st(82), 960, 150, 'stamp', 'pop', z=6))
add(El(title('അവൻ എങ്ങനെയുള്ളവൻ', 60, INK, GREY, rot=-2), st(82) + 0.2, st(84), 560, 330, 'slide_l', 'pop', z=6))
add(El(text_sprite('<', 240, GREY), st(83) + 0.3, st(84), 960, 450, 'pop', 'pop', z=6))
add(El(title('അവൾ സ്വയം എങ്ങനെ കാണുന്നു', 60, INK, YEL, rot=2), st(83) + 0.6, st(84) + 0.2, 1340, 560, 'slide_r', 'pop', z=6))
add(El(cutout(icon_mirror(300)), st(84), S1, 620, 520, 'drop', z=5))
add(El(cutout(person('woman', s=330)), st(84) + 0.3, S1, 980, 560, 'pop', z=6))
add(El(None, st(84) + 0.4, S1, 620, 480, 'fade', z=4, fn=glow_fn, pulse=0.05, float_amp=0, rot_amp=0), sfx='sparkle')
for i, (txt, col, ti) in enumerate([('സുന്ദരി', PINK, st(85) + 1.0), ('ബുദ്ധിമതി', TEAL, st(86)), ('സുരക്ഷിത', BLUE, st(87))]):
    add(El(label_card(txt, 72, WHITE, col, rot=[-3, 2, -2][i]), ti, S1, 1460, 300 + i * 190, 'slide_r', z=7))
    for j in range(3):
        add(El(icon_star(50, YEL), ti + 0.2 + j * 0.06, S1, 1220 + j * 40, 240 + i * 190 + j * 20, 'pop', z=8, spin=60, sfx=False))
    fx(ti + 0.1, 'chime', 0.6)
add(El(title('മറ്റാരിൽ നിന്നും കിട്ടില്ല', 66, WHITE, RED, rot=-2), st(88) + 0.2, S1, 960, 860 - 30, 'stamp', z=9))

# =========================================================== 15 ARJUN AFTER
k = 14; S0, S1 = SCENES[k][1], scene_end(k)
add(El(id_card(), S0 + 0.2, st(90) + 0.1, 960, 450, 'drop', 'slide_l', z=5))
add(El(icon_check(160), S0 + 1.0, st(90) + 0.1, 1260, 330, 'stamp', 'pop', z=6))
steps = [('gym', 'ജിം', st(90)), ('business', 'ബിസിനസ്', st(91)), ('listen', 'കേൾക്കാൻ പഠിച്ചു', st(92))]
icmap = {'gym': icon_dumbbell(200), 'business': icon_briefcase(150), 'listen': icon_ear(130)}
for i, (key, lab, ti) in enumerate(steps):
    x = 400 + i * 560
    add(El(cutout(icon_circle_badge(250, icmap[key], CREAM)), ti, st(93), x, 440, 'drop', 'pop', z=5))
    add(El(word(lab, 50), ti + 0.15, st(93), x, 640, 'pop', 'pop', z=6, sfx=False))
    add(El(icon_check(110), ti + 0.5, st(93), x + 110, 340, 'stamp', 'pop', z=7))
add(El(cutout(icon_calendar(240, '365', GREEN)), st(93), st(94) + 0.1, 520, 470, 'drop', 'pop', z=6))
add(El(title('ഒരു വർഷം കഴിഞ്ഞ്', 66, WHITE, GREEN, rot=-2), st(93) + 0.3, st(94) + 0.1, 1200, 470, 'slide_r', 'pop', z=6))
add(El(photo_card('couple', 640, 420, rot=-3), st(94), S1, 760, 420, 'drop', z=6))
add(El(cutout(icon_heart(120)), st(94) + 0.5, S1, 1110, 200, 'pop', z=7, pulse=0.1))
fx(st(94) + 0.5, 'heartbeat', 0.6)
add(El(bubble('എനിക്ക് ഞാനായിരിക്കാം.', 58, PINK, WHITE, 'L', 640), st(95), S1, 1450, 640, 'stamp', z=8))

# =========================================================== 16 OUTRO
k = 15; S0, S1 = SCENES[k][1], scene_end(k)
add(El(cutout(icon_share(200)), S0 + 0.2, st(97), 760, 430, 'pop', 'pop', z=5))
add(El(cutout(person('man', s=300)), S0 + 0.6, st(97), 1220, 470, 'slide_r', 'pop', z=5))
add(El(title('ഒരു സുഹൃത്തിന് അയക്കൂ', 66, WHITE, TEAL, rot=-2), S0 + 0.4, st(97), 960, 160, 'stamp', 'pop', z=6))
fx(S0 + 1.6, 'swish', 0.6)
add(El(label_card('അടുത്ത വീഡിയോ', 50, WHITE, INK, rot=-3), st(97), S1, 520, 150, 'slide_l', z=6))
def next_card():
    t = text_sprite('7', 280, YEL, stroke=8, stroke_col=INK)
    t2 = text_sprite('സൂചനകൾ', 96, WHITE)
    t3 = text_sprite('അവൾക്ക് താൽപ്പര്യമുണ്ടോ?', 50, WHITE, w=600)
    w, h = 110 + t.width + max(t2.width, t3.width) + 60, 400
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(22), fill=RED)
    im = finish(im)
    im.alpha_composite(t, (50, (h - t.height) // 2))
    im.alpha_composite(t2, (110 + t.width, 90)); im.alpha_composite(t3, (110 + t.width, 240))
    return cutout(im, border=10)
add(El(next_card(), st(97) + 0.2, S1, 960, 400, 'drop', z=6))
def sub_fn(lt):
    pressed = lt > 1.1
    w, h = 560, 140
    im, d = canvas(w, h)
    d.rounded_rectangle(S([0, 0, w, h]), radius=S(70), fill=(140, 140, 140) if pressed else RED)
    im = finish(im)
    t = text_sprite('SUBSCRIBED' if pressed else 'SUBSCRIBE', 60, WHITE); im.alpha_composite(t, ((w - t.width) // 2, (h - t.height) // 2))
    return cutout(im, border=8)
add(El(None, st(98), S1, 860, 740, 'slide_u', z=8, fn=sub_fn, rot_amp=0))
add(El(cutout(icon_bell(130)), st(98) + 0.6, S1, 1230, 740, 'pop', z=8, rot_amp=12))
fx(st(98) + 1.1, 'click', 1.0); fx(st(98) + 1.25, 'ding', 0.8)
add(El(title('കാണാം!', 110, INK, YEL, rot=-4), st(99) - 0.1, DUR, 960, 500, 'slam', z=10))

# =========================================================== progress tracker for points 1..6
POINT_STARTS = [st(26), st(34), st(43), st(56), st(68), st(75)]
POINTS_RANGE = (st(26) - 0.3, SCENES[13][1])
def tracker_sprite(cur):
    w, h = 420, 90
    im, d = canvas(w, h)
    for i in range(6):
        x = 35 + i * 70
        on = i < cur
        c = [RED, TEAL, PINK, RED, PURPLE, ORANGE][i]
        d.ellipse(S([x - 28, 17, x + 28, 73]), fill=c if on else (255, 255, 255, 200), outline=INK, width=S(4))
    im = finish(im)
    for i in range(6):
        t = text_sprite(str(i + 1), 36, WHITE if i < cur else INK)
        im.alpha_composite(t, (35 + i * 70 - t.width // 2, 45 - t.height // 2))
    return im
TRACKERS = [tracker_sprite(i) for i in range(7)]

# =========================================================== captions
CAPS = []
for i, c in enumerate(C):
    t1 = min(c['end'] + 0.35, C[i + 1]['start'] - 0.02) if i + 1 < len(C) else c['end'] + 1.0
    CAPS.append((c['start'] - 0.06, t1, c['text']))

# transitions at scene starts
TRANS = [s[1] for s in SCENES[1:]]
for t in TRANS: fx(t - 0.2, 'transition', 0.8)

ELS.sort(key=lambda e: e.z)
