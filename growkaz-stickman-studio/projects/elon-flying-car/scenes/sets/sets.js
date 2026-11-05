// sets/sets.js — bedroom (night), street (dusk / night / rain), gym, office desk, stage (void + spotlight).
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { cafe } from './cafe.js';
import { lab } from './lab.js';

export const ground = () => E.H * V(0.8, 0.68);

function floor(g, GY, M, a = 0.25) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor || M.wall, 0.08), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
  FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.2)', 0.07);
}

export function bedroom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, shade(M.wall, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX + V(160, 60), wy = GY - V(620, 900), ww = V(420, 380), wh = V(320, 380);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, frame: shade(M.wall, -0.55), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.stars(g, t, { area: [x, y, w, h * 0.6], count: 30, seed: 3 }); FX.moon(g, x + w * 0.7, y + h * 0.3, 26);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: alpha(shade(M.wall, -0.3), 0.9), windowColor: alpha(M.practical, 0.7), seed: 9 });
    });
    if (o.clock) FX.clock(g, CX - V(520, 330), GY - V(640, 1000), 40, o.clock * 3600 + t * 2, { face: '#e9e2ea' });
  });
  layer(g, cam, 0.8, (g) => { floor(g, GY, M); FX.bed(g, { x: CX - V(420, 380), y: GY + 6, w: V(760, 700), color: shade(M.wall, 0.15), frame: shade(M.wall, -0.5), pillow: '#cfd8d2' }); });
  return { GY, CX, M };
}

export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => {
    backdrop(g, M.sky);
    if (o.mood === 'night' || o.rain) FX.stars(g, t, { count: 60, seed: 12 }); else FX.sun(g, CX + V(380, 200), GY - V(300, 500), 56, '#fff3dc', M.key, 5);
    FX.skyline(g, { x: -E.W, y: GY - V(140, 200), w: E.W * 3, minH: 120, maxH: V(420, 700), color: mix(M.sky[0], M.dark, 0.6), windowColor: alpha(M.practical, 0.7), lit: 0.25, seed: o.seed || 5 });
  });
  layer(g, cam, 0.5, (g) => {
    for (const x of [-300, 420, 1180, 1900]) FX.tree(g, x, GY, 1.4, shade(M.dark, 0.05));
    if (o.stalls) for (let i = 0; i < 6; i++) { const x = -200 + i * 420; FX.facade(g, { x, y: GY, w: 300, h: 220, color: shade(M.wall, -0.2), win: M.practical, cols: 2, rows: 1, lit: 0.9, seed: i + 3 });
      for (let k = 0; k < 7; k++) { const lx = x + 20 + k * 40; seg(g, [[lx, GY - 250], [lx + 40, GY - 250]], 2, '#1a1a1a'); circle(g, lx + 20, GY - 240 + Math.sin(k + t * 2) * 3, 8, ['#ffcf5a', '#ff7a5a', '#7dffb0'][k % 3]); glow(g, lx + 20, GY - 240, 30, '#ffcf5a', 0.25); } }
  });
  layer(g, cam, 0.8, (g) => { floor(g, GY, M); for (const x of [CX - V(700, 420), CX + V(700, 420)]) FX.lampPost(g, x, GY, V(380, 520), { light: M.practical }); });
  if (o.rain) FX.rain(g, t, { a: 0.35 });
  return { GY, CX, M };
}

export function gym(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, shade(M.wall, -0.1)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    rr(g, CX - V(600, 400), GY - V(560, 900), V(1200, 800), V(380, 500), 6); g.fillStyle = alpha('#c8e8ff', 0.06); g.fill();     // mirror wall
    for (let i = 0; i < 5; i++) { const x = CX - V(520, 360) + i * V(260, 180); glow(g, x, GY - V(640, 1000), 120, M.practical, 0.2); rr(g, x - 60, GY - V(650, 1010), 120, 14, 4); g.fillStyle = M.practical; g.fill(); }
    for (let i = 0; i < 8; i++) { const x = CX - V(760, 480) + i * 46; rr(g, x, GY - 120, 30, 70, 6); g.fillStyle = '#15181c'; g.fill(); }      // dumbbell rack
  });
  layer(g, cam, 0.8, (g) => floor(g, GY, M));
  return { GY, CX, M };
}

