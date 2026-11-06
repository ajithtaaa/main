// kinetic.js — kinetic typography: huge stacked words, one highlight colour, simple icons, no characters.
import { W, H, fonts, canvas, caption, tag } from './common.js';
export default async function () {
  await fonts(); const g = canvas().getContext('2d');
  g.fillStyle = '#0d0d12'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23f'; g.save(); g.translate(W / 2, 900); g.rotate(-0.08); g.fillRect(-700, -170, 1400, 340); g.restore();
  const word = (s, y, size, c, rot = 0, x = W / 2) => { g.save(); g.translate(x, y); g.rotate(rot); g.font = `700 ${size}px Fredoka`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = c; g.fillText(s, 0, 0); g.restore(); };
  word('NINE', 330, 210, '#fff', -0.04); word('YEARS LATER', 520, 130, '#9aa0b4', -0.04);
  word('HE ACTUALLY', 820, 120, '#0d0d12', -0.08); word('DID IT.', 990, 200, '#0d0d12', -0.08);
  // icons: car outline + arrow up + nozzles
  g.save(); g.translate(W / 2, 1270); g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineJoin = 'round'; g.beginPath(); [[-200, 40], [-200, 0], [-140, -15], [-80, -60], [80, -60], [140, -15], [200, 0], [205, 40], [-200, 40]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  for (const x of [-120, 120]) { g.beginPath(); g.arc(x, 45, 34, 0, 7); g.stroke(); } g.strokeStyle = '#3fd6ff'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-140 + i * 70, 95); g.lineTo(-150 + i * 70, 160); g.stroke(); } g.restore();
  g.strokeStyle = '#ff3f6c'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(860, 1340); g.lineTo(860, 1150); g.moveTo(800, 1210); g.lineTo(860, 1150); g.lineTo(920, 1210); g.stroke();
  word('KIND OF.', 1700, 70, '#ff3f6c', 0.05, 820);
  caption(g, 'HE ACTUALLY DID IT.', 3, { hiColor: '#ff3f6c', y: 1500 }); tag(g, 'KINETIC TYPOGRAPHY', { bg: '#ff3f6c' });
}
