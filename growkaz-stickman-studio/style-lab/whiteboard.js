// whiteboard.js — hand-drawn marker sketch on a whiteboard, wobbly strokes, red marker accent.
import { W, H, fonts, canvas, rnd, caption, tag } from './common.js';
export default async function () {
  await fonts(); const g = canvas().getContext('2d'); const r = rnd(7);
  g.fillStyle = '#f7f7f2'; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,170,180,${0.03 + r() * 0.04})`; g.fillRect(r() * W, r() * H, 200 + r() * 400, 2); }
  const wob = (pts, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; for (let pass = 0; pass < 2; pass++) { g.beginPath(); pts.forEach(([x, y], i) => { const jx = x + (r() - 0.5) * 6, jy = y + (r() - 0.5) * 6; i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); }); g.stroke(); } };
  const circ = (x, y, rad, w, c) => { const p = []; for (let a = 0; a <= 6.5; a += 0.25) p.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); wob(p, w, c); };
  // ground + launch tower
  wob([[60, 1200], [1020, 1200]], 7, '#222'); wob([[820, 1200], [820, 640], [870, 590], [920, 640], [920, 1200]], 6, '#222'); for (let y = 680; y < 1200; y += 60) wob([[820, y], [920, y + 40]], 3, '#555');
  // Elon: stick figure pointing up
  circ(300, 860, 52, 7, '#222'); g.fillStyle = '#222'; g.beginPath(); g.arc(282, 852, 7, 0, 7); g.arc(318, 852, 7, 0, 7); g.fill(); wob([[280, 885], [300, 895], [322, 883]], 5, '#222');
  wob([[300, 912], [300, 1060]], 7, '#222'); wob([[300, 1060], [250, 1195]], 7, '#222'); wob([[300, 1060], [350, 1195]], 7, '#222'); wob([[300, 950], [380, 860], [430, 760]], 7, '#222'); wob([[300, 950], [230, 1010]], 7, '#222');
  wob([[262, 930], [338, 930], [345, 1010], [255, 1010], [262, 930]], 6, '#d22'); g.fillStyle = 'rgba(220,30,30,.18)'; g.fillRect(262, 935, 78, 72);
  // flying car (red marker) + air jets
  const car = [[470, 560], [470, 515], [540, 500], [600, 455], [740, 455], [800, 500], [870, 515], [875, 560], [470, 560]]; wob(car, 8, '#d22'); g.fillStyle = 'rgba(220,30,30,.15)'; g.beginPath(); car.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill();
  circ(560, 565, 38, 7, '#222'); circ(790, 565, 38, 7, '#222'); for (let i = 0; i < 5; i++) { const x = 510 + i * 80; wob([[x, 610], [x - 15, 700]], 4, '#1a7bd6'); wob([[x + 10, 610], [x + 10, 720]], 4, '#1a7bd6'); }
  for (const [x, y] of [[440, 470], [910, 470], [450, 610]]) { wob([[x - 20, y], [x + 20, y]], 4, '#222'); wob([[x, y - 20], [x, y + 20]], 4, '#222'); }
  // marker hand
  g.save(); g.translate(930, 760); g.rotate(-0.6); g.fillStyle = '#f2c9a0'; g.beginPath(); g.ellipse(0, 0, 70, 50, 0, 0, 7); g.fill(); g.fillStyle = '#d22'; g.fillRect(-160, -16, 120, 32); g.fillStyle = '#222'; g.fillRect(-180, -10, 24, 20); g.restore();
  g.save(); g.font = '700 70px Fredoka'; g.fillStyle = '#222'; g.textAlign = 'center'; g.fillText('9 YEARS LATER...', W / 2, 330); wob([[250, 370], [830, 370]], 6, '#d22'); g.restore();
  caption(g, 'HE ACTUALLY DID IT.', 1, { color: '#222', stroke: '', hiColor: '#d22' }); tag(g, 'WHITEBOARD SKETCH', { bg: '#222' });
}
