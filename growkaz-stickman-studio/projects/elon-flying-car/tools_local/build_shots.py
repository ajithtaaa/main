# build_shots.py — writes story/shots.json: each shot starts 0.15 s before its anchor phrase (contiguous shots).
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(HERE, "timeline/words.json")))["words"]
cfg = json.load(open(os.path.join(HERE, "config.json")))
W = [w["word"] for w in words]

EL, PT, X = "ELON", "PETER", "EXTRA"
def f(c, x, pose="stand", **k): return dict(c=c, x=x, pose=pose, **k)
def lab(s, at=0.2, y=0.14, **k): return dict(s=s, at=at, y=y, **k)
S = []  # (anchor, params, scene, extras)
def add(anchor, scene, **p): S.append((anchor, p, scene))


add("In 2017,", "stage: Elon points up at a hovering flying car hologram, 2017", tpl="scene", set="stage", cam=[1.18, 1.0, 0, 0], figs=[f(EL, 0.5, "pointUp", expr="smirk")], fx=["carHover"], labels=[lab("2017", 0.0, y=0.1, size=90)])
add("promised a car", "Elon giant face, smug: IT WILL FLY", tpl="face", c=EL, set="stage", expr="smirk", talk=True, bubble=dict(s="IT WILL FLY.", at=0.2))
add("Everyone laughed.", "crowd laughing HAHA", tpl="scene", set="site", cam=[1.1, 1.0, 0, 0], figs=[], fx=["crowdLaugh"])
add("Nine years later...", "calendar flips 2017 to 2026", tpl="board", kind="years", **{"from": 2017, "to": 2026}, sub="9 YEARS LATER")
add("he actually did it.", "the red car flies across the dusk sky, jets blasting", tpl="scene", set="site", cam=[1, 1.05, 0, 0], figs=[f(EL, 0.3, "cheer", expr="joy")], fx=["carFly"], carY=0.32, labels=[lab("HE DID IT", 0.6, c="good")])
add("Kind of.", "Elon giant face, awkward", tpl="face", c=EL, set="site", expr="confused", tilt=0.1, labels=[lab("...KIND OF", 0.1, y=0.18)])
add("It started because", "Peter Thiel complains to Elon", tpl="scene", set="street", mood="dusk", cam=[1, 1.08, 0, 0], figs=[f(PT, 0.32, "shrug", expr="frown", talk=True), f(EL, 0.68, "crossArms", f=-1, expr="neutral")], bubble=dict(fig=0, s="WHERE ARE THE FLYING CARS?", at=0.1), labels=[lab("PETER THIEL", 0.2, y=0.22, x=0.32, size=46)])
add("the future was", "retro-future city with flying cars in the sky, Peter looks up", tpl="scene", set="street", mood="golden", cam=[1.06, 1, 0, 0], figs=[f(PT, 0.5, "pointUp", expr="sad", look=[0, -1])], fx=["carsSky"], labels=[lab("THE FUTURE WE WERE PROMISED", 0.2, y=0.08, size=46)])
add("So Elon basically", "Elon giant face: FINE.", tpl="face", c=EL, set="street", expr="smirk", talk=True, bubble=dict(s="FINE.", at=0.6))
add("I'll make you one.", "Elon points at Peter: I'LL MAKE YOU ONE", tpl="scene", set="street", mood="dusk", cam=[1.06, 1.14, 0, 0], figs=[f(EL, 0.36, "point", expr="determined", talk=True), f(PT, 0.68, "holdFront", f=-1, expr="surprised")], fx=["ring"], bubble=dict(fig=0, s="I'LL MAKE YOU ONE.", at=0.05))
add("Which is funny,", "Elon terrified as cars buzz overhead", tpl="scene", set="street", mood="dusk", cam=[1, 1.08, 0, 0], figs=[f(EL, 0.5, "handsOnHead", expr="scared", look=[0, -1])], fx=["carsSky"], labels=[lab("ELON: FLYING CARS = TERRIFYING", 1.6, y=0.12, size=44)])
add("because a loose", "a hubcap pops off a flying car and drops", tpl="scene", set="street", mood="dusk", cam=[1, 1.04, 0, 0], figs=[f(X, 0.3, "phone", prop="phone", expr="neutral")], fx=["hubFall"], labels=[lab("LOOSE HUBCAP", 0.5, y=0.08)])
add("slice you", "a spinning hubcap whizzes in, the guy dives away", tpl="scene", set="street", mood="dusk", cam=[1.1, 1.0, 0, 0], figs=[f(X, 0.32, poses=[[0, "phone"], [0.5, "dive"]], expr="shocked", exprs=[[0, "neutral"], [0.5, "shocked"]])], fx=["hubSlice"], labels=[lab("SLICE!", 0.7, c="red", size=90, y=0.22)])
add("So how does", "blueprint: car outline with a big question mark", tpl="board", kind="plan", step=0)
add("No wings.", "blueprint: wings crossed out", tpl="board", kind="plan", step=1)
add("No propellers.", "blueprint: propellers crossed out", tpl="board", kind="plan", step=2)
add("Just ten nozzles", "blueprint: 10 nozzles light up one by one", tpl="board", kind="plan", step=3)
add("like a rocket", "the car with a rocket flame roaring on stage", tpl="scene", set="stage", mood="dusk", cam=[1.15, 1.0, 0, 0], figs=[], fx=["rocketCar", "speed"], labels=[lab("ROCKET + SPORTS CAR", 0.2)])
add("On demo day,", "Texas launch site at dusk, crowd behind barrier", tpl="scene", set="site", cam=[1.0, 1.1, 0, 0], figs=[f(EL, 0.3, "explain", expr="smile", talk=True)], fx=["crowdLaugh"], quiet=True, labels=[lab("DEMO DAY · TEXAS", 0.1)])
add("the car shot", "3D: car blasts off the steel ramp and barrel rolls", tpl="roll3d")
add("and landed on", "the car slams down on its wheels, dust", tpl="scene", set="site", cam=[1.12, 1.0, 0, 0], figs=[], fx=["carGround"], land=True, marks=[dict(k="c", x=0.8, y=0.2, at=0.7)], labels=[lab("STUCK THE LANDING", 0.6, c="good")])
add("Oh, and nobody", "close on the car: the seat is empty", tpl="scene", set="site", cam=[1.25, 1.35, 0, 0], figs=[], fx=["carGround"], empty=True, labels=[lab("NOBODY INSIDE", 0.3)])
add("Elon said that", "Elon giant face, grinning: so we don't kill anyone", tpl="face", c=EL, set="site", expr="smirk", talk=True, bubble=dict(s="SO WE DON'T KILL ANYONE", at=0.2))
add("It goes zero", "speedometer slams 0 to 60 in under a second", tpl="board", kind="speed")
add("Elon admitted", "Elon shrugs, warning sign", tpl="scene", set="site", cam=[1.05, 1.12, 0, 0], figs=[f(EL, 0.42, "shrug", expr="nervous", talk=True)], fx=["warn"], bubble=dict(fig=0, s="NOT EXACTLY SAFE...", at=0.3))
add("and might not", "the car with a NOT LEGAL? stamp", tpl="scene", set="street", mood="dusk", veil=0.3, cam=[1.06, 1.06, 0, 0], figs=[], fx=["carGround", "stamp"], stamp="NOT LEGAL?", stampAt=0.2)
add("The crowd kept", "crowd yelling HOW MUCH?", tpl="scene", set="site", cam=[1.0, 1.08, 0, 0], figs=[], fx=["crowdLaugh"], yell=True)
add("Nobody answered.", "Elon giant face, silent, crickets", tpl="face", c=EL, set="site", expr="thinking", look=[1, 0], fx=["crickets"])
add("Production starts", "calendar 2026 to 2028: production", tpl="board", kind="years", **{"from": 2026, "to": 2028}, sub="PRODUCTION STARTS")
add("So if you", "a guy looks up as the flying car passes overhead", tpl="scene", set="street", mood="golden", cam=[1, 1.06, 0, 0], figs=[f(X, 0.5, "holdFront", expr="awe", look=[0, -1])], fx=["carFly"], carY=0.22)
add("start saving", "piggy bank fills with coins", tpl="scene", set="stage", mood="golden", cam=[1.1, 1.0, 0, 0], figs=[], fx=["piggy"], labels=[lab("START SAVING NOW", 0.2, c="good")])
add("And maybe check", "the car's hubcap wobbling loose, punchline", tpl="scene", set="street", mood="dusk", cam=[1.3, 1.45, 120, 200], figs=[], fx=["carGround"], wobble=True, labels=[lab("CHECK YOUR HUBCAPS", 0.3)])
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
data["music"] = [dict(start=0, end=10, mood="playful", intensity=0.55), dict(start=10, end=26.3, mood="mystery", intensity=0.45),
                 dict(start=26.3, end=36.1, mood="wonder", intensity=0.6), dict(start=36.1, end=50.4, mood="action", intensity=0.8),
                 dict(start=50.4, end=63.6, mood="tension", intensity=0.6), dict(start=63.6, end=T, mood="playful", intensity=0.6)]
