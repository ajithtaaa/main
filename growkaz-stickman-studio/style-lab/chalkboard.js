// chalkboard.js — chalk drawings on a dark green board: dusty textured strokes, yellow/pink chalk accents.
import { W, H, fonts, canvas, rnd, caption, tag } from './common.js';
export default async function () {
  await fonts(); const g = canvas().getContext('2d'); const r = rnd(3);
  g.fillStyle = '#1f3b2e'; g.fillRect(0, 0, W, H); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 3 + r() * 40, 2 + r() * 8); }
  g.fillStyle = '#5a3a22'; g.fillRect(0, 0, W, 34); g.fillRect(0, H - 34, W, 34);
  const chalk = (pts, w, c) => { for (let k = 0; k < 3; k++) { g.strokeStyle = c; g.globalAlpha = 0.35 + r() * 0.35; g.lineWidth = w * (0.6 + r() * 0.5); g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + (r() - 0.5) * 5, y + (r() - 0.5) * 5) : g.moveTo(x, y))); g.stroke(); } g.globalAlpha = 1; };
  const circ = (x, y, rad, w, c) => { const p = []; for (let a = 0; a <= 6.4; a += 0.2) p.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); chalk(p, w, c); };
  g.font = '700 84px Fredoka'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('HOW IT FLIES', W / 2, 260); chalk([[260, 300], [820, 300]], 6, '#f4e27a');
  const car = [[200, 760], [200, 700], [300, 680], [380, 620], [640, 620], [720, 680], [870, 700], [880, 760], [200, 760]]; chalk(car, 9, '#fff'); circ(330, 770, 50, 8, '#fff'); circ(740, 770, 50, 8, '#fff');
  for (let i = 0; i < 10; i++) { const x = 250 + i * 60; chalk([[x, 820], [x - 10, 960]], 6, '#9fe3ff'); }
  g.font = '700 54px Fredoka'; g.fillStyle = '#f4e27a'; g.fillText('10 NOZZLES', W / 2, 1050); g.fillStyle = '#ff9fc0'; g.fillText('NO WINGS  ✗     NO PROPS  ✗', W / 2, 1140);
  circ(140, 1260, 40, 7, '#fff'); chalk([[140, 1300], [140, 1390]], 7, '#fff'); chalk([[140, 1320], [230, 1240]], 7, '#fff'); chalk([[140, 1320], [80, 1370]], 7, '#fff'); g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '700 40px Fredoka'; g.fillText('ELON', 140, 1200);
  caption(g, 'HE ACTUALLY DID IT.', 2, { stroke: '', color: 'rgba(255,255,255,.92)', hiColor: '#f4e27a', y: 1560 }); tag(g, 'CHALKBOARD', { bg: '#5a3a22' });
}
