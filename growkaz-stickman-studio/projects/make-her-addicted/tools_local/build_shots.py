# build_shots.py — writes story/shots.json: each shot starts 0.15 s before its anchor phrase (contiguous shots).
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(HERE, "timeline/words.json")))["words"]
cfg = json.load(open(os.path.join(HERE, "config.json")))
W = [w["word"] for w in words]

A, M, PR, D, L = "ARJUN", "MEERA", "PRIYA", "DOC", "LOUD"
def f(c, x, pose="stand", **k): return dict(c=c, x=x, pose=pose, **k)
def lab(s, at=0.2, y=0.14, **k): return dict(s=s, at=at, y=y, **k)
S = []  # (anchor, params, scene, extras)
def add(anchor, scene, **p): S.append((anchor, p, scene))

# ---- HOOK
add("ഒരു സ്ത്രീ ഒരു പുരുഷനെ ഭ്രാന്തമായി", "spotlight: Meera gazes at Arjun, hearts rise", tpl="scene", set="stage", cam=[1.15, 1.0, 0, 0],
    figs=[f(A, 0.38, "relaxed", expr="neutral"), f(M, 0.62, "holdFront", f=-1, expr="awe")], fx=["hearts"], heartsOn=1, labels=[lab("WHEN DOES SHE CRAVE HIM?", 0.6)])
