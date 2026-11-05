// shots/all.js — data-driven shot templates. Every shot in story/shots.json names a template in params.tpl
// (scene | face | tip | board | title | phone | big | trek3d | bench3d | end) and its own parameters.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, ground } from '../sets/sets.js';
import { CAST } from '../cast.js';

const RED = '#ff5a4e';
const ui = () => S().ui;
const P = (n) => (typeof n === 'string' ? POSES[n] || POSES.stand : n);
const fadeIn = (t, a = 0, d = 0.3) => ease.out(prog(t, a, a + d));

// ---------- small props & overlays ----------
function heart(g, x, y, r, c, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = c; g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fill(); g.restore(); glow(g, x, y, r * 2.2, c, 0.25 * a); }
function xMark(g, x, y, r, p) { const k = ease.outBack(p); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); seg(g, [[-r, -r], [r, r]], r * 0.28, RED); seg(g, [[r, -r], [-r, r]], r * 0.28, RED); g.restore(); glow(g, x, y, r * 2, RED, 0.25 * k); }
function check(g, x, y, r, p) { const k = ease.outBack(p); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; seg(g, [[-r, 0], [-r * 0.3, r * 0.7], [r, -r * 0.7]], r * 0.28, ui().good); g.restore(); glow(g, x, y, r * 2, ui().good, 0.25 * k); }
function label(g, str, x, y, a = 1, color, size = V(56, 58)) { text(g, str, x, y, { size, color: color || ui().gold, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(color || ui().gold, 0.5), alpha: a, spacing: 2 }); }
function bigPhone(g, x, y, s, t, o = {}) {
  const w = 300 * s, h = 560 * s; g.save(); glow(g, x, y, w * 1.2, '#9fd8ff', 0.18);
  rr(g, x - w / 2, y - h / 2, w, h, 40 * s); g.fillStyle = '#0c0f12'; g.fill();
  rr(g, x - w / 2 + 14 * s, y - h / 2 + 50 * s, w - 28 * s, h - 100 * s, 14 * s); g.fillStyle = '#121c26'; g.fill();
  text(g, o.clock || '2:00 AM', x, y - h / 2 + 28 * s, { size: 22 * s, color: '#cfe6ff', font: FONTS.ui, weight: 800 });
  let yy = y - h / 2 + 90 * s;
  for (const m of o.msgs || []) { const a = fadeIn(t, m.at, 0.2); if (a <= 0) continue; const bw = Math.min(w - 60 * s, (m.s.length * 13 + 40) * s), bx = m.me ? x + w / 2 - 24 * s - bw : x - w / 2 + 24 * s;
    g.globalAlpha = a; rr(g, bx, yy, bw, 52 * s, 22 * s); g.fillStyle = m.me ? '#f08a24' : '#2c3b48'; g.fill(); g.globalAlpha = 1;
    text(g, m.s, bx + bw / 2, yy + 27 * s, { size: 22 * s, color: '#fff', font: FONTS.ui, weight: 800, alpha: a }); yy += 66 * s; }
  g.restore();
}
function barbell(g, x, y, s) { seg(g, [[x - 120 * s, y], [x + 120 * s, y]], 8 * s, '#c8ccd2'); for (const d of [-1, 1]) { rr(g, x + d * 100 * s - 14 * s, y - 50 * s, 28 * s, 100 * s, 6 * s); g.fillStyle = '#16181c'; g.fill(); rr(g, x + d * 128 * s - 10 * s, y - 36 * s, 20 * s, 72 * s, 5 * s); g.fill(); } }
function laptop(g, x, y, s, t) { poly(g, [[x - 110 * s, y], [x + 110 * s, y], [x + 130 * s, y + 14 * s], [x - 130 * s, y + 14 * s]], '#20262c'); rr(g, x - 100 * s, y - 150 * s, 200 * s, 145 * s, 8 * s); g.fillStyle = '#20262c'; g.fill(); g.fillStyle = '#7fd0ff'; g.fillRect(x - 90 * s, y - 140 * s, 180 * s, 125 * s); glow(g, x, y - 80 * s, 200 * s, '#7fd0ff', 0.35); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(10,30,50,.6)'; g.fillRect(x - 76 * s, y - 126 * s + i * 22 * s, (60 + ((i * 37 + Math.floor(t * 6)) % 90)) * s, 8 * s); } }
function guitar(g, x, y, s) { g.save(); g.translate(x, y); g.rotate(-0.5); g.fillStyle = '#b5652a'; g.beginPath(); g.ellipse(0, 0, 60 * s, 46 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-56 * s, 0, 42 * s, 34 * s, 0, 0, 7); g.fill(); circle(g, -20 * s, 0, 14 * s, '#2a160c'); g.fillStyle = '#3a2412'; g.fillRect(40 * s, -7 * s, 170 * s, 14 * s); g.restore(); }
function bike(g, x, y, s, t, c = '#2a2f36') { for (const d of [-1, 1]) { ring(g, x + d * 110 * s, y - 50 * s, 50 * s, 12 * s, '#0c0e10'); for (let k = 0; k < 4; k++) { const a = k * 0.8 - t * 14; seg(g, [[x + d * 110 * s, y - 50 * s], [x + d * 110 * s + Math.cos(a) * 44 * s, y - 50 * s + Math.sin(a) * 44 * s]], 2 * s, '#5a6068'); } }
  poly(g, [[x - 110 * s, y - 50 * s], [x - 30 * s, y - 120 * s], [x + 70 * s, y - 120 * s], [x + 110 * s, y - 50 * s], [x + 20 * s, y - 70 * s]], c); seg(g, [[x + 70 * s, y - 120 * s], [x + 95 * s, y - 165 * s]], 8 * s, '#1a1d22'); glow(g, x + 150 * s, y - 110 * s, 90 * s, '#fff2c0', 0.35); }
function bulb(g, x, y, r, a) { glow(g, x, y, r * 3, '#ffe27a', 0.5 * a); circle(g, x, y, r, alpha('#fff2a8', a)); rr(g, x - r * 0.4, y + r * 0.8, r * 0.8, r * 0.5, 4); g.fillStyle = alpha('#8a8f99', a); g.fill(); }
function money(g, x, y, s) { for (let i = 0; i < 6; i++) { rr(g, x - 60 * s, y - i * 14 * s, 120 * s, 12 * s, 3 * s); g.fillStyle = i % 2 ? '#3aa860' : '#2f8f50'; g.fill(); } glow(g, x, y - 40 * s, 120 * s, '#7dffb0', 0.2); }
function polaroid(g, x, y, s, rot, c) { g.save(); g.translate(x, y); g.rotate(rot); rr(g, -60 * s, -70 * s, 120 * s, 140 * s, 4); g.fillStyle = '#f2efe6'; g.fill(); g.fillStyle = c; g.fillRect(-50 * s, -60 * s, 100 * s, 95 * s); g.restore(); }
function calendar(g, x, y, s, str, a = 1) { g.save(); g.globalAlpha *= a; rr(g, x - 110 * s, y - 120 * s, 220 * s, 240 * s, 16 * s); g.fillStyle = '#f2efe6'; g.fill(); rr(g, x - 110 * s, y - 120 * s, 220 * s, 60 * s, 16 * s); g.fillStyle = RED; g.fill(); text(g, str, x, y + 30 * s, { size: 64 * s, color: '#1a1a1a', font: FONTS.ui, weight: 900 }); g.restore(); }
function fire(g, x, y, r, t) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; glow(g, x + Math.sin(i * 2 + t * 5) * r * 0.2, y - ph * r * 1.2, r * (0.6 - ph * 0.4), i % 2 ? '#ff7a2e' : '#ffd45a', 0.6 * (1 - ph)); } g.restore(); }

