// shoot.mjs — serve the studio root and screenshot each style sample at 1080x1920.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve('..'); const T = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
fs.mkdirSync('out', { recursive: true });
for (const s of process.argv.slice(2)) { const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } }); pg.on('pageerror', (e) => console.log(s, 'ERR', e.message));
  await pg.goto(`http://localhost:${srv.address().port}/style-lab/page.html?s=${s}`); await pg.waitForFunction('window.DONE === true', null, { timeout: 120000 }); const t = await pg.title(); if (t.startsWith('ERR')) console.log(s, t);
  await pg.screenshot({ path: `out/${s}.png` }); console.log('shot', s); await pg.close(); }
await b.close(); srv.close();