add("അവൻ സുന്ദരൻ", "loud guy in sunglasses poses, red X: not looks", tpl="scene", set="stage", cam=[1, 1.08, 0, 0], figs=[f(L, 0.5, "crossArms", expr="smirk")], labels=[lab("LOOKS?", 0.1)], marks=[dict(k="x", x=0.72, y=0.4, at=0.8)])
add("പണം ഉള്ളത്", "same guy with stacks of cash, red X: not money", tpl="scene", set="stage", cam=[1.08, 1.0, 0, 0], figs=[f(L, 0.45, "shrug", expr="smirk")], fx=["money"], labels=[lab("MONEY?", 0.1)], marks=[dict(k="x", x=0.72, y=0.4, at=0.6)])
add("ഈ വീഡിയോയുടെ അവസാനം", "a locked glowing chest with a question mark", tpl="big", lines=["THE SECRET", "...AT THE END"], size=110, secret=True)
add("അതറിഞ്ഞാൽ", "Arjun giant face, eyes widen", tpl="face", c=A, set="street", expr="neutral", exprs=[[1.2, "awe"]], look=[0, -0.1])
add("അതുകൊണ്ട് സ്കൈപ്", "DON'T SKIP card, skip button gets crossed", tpl="big", lines=["DON'T SKIP"], skip=True)
# ---- STORY
add("ആദ്യം ഒരു കഥ", "title card: A STORY at sunset", tpl="title", lines=["FIRST,", "A STORY"])
add("അർജുൻ 26", "Arjun walks along the dusk street, label ARJUN, 26", tpl="scene", set="street", cam=[1, 1.05, 0, -40], figs=[f(A, 0.3, walk=1.8, dx=60, expr="smile")], labels=[lab("ARJUN · 26", 0.3)])
add("അവന് ഒരു പെൺകുട്ടിയെ", "cafe: Arjun stares at Priya, hearts above him", tpl="scene", set="cafe", mood="golden", cam=[1, 1.06, 0, 30], figs=[f(A, 0.3, "holdFront", expr="joy", look=[1, 0]), f(PR, 0.68, "phone", f=-1, prop="phone", expr="neutral")], fx=["hearts"], labels=[lab("PRIYA", 0.6, y=0.2, x=0.68)])
add("അവൾ എന്ത് ചോദിച്ചാലും", "Priya points, Arjun rushes carrying bags", tpl="scene", set="street", cam=[1.04, 1, 0, 0], figs=[f(PR, 0.7, "point", f=-1, expr="smile"), f(A, 0.2, walk=3, run=True, dx=180, expr="happy")], fx=["speed"], labels=[lab("ANYTHING SHE ASKS", 0.4)])
add("രാത്രി 2:00", "bedroom at night, clock 2:00, Arjun texting in bed", tpl="scene", set="bedroom", clock=2, cam=[1, 1.07, 0, 0], figs=[f(A, 0.42, "sit", prop="phone", expr="smile", dy=-40)], labels=[lab("2:00 AM", 0.2)])
add("ഓരോ മെസ്സേജിനും.", "phone close-up: instant replies pile up", tpl="phone", msgs=[dict(s="hey", at=0.1), dict(s="hi!! 😊", me=True, at=0.3), dict(s="u up?", at=0.7), dict(s="always! what's up?", me=True, at=0.9), dict(s="ok", at=1.6), dict(s="tell me more!!", me=True, at=1.8)], labels=[lab("INSTANT REPLY. EVERY TIME.", 1.0, y=0.08)])
add("എന്നിട്ടും ഒരു ദിവസം", "dusk street: Priya talks to Arjun", tpl="scene", set="street", cam=[1, 1.1, 0, 0], figs=[f(A, 0.4, "relaxed", expr="happy"), f(PR, 0.6, "talk", f=-1, expr="neutral", talk=True)], labels=[lab("ONE DAY...", 0.2)])
add("നീ നല്ലവനാണ്.", "Priya giant face, polite smile: YOU'RE A NICE GUY", tpl="face", c=PR, set="street", expr="smile", talk=True, bubble=dict(s="YOU'RE A NICE GUY", at=0.1))
add("പക്ഷേ എനിക്ക്", "Priya giant face: BUT I DON'T FEEL IT", tpl="face", c=PR, set="street", expr="sad", talk=True, tilt=-0.08, bubble=dict(s="BUT I DON'T FEEL IT", at=0.1))
add("അർജുൻ എന്താണ്", "Arjun alone in the rain, head down", tpl="scene", set="street", mood="night", rain=True, cam=[1.1, 1, 0, 0], figs=[f(A, 0.5, "sad", expr="sad")], labels=[lab("WHAT WENT WRONG?", 0.3)], fx=["rain"])
add("അതിനു ശേഷം", "stage: sad Arjun straightens up, teaser", tpl="scene", set="stage", cam=[1, 1.1, 0, 0], figs=[f(A, 0.5, poses=[[0, "sad"], [1.6, "crossArms"]], expr="sad", exprs=[[1.6, "determined"]])], fx=["ring"], labels=[lab("WHAT HE CHANGED → LATER", 0.4)])
add("അർജുൻ ചെയ്ത തെറ്റ്", "street crowd: everyone glued to their phone", tpl="scene", set="street", mood="dusk", cam=[1.05, 1, 0, 0], figs=[], fx=["crowdPhones"], labels=[lab("MOST OF US MAKE THIS MISTAKE", 0.3)])
add("അവളെ നമ്മുടെ", "blueprint: you orbit around her", tpl="board", kind="orbit")
add("നീ നിന്റെ ലോകം", "blueprint: gym, friends, career, hobbies, goals fall away", tpl="board", kind="world", capAt=3.6)
add("അവൾക്കു നിന്നിൽ", "Priya giant face, bored", tpl="face", c=PR, set="cafe", mood="golden", expr="sleepy", labels=[lab("NOTHING LEFT TO DISCOVER", 0.2, y=0.12)])
add("അട്ട്രാക്ഷൻ", "blueprint: ATTRACTION = MYSTERY + DEPTH", tpl="board", kind="equation", depthAt=3.0)
add("ഇനി നമുക്ക്", "title card: 6 THINGS THAT ACTUALLY WORK", tpl="title", lines=["6 THINGS THAT", "ACTUALLY WORK"])
add("4-ആം പോയിന്റ്", "Arjun thinking under a spotlight, label #4", tpl="scene", set="stage", cam=[1.1, 1.0, 0, 0], figs=[f(A, 0.5, "think", expr="thinking")], labels=[lab("#4: MOST MEN DON'T KNOW THIS", 0.2)])
# ---- TIP 1
add("1 നിനക്ക് സ്വന്തമായി", "tip card 1: HAVE YOUR OWN MISSION", tpl="tip", n=1, title=["HAVE YOUR", "OWN MISSION"], set="gym")
add("ജിം", "gym: Arjun lifts a barbell", tpl="scene", set="gym", cam=[1.1, 1.0, 0, 0], figs=[f(A, 0.5, "cheer", expr="determined")], fx=["barbell"], labels=[lab("GYM", 0.05)])
add("കരിയർ", "night office: Arjun at the laptop", tpl="scene", set="office", cam=[1, 1.08, 0, 0], figs=[f(A, 0.38, "sit", expr="determined", dy=-10)], fx=["laptop"], labels=[lab("CAREER", 0.05)])
add("മ്യൂസിക്", "bedroom: Arjun plays guitar", tpl="scene", set="bedroom", mood="interiorWarm", cam=[1.08, 1, 0, 0], figs=[f(A, 0.5, "holdFront", expr="joy")], fx=["guitar"], labels=[lab("MUSIC", 0.05)])
add("എന്തുമാകട്ടെ", "Arjun walks with purpose on the dusk street", tpl="scene", set="street", cam=[1, 1.05, 0, -30], figs=[f(A, 0.35, walk=1.8, dx=80, expr="determined")], labels=[lab("ANYTHING. JUST HAVE ONE.", 0.2)])
add("1 ലക്ഷത്തിന്", "Arjun giant face, fire in his eyes", tpl="face", c=A, set="gym", expr="smirk", fx=["fire"], labels=[lab("A FIRE IN HIS EYES", 0.6)])
add("അവൾ അത് ശ്രദ്ധിക്കും", "cafe: Meera notices Arjun working", tpl="scene", set="cafe", mood="golden", cam=[1, 1.08, 0, 30], figs=[f(A, 0.3, "phone", prop="tablet", expr="determined"), f(M, 0.7, "holdFront", f=-1, expr="awe", look=[-1, 0])], labels=[lab("SHE NOTICES", 0.4)])
add("നിന്റെ ലോകത്തിലേക്ക്", "Meera walks toward Arjun's glowing world", tpl="scene", set="stage", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(A, 0.4, "explain", expr="smile"), f(M, 0.78, walk=1.2, dx=-70, f=-1, expr="joy")], fx=["ring"], labels=[lab("SHE WANTS IN", 0.4)])
add("കാരണം നീ അവളുടെ", "Arjun chases Priya who walks away, red X", tpl="scene", set="street", cam=[1, 1.04, 0, 0], figs=[f(PR, 0.65, walk=1.6, dx=90, expr="neutral"), f(A, 0.35, walk=2.4, run=True, dx=90, expr="worried")], marks=[dict(k="x", x=0.85, y=0.25, at=0.4)], labels=[lab("DON'T CHASE HER", 0.1)])
add("നീ എവിടേക്കോ", "Arjun runs toward the sunrise, check", tpl="scene", set="street", mood="golden", cam=[1.05, 1, 0, 60], figs=[f(A, 0.45, walk=2.6, run=True, dx=60, expr="determined")], fx=["speed"], marks=[dict(k="c", x=0.8, y=0.25, at=0.5)], labels=[lab("RUN TOWARD YOUR GOAL", 0.2)])
# ---- TIP 2
add("രണ്ട്.", "tip card 2: REALLY LISTEN", tpl="tip", n=2, title=["REALLY", "LISTEN"], set="cafe", mood="golden")
add("മിക്ക ആണുങ്ങളും കേൾക്കുന്നത്", "cafe: Meera talks, a guy just waits to reply", tpl="scene", set="cafe", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(L, 0.32, "talk", expr="smirk", talk=True), f(M, 0.68, "explain", f=-1, expr="worried", talk=True, talkTo=1)], labels=[lab("LISTENING JUST TO REPLY", 0.6)], marks=[dict(k="x", x=0.15, y=0.3, at=2.6)])
add("അവൾ 3 ദിവസം", "blueprint: calendar flips back 3 days, mom's doctor visit", tpl="board", kind="calendar")
add("അമ്മയുടെ ഡോക്ടർ", "cafe: Arjun asks about her mom's doctor visit", tpl="scene", set="cafe", mood="golden", cam=[1.05, 1.12, 0, 0], figs=[f(A, 0.36, "explain", expr="smile", talk=True), f(M, 0.64, "relaxed", f=-1, expr="neutral")], bubble=dict(fig=0, s="HOW WAS YOUR MOM'S CHECKUP?", at=0.1))
add("അവളുടെ മുഖത്ത്", "Meera giant face: surprise turns to a big smile", tpl="face", c=M, set="cafe", mood="golden", expr="surprised", exprs=[[0.8, "joy"]], side=1)
add("കാരണം ഇന്നത്തെ", "crowd glued to phones, nobody listens", tpl="scene", set="street", mood="night", cam=[1, 1.06, 0, 0], figs=[], fx=["crowdPhones"], labels=[lab("NOBODY REALLY LISTENS", 0.4)])
add("നീ ശ്രദ്ധിക്കുമ്പോൾ", "crowd dim, Arjun lit and looking up", tpl="scene", set="street", mood="night", cam=[1.05, 1.15, 0, 0], figs=[f(A, 0.5, "relaxed", expr="smile", rimC="#c6ff3d")], fx=["crowdPhones", "ring"], skip=[4], labels=[lab("YOU STAND OUT", 0.5, c="good")])
# ---- TIP 3
add("മൂന്ന് പുതിയ", "tip card 3: NEW EXPERIENCES TOGETHER", tpl="tip", n=3, title=["NEW EXPERIENCES", "TOGETHER"], set="street", mood="golden")
add("സൈക്കോളജിസ്റ്റുകൾ", "lab: psychologist presents research", tpl="scene", set="lab", mood="interiorWarm", cam=[1, 1.06, 0, -20], figs=[f(D, 0.45, "point", f=-1, prop="pointer", expr="smile")], labels=[lab("PSYCHOLOGY STUDIES", 0.3)])
add("പുതിയതും.", "blueprint: closeness curve rises with novelty", tpl="board", kind="curve")
add("ഒരേ കഫേ,", "cafe: bored couple, labels SAME CAFE / SAME MOVIE / SAME CHAT", tpl="scene", set="cafe", mood="golden", cam=[1, 1.04, 0, 0], veil=0.25, figs=[f(A, 0.36, "relaxed", expr="sleepy"), f(M, 0.64, "phone", f=-1, prop="phone", expr="sleepy")], labels=[lab("SAME CAFE", 0.1, y=0.14), lab("SAME MOVIE", 0.9, y=0.24), lab("SAME CHAT", 1.7, y=0.34)])
add("ഇത് ബോറാണ്.", "BORING stamp slams down", tpl="scene", set="cafe", mood="golden", veil=0.5, cam=[1.04, 1.04, 0, 0], figs=[f(A, 0.36, "relaxed", expr="sleepy"), f(M, 0.64, "phone", f=-1, prop="phone", expr="sleepy")], fx=["stamp"], stamp="BORING", stampAt=0.1)
add("പകരം ഒരു സൺറൈസ്", "3D: sunrise trek on a mountain ridge", tpl="trek3d")
add("ഒരു പുതിയ ഫുഡ്", "night food street with lantern stalls, couple walks", tpl="scene", set="street", mood="night", stalls=True, cam=[1, 1.06, 0, -40], figs=[f(A, 0.4, walk=1.4, dx=50, expr="joy"), f(M, 0.52, walk=1.4, dx=50, expr="joy")], labels=[lab("NEW FOOD STREET", 0.2)])
add("ഒരു മഴയത്തുള്ള", "rainy night bike ride, speed lines", tpl="scene", set="street", mood="night", rain=True, cam=[1.1, 1.1, 0, -400], figs=[f(A, 0.47, "sit", expr="joy", dy=-60, s=0.9), f(M, 0.4, "sit", expr="joy", dy=-60, s=0.9)], fx=["bike", "rain", "speed"], labels=[lab("BIKE RIDE IN THE RAIN", 0.2)])
add("ആ ത്രില്ലിന്റെ", "Meera giant face, eyes closed smiling, memories float", tpl="face", c=M, set="street", mood="night", expr="joy", fx=["polaroids"])
add("പക്ഷേ അതുണ്ടാക്കുന്നത്", "nervous Arjun checks his phone, ANXIETY", tpl="scene", set="bedroom", cam=[1.1, 1.0, 0, 0], figs=[f(A, 0.5, "phone", prop="phone", expr="nervous")], labels=[lab("THAT CREATES ANXIETY", 0.2, c="red"), lab("NOT LOVE", 2.0, y=0.26, c="red")])
# ---- TIP 4
add("ശരിയായ വഴി", "tip card 4: BE CONSISTENT", tpl="tip", n=4, title=["THE RIGHT WAY:", "BE CONSISTENT"], set="street")
add("നിന്റെ വാക്കും", "blueprint: WORDS = ACTIONS on a balance", tpl="board", kind="scale")
add("പറഞ്ഞ സമയത്ത്", "Arjun arrives on time, Meera smiles, clock", tpl="scene", set="street", cam=[1, 1.06, 0, 0], figs=[f(A, 0.25, walk=1.6, dx=120, expr="smile"), f(M, 0.68, "wave", f=-1, expr="joy")], fx=["clock"], clockAt=7, labels=[lab("ON TIME", 0.3, c="good")])
add("ദേഷ്യം വന്നാലും", "Arjun with red anger aura, speaking calmly", tpl="scene", set="stage", cam=[1.05, 1.0, 0, 0], figs=[f(A, 0.42, "explain", expr="determined", talk=True), f(M, 0.62, "crossArms", f=-1, expr="neutral")], fx=["aura"], labels=[lab("ANGRY? STILL RESPECTFUL.", 0.2)])
add("1 സ്ത്രീക്ക് 1", "dusk park: Meera laughs freely beside Arjun", tpl="scene", set="street", mood="golden", cam=[1, 1.1, 0, 0], figs=[f(A, 0.42, "relaxed", expr="smile"), f(M, 0.58, "cheer", f=-1, expr="joy")], fx=["hearts"], heartsOn=1, labels=[lab("SHE CAN BE HERSELF", 0.5)])
add("അവൾ ആ സ്ഥലം", "3D: the couple on a park bench at night", tpl="bench3d")
# ---- TIP 5
add("5 ശാന്തമായ", "tip card 5: QUIET CONFIDENCE", tpl="tip", n=5, title=["QUIET", "CONFIDENCE"], set="stage")
add("എന്നാൽ ഉറക്ക", "loud guy shouting, red X", tpl="scene", set="stage", cam=[1.1, 1.0, 0, 0], figs=[f(L, 0.5, "cheer", expr="angry", talk=True)], labels=[lab("NOT BEING LOUD", 0.2, c="red")], marks=[dict(k="x", x=0.72, y=0.38, at=0.5)])
add("അറിയില്ല എന്ന്", "Arjun shrugs honestly: I DON'T KNOW", tpl="scene", set="cafe", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(A, 0.45, "shrug", expr="smile", talk=True)], bubble=dict(fig=0, s="I DON'T KNOW", at=0.2), marks=[dict(k="c", x=0.8, y=0.3, at=1.2)])
add("തെറ്റു പറ്റിയാൽ", "Arjun apologizes, Meera softens", tpl="scene", set="cafe", mood="golden", cam=[1.04, 1.1, 0, 0], figs=[f(A, 0.38, "holdFront", expr="sad", talk=True), f(M, 0.64, "crossArms", f=-1, expr="neutral", exprs=[[1.6, "smile"]])], bubble=dict(fig=0, s="SORRY, MY MISTAKE", at=0.2))
add("സ്വന്തം അഭിപ്രായം", "Arjun shares his opinion while Meera disagrees", tpl="scene", set="cafe", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(A, 0.38, "explain", expr="determined", talk=True), f(M, 0.64, "crossArms", f=-1, expr="thinking")], labels=[lab("STAND BY YOUR OPINION", 0.3)])
add("സ്വയം അംഗീകരിക്കുന്ന", "Arjun stands tall in a spotlight, Meera admires", tpl="scene", set="stage", mood="golden", cam=[1.1, 1.0, 0, 0], figs=[f(A, 0.45, "crossArms", expr="smile"), f(M, 0.66, "holdFront", f=-1, expr="awe")], fx=["ring"], labels=[lab("SELF-ACCEPTANCE = RESPECT", 0.4)])
# ---- TIP 6
add("6 അവളുടെ", "tip card 6: BE HER BIGGEST FAN", tpl="tip", n=6, title=["BE HER", "BIGGEST FAN"], set="stage", mood="golden")
add("ഏറ്റവും വലിയ ഫാൻ", "Meera on stage presenting, Arjun cheering", tpl="scene", set="stage", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(M, 0.6, "explain", f=-1, expr="joy", talk=True), f(A, 0.3, "cheer", expr="joy")], fx=["hearts"], heartsOn=1)
add("അവൾ ഒരു പുതിയ", "Meera gets an idea, lightbulb", tpl="scene", set="office", mood="night", cam=[1.06, 1.0, 0, 0], figs=[f(M, 0.5, "pointUp", expr="joy")], fx=["bulb"], bulbAt=0.3, labels=[lab("HER NEW IDEA", 0.2)])
add("അത് നടക്കില്ല", "doubters around her say NO WAY", tpl="scene", set="street", mood="dusk", cam=[1, 1.06, 0, 0], figs=[f(M, 0.5, "sad", expr="sad")], fx=["doubters"])
add("നീ മാത്രം പറയൂ", "Arjun: YOU CAN DO IT. I'M WITH YOU.", tpl="scene", set="street", mood="golden", cam=[1.05, 1.12, 0, 0], figs=[f(A, 0.4, "explain", expr="smile", talk=True), f(M, 0.62, "relaxed", f=-1, expr="neutral", exprs=[[1.6, "joy"]])], bubble=dict(fig=0, s="YOU CAN DO IT. I'M WITH YOU.", at=0.2))
# ---- SECRET
add("ഇനി ഞാൻ തുടക്കത്തിൽ", "the secret chest opens with light", tpl="big", lines=["THE SECRET"], size=120, secret=True, open=True)
add("ഒരു സ്ത്രീ ഒരു പുരുഷനെ ആഗ്രഹിക്കുന്നത്", "blueprint: not only WHO HE IS", tpl="board", kind="notOnly", at2=99, strike=2.6)
add("അവന്റെ കൂടെ ഇരിക്കുമ്പോൾ", "blueprint: WHO SHE BECOMES WITH HIM", tpl="board", kind="notOnly", at2=0.3, strike=0.01)
add("നിന്റെ കൂടെയുള്ളപ്പോൾ", "Meera looks into a mirror and sees a glowing version of herself", tpl="scene", set="bedroom", mood="interiorWarm", cam=[1, 1.08, 0, 0], figs=[f(M, 0.36, "relaxed", expr="awe", look=[1, 0])], fx=["mirror"])
add("സുന്ദരി", "Meera giant face: BEAUTIFUL / SMART / SAFE", tpl="face", c=M, set="street", mood="golden", expr="joy", side=1,
    labels=[lab("BEAUTIFUL", 0.05, y=0.14, x=0.2), lab("SMART", 1.4, y=0.14, x=0.5), lab("SAFE", 2.6, y=0.14, x=0.8)])