// extras: drawn in front of the set (pre) or on top of everything (post)
const EX = {
  hearts: { post(g, t, c) { const r = rng(4); for (let i = 0; i < 7; i++) { const ph = (t * 0.35 + r()) % 1; heart(g, c.figs[c.o.heartsOn ?? 0].x + (r() - 0.5) * 260, c.GY - 420 - ph * 300, 16 + r() * 12, '#ff5a8a', Math.sin(ph * Math.PI)); } } },
  clock: { post(g, t, c) { FX.clock(g, E.W - V(220, 200), V(220, 260), 70, (c.o.clockAt || 2) * 3600 + t * 30, { face: '#e9e2ea' }); } },
  barbell: { held: (g, t, f) => barbell(g, f.x, f.y - 300 * f.s - Math.abs(Math.sin(t * 2.6)) * 80 * f.s, f.s) },
  laptop: { pre(g, t, c) { const f0 = c.figs[0]; g.save(); g.translate(f0.x, 0); FX.chair(g, -18 * f0.s, c.GY, f0.s, '#14201a'); g.restore(); laptop(g, c.figs[0].x + 150 * c.figs[0].s, c.GY - 150, 1.0, t); } },
  guitar: { held: (g, t, f) => guitar(g, f.x + 10 * f.facing * f.s, f.y - 115 * f.s, f.s * 0.8) },
  bike: { pre(g, t, c) { bike(g, c.CX, c.GY, 1.4, t, '#d84a2a'); } },
  money: { pre(g, t, c) { money(g, c.figs[0].x + 150, c.GY, 1.3); money(g, c.figs[0].x - 160, c.GY, 1.1); } },
  bulb: { post(g, t, c) { const f = c.figs[c.o.bulbOn ?? 0]; bulb(g, f.x, f.y - 470 * f.s, 34, fadeIn(t, c.o.bulbAt ?? 0.4)); } },
  fire: { post(g, t, c) { for (const d of [-1, 1]) { const x = E.W / 2 + d * c.o.fr * 0.3, y = E.H * V(0.62, 0.55) - c.o.fr * 0.12; glow(g, x, y, c.o.fr * 0.5, '#ff7a2e', 0.5); fire(g, x, y + 20, 110, t); } } },
  polaroids: { post(g, t, c) { ['#f0a050', '#5ab0e0', '#e05a8a'].forEach((col, i) => { const a = fadeIn(t, 0.2 + i * 0.35); polaroid(g, E.W * (0.16 + i * 0.07) , E.H * (0.3 + i * 0.18) - a * 20, 1.1, -0.2 + i * 0.15, col); polaroid(g, E.W * (0.84 - i * 0.07), E.H * (0.3 + i * 0.18) - a * 20, 1.1, 0.2 - i * 0.15, ['#7dffb0', '#ffd45a', '#c08ae0'][i]); }); } },
  crowdPhones: { pre(g, t, c) { const r = rng(9); for (let i = 0; i < 9; i++) { const x = E.W * (0.06 + i * 0.11) + (r() - 0.5) * 40; if (c.o.skip?.includes(i)) continue; drawFigure(g, { x, y: c.GY - 10, s: 1.3, facing: r() > 0.5 ? 1 : -1, outfit: { top: 'tshirt', color: shade('#56606a', (r() - 0.5) * 0.4), head: r() > 0.6 ? 'ponytail' : 'none' }, pose: breathe(POSES.phone, t, 1, i), prop: 'phone', expr: 'neutral', dim: 0.5, rim: { color: c.M.rim, dir: [0, -1], w: 2 } }); } } },
  doubters: { pre(g, t, c) { [0.12, 0.25, 0.75, 0.88].forEach((fx, i) => { drawFigure(g, { x: E.W * fx, y: c.GY, s: 1.5, facing: fx < 0.5 ? 1 : -1, outfit: { top: 'tshirt', color: '#4a525a', head: i % 2 ? 'cap' : 'none', headColor: '#2a2a2a' }, pose: breathe(i % 2 ? POSES.crossArms : POSES.shrug, t, 1, i), expr: 'frown', dim: 0.35, rim: { color: c.M.rim, dir: [0, -1], w: 2 } });
      const a = fadeIn(t, 0.3 + i * 0.25); if (a > 0) { g.save(); g.globalAlpha = a; UI.bubble(g, E.W * fx, c.GY - 470, { w: 150, h: 66, str: 'NO WAY', color: '#f4d0cc' }); g.restore(); } }); } },
  rain: { post(g, t) { FX.rain(g, t, { a: 0.4 }); } },
  speed: { post(g, t) { FX.speedLines(g, t, { a: 0.18 }); } },
  ring: { pre(g, t, c) { const f = c.figs[0]; const k = fadeIn(t, 0.2, 0.6); glow(g, f.x, f.y - 160, 330 * k, c.M.rim, 0.18); ring(g, f.x, f.y - 160, 300 * k, 4, alpha(c.M.rim, 0.6)); } },
  aura: { pre(g, t, c) { const f = c.figs[0]; glow(g, f.x, f.y - 180, 260 + Math.sin(t * 8) * 20, RED, 0.25); } },
  mirror: { pre(g, t, c) { const x = E.W * 0.66, y = c.GY; rr(g, x - 150, y - 560, 300, 520, 150); g.fillStyle = '#1a2a32'; g.fill(); ring(g, x, y - 300, 0, 0, '#000'); g.strokeStyle = '#d8c080'; g.lineWidth = 10; rr(g, x - 150, y - 560, 300, 520, 150); g.stroke();
      g.save(); rr(g, x - 140, y - 550, 280, 500, 140); g.clip(); const k = fadeIn(t, 0.6, 1); glow(g, x, y - 300, 260, '#ffe7a0', 0.4 * k); drawFigure(g, { x, y: y - 60, s: 1.45, facing: -1, outfit: CAST.MEERA, pose: breathe(POSES.cheer, t), expr: 'joy', rim: { color: '#ffe7a0', dir: [0, -1], w: 5 } }); g.restore(); for (let i = 0; i < 6; i++) FX.sparkle(g, x - 120 + i * 50, y - 500 + (i % 3) * 140, 18 * k, '#fff2c0', k); } },
  stamp: { post(g, t, c) { const k = ease.outBack(prog(t, c.o.stampAt ?? 0.4, (c.o.stampAt ?? 0.4) + 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, E.H * 0.42); g.rotate(-0.12); g.scale(k, k); g.strokeStyle = RED; g.lineWidth = 10; rr(g, -330, -90, 660, 180, 20); g.stroke(); text(g, c.o.stamp, 0, 4, { size: 120, color: RED, font: FONTS.ui, weight: 900, spacing: 8 }); g.restore(); } },
  sunrise: { pre(g, t, c) { FX.sun(g, E.W * 0.7, c.GY - 120 - t * 20, 80, '#fff3dc', '#ffb070', 6); } },
};

// ---------- figures ----------
function figs(g, t, info, c) {
  const out = [];
  (info.figs || []).forEach((f, i) => {
    const s = (f.s || 1) * V(1.9, 2.3), x = E.W * f.x + (f.dx ? f.dx * t : 0), y = c.GY + (f.dy || 0);
    let pose = f.poses ? posesAt(t, f.poses.map(([a, p]) => [a, P(p)])) : P(f.pose || 'stand');
    if (f.walk) pose = walkPose(t * (f.walk || 1.6), { run: f.run });
    const expr = f.exprs ? f.exprs.reduce((e, [a, x]) => (t >= a ? x : e), f.expr) : f.expr;
    const talk = f.talk ? (0.5 + 0.5 * Math.sin(t * 15)) * (t > (f.talkFrom || 0) && t < (f.talkTo || 99) ? 1 : 0) : 0;
    const d = { x, y, s, facing: f.f || 1, outfit: CAST[f.c] || CAST.EXTRA, pose: f.walk ? pose : breathe(pose, t, 1, i), expr: expr || 'neutral', talk, look: f.look, prop: f.prop, dim: f.dim, rot: f.rot,
      blink: ((t + i * 0.7) % 3.4) > 3.3, rim: { color: f.rimC || c.M.rim, dir: f.rimDir || [0, -1], w: 4 } };
    out.push(d);
  });
  c.figs = out;
  for (const n of info.fx || []) EX[n]?.pre?.(g, t, c);
  out.forEach((d, i) => { drawFigure(g, d); for (const n of info.fx || []) if (EX[n]?.held && (info.heldBy ?? 0) === i) EX[n].held(g, t, d); });
}
function overlays(g, t, info, c) {
  for (const n of info.fx || []) EX[n]?.post?.(g, t, c);
  if (info.bubble) { const b = info.bubble, f = c.figs[b.fig || 0], a = fadeIn(t, b.at ?? 0.2); if (a > 0 && f) { g.save(); g.globalAlpha = a; const w = Math.max(200, b.s.length * 26 + 70); const [hx, hy, hr] = headPos(f); const bx = clamp(hx + (b.dx ?? 0.7 * w) * (f.facing || 1) * 0.6, w / 2 + 20, E.W - w / 2 - 20); UI.bubble(g, bx, hy - hr - 120, { w: Math.min(w, E.W - 40), h: 90, str: b.s }); g.restore(); } }
  for (const L of info.labels || []) { const a = fadeIn(t, L.at ?? 0.2) * clamp(((L.out ?? 99) - t) / 0.2); if (a > 0) label(g, L.s, E.W * (L.x ?? 0.5), E.H * (L.y ?? 0.16), a, L.c === 'red' ? RED : L.c === 'good' ? ui().good : L.c === 'cream' ? ui().cream : undefined, L.size); }
  for (const m of info.marks || []) { const p = prog(t, m.at ?? 0.4, (m.at ?? 0.4) + 0.3); (m.k === 'x' ? xMark : check)(g, E.W * m.x, E.H * m.y, m.r || 70, p); }
}
function camOf(info, t) { const [z0, z1, x0, x1, y0, y1] = info.cam || [1, 1.06, 0, -30, 0, 0]; const k = ease.inOut(clamp(t / info.dur)); return { z: lerp(z0, z1, k), x: lerp(x0, x1, k), y: lerp(y0 || 0, y1 || 0, k) }; }

// ---------- templates ----------
const TPL = {
  scene(g, t, info) {
    const cam = camOf(info, t), set = SETS[info.set || 'street'];
    const r = set(g, t, cam, { mood: info.mood, clock: info.clock, rain: info.rain, stalls: info.stalls });
    const c = { ...r, o: info };
    layer(g, cam, 1, (g) => figs(g, t, info, c));
    if (info.dust !== false) FX.dust(g, t, { count: 30, color: r.M.practical, a: 0.3 });
    if (info.veil) veil(g, '#000', info.veil);
    overlays(g, t, info, c);
  },
  face(g, t, info) {
    const set = SETS[info.set || 'street'];
    let M; blurLayer(g, 14, (g) => { M = set(g, t, { z: 1.4, x: info.bgx || -120, y: -120 }, { mood: info.mood, rain: info.rain, stalls: info.stalls }).M; }); veil(g, '#06110c', 0.35);
    const r = V(300, 330) * (1 + 0.05 * t / Math.max(1, info.dur) * 2), cx = E.W * (info.fxp || 0.5);
    const expr = info.exprs ? info.exprs.reduce((e, [a, x]) => (t >= a ? x : e), info.expr) : info.expr;
    const talk = info.talk ? 0.5 + 0.5 * Math.sin(t * 15) : 0;
    bigFace(g, cx, E.H * V(0.62, 0.55), r, { outfit: CAST[info.c], expr: expr || 'neutral', talk, look: info.look || [0, 0], rimColor: M.rim, rimSide: info.side || -1, blink: (t % 3.2) > 3.1, tilt: info.tilt || 0 });
    const c = { GY: ground(), M, figs: [{ x: cx, y: E.H * 0.9, s: 2, facing: 1 }], o: { ...info, fr: r } };
    if (info.fx) for (const n of info.fx) EX[n]?.post?.(g, t, c);
    if (info.bubble) { const a = fadeIn(t, info.bubble.at ?? 0.2); if (a > 0) { g.save(); g.globalAlpha = a; const w = Math.max(220, info.bubble.s.length * 30 + 80); UI.bubble(g, E.vertical ? E.W / 2 : cx + (info.bubble.side || 1) * (r + w * 0.35), E.vertical ? E.H * 0.3 : E.H * 0.22, { w: Math.min(w, E.W * 0.9), h: 100, str: info.bubble.s }); g.restore(); } }
    for (const L of info.labels || []) { const a = fadeIn(t, L.at ?? 0.2); if (a > 0) label(g, L.s, E.W * (L.x ?? 0.5), E.H * (L.y ?? 0.14), a, L.c === 'red' ? RED : L.c === 'good' ? ui().good : undefined, L.size); }
    FX.dust(g, t, { count: 25, color: M.practical, a: 0.3 });
  },
  tip(g, t, info) {
    const set = SETS[info.set || 'stage']; let M;
    blurLayer(g, 10, (g) => { M = set(g, t, { z: 1.1 + 0.05 * t, x: 0, y: 0 }, { mood: info.mood }).M; }); veil(g, '#041009', 0.45);
    const k = ease.outBack(prog(t, 0.05, 0.5)), u = ui();
    g.save(); g.translate(E.W * 0.3, E.H * 0.5); g.scale(k, k);
    ring(g, 0, 0, 170, 10, u.accent); glow(g, 0, 0, 300, u.accent, 0.3);
    text(g, String(info.n), 0, 8, { size: 240, color: u.accent, font: FONTS.title, weight: 700, glow: 30, glowColor: alpha(u.accent, 0.7) });
    g.restore();
    const a = fadeIn(t, 0.35, 0.4);
    text(g, 'TIP ' + info.n + ' OF 6', E.W * 0.47, E.H * 0.4, { size: 44, color: u.sub || u.text, font: FONTS.ui, weight: 900, align: 'left', alpha: a, spacing: 6 });
    (info.title || []).forEach((ln, i) => text(g, ln, E.W * 0.47 + (1 - a) * 40, E.H * 0.52 + i * 96, { size: 92, color: u.gold, font: FONTS.title, weight: 700, align: 'left', alpha: a, glow: 20, glowColor: alpha(u.gold, 0.4) }));
    FX.dust(g, t, { count: 40, color: M.practical, a: 0.35 });
  },
  title(g, t, info) {
    const M = mood(info.mood || 'dusk'), cam = { z: 1.06 - 0.06 * ease.inOut(t / info.dur), y: -15 * t };
    layer(g, cam, 0.2, (g) => { backdrop(g, M.sky); FX.sun(g, E.W / 2, E.H * 0.62, 90, '#fff3dc', M.key, 5); FX.godRays(g, E.W / 2, E.H * 0.62, { count: 14, angle: -Math.PI / 2, spread: Math.PI * 1.6, len: 1800, a: 0.06, t }); });
    layer(g, cam, 0.5, (g) => FX.skyline(g, { x: -200, y: E.H * 0.74, w: E.W + 400, maxH: 300, color: shade(M.dark, 0.1), windowColor: alpha(M.practical, 0.8), seed: 21 }));
    layer(g, cam, 0.8, (g) => { g.fillStyle = M.dark; g.fillRect(-E.W, E.H * 0.74, E.W * 3, E.H); });
    if (info.figs) { const c = { GY: E.H * 0.8, M, o: info }; layer(g, cam, 1, (g) => figs(g, t, info, c)); }
    FX.dust(g, t, { count: 30, color: M.practical, a: 0.4 });
    UI.titleCard(g, t, { lines: info.lines, sub: info.sub, dur: info.dur + 0.6, y: E.H * (info.ty || 0.36) });
    for (const m of info.marks || []) xMark(g, E.W * m.x, E.H * m.y, m.r || 70, prog(t, m.at, m.at + 0.3));
  },
  phone(g, t, info) {
    const set = SETS[info.set || 'bedroom']; let M;
    blurLayer(g, 16, (g) => { M = set(g, t, { z: 1.5, x: 0, y: -80 }, { mood: info.mood, clock: 2 }).M; }); veil(g, '#020806', 0.5);
    const s = 1.35 + 0.05 * t / info.dur; bigPhone(g, E.W / 2, E.H * 0.52 + (1 - fadeIn(t, 0, 0.4)) * 60, s, t, info);
    for (const L of info.labels || []) { const a = fadeIn(t, L.at ?? 0.2); if (a > 0) label(g, L.s, E.W * (L.x ?? 0.5), E.H * (L.y ?? 0.1), a, undefined, L.size); }
    if (info.typing) { for (let i = 0; i < 3; i++) circle(g, E.W / 2 - 30 + i * 30, E.H * 0.9, 9, alpha('#cfe6ff', 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + i)))); }
  },
  big(g, t, info) {
    const M = mood(info.mood || 'void'); backdrop(g, [M.dark, shade(M.dark, 0.1)]); glow(g, E.W / 2, E.H / 2, 800, M.rim, 0.12);
    const k = ease.outBack(prog(t, 0.05, 0.4));
    (info.lines || []).forEach((ln, i) => text(g, ln, E.W / 2, E.H * ((info.secret ? 0.24 : 0.42) + i * 0.13), { size: (info.size || 130) * (i ? 0.6 : 1) * k, color: i ? ui().cream : ui().gold, font: FONTS.title, weight: 700, glow: 24, glowColor: alpha(ui().gold, 0.5) }));
    if (info.skip) { const a = fadeIn(t, 0.5); g.save(); g.globalAlpha = a; rr(g, E.W * 0.72, E.H * 0.78, 240, 80, 10); g.fillStyle = 'rgba(0,0,0,.6)'; g.fill(); text(g, 'Skip ▸▸', E.W * 0.72 + 120, E.H * 0.78 + 42, { size: 40, color: '#fff', font: FONTS.ui, weight: 800 }); g.restore(); xMark(g, E.W * 0.72 + 120, E.H * 0.78 + 40, 60, prog(t, 0.8, 1.1)); }
    if (info.secret) { const a = fadeIn(t, 0.1, 0.6); const x = E.W / 2, y = E.H * 0.72; rr(g, x - 130, y - 70, 260, 150, 14); g.fillStyle = '#3a2a18'; g.fill(); const open = info.open ? ease.out(prog(t, 0.5, 1.2)) : 0; g.save(); g.translate(x - 130, y - 70); g.rotate(-open * 0.9); rr(g, 0, -40, 260, 50, 10); g.fillStyle = '#5a3e22'; g.fill(); g.restore(); glow(g, x, y - 70, 260 * (0.4 + open), '#ffe27a', 0.5 * a); circle(g, x, y + 10, 18, '#ffd45a'); if (!info.open) text(g, '?', x, y - 150, { size: 120, color: ui().gold, font: FONTS.title, alpha: a, glow: 20 }); else FX.godRays(g, x, y - 70, { count: 10, angle: -Math.PI / 2, spread: 1.4, len: 900, a: 0.1 * open, t }); }
    FX.dust(g, t, { count: 40, color: M.practical, a: 0.35 });
  },
  board(g, t, info) { UI.blueprint(g); BOARD[info.kind](g, t, info, UI.bpStroke(), ui()); },
  end(g, t, info) { UI.endScreen(g, t, { question: info.q, cast: [CAST.ARJUN, CAST.MEERA], moodColors: ['#03100c', '#0a2a20', '#164a36'], rim: '#c6ff3d' }); },
};

