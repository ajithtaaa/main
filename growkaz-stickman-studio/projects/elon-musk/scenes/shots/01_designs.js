// shots/01_designs.js — character design sheet for Elon Musk (lineup, close-up, launch pad).
import { E, V, registerShot, mood, layer, backdrop, ease, prog, lerp, circle, rr, linGrad, glow, alpha, shade, S } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { ELON_YOUNG, ELON_TESLA, ELON_SPACE } from '../cast.js';

const GY = () => E.H * V(0.8, 0.68);

function stage(g, t, cam, M) {
  layer(g, cam, 0.3, (g) => {
    backdrop(g, [M.dark, M.wall, shade(M.wall, 0.15)]);
    for (let i = 0; i < 3; i++) glow(g, E.W * (0.25 + i * 0.25), GY() - V(260, 400), V(320, 300), M.key, 0.14);
  });
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, GY(), 0, GY() + 500, [shade(M.floor, 0.1), M.dark]); g.fillRect(-E.W, GY(), E.W * 3, E.H * 2);
    FX.floorLines(g, GY(), GY() + 500, 'rgba(0,0,0,.2)', 0.07);
    for (let i = 0; i < 3; i++) FX.pool(g, E.W * (0.25 + i * 0.25), GY() + 8, 200, 40, M.key, 0.3);
  });
}

function label(g, x, y, str, sub) {
  const ui = S().ui; g.textAlign = 'center';
  g.font = `800 ${V(30, 30)}px Fredoka, sans-serif`; g.fillStyle = ui.gold; g.fillText(str, x, y);
  g.font = `600 ${V(20, 20)}px Nunito, sans-serif`; g.fillStyle = alpha(ui.text || '#eee', 0.9); g.fillText(sub, x, y + V(30, 30));
}

// c01 — lineup of the three looks
registerShot('c01', { draw(g, t) {
  const M = mood('dusk'), cam = { z: 1.02 + 0.04 * ease.inOut(t / 3), x: -20 * ease.inOut(t / 3), y: 0 };
  stage(g, t, cam, M);
  const s = V(2.1, 1.8), rim = { color: M.rim, dir: [0, -1], w: 4 };
  const looks = [
    [ELON_YOUNG, POSES.crossArms, 'THE FOUNDER', 'Zip2 / PayPal · navy suit'],
    [ELON_TESLA, POSES.explain, 'THE CAR GUY', 'Tesla · red tee'],
    [ELON_SPACE, POSES.pointUp, 'THE ROCKET MAN', 'SpaceX · white jacket'],
  ];
  layer(g, cam, 1, (g) => looks.forEach(([o, p, a, b], i) => {
    const x = E.W * (0.25 + i * 0.25);
    drawFigure(g, { x, y: GY(), s, facing: i === 0 ? 1 : i === 2 ? -1 : 1, outfit: o, pose: breathe(p, t, 1, i), expr: i === 1 ? 'happy' : 'determined', rim, blink: ((t + i) % 3.1) > 3.0 });
    label(g, x, GY() + V(70, 70), a, b);
  }));
  FX.dust(g, t, { count: 40, color: M.practical, a: 0.3 });
} });

// c02 — giant face close-up
registerShot('c02', { draw(g, t) {
  const M = mood('dusk');
  stage(g, t, { z: 1.4, x: 0, y: -80 }, M);
  const r = V(300, 330) * (1 + 0.04 * (t - 3));
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), r, { outfit: ELON_TESLA, expr: 'smirk', look: [0.35, -0.15], rimColor: M.rim, rimSide: -1, talk: 0 });
  FX.dust(g, t, { count: 30, color: M.practical, a: 0.3 });
} });

// c03 — SpaceX Elon at the launch pad at night
function rocket(g, x, y, h, M) {
  const w = h * 0.09;
  g.fillStyle = linGrad(g, x - w, 0, x + w, 0, [shade('#d8dde4', -0.35), '#eef2f6', shade('#d8dde4', -0.45)]);
  rr(g, x - w / 2, y - h, w, h, 6); g.fill();
  g.beginPath(); g.moveTo(x - w / 2, y - h + 4); g.quadraticCurveTo(x, y - h - w * 1.6, x + w / 2, y - h + 4); g.fill();
  g.fillStyle = '#1a1e26'; [0.25, 0.5].forEach((f) => g.fillRect(x - w / 2, y - h * f, w, h * 0.012));
  g.fillStyle = shade(M.wall, -0.5); g.fillRect(x + w * 0.9, y - h * 0.95, w * 0.5, h * 0.95);   // tower
  for (let i = 0; i < 14; i++) g.fillRect(x + w * 0.5, y - h * 0.95 + i * h * 0.067, w * 1.2, 3);
}
registerShot('c03', { draw(g, t) {
  const M = mood('night'), lt = t - 6, cam = { z: 1 + 0.06 * ease.inOut(lt / 3), x: 30 * ease.inOut(lt / 3), y: 0 };
  layer(g, cam, 0.2, (g) => { backdrop(g, M.sky); for (let i = 0; i < 80; i++) circle(g, (i * 977) % (E.W * 1.6) - E.W * 0.3, (i * 433) % (E.H * 0.6), 1.4, alpha('#ffffff', 0.5 + 0.4 * Math.sin(i + lt * 2))); });
  layer(g, cam, 0.5, (g) => { glow(g, E.W * 0.68, GY() - V(300, 500), V(420, 380), M.practical, 0.18); rocket(g, E.W * 0.68, GY(), E.H * V(0.58, 0.42), M); });
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, GY(), 0, GY() + 500, [shade(M.floor || M.wall, 0.05), M.dark]); g.fillRect(-E.W, GY(), E.W * 3, E.H * 2); FX.pool(g, E.W * 0.32, GY() + 8, 220, 40, M.practical, 0.25); });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W * 0.32, y: GY(), s: V(1.7, 1.5), facing: 1, outfit: ELON_SPACE, pose: breathe(POSES.point, lt), expr: 'happy', look: [1, -0.4], rim: { color: M.rim, dir: [1, -1], w: 4 } }));
  FX.dust(g, lt, { count: 30, color: M.practical, a: 0.25 });
} });
