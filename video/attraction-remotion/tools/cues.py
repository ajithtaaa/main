"""Derive SFX cues (seconds) from shots.json, mirroring the animation timings in templates.tsx."""
import json
FPS = 30
shots = json.load(open('src/data/shots.json'))
cues = []
def c(fr, kind, g=1.0): cues.append((round(fr / FPS, 3), kind, g))
scene_prev = None
for s in shots:
    a, dur, t, p = s['from'], s['to'] - s['from'], s['tpl'], s['props']
    if s['scene'] != scene_prev and s['id']:
        c(a - 8, 'transition', 0.9)
    scene_prev = s['scene']
    if t == 'slam':
        c(a + 1, 'stamp', 1.0); c(a + 2, 'boom', 0.45)
        if len(p['lines']) > 1: c(a + 8, 'pop', 0.8)
        if p.get('end'): c(a + 4, 'sparkle', 0.8)
    elif t == 'number':
        c(a - 20, 'riser', 0.5); c(a + 3, 'boom', 1.0)
    elif t == 'cross':
        n = len(p['items']); st = min(14, (dur - 20) // max(1, n))
        for i in range(n):
            c(a + i * st, 'thud', 0.8)
            if p.get('mark') == 'x': c(a + i * st + 12, 'stamp', 0.9)
    elif t == 'icons4':
        items = p['items']
        if p.get('check'):
            c(a, 'thud', 0.8); c(a + 8, 'ding', 0.6)
        else:
            st = max(5, (dur - 12) // len(items))
            for i in range(len(items)): c(a + i * st, 'thud', 0.8)
    elif t == 'chat':
        step = 5 if p.get('fast') else max(6, (dur - 12) // len(p['msgs']))
        c(a, 'whoosh', 0.8)
        for i in range(len(p['msgs'])): c(a + 6 + i * step, 'ping', 0.55)
        if p.get('clock'): c(a + 4, 'clock', 0.6)
    elif t == 'versus':
        if not p.get('step'): c(a, 'whoosh', 1.0); c(a + 6, 'pop', 0.8)
        else: c(a + 4, 'stamp', 0.9); c(a + 6, 'ding' if not p.get('flip') else 'sad', 0.5)
    elif t == 'lock':
        c(a, 'thud', 0.9)
        if p.get('open'): c(a + 22, 'unlock', 1.0); c(a + 22, 'sparkle', 0.8)
        else: c(a + 6, 'click', 0.6); c(a + 12, 'click', 0.6)
    elif t == 'quote':
        c(a, 'swish', 0.8)
        if p.get('break'): c(a + dur - 26, 'crack', 1.0); c(a + dur - 14, 'sad', 0.7)
        if p.get('gold') or p.get('love'): c(a + 10, 'sparkle', 0.8)
        if p.get('chat'): c(a + 2, 'ping', 0.6)
    elif t == 'people':
        c(a, 'whoosh', 0.8)
        if p['mode'] in ('love', 'crush'): c(a + 12, 'heartbeat', 0.8)
        if p['mode'] == 'notice': c(a + 12, 'ding', 0.5)
    elif t == 'comment':
        c(a, 'whoosh', 0.7)
        for i in range(10): c(a + 14 + i * 3, 'tick', 0.6)
    elif t == 'subscribe':
        c(a, 'whoosh', 0.7); c(a + 26, 'click', 1.0); c(a + 30, 'ding', 0.8); c(a + 30, 'sparkle', 0.7)
    elif t == 'grid6':
        for i in range(6): c(a + 4 + i * 3, 'pop', 0.6)
        if p.get('highlight'): c(a + 6, 'stamp', 0.7)
    elif t == 'orbit':
        c(a, 'swish', 0.8)
        if p.get('fall'): c(a + 6, 'fall', 0.9)
    elif t in ('smile', 'words3', 'respect', 'fan', 'memories', 'mirror', 'home'):
        c(a, 'swish' if t != 'words3' else 'stamp', 0.8); c(a + 8, 'sparkle', 0.7)
        if t == 'memories': c(a + 28, 'heartbeat', 0.7)
    elif t == 'media':
        c(a, 'whoosh', 0.9)
        if p['key'] == 'rain': c(a + 2, 'rain', 0.8)
    elif t == 'fireeye':
        c(a, 'pop', 0.7); c(a + 10, 'fire', 0.9)
    elif t == 'run':
        c(a, 'whoosh', 0.9)
        if p['mode'] == 'chase': c(a + 10, 'stamp', 0.8)
    elif t == 'clock':
        c(a, 'clock', 0.7); c(a + 30, 'ding', 0.6)
    elif t == 'equals':
        c(a, 'whoosh', 0.8); c(a + 10, 'stamp', 0.8); c(a + 20, 'ding', 0.5)
    elif t == 'volume':
        c(a, 'pop', 0.7); c(a + 12, 'stamp', 0.8)
    elif t == 'bubble':
        c(a + 4, 'pop', 0.9); c(a + 14, 'ding', 0.6)
    elif t == 'chart':
        c(a, 'riser', 0.35); c(a + 10, 'pop', 0.7)
    elif t == 'naysay':
        for i in range(5): c(a + i * 4, 'pop', 0.6)
    elif t in ('calendar', 'idcard', 'next', 'share', 'shield', 'listen', 'checks', 'study', 'dream', 'portal', 'depth', 'mystery', 'empty', 'calm', 'crowd'):
        c(a, 'whoosh', 0.8); c(a + 8, 'pop', 0.6)
        if t == 'shield': c(a + 6, 'boom', 0.5)
        if t == 'crowd' and p.get('spot'): c(a + 2, 'sparkle', 0.8)
        if t == 'idcard' and p.get('upgrade'): c(a + 10, 'sparkle', 0.8)
    else:
        c(a, 'whoosh', 0.7)
json.dump({'dur': shots[-1]['to'] / FPS, 'cues': cues}, open('out/cues.json', 'w'))
print(len(cues), 'cues')