add("ആ ഫീലിംഗ്.", "couple silhouette at sunset, a big heart glows", tpl="scene", set="street", mood="golden", cam=[1.1, 1.0, 0, 0], figs=[f(A, 0.45, "relaxed", expr="smile"), f(M, 0.55, "relaxed", f=-1, expr="joy")], fx=["hearts"], labels=[lab("A FEELING NO ONE ELSE GIVES HER", 0.4)])
# ---- ARJUN'S CHANGE
add("അർജുൻ ഇത് മനസ്സിലാക്കി", "Arjun giant face: realization", tpl="face", c=A, set="stage", expr="awe", exprs=[[1.0, "determined"]])
add("അവൻ ജിമ്മിൽ", "gym: Arjun lifts", tpl="scene", set="gym", cam=[1, 1.08, 0, 0], figs=[f(A, 0.5, "cheer", expr="determined")], fx=["barbell"], labels=[lab("GYM", 0.1)])
add("സ്വന്തം ബിസിനസ്സ്", "night office: Arjun builds his business idea", tpl="scene", set="office", cam=[1.06, 1, 0, 0], figs=[f(A, 0.38, "sit", expr="determined", dy=-10)], fx=["laptop"], labels=[lab("HIS OWN BUSINESS", 0.1)])
add("ആളുകളെ ശരിക്കും", "cafe: Arjun listens to a friend", tpl="scene", set="cafe", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(A, 0.36, "think", expr="smile"), f("EXTRA", 0.64, "explain", f=-1, expr="happy", talk=True)], labels=[lab("LEARNED TO LISTEN", 0.1)])
add("1 വർഷത്തിന്", "1 YEAR LATER: Arjun meets Meera on the street, they wave", tpl="scene", set="street", mood="golden", cam=[1, 1.08, 0, 0], figs=[f(A, 0.35, "wave", expr="smile"), f(M, 0.65, "wave", f=-1, expr="joy")], labels=[lab("1 YEAR LATER", 0.1)])
add("ഇന്ന് അവൾ", "Meera giant face: WITH HIM, I CAN BE ME", tpl="face", c=M, set="street", mood="golden", expr="joy", talk=True, side=1, bubble=dict(s="WITH HIM, I CAN BE ME", at=0.6, side=-1))
# ---- OUTRO
add("ഈ വീഡിയോ ഉപകാരപ്പെട്ടെങ്കിൽ", "phone: share this video with a friend", tpl="phone", set="street", msgs=[dict(s="bro watch this 👇", me=True, at=0.4), dict(s="▶ 6 THINGS THAT WORK", me=True, at=1.0), dict(s="🔥🔥 thanks!", at=2.4)], labels=[lab("SEND IT TO A FRIEND", 0.2, y=0.08)])
add("അടുത്ത വീഡിയോയിൽ", "next video teaser: 7 SIGNS SHE'S INTERESTED", tpl="title", lines=["NEXT VIDEO:", "7 SIGNS SHE'S INTERESTED"])
add("അത് മിസ്", "end screen: subscribe, Arjun and Meera", tpl="end", q="Subscribe so you don't miss it!")