// ---------- blueprint diagrams ----------
const lf = (g, x, y, s, pose, color, facing = 1) => UI.lineFigure(g, { x, y, s, pose: P(pose), color, facing });
const T = (g, s, x, y, o = {}) => text(g, s, x, y, { size: 44, font: FONTS.ui, weight: 900, color: o.c, alpha: o.a ?? 1, align: o.align || 'center', spacing: 2 });
const BOARD = {
  orbit(g, t, o, bp, u) { const cx = E.W / 2, cy = E.H * 0.55; ring(g, cx, cy, 320, 3, alpha(bp, 0.5)); lf(g, cx, cy + 110, 1.1, 'stand', '#ff8ac0'); T(g, 'HER', cx, cy + 160, { c: '#ff8ac0' }); const a = t * 1.6; lf(g, cx + Math.cos(a) * 320, cy + Math.sin(a) * 320 * 0.6 + 100, 0.8, 'reach', u.gold); T(g, 'YOUR WHOLE LIFE REVOLVES AROUND HER', cx, E.H * 0.12, { c: u.gold, a: fadeIn(t, 0.3) }); },
  world(g, t, o, bp, u) { const items = ['GYM', 'FRIENDS', 'CAREER', 'HOBBIES', 'GOALS']; const cx = E.W * 0.3, cy = E.H * 0.6; lf(g, cx, cy + 120, 1.2, 'sad', u.gold); items.forEach((s, i) => { const k = ease.in(prog(t, 0.5 + i * 0.5, 1.0 + i * 0.5)); const x = E.W * 0.62, y = E.H * (0.22 + i * 0.13) + k * 60; T(g, s, x, y, { c: bp, a: 1 - k }); seg(g, [[x - 120, y], [x + 120, y]], 3, alpha(RED, k > 0.05 ? 0.8 * (1 - k) : 0)); }); lf(g, E.W * 0.85, cy + 120, 1.2, 'stand', '#ff8ac0', -1); T(g, 'NOTHING LEFT TO DISCOVER', E.W / 2, E.H * 0.1, { c: u.gold, a: fadeIn(t, o.capAt ?? 2.8) }); },
  equation(g, t, o, bp, u) { const y = E.H * 0.5; const parts = [['ATTRACTION', u.gold, 0.1], ['=', bp, 0.6], ['MYSTERY', u.accent, 0.9], ['+', bp, o.depthAt - 0.3], ['DEPTH', u.good, o.depthAt]]; let x = E.W * 0.1; parts.forEach(([s, c, at]) => { const w = s.length * 34 + 60; text(g, s, x + w / 2, y, { size: 72, font: FONTS.title, weight: 700, color: c, alpha: fadeIn(t, at), glow: 14, glowColor: alpha(c, 0.4) }); x += w; }); const a = fadeIn(t, 0.9); text(g, '?', E.W * 0.55, y - 170 + Math.sin(t * 3) * 10, { size: 140, color: u.accent, font: FONTS.title, alpha: a * 0.7 }); },
  iceberg(g, t, o, bp, u) { const cx = E.W / 2, wy = E.H * 0.42; seg(g, [[0, wy], [E.W, wy]], 3, alpha(bp, 0.7)); poly(g, [[cx - 120, wy], [cx, wy - 160], [cx + 140, wy]], alpha(bp, 0.5)); const k = ease.out(prog(t, 0.3, 1.5)); poly(g, [[cx - 120, wy], [cx + 140, wy], [cx + 320, wy + 300 * k], [cx + 60, wy + 520 * k], [cx - 300, wy + 360 * k]], alpha(u.good, 0.35)); T(g, 'WHAT SHE SEES', cx + 260, wy - 80, { c: bp, align: 'left' }); T(g, 'DEPTH', cx, wy + 260 * k, { c: u.good, a: k }); },
  calendar(g, t, o, bp, u) { const n = Math.floor(clamp(t / 0.9) * 3); calendar(g, E.W * 0.3, E.H * 0.52, 1.6, ['MON', 'TUE', 'WED', 'THU'][n]); T(g, '3 DAYS AGO SHE SAID...', E.W * 0.66, E.H * 0.35, { c: u.gold }); const a = fadeIn(t, 0.9); g.save(); g.globalAlpha = a; UI.bubble(g, E.W * 0.66, E.H * 0.55, { w: 560, h: 100, str: "MOM'S DOCTOR VISIT", color: '#f4efe6' }); g.restore(); T(g, 'REMEMBER IT', E.W * 0.66, E.H * 0.76, { c: u.good, a: fadeIn(t, 2) }); },
  curve(g, t, o, bp, u) { const x0 = E.W * 0.18, y0 = E.H * 0.8, w = E.W * 0.64, h = E.H * 0.55; seg(g, [[x0, y0 - h], [x0, y0], [x0 + w, y0]], 3, bp); T(g, 'CLOSENESS', x0 - 20, y0 - h - 30, { c: bp, align: 'left' }); T(g, 'NEW + EXCITING THINGS TOGETHER', x0 + w / 2, y0 + 60, { c: bp }); const k = ease.inOut(prog(t, 0.3, Math.min(info_dur(o) - 0.3, 3))); g.strokeStyle = u.gold; g.lineWidth = 8; g.beginPath(); for (let i = 0; i <= 40 * k; i++) { const f = i / 40; g.lineTo(x0 + f * w, y0 - h * Math.pow(f, 1.8) * 0.95); } g.stroke(); g.strokeStyle = alpha(bp, 0.6); g.lineWidth = 4; g.setLineDash([12, 12]); g.beginPath(); for (let i = 0; i <= 40 * k; i++) { const f = i / 40; g.lineTo(x0 + f * w, y0 - h * 0.15 * f); } g.stroke(); g.setLineDash([]); T(g, 'SAME OLD ROUTINE', x0 + w * k, y0 - h * 0.15 * k - 40, { c: bp, a: k, align: 'right' }); lf(g, E.W * 0.86, E.H * 0.5, 0.9, 'pointUp', u.gold, -1); },
  scale(g, t, o, bp, u) { const cx = E.W / 2, cy = E.H * 0.42, k = Math.sin(t * 2) * 0.02 * (1 - clamp(t / 1.5)); seg(g, [[cx, cy], [cx, E.H * 0.82]], 6, bp); poly(g, [[cx - 80, E.H * 0.84], [cx + 80, E.H * 0.84], [cx, E.H * 0.78]], bp); g.save(); g.translate(cx, cy); g.rotate(k); seg(g, [[-420, 0], [420, 0]], 6, bp); for (const d of [-1, 1]) { seg(g, [[d * 420, 0], [d * 420, 140]], 2, bp); rr(g, d * 420 - 150, 140, 300, 20, 6); g.fillStyle = bp; g.fill(); } g.restore(); T(g, 'WORDS', cx - 420, cy + 110, { c: u.gold }); T(g, 'ACTIONS', cx + 420, cy + 110, { c: u.good }); text(g, '=', cx, cy - 80, { size: 120, color: u.gold, font: FONTS.title, alpha: fadeIn(t, 0.6) }); },
  notOnly(g, t, o, bp, u) { const a1 = fadeIn(t, 0.2), a2 = fadeIn(t, o.at2 ?? 2); T(g, 'WHO HE IS', E.W * 0.28, E.H * 0.3, { c: bp, a: a1 }); lf(g, E.W * 0.28, E.H * 0.72, 1.2, 'stand', bp); if (o.strike) seg(g, [[E.W * 0.28 - 170, E.H * 0.3], [E.W * 0.28 + 170, E.H * 0.3]], 6, alpha(RED, fadeIn(t, o.strike))); T(g, 'WHO SHE BECOMES WITH HIM', E.W * 0.68, E.H * 0.3, { c: u.gold, a: a2 }); g.save(); g.globalAlpha = a2; lf(g, E.W * 0.62, E.H * 0.72, 1.2, 'stand', bp); lf(g, E.W * 0.74, E.H * 0.72, 1.2, 'cheer', u.gold, -1); g.restore(); glow(g, E.W * 0.74, E.H * 0.55, 220, u.gold, 0.25 * a2); },
};
const info_dur = (o) => o.dur || 3;

