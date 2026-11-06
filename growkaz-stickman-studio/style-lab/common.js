// common.js — shared helpers for the style-lab sample pages (1080x1920 canvas).
export const W = 1080, H = 1920;
export async function fonts() {
  for (const [f, w, file] of [['Fredoka', '700', 'fredoka/files/fredoka-latin-700-normal.woff2'], ['Nunito', '900', 'nunito/files/nunito-latin-900-normal.woff2']]) {
    const ff = new FontFace(f, `url(/node_modules/@fontsource/${file})`, { weight: w }); await ff.load(); document.fonts.add(ff);
  }
}
export function canvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; document.body.appendChild(c); return c; }
export function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function caption(g, words, hi, o = {}) {
  const { y = 1480, size = 92, color = '#fff', hiColor = '#ffd23f', stroke = '#000', font = 'Fredoka' } = o;
  g.save(); g.font = `700 ${size}px ${font}`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const parts = words.split(' '), widths = parts.map((p) => g.measureText(p + ' ').width), tot = widths.reduce((a, b) => a + b, 0);
  let x = W / 2 - tot / 2; parts.forEach((p, i) => { g.lineWidth = 16; g.strokeStyle = stroke; g.lineJoin = 'round'; if (stroke) g.strokeText(p, x, y); g.fillStyle = i === hi ? hiColor : color; g.fillText(p, x, y); x += widths[i]; });
  g.restore();
}
export function tag(g, str, o = {}) { g.save(); g.font = `900 40px Nunito`; g.textAlign = 'center'; g.fillStyle = o.bg || 'rgba(0,0,0,.55)'; const w = g.measureText(str).width + 60; g.beginPath(); g.roundRect(W / 2 - w / 2, 60, w, 72, 36); g.fill(); g.fillStyle = o.color || '#fff'; g.textBaseline = 'middle'; g.fillText(str, W / 2, 97); g.restore(); }