for o in data["shots"]:
    fx = o["params"].get("fx", [])
    if "carFly" in fx or "rocketCar" in fx: o["sfx"] = ([dict(at=0.1, name="whoosh", gain=-6)] + o["sfx"])[:3]
    if "hubSlice" in fx: o["sfx"] = [dict(at=0.0, name="swish", gain=-6), dict(at=0.5, name="whoosh", gain=-6), dict(at=0.7, name="pop", gain=-12)]
    if "carGround" in fx and o["params"].get("land"): o["sfx"] = [dict(at=0.5, name="impact", gain=-6), dict(at=0.7, name="blip", gain=-12)]
    if o["params"].get("tpl") == "roll3d": o["sfx"] = [dict(at=0.0, name="riser", gain=-8), dict(at=0.3, name="whoosh", gain=-4), dict(at=1.6, name="whoosh", gain=-6)]
    if o["params"].get("kind") == "speed": o["sfx"] = [dict(at=0.3, name="counter", gain=-10), dict(at=1.3, name="impact", gain=-10)]
    if o["params"].get("kind") == "years": o["sfx"] = [dict(at=0.2, name="counter", gain=-12), dict(at=1.1, name="ding", gain=-12)]
    if "crowdLaugh" in fx: o["amb"] = dict(name="murmur", gain=-18)
    o["in"] = dict(type="cut")
json.dump(data, open(os.path.join(HERE, "story/shots.json"), "w"), ensure_ascii=False, indent=1)
print("sound plan added")