export function office(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, shade(M.wall, -0.25)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    FX.windowFrame(g, { x: CX - V(700, 420), y: GY - V(640, 980), w: V(520, 400), h: V(360, 420), cols: 3, frame: shade(M.wall, -0.55), bar: 8 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.skyline(g, { x, y: y + h, w, maxH: h * 0.7, color: alpha(shade(M.wall, -0.3), 0.9), windowColor: alpha(M.practical, 0.8), lit: 0.4, seed: 2 }); });
    rr(g, CX + V(160, 60), GY - V(600, 940), 360, 220, 8); g.fillStyle = '#e8efe9'; g.fill();                                       // whiteboard
    g.strokeStyle = '#2a7a4a'; g.lineWidth = 6; g.beginPath(); [[0, 180], [70, 150], [140, 160], [210, 100], [280, 70], [330, 30]].forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, CX + V(175, 75) + x, GY - V(600, 940) + y)); g.stroke();
  });
  layer(g, cam, 0.8, (g) => { floor(g, GY, M); rr(g, CX - V(380, 300), GY - 150, V(560, 460), 18, 4); g.fillStyle = shade(M.wall, -0.5); g.fill(); seg(g, [[CX - V(360, 280), GY - 140], [CX - V(360, 280), GY]], 10, shade(M.wall, -0.55)); seg(g, [[CX + V(160, 140), GY - 140], [CX + V(160, 140), GY]], 10, shade(M.wall, -0.55)); });
  return { GY, CX, M, deskY: GY - 150 };
}

export function stageSet(g, t, cam, o = {}) {
  const M = mood(o.mood || 'void'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => { backdrop(g, [M.dark, shade(M.dark, 0.08)]); FX.lightCone(g, CX + (o.spotX || 0), -100, { angle: Math.PI / 2, spread: 0.35, len: GY + 200, color: M.key, a: 0.14 }); });
  layer(g, cam, 0.8, (g) => { floor(g, GY, M); FX.pool(g, CX + (o.spotX || 0), GY + 8, 380, 60, M.key, 0.35); });
  return { GY, CX, M };
}

export const SETS = {
  bedroom, street, gym, office, stage: stageSet,
  cafe: (g, t, cam, o) => { const r = cafe(g, t, cam, o); return { GY: r.GY, CX: E.W / 2, M: r.M }; },
  lab: (g, t, cam, o) => lab(g, t, cam, o),
};

// launch site: Texas desert at dusk, rocket + tower silhouettes, distant crowd barrier
export function site(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = ground(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.sun(g, CX - V(300, 260), GY - V(260, 380), 70, '#fff3dc', M.key, 5); FX.hills(g, { y: GY - 40, amp: 60, color: shade(M.dark, 0.12), seed: 3 }); });
  layer(g, cam, 0.45, (g) => {
    const rx = CX + V(380, 300), h = V(560, 760);
    rr(g, rx - 34, GY - h, 68, h, 10); g.fillStyle = shade(M.wall, 0.25); g.fill(); poly(g, [[rx - 34, GY - h], [rx, GY - h - 110], [rx + 34, GY - h]], shade(M.wall, 0.25));
    g.fillStyle = shade(M.dark, 0.05); g.fillRect(rx + 50, GY - h - 40, 50, h + 40); for (let i = 0; i < 18; i++) g.fillRect(rx + 34, GY - h + i * (h / 18), 90, 5);
    glow(g, rx, GY - 40, 220, M.practical, 0.15);
  });
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor, 0.12), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.2)', 0.07); });
  return { GY, CX, M };
}
SETS.site = site;