// ---------- 3D ----------
const T3 = {

  roll3d: {
    init(T3k) { const M = mood('dusk'); const st = T3k.stage({ mood: 'dusk', fov: V(40, 58), fog: [20, 90], keyPos: [-10, 12, 8], keyIntensity: 2.6, ambient: 1.2 });
      st.add(T3k.ground(300, 300, M.floor || '#2a2018'));
      // rocket launch site: rocket + tower in the distance
      st.add(T3k.cyl(1.2, 1.2, 22, '#e8ecef', -18, 11, -30, 20), T3k.cone(1.2, 4, '#e8ecef', -18, 24, -30, 20), T3k.box(2, 26, 2, '#20262c', -15.5, 13, -30));
      for (let i = 0; i < 8; i++) st.add(T3k.building(6, 3 + (i % 3), 5, { color: '#2a2230', win: M.practical, lit: 0.5, seed: i }).translateX(-40 + i * 11).translateZ(-50));
      // steel ramp
      const ramp = T3k.box(3, 0.2, 9, '#8a96a2', 0, 1.2, 4); ramp.rotation.x = -0.28; st.add(ramp);
      // the car: body, cabin, wheels, 10 glowing nozzles
      const car = new T3k.THREE.Group();
      car.add(T3k.box(1.9, 0.45, 4.2, '#c41d27', 0, 0.55, 0), T3k.box(1.6, 0.42, 2.0, '#16181c', 0, 0.98, -0.2));
      for (const [x, z] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) { const w = T3k.cyl(0.38, 0.38, 0.3, '#0c0e10', x, 0.38, z, 18); w.rotation.z = Math.PI / 2; car.add(w); }
      const nozzles = []; for (let i = 0; i < 10; i++) { const x = -0.75 + (i % 5) * 0.375, z = i < 5 ? 1.5 : -1.5; const n = T3k.cone(0.12, 0.35, '#ffd27a', x, 0.15, z, 10); n.rotation.x = Math.PI; car.add(n); const sh = T3k.shaft(0.25, 0.9, '#bfe8ff', 0.1); sh.position.set(x, -0.3, z); car.add(sh); nozzles.push(sh); }
      st.add(car);
      const crowd = T3k.crowd3D({ rows: 3, perRow: 40, width: 40, z0: 18, colors: ['#3a3358', '#4a4068', '#2e2a48'] }); st.add(crowd);
      return { stage: st, car, nozzles }; },
    draw(s, t, info, T3k) {
      const k = clamp(t / info.dur); const z = lerp(14, -26, k), y = 1.4 + Math.sin(Math.PI * clamp((k - 0.15) / 0.75)) * 9;
      s.car.position.set(0, y, z); s.car.rotation.z = ease.inOut(clamp((k - 0.3) / 0.45)) * Math.PI * 2; s.car.rotation.x = -0.15 * Math.sin(Math.PI * k);
      s.nozzles.forEach((n, i) => (n.material.opacity = 0.06 + 0.08 * Math.abs(Math.sin(t * 30 + i))));
      const cam = s.stage.camera; cam.position.set(7 - 3 * k, y + 0.6 - 0.8 * k, z + 9); cam.lookAt(0, y + 0.8, z - 2); cam.fov = V(42, 62); cam.updateProjectionMatrix();
    },
    overlay(g, t, info) { label(g, 'BARREL ROLL', E.W / 2, E.H * 0.14, fadeIn(t, 0.3)); },
  },
  trek3d: {
    init(T3k) { const M = mood('golden'); const st = T3k.stage({ mood: 'golden', fov: 40, fog: [18, 70], keyPos: [12, 6, -10], keyIntensity: 3, ambient: 1.2 });
      st.add(T3k.ground(200, 200, M.floor || '#1a3a28'));
      for (let i = 0; i < 16; i++) { const h = 5 + (i % 4) * 2.5; st.add(T3k.cone(6 + (i % 3) * 2, h, i % 2 ? '#14281e' : '#1c3428', -60 + i * 8, h / 2 - 0.5, -42 - (i % 3) * 6, 6)); }
      for (let i = 0; i < 8; i++) st.add(T3k.pine3D(i < 4 ? -14 + i * 1.6 : 8 + i * 1.6, -8 - (i % 3) * 2, 0.5 + (i % 3) * 0.15, '#0e2018'));
      const sun = T3k.sphere(3, '#fff1c8', 0, 2, -70); st.add(sun);
      const a = T3k.figure3D(CAST.ARJUN, { rim: M.rim, pose: POSES.pointUp }); a.position.set(-0.6, 0, 0); a.rotation.y = Math.PI / 2; st.add(a);
      const m = T3k.figure3D(CAST.MEERA, { rim: M.rim, pose: POSES.cheer }); m.position.set(0.6, 0, 0); m.rotation.y = Math.PI / 2; st.add(m);
      return { stage: st, sun }; },
    draw(s, t, info, T3k) { s.sun.position.y = 2 + t * 0.8; T3k.dolly(s.stage.camera, t, [[0, { pos: [-1.5, 1.2, 6.5], look: [0, 1.6, -10], fov: 50 }], [info.dur, { pos: [1.5, 1.5, 5], look: [0, 2.0, -10], fov: 46 }]]); },
    overlay(g, t, info) { label(g, 'SUNRISE TREK', E.W / 2, E.H * 0.14, fadeIn(t, 0.3)); },
  },
  bench3d: {
    init(T3k) { const M = mood('night'); const st = T3k.stage({ mood: 'night', fov: 38, fog: [10, 40], keyPos: [3, 6, 4], keyIntensity: 2.8, ambient: 1.6 });
      st.add(T3k.ground(80, 80, '#0c1a14'));
      st.add(T3k.box(2.2, 0.08, 0.6, '#3a2a1e', 0, 0.48, 0), T3k.box(2.2, 0.5, 0.06, '#3a2a1e', 0, 0.8, -0.3), T3k.box(0.08, 0.48, 0.5, '#1a1410', -1, 0.24, 0), T3k.box(0.08, 0.48, 0.5, '#1a1410', 1, 0.24, 0));
      st.add(T3k.cyl(0.06, 0.08, 4, '#15121c', 1.8, 2, -0.4)); const lamp = T3k.sphere(0.25, '#ffe28a', 1.8, 4, -0.4); st.add(lamp);
      const sh = T3k.shaft(1.6, 4, M.practical || '#ffe28a', 0.07); sh.position.set(1.8, 2, -0.4); st.add(sh);
      for (let i = 0; i < 10; i++) st.add(T3k.tree3D(-12 + i * 2.6, -6 - (i % 3) * 2, 1 + (i % 2) * 0.3, '#0c1a14'));
      for (let i = 0; i < 6; i++) st.add(T3k.building(4, 8 + (i % 3) * 4, 3, { color: '#10221a', win: '#ffe28a', lit: 0.3 }).translateX(-15 + i * 6).translateZ(-22));
      const a = T3k.figure3D(CAST.ARJUN, { rim: M.rim, pose: POSES.sitBack }); a.position.set(-0.45, 0, 0); a.rotation.y = -Math.PI / 2; st.add(a);
      const m = T3k.figure3D(CAST.MEERA, { rim: M.rim, pose: POSES.sit }); m.position.set(0.45, 0, 0); m.rotation.y = -Math.PI / 2; st.add(m);
      return { stage: st }; },
    draw(s, t, info, T3k) { T3k.orbit(s.stage.camera, t, { target: [0, 0.9, 0], radius: 3.6, height: [1.8, 1.3], from: -0.5, to: 0.5, dur: info.dur }); },
  },
};

