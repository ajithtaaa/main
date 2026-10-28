// node tools/stills.mjs out/sheet.png 1.0 5.2 ...  (times in seconds) -> contact sheet
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const [out, ...ts] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Main', browserExecutable});
const files = [];
for (const t of ts) {
  const f = `out/still_${t}.png`;
  await renderStill({serveUrl, composition: comp, frame: Math.round(parseFloat(t) * 30), output: f, browserExecutable, imageFormat: 'png'});
  files.push(f);
}
const args = [];
files.forEach((f) => args.push('-i', f));
const n = files.length, cols = 3, rows = Math.ceil(n / cols);
let filter = files.map((_, i) => `[${i}:v]scale=640:360[v${i}]`).join(';') + ';';
filter += files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${n}:layout=` + files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|') + (n < cols * rows ? `:fill=black` : '') + '[o]';
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', filter, '-map', '[o]', out]);
console.log('sheet', out);