# resolve anchors
shots, pos = [], 0
for anchor, p, scene in S:
    toks = anchor.split()
    for i in range(pos, len(W)):
        if all(W[i + k].startswith(toks[k]) or W[i + k] == toks[k] for k in range(len(toks)) if i + k < len(W)): break
    else: raise SystemExit("anchor not found: " + anchor)
    pos = i + 1
    shots.append(dict(i=i, p=p, scene=scene))
total = round(max(cfg["duration"], words[-1]["end"]) + 1.5, 2)
out = []
for k, s in enumerate(shots):
    st = 0 if k == 0 else round(max(0, words[s["i"]]["start"] - 0.15), 2)
    en = total if k == len(shots) - 1 else round(max(0, words[shots[k + 1]["i"]]["start"] - 0.15), 2)
    j = shots[k + 1]["i"] if k + 1 < len(shots) else len(W)
    out.append(dict(id=f"s{k + 1:03d}", start=st, end=en, line=" ".join(W[s["i"]:j]), scene=s["scene"], bars=None, **{"in": {"type": "cut"}}, sfx=[], params=s["p"]))
json.dump(dict(title=cfg["title"], duration=total, shots=out), open(os.path.join(HERE, "story/shots.json"), "w"), ensure_ascii=False, indent=1)
d = [o["end"] - o["start"] for o in out]; print(len(out), "shots, median", sorted(d)[len(d) // 2], "min", min(d), "max", max(d))
for o in out:
    if o["end"] - o["start"] < 0.8 or o["end"] - o["start"] > 8: print("  check", o["id"], round(o["end"] - o["start"], 2), o["scene"])

# ---- sound: per-template sfx + ambience, music sections
data = json.load(open(os.path.join(HERE, "story/shots.json")))
for o in data["shots"]:
    p = o["params"]; sfx = []
    if p.get("tpl") == "tip": sfx += [dict(at=0.0, name="whoosh", gain=-8), dict(at=0.12, name="impact", gain=-12)]
    if p.get("tpl") == "big": sfx += [dict(at=0.05, name="riser" if p.get("open") else "whoosh", gain=-10)]
    if p.get("tpl") == "title": sfx += [dict(at=0.1, name="whoosh", gain=-12)]
    if p.get("stamp"): sfx += [dict(at=p.get("stampAt", 0.4), name="impact", gain=-8)]
    for m in p.get("marks", []): sfx += [dict(at=m.get("at", 0.4), name="hit" if m["k"] == "x" else "blip", gain=-10)]
    for L in p.get("labels", [])[:3]: sfx += [dict(at=L.get("at", 0.2), name="pop", gain=-14)]
    if p.get("bubble"): sfx += [dict(at=p["bubble"].get("at", 0.2), name="blip", gain=-12)]
    if p.get("tpl") == "phone": sfx += [dict(at=m["at"], name="blip", gain=-14) for m in p.get("msgs", [])]
    if p.get("rain"): o["amb"] = dict(name="rain", gain=-20)
    elif p.get("set") == "cafe": o["amb"] = dict(name="murmur", gain=-28)
    elif p.get("set") == "street" and p.get("mood") == "night": o["amb"] = dict(name="city", gain=-26)
    o["sfx"] = sorted(sfx, key=lambda x: x["at"])[:3]
    if p.get("tpl") in ("tip", "big", "title", "trek3d", "end") or p.get("kind") == "notOnly": o["in"] = dict(type="dip", dur=0.3)
T = data["duration"]
data["music"] = [dict(start=0, end=19.2, mood="mystery", intensity=0.45), dict(start=19.2, end=56.7, mood="sad", intensity=0.35),
                 dict(start=56.7, end=133.0, mood="hopeful", intensity=0.55), dict(start=133.0, end=185.7, mood="playful", intensity=0.5),
                 dict(start=185.7, end=206.3, mood="wonder", intensity=0.6), dict(start=206.3, end=T, mood="triumph", intensity=0.6)]
json.dump(data, open(os.path.join(HERE, "story/shots.json"), "w"), ensure_ascii=False, indent=1)
print("sound plan added")