// ---------- flying-car components ----------
function hubcap(g, x, y, r, rot) { g.save(); g.translate(x, y); g.rotate(rot); circle(g, 0, 0, r, '#cfd6dc'); ring(g, 0, 0, r, r * 0.12, '#6a737c'); for (let i = 0; i < 5; i++) { const a = i * 1.2566; seg(g, [[0, 0], [Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85]], r * 0.14, '#8a939c'); } circle(g, 0, 0, r * 0.25, '#4a525a'); g.restore(); }
function car2d(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0); g.scale(s * (o.facing || 1), s);
  if (o.jets) for (let i = 0; i < 5; i++) { const jx = -150 + i * 75, L = 120 + Math.sin(t * 40 + i) * 25; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, 10, 0, 10 + L, ['rgba(190,240,255,.85)', 'rgba(120,220,255,0)']); poly(g, [[jx - 14, 12], [jx + 14, 12], [jx + 30, 12 + L], [jx - 30, 12 + L]], g.fillStyle); g.restore(); glow(g, jx, 16, 40, '#bfe8ff', 0.5); }
  if (o.flame) { g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) glow(g, -260 - k * 50 - Math.sin(t * 30 + k) * 10, -40, 70 - k * 12, k % 2 ? '#ff7a2e' : '#ffd45a', 0.7); g.restore(); }
  poly(g, [[-230, 0], [-230, -60], [-150, -80], [-70, -130], [70, -130], [150, -80], [235, -60], [240, 0]], '#c41d27');
  poly(g, [[-55, -118], [60, -118], [125, -80], [-125, -80]], o.driver ? '#1a2a38' : '#9fd0f0');
  if (o.driver) circle(g, 10, -100, 18, '#06110c');
  seg(g, [[-230, -36], [240, -36]], 4, '#8a141c'); rr(g, 215, -52, 24, 14, 4); g.fillStyle = '#fff2c0'; g.fill(); glow(g, 240, -45, 50, '#fff2c0', 0.4);
  for (const wx of [-140, 140]) { circle(g, wx, 0, 52, '#0c0e10'); if (!(o.hubcapOff && wx === 140)) hubcap(g, wx, 0, 30, (o.spin || 0) * t * 10 + (o.wobble && wx === 140 ? Math.sin(t * 20) * 0.4 : 0)); }
  g.restore();
}
function speedo(g, cx, cy, r, v, u) { g.save(); g.lineCap = 'round'; g.strokeStyle = alpha(u.blueprint, 0.35); g.lineWidth = 28; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 2.2); g.stroke(); g.strokeStyle = u.gold; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * v)); g.stroke(); const a = Math.PI * (0.8 + 1.4 * v); seg(g, [[cx, cy], [cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85]], 10, '#ff5a4e'); circle(g, cx, cy, 22, u.cream); text(g, String(Math.round(v * 60)), cx, cy + r * 0.5, { size: 150, font: FONTS.title, weight: 700, color: u.cream, glow: 20, glowColor: alpha(u.gold, 0.5) }); text(g, 'MPH', cx, cy + r * 0.85, { size: 44, font: FONTS.ui, weight: 900, color: u.sub || u.text }); g.restore(); }
function piggy(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#ff8ab0'; g.beginPath(); g.ellipse(0, 0, 150, 110, 0, 0, 7); g.fill(); circle(g, 150, -10, 45, '#ff8ab0'); circle(g, 175, -10, 22, '#e86a90'); circle(g, 90, -50, 10, '#06110c'); poly(g, [[60, -95], [90, -150], [110, -90]], '#ff8ab0'); for (const lx of [-80, -20, 40, 90]) { rr(g, lx - 15, 80, 30, 60, 8); g.fillStyle = '#e86a90'; g.fill(); } rr(g, -40, -112, 80, 12, 6); g.fillStyle = '#5a2a3a'; g.fill(); g.restore(); for (let i = 0; i < 4; i++) { const ph = (t * 1.1 + i * 0.25) % 1; const cy = y - 400 * s + ph * 300 * s; if (ph < 0.95) { circle(g, x, cy, 34 * s, '#ffd45a'); ring(g, x, cy, 34 * s, 5, '#c89a20'); } } }

Object.assign(EX, {
  carHover: { pre(g, t, c) { car2d(g, E.W / 2, c.GY - V(560, 900) + Math.sin(t * 2) * 20, 1.1, t, { jets: true, tilt: 0.04 * Math.sin(t * 1.5), driver: false }); } },
  carFly: { post(g, t, c) { const k = clamp(t / c.o.dur); car2d(g, lerp(-300, E.W + 300, ease.inOut(k)), E.H * (c.o.carY ?? 0.3) - Math.sin(k * Math.PI) * 120, 1.0, t, { jets: true, tilt: -0.08, driver: !c.o.empty }); FX.speedLines(g, t, { a: 0.12 }); } },
  carsSky: { pre(g, t, c) { for (let i = 0; i < 3; i++) { const x = ((t * (120 + i * 60) + i * 500) % (E.W + 600)) - 300; car2d(g, x, E.H * (0.16 + i * 0.1), 0.45 - i * 0.08, t, { jets: true, facing: 1 }); } } },
  hubFall: { post(g, t, c) { const k = clamp(t / c.o.dur); const cx = E.W * 0.55 + k * 60; car2d(g, cx, E.H * 0.24, 0.9, t, { jets: true, hubcapOff: k > 0.15, driver: true }); if (k > 0.15) { const f = (k - 0.15) / 0.85; hubcap(g, cx + 126 + f * 120, E.H * 0.24 + f * f * E.H * 0.42, 30, t * 18); } } },
  hubSlice: { post(g, t, c) { const k = clamp(t / 0.7); const x = lerp(E.W + 80, E.W * 0.3, ease.in(k)), y = lerp(E.H * 0.2, c.GY - 260, k); hubcap(g, x, y, 34, t * 30); for (let i = 1; i < 6; i++) hubcap(g, x + i * 30, y - i * 14, 34, t * 30 - i); if (k >= 1) { glow(g, E.W * 0.3, c.GY - 260, 200, '#ff5a4e', 0.3 * clamp(1 - (t - 0.7) * 2)); } } },
  carGround: { pre(g, t, c) { const land = c.o.land ? ease.outBack(prog(t, 0, 0.6)) : 1; const y = c.GY - (1 - land) * 500; car2d(g, E.W / 2, y - 52, 1.05, t, { jets: !!c.o.land && t < 0.5, driver: !c.o.empty, wobble: c.o.wobble }); if (c.o.land) { const a = clamp(1 - Math.abs(t - 0.55) * 2); for (let i = 0; i < 8; i++) glow(g, E.W / 2 + (i - 3.5) * 70, c.GY - 10, 90 * a, '#c8b89a', 0.35 * a); } } },
  rocketCar: { pre(g, t, c) { car2d(g, E.W / 2 + Math.sin(t * 30) * 3, c.GY - 52, 1.05, t, { flame: true, driver: true }); } },
  crowdLaugh: { pre(g, t, c) { const r = rng(5); const n = 7; for (let i = 0; i < n; i++) { const x = E.W * (0.08 + i * 0.14); const pose = c.o.yell ? POSES.cheer : (i % 2 ? POSES.handsOnHead : POSES.crossArms); drawFigure(g, { x, y: c.GY + (i % 2) * 30, s: 1.25, facing: x < E.W / 2 ? 1 : -1, outfit: { top: 'tshirt', color: shade('#56606a', (r() - 0.5) * 0.5), head: ['none', 'cap', 'ponytail', 'bun'][i % 4], headColor: '#1a1a1a' }, pose: breathe(pose, t * 3, 1, i), expr: c.o.yell ? 'shocked' : 'joy', talk: 0.5 + 0.5 * Math.sin(t * 16 + i), rim: { color: c.M.rim, dir: [0, -1], w: 2 }, dim: 0.15 });
      const a = c.o.quiet ? 0 : fadeIn(t, 0.1 + i * 0.12); if (a > 0 && i % 2 === 0) { g.save(); g.globalAlpha = a; UI.bubble(g, x, c.GY - 380 - (i % 3) * 40, { w: c.o.yell ? 230 : 160, h: 70, str: c.o.yell ? 'HOW MUCH?' : 'HAHA', color: '#f4efe6' }); g.restore(); } } } },
  piggy: { pre(g, t, c) { piggy(g, E.W / 2, c.GY - 180, 1.4, t); } },
  crickets: { post(g, t) { const a = 0.5 + 0.5 * Math.sin(t * 6); text(g, 'chirp... chirp...', E.W / 2, E.H * 0.24, { size: 46, font: FONTS.ui, weight: 800, color: alpha('#cfe6d0', 0.6 * a) }); } },
  warn: { post(g, t, c) { const k = ease.outBack(prog(t, 0.3, 0.6)); if (k <= 0) return; g.save(); g.translate(E.W * 0.8, E.H * 0.22); g.scale(k, k); poly(g, [[0, -90], [95, 75], [-95, 75]], '#ffd45a'); text(g, '!', 0, 20, { size: 120, font: FONTS.title, weight: 700, color: '#111' }); g.restore(); } },
});
Object.assign(BOARD, {
  plan(g, t, o, bp, u) { const cx = E.W / 2, cy = E.H * 0.42, s = 1.6;
    g.save(); g.translate(cx, cy); g.scale(s, s); g.strokeStyle = bp; g.lineWidth = 3;
    g.beginPath(); [[-230, 0], [-230, -60], [-150, -80], [-70, -130], [70, -130], [150, -80], [235, -60], [240, 0], [-230, 0]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); for (const wx of [-140, 140]) ring(g, wx, 0, 52, 3, bp);
    const step = o.step || 0;
    if (step === 1 || step === 0) { g.globalAlpha = 0.9; poly(g, [[-60, -70], [-260, -170], [-40, -110]], alpha(bp, 0.25)); poly(g, [[60, -70], [260, -170], [40, -110]], alpha(bp, 0.25)); g.globalAlpha = 1; }
    if (step === 2) for (const px of [-160, 160]) { seg(g, [[px, -130], [px, -170]], 4, bp); g.save(); g.translate(px, -175); g.rotate(t * 20); seg(g, [[-70, 0], [70, 0]], 8, alpha(bp, 0.8)); g.restore(); }
    if (step === 3) { const n = Math.min(10, Math.floor(prog(t, 0.2, 2.2) * 10.99)); for (let i = 0; i < 5; i++) { const on = i * 2 < n; const jx = -170 + i * 85; if (on) { g.save(); g.globalCompositeOperation = 'lighter'; poly(g, [[jx - 12, 4], [jx + 12, 4], [jx + 26, 130], [jx - 26, 130]], 'rgba(190,240,255,.5)'); g.restore(); } circle(g, jx, 4, 9, on ? u.gold : alpha(bp, 0.5)); } g.restore(); text(g, String(Math.max(n, 0)), E.W * 0.82, E.H * 0.24, { size: 160, font: FONTS.title, weight: 700, color: u.gold, glow: 20, glowColor: alpha(u.gold, 0.5) }); text(g, 'NOZZLES', E.W * 0.82, E.H * 0.31, { size: 40, font: FONTS.ui, weight: 900, color: bp }); T(g, 'ULTRA HIGH-PRESSURE AIR', cx, E.H * 0.66, { c: u.gold, a: fadeIn(t, 1.2) }); return; }
    g.restore();
    if (step === 0) text(g, '?', cx, E.H * 0.2, { size: 220, font: FONTS.title, weight: 700, color: u.gold, alpha: fadeIn(t, 0.2), glow: 20, glowColor: alpha(u.gold, 0.5) });
    if (step === 1) { T(g, 'WINGS', cx, E.H * 0.22, { c: bp }); xMark(g, cx, E.H * 0.33, 110, prog(t, 0.15, 0.45)); }
    if (step === 2) { T(g, 'PROPELLERS', cx, E.H * 0.22, { c: bp }); xMark(g, cx, E.H * 0.33, 110, prog(t, 0.15, 0.45)); }
    T(g, 'HOW IT FLIES', cx, E.H * 0.08, { c: alpha(bp, 0.8) });
  },
  speed(g, t, o, bp, u) { const v = ease.out(prog(t, 0.3, 1.3)); speedo(g, E.W / 2, E.H * 0.38, 300, v, u); T(g, '0 → 60 MPH', E.W / 2, E.H * 0.1, { c: bp }); text(g, (v * 0.9).toFixed(2) + ' s', E.W / 2, E.H * 0.66, { size: 110, font: FONTS.title, weight: 700, color: u.gold, glow: 16, glowColor: alpha(u.gold, 0.5) }); T(g, 'UNDER ONE SECOND', E.W / 2, E.H * 0.74, { c: u.good, a: fadeIn(t, 1.4) }); },
  years(g, t, o, bp, u) { const k = ease.inOut(prog(t, 0.2, 1.1)); const yr = Math.round(lerp(o.from, o.to, k)); calendar(g, E.W / 2, E.H * 0.38, 2.4, String(yr)); if (o.sub) T(g, o.sub, E.W / 2, E.H * 0.6, { c: u.gold, a: fadeIn(t, 0.9) }); },
});

// ---------- register every shot from shots.json ----------
for (const sh of E.shots) {
  const p = sh.params || {};
  if (T3[p.tpl]) { const d = T3[p.tpl]; registerShot(sh.id, { kind: '3d', init: (T3k, info) => d.init(T3k, info), draw: (s, t, info, T3k) => d.draw(s, t, info, T3k), overlay: d.overlay ? (g, t, info, s) => d.overlay(g, t, info, s) : undefined }); }
  else if (TPL[p.tpl]) registerShot(sh.id, { draw: (g, t, info) => TPL[p.tpl](g, t, info) });
}
