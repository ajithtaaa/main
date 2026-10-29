"""Stickman storyboard: one scene spec per voiceover line -> src/data/stick_shots.json (timing from shots.json)."""
import json

shots = json.load(open('src/data/shots.json'))

def A(who, x, poses, face='neutral', flip=False, **kw):
    if isinstance(poses, str): poses = [[0, poses]]
    d = {'who': who, 'x': x, 'poses': poses, 'face': face, 'flip': flip}
    d.update(kw); return d
def P(t, x, y, at=0, **kw):
    d = {'t': t, 'x': x, 'y': y, 'at': at}; d.update(kw); return d
def T(text, at=4, color='#ffd166', y=60): return {'text': text, 'at': at, 'color': color, 'y': y}
ARJ, GIRL = 'arjun', 'girl'

def spec(i, d):
    """Return the scene spec for line i (d = shot length in frames)."""
    h = d // 2
    S = [
    # ---- hook
    dict(bg='park', actors=[A(ARJ, 1150, 'idle', 'happy', enter='right'), A(GIRL, 760, [[0, 'idle'], [h, 'heart']], 'love', faces=[[0, 'happy'], [h, 'love']], enter='left')],
         props=[P('hearts', 960, 420, 10, n=8), P('question', 960, 220, h, s=0.9, anim='spin')], title=T('ഭ്രാന്തമായി ആഗ്രഹിക്കാൻ?', 6)),
    dict(bg='street', actors=[A('guy', 760, 'flex', 'smirk', hold='glasses'), A(GIRL, 1250, 'cross_arms', 'neutral', flip=True)],
         props=[P('glasses', 760, 470, 4, s=0.7), P('x', 1000, 420, 14, s=1.3, anim='stamp'), P('label', 760, 150, 6, text='സൗന്ദര്യം')], shake=14),
    dict(bg='street', actors=[A('guy', 760, 'arms_open', 'smirk'), A(GIRL, 1250, 'cross_arms', 'neutral', flip=True)],
         props=[P('money', 620, 400, 2, anim='float'), P('money', 900, 330, 5, anim='float'), P('x', 1000, 420, 12, s=1.3, anim='stamp'), P('label', 760, 150, 4, text='പണം')], shake=12),
    # ---- tease
    dict(bg='night', actors=[A(ARJ, 620, 'point', 'surprised')], props=[P('lock', 1180, 430, 4, s=1.4, anim='beat'), P('label', 1180, 160, 8, text='രഹസ്യം', color='#ff4d5e')]),
    dict(bg='night', actors=[A(ARJ, 760, [[0, 'think'], [h, 'surprised' if False else 'arms_open']], 'surprised', faces=[[0, 'neutral'], [h, 'surprised']]), A(GIRL, 1260, 'idle', 'happy', flip=True)],
         props=[P('eye', 960, 300, h - 4, s=1.0, anim='beat'), P('spark', 760, 330, h, s=0.6)]),
    dict(bg='dark', actors=[A(ARJ, 960, 'stop', 'determined')], props=[P('big', 960, 300, 2, text='SKIP ✕'.replace(' ✕', ''), color='#ff4d5e'), P('x', 960, 300, 8, s=2.2, anim='stamp'), P('label', 960, 120, 6, text='ചെയ്യരുത്!', color='#ffd166')], shake=8),
    # ---- arjun story
    dict(bg='yellow', props=[P('book', 960, 420, 2, s=2.0, anim='beat'), P('label', 960, 160, 6, text='ആദ്യം ഒരു കഥ')]),
    dict(bg='room', actors=[A(ARJ, 960, [[0, 'wave']], 'happy', enter='pop')], props=[P('sign', 960, 210, 4, text='അർജുൻ', color='#3a86ff')]),
    dict(bg='room', actors=[A(ARJ, 760, 'idle', 'happy')], props=[P('big', 1260, 420, 2, text='26', color='#3a86ff'), P('label', 1260, 640, 8, text='വയസ്സ്')]),
    dict(bg='park', actors=[A(ARJ, 640, [[0, 'idle'], [10, 'heart']], 'love'), A(GIRL, 1320, 'idle', 'neutral', flip=True)], props=[P('hearts', 760, 520, 6, n=10), P('heart', 640, 260, 12, s=0.9, anim='beat')]),
    dict(bg='street', actors=[A(GIRL, 700, 'point', 'happy', flip=False), A(ARJ, 1200, [[0, 'run']], 'happy', move=[[0, 1700], [d, 1150]], hold='gift')],
         props=[P('sweat', 1250, 500, 4), P('check', 1450, 300, h, s=0.8, anim='stamp'), P('motion', 1300, 600, 0)]),
    dict(bg='night_room', actors=[A(ARJ, 620, [[0, 'type']], 'happy', hold='phone')], props=[P('clock', 1450, 300, 2, text='2:00 AM', color='#ff4d5e'), P('phone_chat', 1000, 430, 4, text='ഹായ്|ഉറങ്ങിയില്ലേ?|ഇല്ല!|ഓക്കെ|ശരി', n=9), P('zzz', 1500, 520, 10)]),
    dict(bg='night_room', actors=[A(ARJ, 620, [[0, 'type']], 'surprised', hold='phone')], props=[P('phone_chat', 1000, 430, 0, text='ഓക്കെ!|ശരി!|ഉടൻ!|ഓക്കെ!|ശരി!|ഉടൻ!', n=4), P('label', 1460, 260, 10, text='ഉടൻ മറുപടി', color='#ff4d5e'), P('sweat', 680, 470, 6)]),
    # ---- rejection
    dict(bg='park', actors=[A(ARJ, 700, 'idle', 'happy'), A(GIRL, 1220, 'talk', 'neutral', flip=True)], props=[P('label', 960, 150, 4, text='ഒരു ദിവസം...', color='#ffffff')]),
    dict(bg='park', actors=[A(ARJ, 700, [[0, 'idle'], [d - 30, 'sad']], 'happy', faces=[[0, 'happy'], [d - 30, 'sad']]), A(GIRL, 1220, 'talk', 'shy', flip=True)],
         props=[P('bubble', 1150, 300, 2, text='നീ നല്ലവനാണ്... പക്ഷേ ഫീലിംഗ് ഇല്ല', color='#ffffff'), P('heartbreak', 700, 330, d - 26, s=0.8)], shake=d - 26),
    dict(bg='rain', actors=[A(ARJ, 960, 'breathe_sad', 'cry')], props=[P('qrain', 0, 0, 4, n=8), P('label', 960, 140, 6, text='എന്താണ് തെറ്റിയത്?', color='#ff4d5e')]),
    dict(bg='rain', actors=[A(ARJ, 960, [[0, 'sad'], [h, 'think']], 'sad', faces=[[h, 'neutral']])], props=[P('thought', 1350, 300, 6, text='എന്ത് മാറ്റണം?')]),
    dict(bg='yellow', actors=[A(ARJ, 760, 'point', 'happy')], props=[P('play', 1250, 420, 4, s=1.6, anim='beat'), P('label', 1250, 180, 8, text='ഈ വീഡിയോയിൽ')]),
    # ---- the mistake
    dict(bg='blue', actors=[A('grey', 420, 'facepalm', 'sad'), A(ARJ, 960, 'facepalm', 'sad'), A('grey', 1500, 'facepalm', 'sad', flip=True)], props=[P('warn', 960, 230, 6, s=1.1, anim='beat'), P('label', 960, 100, 10, text='മിക്കവരുടെയും തെറ്റ്', color='#ff4d5e')]),
    dict(bg='plain', actors=[A(GIRL, 960, 'idle', 'happy', flip=True), A(ARJ, 960, 'run', 'love', move=[[0, 500], [d, 1400]], y=840)], props=[P('orbit', 960, 600, 0), P('label', 960, 120, 6, text='അവൾ = കേന്ദ്രം')]),
    dict(bg='plain', actors=[A(GIRL, 960, 'idle', 'neutral', flip=True), A(ARJ, 600, [[0, 'arms_open'], [h, 'sad']], 'surprised', faces=[[h, 'sad']])], props=[P('orbit', 960, 600, 0, anim='fall'), P('label', 960, 120, 4, text='അവന്റെ ലോകം', color='#3a86ff')]),
    dict(bg='plain', actors=[A(GIRL, 1000, 'shrug', 'neutral', flip=True)], props=[P('thought', 1350, 300, 6, text='...?', color='#ffffff'), P('label', 960, 120, 10, text='ബാക്കി ഒന്നുമില്ല', color=INK)]),
    dict(bg='night', actors=[A(ARJ, 960, 'cross_arms', 'smirk')], props=[P('qrain', 0, 0, 0, n=12), P('label', 960, 120, 6, text='മിസ്റ്ററി', color='#9b5de5')]),
    dict(bg='beach', actors=[A(ARJ, 960, 'calm_breath', 'smirk')], props=[P('label', 960, 120, 4, text='ആഴം', color='#2ec4b6')]),
    # ---- six things
    dict(bg='yellow', actors=[A(ARJ, 260, 'point', 'happy')], props=[P('grid6', 1060, 380, 2), P('label', 1060, 110, 6, text='വർക്ക് ചെയ്യുന്ന 6 കാര്യങ്ങൾ', color='#ffffff', n=60)]),
    dict(bg='yellow', actors=[A(ARJ, 260, 'surprised' if False else 'shrug', 'surprised')], props=[P('grid6', 1060, 380, 0, n=4), P('label', 1060, 110, 6, text='മിക്കവർക്കും അറിയില്ല!', color='#ff4d5e')]),
    # ---- point 1 mission
    dict(bg='yellow', props=[P('big', 960, 380, 0, text='1', color='#ff9f1c', n=420)], flash=2, shake=2),
    dict(bg='office', actors=[A(ARJ, 960, 'flex', 'determined')], props=[P('target', 1450, 330, 6, s=1.0, anim='beat'), P('label', 960, 120, 4, text='സ്വന്തം മിഷൻ', color='#ff9f1c')]),
    dict(bg='gym', actors=[A(ARJ, 960, 'lift', 'determined', hold='dumbbell')], props=[P('briefcase', 1250, 300, int(d * .25), s=0.7, anim='drop'), P('chart', 1500, 300, int(d * .5), s=0.7, anim='drop'), P('music', 1720, 300, int(d * .75), s=0.7, anim='drop'), P('label', 520, 200, 2, text='ജിം', color='#ff9f1c')]),
    dict(bg='dark', actors=[A(ARJ, 960, 'flex', 'determined')], props=[P('flame', 920, 520, 6, s=0.5, anim='beat'), P('flame', 1000, 520, 8, s=0.5, anim='beat'), P('label', 960, 120, 10, text='കണ്ണുകളിൽ തീ', color='#ff4d5e')]),
    dict(bg='office', actors=[A(ARJ, 760, 'type', 'determined', hold='briefcase'), A(GIRL, 1350, [[0, 'idle'], [8, 'heart']], 'love', flip=True)], props=[P('eye', 1350, 280, 6, s=0.7, anim='beat'), P('hearts', 1330, 520, 10, n=5)]),
    dict(bg='park', actors=[A(ARJ, 700, 'arms_open', 'happy'), A(GIRL, 1300, 'walk', 'happy', flip=True, move=[[0, 1500], [d, 1050]])], props=[P('label', 960, 120, 6, text='നിന്റെ ലോകത്തിലേക്ക്')]),
    dict(bg='street', actors=[A(GIRL, 1300, 'walk', 'neutral', move=[[0, 1200], [d, 1500]]), A('grey', 700, 'run', 'cry', move=[[0, 500], [d, 900]])], props=[P('x', 700, 330, 10, s=1.2, anim='stamp'), P('label', 960, 120, 4, text='പിന്നാലെ ഓടരുത്', color='#ffffff')]),
    dict(bg='mountain', actors=[A(ARJ, 900, 'run', 'determined', move=[[0, 300], [d, 1300]]), A(GIRL, 1500, 'cheer_jump', 'love', flip=True)], props=[P('motion', 900, 560, 0), P('label', 960, 120, 4, text='മുന്നോട്ട്!', color='#ff9f1c')]),
    # ---- point 2 listen
    dict(bg='blue', props=[P('big', 960, 380, 0, text='2', color='#2ec4b6', n=420)], flash=2, shake=2),
    dict(bg='cafe', actors=[A(ARJ, 700, 'listen', 'happy'), A(GIRL, 1220, 'talk', 'happy', flip=True)], props=[P('ear', 760, 260, 6, s=0.8, anim='beat'), P('label', 960, 120, 4, text='ശരിക്കും കേൾക്കുക', color='#2ec4b6')]),
    dict(bg='cafe', actors=[A('grey', 700, 'talk', 'smirk', hold='phone'), A(GIRL, 1220, 'talk', 'neutral', flip=True)], props=[P('bubble', 700, 340, 4, text='ഞാൻ... ഞാൻ... ഞാൻ...', color='#ffffff'), P('label', 960, 120, 2, text='മറുപടി പറയാൻ', color='#cccccc')]),
    dict(bg='cafe', actors=[A('grey', 700, 'talk', 'smirk'), A(GIRL, 1220, 'facepalm', 'sad', flip=True)], props=[P('x', 700, 300, 4, s=1.2, anim='stamp'), P('label', 960, 120, 2, text='മനസ്സിലാക്കാനല്ല', color='#ff4d5e')], shake=4),
    dict(bg='room', actors=[A(ARJ, 700, 'think', 'neutral')], props=[P('calendar', 1250, 380, 2, s=1.2, text='3'), P('thought', 1000, 230, 10, text='അമ്മയുടെ ഡോക്ടർ...', color='#ffffff'), P('label', 1250, 640, 8, text='ദിവസം മുൻപ്')]),
    dict(bg='cafe', actors=[A(ARJ, 700, 'talk', 'happy'), A(GIRL, 1220, 'idle', 'surprised', flip=True)], props=[P('bubble', 760, 280, 0, text='അമ്മയുടെ ഡോക്ടർ അപ്പോയിന്റ്മെന്റ് എന്തായി?', color='#3a86ff')]),
    dict(bg='cafe', actors=[A(ARJ, 700, 'idle', 'happy'), A(GIRL, 1220, [[0, 'idle'], [6, 'heart']], 'love', flip=True)], props=[P('hearts', 1220, 520, 6, n=8), P('spark', 1220, 300, 4)]),
    dict(bg='street', actors=[A('grey', 300, 'type', 'neutral', hold='phone'), A('grey', 620, 'type', 'neutral', hold='phone'), A(GIRL, 960, 'sad', 'sad'), A('grey', 1300, 'type', 'neutral', hold='phone', flip=True), A('grey', 1620, 'type', 'neutral', hold='phone', flip=True)],
         props=[P('label', 960, 120, 4, text='ആരും ശ്രദ്ധിക്കുന്നില്ല', color='#cccccc')]),
    dict(bg='street', actors=[A('grey', 300, 'type', 'neutral', hold='phone'), A(ARJ, 760, 'listen', 'happy'), A(GIRL, 1100, 'talk', 'happy', flip=True), A('grey', 1620, 'type', 'neutral', hold='phone', flip=True)],
         props=[P('spot', 930, 0, 0, s=1.3), P('label', 960, 120, 4, text='നീ വ്യത്യസ്തൻ')]),
    # ---- point 3 new experiences
    dict(bg='pink', props=[P('big', 960, 380, 0, text='3', color='#ff5d8f', n=420)], flash=2, shake=2),
    dict(bg='mountain', actors=[A(ARJ, 760, 'cheer_jump', 'happy'), A(GIRL, 1160, 'cheer_jump', 'happy', flip=True)], props=[P('label', 960, 120, 4, text='പുതിയ അനുഭവങ്ങൾ', color='#ff5d8f')]),
    dict(bg='office', actors=[A('guy', 700, 'point', 'neutral')], props=[P('brain', 1200, 350, 4, s=1.2, anim='beat'), P('label', 960, 120, 6, text='സൈക്കോളജി പഠനം', color='#ffffff')]),
    dict(bg='plain', actors=[A(ARJ, 500, 'cheer', 'happy'), A(GIRL, 760, 'cheer', 'happy', flip=True)], props=[P('chart', 1350, 400, 4, s=1.5), P('hearts', 630, 450, 6, n=8), P('label', 1350, 140, 10, text='അടുപ്പം കൂടും', color='#2ec4b6')]),
    dict(bg='cafe', actors=[A(ARJ, 700, 'sit', 'sleep'), A(GIRL, 1220, 'sit', 'sleep', flip=True)], props=[P('coffee', 960, 520, 2, s=0.6), P('film', 400, 250, int(d * .3), s=0.6, anim='drop'), P('chat', 1500, 250, int(d * .6), s=0.6, anim='drop'), P('zzz', 760, 560, 4), P('zzz', 1260, 560, 8)]),
    dict(bg='plain', actors=[A(ARJ, 760, 'breathe_sad', 'sleep'), A(GIRL, 1160, 'breathe_sad', 'sleep', flip=True)], props=[P('big', 960, 260, 0, text='ബോർ!', color='#9a9aa2', n=220)], shake=2),
    dict(bg='mountain', actors=[A(ARJ, 700, 'walk', 'happy', move=[[0, 500], [d, 900]], hold='flag' if False else None), A(GIRL, 960, 'walk', 'happy', move=[[0, 760], [d, 1160]])], props=[P('label', 960, 120, 2, text='സൺറൈസ് ട്രെക്ക്', color='#ff9f1c')]),
    dict(bg='street', actors=[A(ARJ, 760, 'talk', 'happy', hold='bowl'), A(GIRL, 1160, 'clap', 'happy', flip=True)], props=[P('bowl', 960, 560, 2, s=0.7), P('label', 960, 120, 2, text='ഫുഡ് സ്ട്രീറ്റ്', color='#ff4d5e')]),
    dict(bg='rain', actors=[A(ARJ, 900, 'sit', 'happy', move=[[0, 600], [d, 1000]], y=740), A(GIRL, 800, 'cheer', 'happy', move=[[0, 500], [d, 900]], y=740)], props=[P('bike', 960, 760, 0, s=1.6), P('label', 960, 120, 2, text='മഴയത്ത് ബൈക്ക്', color='#3a86ff')]),
    dict(bg='sunset', actors=[A(GIRL, 960, 'heart', 'love', flip=True)], props=[P('thought', 1300, 280, 4, text='ട്രെക്ക് + മഴ + ഫുഡ്', color='#ffffff'), P('hearts', 960, 520, 8, n=10), P('label', 960, 120, 12, text='ഓർമ്മകൾ = നിന്റെ മുഖം')]),
    # ---- comment
    dict(bg='blue', actors=[A(ARJ, 760, 'think', 'neutral')], props=[P('question', 1250, 360, 4, s=1.4, anim='beat'), P('label', 960, 120, 4, text='ഏതാണ് ചെയ്യാത്തത്?')]),
    dict(bg='blue', actors=[A(ARJ, 300, 'point', 'happy')], props=[P('comment', 1080, 420, 0, text='1, 2, 3...'), P('label', 1080, 640, 10, text='COMMENT', color='#ff4d5e')]),
    dict(bg='dark', actors=[A(ARJ, 600, 'shrug', 'smirk')], props=[P('big', 1200, 380, 4, text='4 ?', color='#ffd166', n=360)]),
    # ---- point 4 emotional safety
    dict(bg='dark', props=[P('big', 960, 380, 0, text='4', color='#ff4d5e', n=420)], flash=2, shake=2),
    dict(bg='room', actors=[A(GIRL, 960, 'calm_breath', 'happy', flip=True)], props=[P('shield', 960, 320, 4, s=1.6, anim='beat'), P('label', 960, 110, 8, text='ഇമോഷണൽ സേഫ്റ്റി', color='#2ec4b6')]),
    dict(bg='office', actors=[A('guy', 700, 'talk', 'smirk')], props=[P('globe', 1250, 380, 2, s=1.2, anim='spin'), P('label', 960, 120, 6, text='ഇന്റർനെറ്റ് ടിപ്സ്', color='#ffffff')]),
    dict(bg='plain', actors=[A('guy', 300, 'cross_arms', 'smirk')], props=[P('label', 800, 280, 2, text='അവഗണിക്കൂ'), P('x', 1080, 280, 10, s=0.7, anim='stamp'), P('label', 900, 480, int(d * .33), text='ജെലസി'), P('x', 1100, 480, int(d * .33) + 8, s=0.7, anim='stamp'),
                                                                     P('label', 1000, 680, int(d * .66), text='ഗെയിം'), P('x', 1200, 680, int(d * .66) + 8, s=0.7, anim='stamp')]),
    dict(bg='park', actors=[A('guy', 700, 'cross_arms', 'smirk'), A(GIRL, 1220, 'idle', 'surprised', flip=True)], props=[P('hearts', 1220, 520, 2, n=4), P('label', 960, 120, 6, text='കുറച്ചുകാലം മാത്രം', color='#ff9f1c')]),
    dict(bg='rain', actors=[A('guy', 700, 'cross_arms', 'smirk'), A(GIRL, 1220, 'shiver', 'cry', flip=True)], props=[P('sweat', 1250, 500, 4), P('label', 960, 120, 4, text='ആകാംക്ഷ, സ്നേഹമല്ല', color='#ff4d5e')]),
    dict(bg='yellow', actors=[A(ARJ, 960, 'point', 'determined')], props=[P('check', 1400, 380, 6, s=1.4, anim='stamp'), P('label', 960, 120, 2, text='ശരിയായ വഴി', color='#2ec4b6')], shake=6),
    dict(bg='park', actors=[A(ARJ, 760, 'talk', 'happy'), A(GIRL, 1160, 'idle', 'happy', flip=True)], props=[P('bubble', 760, 300, 2, text='ഞാൻ വരും', color='#ffffff'), P('check', 1160, 300, int(d * .6), s=0.9, anim='stamp'), P('label', 960, 110, 4, text='വാക്ക് = പ്രവൃത്തി')]),
    dict(bg='street', actors=[A(ARJ, 700, 'wave', 'happy', move=[[0, 300], [12, 700]]), A(GIRL, 1220, 'clap', 'happy', flip=True)], props=[P('clock', 960, 300, 2, s=1.1, text='7:00'), P('check', 1220, 300, 14, s=0.8, anim='stamp')]),
    dict(bg='room', actors=[A(ARJ, 760, 'calm_breath', 'determined'), A(GIRL, 1160, 'idle', 'surprised', flip=True)], props=[P('label', 960, 120, 4, text='ദേഷ്യത്തിലും ബഹുമാനം')]),
    dict(bg='room', actors=[A(GIRL, 960, 'dance', 'happy', flip=True)], props=[P('house', 960, 300, 0, s=1.3), P('label', 960, 110, 8, text='അവൾ അവളായിരിക്കാം', color='#ff5d8f')]),
    dict(bg='room', actors=[A(ARJ, 760, 'hug', 'happy'), A(GIRL, 960, 'hug', 'love', flip=True)], props=[P('hearts', 860, 500, 4, n=10), P('label', 960, 110, 10, text='വിട്ടുപോകില്ല')]),
    # ---- point 5 calm confidence
    dict(bg='pink', props=[P('big', 960, 380, 0, text='5', color='#9b5de5', n=420)], flash=2, shake=2),
    dict(bg='office', actors=[A(ARJ, 960, 'calm_breath', 'smirk')], props=[P('label', 960, 120, 4, text='ശാന്തമായ കോൺഫിഡൻസ്', color='#9b5de5')]),
    dict(bg='office', actors=[A('guy', 700, 'angry', 'angry', hold='megaphone'), A(ARJ, 1250, 'calm_breath', 'smirk', flip=True)], props=[P('x', 700, 300, 10, s=1.0, anim='stamp'), P('label', 960, 120, 4, text='ഉറക്കെ അല്ല', color='#cccccc')]),
    dict(bg='office', actors=[A(ARJ, 760, 'shrug', 'happy')], props=[P('bubble', 1150, 330, 2, text='അറിയില്ല', color='#2ec4b6'), P('check', 1450, 230, 12, s=0.7, anim='stamp')]),
    dict(bg='park', actors=[A(ARJ, 760, 'facepalm', 'shy'), A(GIRL, 1250, 'idle', 'happy', flip=True)], props=[P('bubble', 800, 320, 2, text='സോറി', color='#ff5d8f'), P('hearts', 1250, 520, 12, n=4)]),
    dict(bg='office', actors=[A(ARJ, 700, 'point', 'determined'), A(GIRL, 1220, 'cross_arms', 'neutral', flip=True)], props=[P('bubble', 760, 300, 2, text='എന്റെ അഭിപ്രായം', color='#ff9f1c'), P('check', 1000, 200, 14, s=0.7, anim='stamp')]),
    dict(bg='stage', actors=[A(ARJ, 960, 'calm_breath', 'smirk'), A(GIRL, 600, 'clap', 'love'), A('grey', 1320, 'clap', 'happy', flip=True)], props=[P('star', 960, 250, 4, s=0.8, anim='spin'), P('label', 960, 110, 8, text='ആഴത്തിലുള്ള ബഹുമാനം')]),
    # ---- point 6 biggest fan
    dict(bg='yellow', props=[P('big', 960, 380, 0, text='6', color='#ff9f1c', n=420)], flash=2, shake=2),
    dict(bg='stage', actors=[A(GIRL, 960, 'cheer', 'happy', flip=True), A(ARJ, 1450, 'cheer_jump', 'happy', flip=True, hold='sign:#1 FAN')], props=[P('spot', 960, 0, 0), P('star', 960, 250, 4, s=0.7, anim='spin'), P('label', 960, 100, 6, text='അവളുടെ സ്വപ്നങ്ങളുടെ ഫാൻ', n=60)]),
    dict(bg='room', actors=[A(GIRL, 760, 'think', 'happy')], props=[P('thought', 1250, 320, 4, text='എന്റെ സ്വന്തം ബിസിനസ്!', color='#ffffff'), P('spark', 1250, 320, 10)]),
    dict(bg='street', actors=[A(GIRL, 960, 'breathe_sad', 'sad'), A('grey', 400, 'talk', 'smirk'), A('grey', 1520, 'talk', 'smirk', flip=True)], props=[P('bubble', 400, 330, 2, text='നടക്കില്ല', color='#bdbdbd'), P('bubble', 1520, 330, 8, text='നടക്കില്ല', color='#bdbdbd'), P('bubble', 960, 250, 14, text='നടക്കില്ല', color='#bdbdbd')]),
    dict(bg='street', actors=[A(GIRL, 1100, 'sad', 'sad', flip=True), A(ARJ, 760, 'arms_open', 'happy', enter='left')], props=[P('label', 960, 120, 6, text='നീ മാത്രം')]),
    dict(bg='sunset', actors=[A(ARJ, 760, 'point', 'happy'), A(GIRL, 1160, [[0, 'sad'], [h, 'cheer_jump']], 'sad', faces=[[h, 'happy']], flip=True)], props=[P('bubble', 760, 280, 0, text='നിനക്ക് പറ്റും. ഞാനുണ്ട് കൂടെ.', color='#ffd166'), P('hearts', 1160, 520, h, n=8)]),
    # ---- the secret
    dict(bg='night', actors=[A(ARJ, 600, 'point', 'surprised')], props=[P('lockopen', 1180, 430, 4, s=1.5, anim='beat'), P('label', 1180, 160, 8, text='രഹസ്യം', color='#ff4d5e')], flash=14),
    dict(bg='night', actors=[A(GIRL, 960, 'idle', 'happy', flip=True)], props=[P('heart', 960, 280, 4, s=0.8, anim='beat'), P('label', 960, 110, 8, text='അവൾ ആഗ്രഹിക്കുന്നത്', color='#ff5d8f')]),
    dict(bg='night', actors=[A('guy', 700, 'flex', 'smirk'), A(GIRL, 1250, 'shrug', 'neutral', flip=True)], props=[P('label', 700, 300, 4, text='അവൻ എങ്ങനെ?', color='#cccccc'), P('x', 950, 300, 14, s=0.6, anim='stamp')]),
    dict(bg='room', actors=[A(GIRL, 800, 'idle', 'happy')], props=[P('mirror', 1250, 520, 2, s=1.6), P('spark', 1250, 400, 10), P('label', 960, 110, 8, text='അവൾ സ്വയം എങ്ങനെ കാണുന്നു', color='#ff5d8f', n=60)]),
    dict(bg='room', actors=[A(ARJ, 760, 'clap', 'happy'), A(GIRL, 1160, 'dance', 'shy', flip=True)], props=[P('label', 1160, 300, 6, text='സുന്ദരി', color='#ff5d8f'), P('hearts', 1160, 520, 8, n=6)]),
    dict(bg='office', actors=[A(ARJ, 760, 'listen', 'happy'), A(GIRL, 1160, 'talk', 'happy', flip=True)], props=[P('brain', 1160, 260, 2, s=0.7, anim='beat'), P('label', 960, 110, 4, text='ബുദ്ധിമതി', color='#2ec4b6')]),
    dict(bg='rain', actors=[A(ARJ, 900, 'hug', 'determined'), A(GIRL, 1050, 'calm_breath', 'happy', flip=True)], props=[P('shield', 975, 330, 2, s=1.1), P('label', 960, 110, 4, text='സുരക്ഷിത', color='#3a86ff')]),
    dict(bg='night', actors=[A(GIRL, 960, 'heart', 'love', flip=True), A('grey', 400, 'idle', 'neutral'), A('grey', 1520, 'idle', 'neutral', flip=True)], props=[P('hearts', 960, 520, 2, n=10), P('label', 960, 110, 6, text='മറ്റാരിൽ നിന്നും കിട്ടില്ല', color='#ff4d5e')]),
    # ---- arjun after
    dict(bg='room', actors=[A(ARJ, 960, [[0, 'think'], [h, 'cheer']], 'neutral', faces=[[h, 'determined']])], props=[P('spark', 1100, 280, h), P('label', 960, 110, 4, text='അർജുൻ 2.0', color='#2ec4b6')]),
    dict(bg='gym', actors=[A(ARJ, 960, 'lift', 'determined', hold='dumbbell')], props=[P('check', 1400, 300, 10, s=0.8, anim='stamp'), P('sweat', 1010, 450, 4)]),
    dict(bg='office', actors=[A(ARJ, 760, 'type', 'determined', hold='briefcase')], props=[P('chart', 1300, 380, 4, s=1.1), P('check', 1550, 260, 14, s=0.7, anim='stamp')]),
    dict(bg='cafe', actors=[A(ARJ, 700, 'listen', 'happy'), A('guy', 1220, 'talk', 'happy', flip=True)], props=[P('ear', 760, 280, 4, s=0.7, anim='beat'), P('check', 1000, 220, 14, s=0.7, anim='stamp')]),
    dict(bg='park', actors=[A(ARJ, 700, 'walk', 'happy', move=[[0, 400], [d, 760]]), A('girl2', 1250, 'wave', 'happy', flip=True)], props=[P('calendar', 960, 300, 2, s=0.9, text='365'), P('label', 960, 110, 6, text='ഒരു വർഷത്തിന് ശേഷം', color='#2ec4b6')]),
    dict(bg='beach', actors=[A(ARJ, 860, 'idle', 'happy'), A('girl2', 1060, 'dance', 'happy', flip=True)], props=[P('hearts', 960, 520, 4, n=8)]),
    dict(bg='sunset', actors=[A(ARJ, 860, 'hug', 'happy'), A('girl2', 1060, 'hug', 'love', flip=True)], props=[P('bubble', 1300, 280, 0, text='എനിക്ക് ഞാനായിരിക്കാം', color='#ff5d8f'), P('hearts', 960, 520, 4, n=10)]),
    # ---- outro
    dict(bg='park', actors=[A(ARJ, 600, 'point', 'happy', hold='phone'), A('guy', 1320, [[0, 'idle'], [h, 'cheer']], 'surprised', faces=[[h, 'happy']], flip=True)], props=[P('share', 960, 330, 6, s=0.9, anim='beat'), P('label', 960, 110, 4, text='സുഹൃത്തിന് അയക്കൂ', color='#2ec4b6')]),
    dict(bg='yellow', actors=[A(ARJ, 380, 'point', 'happy')], props=[P('big', 900, 380, 4, text='7', color='#ff4d5e', n=380), P('label', 1350, 330, 10, text='സൂചനകൾ'), P('label', 1350, 500, 16, text='അവൾക്ക് താൽപ്പര്യമുണ്ടോ?', color='#ffffff', n=52)]),
    dict(bg='plain', actors=[A(ARJ, 400, 'point', 'happy')], props=[P('subscribe', 1050, 420, 0), P('bell', 1450, 420, 26, s=0.7, anim='shake')]),
    dict(bg='sunset', actors=[A(ARJ, 760, 'wave', 'happy'), A(GIRL, 1160, 'wave', 'happy', flip=True)], props=[P('big', 960, 300, 2, text='കാണാം!', color='#ffd166', n=200)]),
    ]
    return S[i]

INK = '#1b1b1f'
out = []
for s in shots:
    d = s['to'] - s['from']
    sp = spec(s['id'], d)
    # strip None holds
    for a in sp.get('actors', []):
        if a.get('hold') is None: a.pop('hold', None)
    out.append({**s, 'spec': sp})
json.dump(out, open('src/data/stick_shots.json', 'w'), ensure_ascii=False)
print(len(out), 'stick shots')
