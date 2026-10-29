import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Stickman, poseAt, handPos, Face, Who} from './Stickman';
import {Icon} from '../icons';
import {FONT} from '../theme';

export const INK = '#1b1b1f';
export const PAPER = '#fbf7ee';
const GROUND = 840;

export type Actor = {who: Who; x: number; y?: number; size?: number; flip?: boolean; face?: Face; faces?: [number, Face][]; poses: [number, string][];
  move?: [number, number][]; hold?: string; at?: number; enter?: 'left' | 'right' | 'pop' | 'drop'};
export type Prop = {t: string; x: number; y: number; at?: number; s?: number; text?: string; color?: string; anim?: string; until?: number; rot?: number; n?: number};
export type StickShotSpec = {bg: string; cam?: {z?: [number, number]; x?: [number, number]; y?: [number, number]}; actors?: Actor[]; props?: Prop[];
  title?: {text: string; at?: number; color?: string; y?: number}; flash?: number; shake?: number};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lin = (f: number, a: number, b: number, v0 = 0, v1 = 1) => interpolate(f, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
const kf = (keys: [number, number][], f: number) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return interpolate(f, [keys[i - 1][0], keys[i][0]], [keys[i - 1][1], keys[i][1]], {easing: (t) => t * t * (3 - 2 * t)});
  return keys[keys.length - 1][1];
};
const useSpr = (delay: number, damping = 11) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 170, mass: 0.7}});
};

// ------------------------------------------------------------------ backgrounds (doodle line art)
const L: React.FC<{d: string; w?: number; c?: string; fill?: string; o?: number}> = ({d, w = 5, c = INK, fill = 'none', o = 1}) => (
  <path d={d} stroke={c} strokeWidth={w} fill={fill} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
);
export const Background: React.FC<{kind: string}> = ({kind}) => {
  const f = useCurrentFrame();
  const dark = kind === 'night' || kind === 'dark';
  const base = dark ? '#1d2440' : kind === 'sunset' ? '#ffe3c2' : kind === 'pink' ? '#ffe0ea' : kind === 'yellow' ? '#fff1b8' : kind === 'blue' ? '#dff1ff' : PAPER;
  const ink = dark ? '#e9ecf7' : INK;
  const lines = [];
  for (let y = 60; y < 1080; y += 54) lines.push(<line key={y} x1={0} y1={y} x2={1920} y2={y} stroke={dark ? '#ffffff' : '#5b8def'} strokeOpacity={0.07} strokeWidth={2} />);
  const ground = <L d={`M-20,${GROUND + 2} Q480,${GROUND - 6} 960,${GROUND + 2} T1940,${GROUND}`} w={6} c={ink} />;
  let art: React.ReactNode = null;
  if (kind === 'room' || kind === 'night_room') art = <>
    <L d="M1380,180 h300 v240 h-300 z M1530,180 v240 M1380,300 h300" c={ink} fill={kind === 'night_room' ? '#28305a' : '#dff1ff'} />
    {kind === 'night_room' && <><circle cx={1610} cy={240} r={28} fill="#fff3b0" /><circle cx={1440} cy={360} r={4} fill="#fff" /><circle cx={1480} cy={220} r={3} fill="#fff" /></>}
    <L d="M240,840 v-170 h340 v170 M240,720 h340 M260,670 q60,-50 120,0" c={ink} fill="#f2e6ff" />
    <L d="M1780,840 v-260 M1730,580 h100 l-20,-70 h-60 z" c={ink} fill="#fff3b0" />
    <L d="M720,240 h170 v130 h-170 z" c={ink} fill="#ffe3e3" /><L d="M740,350 l40,-50 l30,30 l25,-20 l35,40" c={ink} w={4} />
  </>;
  if (kind === 'street') art = <>
    {[[80, 380, 220], [330, 300, 180], [540, 420, 240], [1240, 340, 200], [1470, 260, 210], [1700, 400, 200]].map(([x, h, w], i) =>
      <g key={i}><L d={`M${x},${GROUND} v-${h} h${w} v${h}`} c={ink} fill={['#ffe3e3', '#e3f2ff', '#fff3b0', '#e8ffe3', '#f2e6ff', '#ffe9d6'][i]} />
        {Array.from({length: 3}).map((_, j) => <L key={j} d={`M${x + 30},${GROUND - h + 40 + j * 70} h40 v36 h-40 z M${x + w - 70},${GROUND - h + 40 + j * 70} h40 v36 h-40 z`} c={ink} w={3} />)}</g>)}
    <L d="M960,840 v-300 M960,540 q40,0 40,40" c={ink} /><circle cx={1000} cy={585} r={12} fill="#fff3b0" stroke={ink} strokeWidth={4} />
  </>;
  if (kind === 'cafe') art = <>
    {[300, 760, 1220, 1680].map((x, i) => <g key={i}><L d={`M${x},0 v120`} c={ink} w={3} /><L d={`M${x - 40},150 q40,-50 80,0 z`} c={ink} fill="#fff3b0" /><circle cx={x} cy={160} r={10} fill="#ffd166" /></g>)}
    <L d="M760,840 v-200 M600,640 h320" c={ink} w={6} /><L d="M640,640 v-30 h40 v30 M840,640 v-34 h34 v34" c={ink} w={4} fill="#fff" />
    <L d="M120,260 h300 v250 h-300 z" c={ink} fill="#e3f2ff" /><L d="M1500,300 h260 v120 h-260 z" c={ink} fill="#ffe3e3" />
  </>;
  if (kind === 'gym') art = <>
    <L d="M140,840 v-360 h420 v360 M140,600 h420 M140,720 h420" c={ink} />
    {[200, 300, 400, 500].map((x, i) => <g key={i}><circle cx={x} cy={570} r={22} fill="#ff6b6b" stroke={ink} strokeWidth={4} /><circle cx={x} cy={690} r={26} fill="#4d96ff" stroke={ink} strokeWidth={4} /></g>)}
    <L d="M1400,200 h360 v500 h-360 z" c={ink} fill="#e3f2ff" o={0.9} /><L d="M1440,240 l60,-0 M1440,280 l120,0" c="#fff" w={8} />
  </>;
  if (kind === 'stage') art = <>
    <L d="M0,0 h300 q-60,400 0,840 h-300 z M1920,0 h-300 q60,400 0,840 h300 z" c={ink} fill="#e63946" />
    <path d="M840,0 h240 l260,840 h-760 z" fill="#fff6c8" opacity={0.55} />
    <L d="M0,60 q960,90 1920,0" c={ink} fill="none" w={8} />
  </>;
  if (kind === 'mountain' || kind === 'sunset') art = <>
    <circle cx={1500} cy={330 - lin(f, 0, 90, 0, 40)} r={110} fill="#ffd166" stroke={ink} strokeWidth={5} />
    <L d={`M0,${GROUND} L380,360 L620,620 L900,300 L1260,${GROUND}`} c={ink} fill="#c7b8ea" />
    <L d={`M900,${GROUND} L1300,460 L1700,${GROUND}`} c={ink} fill="#a9def9" />
    <L d="M300,440 l80,-80 l60,60 M820,360 l80,-60 l50,50" c={ink} w={4} />
  </>;
  if (kind === 'rain') art = <>
    {[[300, 160], [900, 120], [1500, 170]].map(([x, y], i) => <L key={i} d={`M${x - 160},${y + 50} q0,-60 70,-50 q30,-60 100,-30 q70,-30 90,40 q60,10 40,60 z`} c={ink} fill="#cfd8e8" />)}
    {Array.from({length: 70}).map((_, i) => { const x = random(`r${i}`) * 1960, y = (random(`ry${i}`) * 900 + f * 26) % 900 + 200; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} stroke="#4d96ff" strokeWidth={4} strokeLinecap="round" />; })}
  </>;
  if (kind === 'beach') art = <>
    <circle cx={960} cy={420} r={150} fill="#ffd166" stroke={ink} strokeWidth={5} />
    <path d="M0,560 h1920 v300 h-1920 z" fill="#a9def9" />
    {[0, 1, 2].map((i) => <L key={i} d={`M${-100 + ((f * 2 + i * 300) % 400)},${600 + i * 70} q60,-30 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0`} c={ink} w={4} />)}
    <path d={`M0,${GROUND - 40} h1920 v200 h-1920 z`} fill="#ffe3a3" />
  </>;
  if (kind === 'office') art = <>
    <L d="M560,840 v-230 M520,610 h520 M1000,610 v230" c={ink} w={6} />
    <L d="M640,610 l30,-150 h220 l-30,150 z" c={ink} fill="#e3f2ff" /><L d="M1500,840 v-120 h120 v120 M1530,720 q30,-120 60,0" c={ink} fill="#c7f0c2" />
  </>;
  if (kind === 'night') art = <>
    <circle cx={1550} cy={220} r={70} fill="#fff3b0" />
    {Array.from({length: 40}).map((_, i) => <circle key={i} cx={random(`s${i}`) * 1920} cy={random(`sy${i}`) * 600} r={2 + random(`sr${i}`) * 3} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 10 + i))} />)}
  </>;
  if (kind === 'park') art = <>
    {[260, 1660].map((x, i) => <g key={i}><L d={`M${x},${GROUND} v-220`} c={ink} w={10} /><L d={`M${x - 130},${GROUND - 260} q0,-180 130,-180 q130,0 130,180 q-130,60 -260,0 z`} c={ink} fill="#b8f2b0" /></g>)}
    <circle cx={1550} cy={200} r={70} fill="#ffd166" stroke={ink} strokeWidth={5} />
    <L d="M760,840 v-60 h400 v60 M740,780 h440" c={ink} w={6} />
  </>;
  return (
    <AbsoluteFill style={{background: base}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>{lines}{art}{kind !== 'plain' && kind !== 'yellow' && kind !== 'pink' && kind !== 'blue' && kind !== 'dark' ? ground : null}</svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ props
const Pop: React.FC<{at: number; children: React.ReactNode; anim?: string; x: number; y: number; s?: number; rot?: number; until?: number}> = ({at, children, anim = 'pop', x, y, s = 1, rot = 0, until}) => {
  const f = useCurrentFrame();
  const sp = useSpr(at);
  if (f < at || (until !== undefined && f > until)) return null;
  let tx = 0, ty = 0, sc = sp, r = rot, op = 1;
  const lt = f - at;
  if (anim === 'float') ty = Math.sin(lt / 10) * 10;
  if (anim === 'beat') sc = sp * (1 + Math.abs(Math.sin(lt / 5)) * 0.12);
  if (anim === 'rise') { ty = -lt * 3; op = Math.max(0, 1 - lt / 50); }
  if (anim === 'drop') { sc = 1; ty = (1 - sp) * -500; }
  if (anim === 'spin') r = rot + lt * 4;
  if (anim === 'shake') tx = Math.sin(lt * 2) * 6;
  if (anim === 'stamp') sc = 1 + (1 - sp) * 2;
  return <g transform={`translate(${x + tx},${y + ty}) rotate(${r}) scale(${sc * s})`} opacity={op}>{children}</g>;
};

const fo = (node: React.ReactNode, w: number, h: number) => (
  <foreignObject x={-w / 2} y={-h / 2} width={w} height={h} style={{overflow: 'visible'}}>
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{node}</div>
  </foreignObject>
);
const txt = (size: number, color = INK): React.CSSProperties => ({fontFamily: FONT, fontWeight: 800, fontSize: size, color, lineHeight: 1.25, textAlign: 'center'});

const ICON_PROPS = new Set(['heart', 'x', 'check', 'question', 'money', 'glasses', 'lock', 'lockopen', 'dumbbell', 'briefcase', 'chart', 'music', 'flame', 'star', 'spark',
  'megaphone', 'bell', 'mirror', 'house', 'shield', 'eye', 'ear', 'gift', 'coffee', 'film', 'bowl', 'bike', 'cloud', 'globe', 'target', 'share', 'brain', 'play', 'warn', 'chat', 'phone', 'clock', 'calendar', 'book', 'sun']);

const PropView: React.FC<{p: Prop}> = ({p}) => {
  const f = useCurrentFrame();
  const at = p.at ?? 0;
  const s = p.s ?? 1;
  if (ICON_PROPS.has(p.t)) {
    const extra = p.t === 'calendar' && p.text ? <text x={0} y={30} textAnchor="middle" style={txt(90) as any} fill={INK}>{p.text}</text> : null;
    return <Pop at={at} x={p.x} y={p.y} s={s} anim={p.anim} rot={p.rot} until={p.until}>
      <g transform="translate(-90,-90)"><foreignObject x={0} y={0} width={180} height={180} style={{overflow: 'visible'}}><Icon name={p.t} size={180} color={p.color || '#ff4d5e'} /></foreignObject></g>
      {p.t === 'calendar' && p.text && fo(<div style={{...txt(p.text.length > 2 ? 46 : 64), marginTop: 30}}>{p.text}</div>, 180, 180)}
      {p.t === 'clock' && p.text && <g transform="translate(0,120)">{fo(<div style={{...txt(40, '#fff'), background: INK, padding: '2px 16px', borderRadius: 10}}>{p.text}</div>, 260, 60)}</g>}
      {extra && null}
    </Pop>;
  }
  if (p.t === 'bubble' || p.t === 'thought' || p.t === 'shout') {
    const w = Math.min(720, 120 + (p.text || '').length * 26), h = (p.text || '').length > 22 ? 200 : 130;
    const bg = p.color || '#ffffff';
    return <Pop at={at} x={p.x} y={p.y} s={s} anim={p.anim || 'pop'} until={p.until}>
      {p.t === 'thought'
        ? <><ellipse cx={0} cy={0} rx={w / 2} ry={h / 2} fill={bg} stroke={INK} strokeWidth={6} /><circle cx={-w / 3} cy={h / 2 + 30} r={18} fill={bg} stroke={INK} strokeWidth={5} /><circle cx={-w / 3 - 30} cy={h / 2 + 70} r={10} fill={bg} stroke={INK} strokeWidth={4} /></>
        : <><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={40} fill={bg} stroke={INK} strokeWidth={6} /><path d={`M${-w / 4},${h / 2 - 4} l-30,60 l70,-58`} fill={bg} stroke={INK} strokeWidth={6} strokeLinejoin="round" /><rect x={-w / 4 - 4} y={h / 2 - 12} width={64} height={14} fill={bg} /></>}
      {fo(<div style={{...txt(p.t === 'shout' ? 64 : 54, p.color && p.color !== '#ffffff' && p.color !== '#fff3b0' ? '#fff' : INK), padding: '0 30px'}}>{p.text}</div>, w, h)}
    </Pop>;
  }
  if (p.t === 'label' || p.t === 'sign') {
    return <Pop at={at} x={p.x} y={p.y} s={s} anim={p.anim || 'stamp'} rot={p.rot ?? -3} until={p.until}>
      {fo(<div style={{...txt(p.n || 72, p.color === INK ? '#fff' : INK), background: p.color || '#ffd166', border: `6px solid ${INK}`, borderRadius: 18, padding: '6px 34px', boxShadow: `8px 10px 0 ${INK}`, whiteSpace: 'nowrap'}}>{p.text}</div>, 1600, 200)}
    </Pop>;
  }
  if (p.t === 'big') {
    return <Pop at={at} x={p.x} y={p.y} s={s} anim={p.anim || 'stamp'} rot={p.rot} until={p.until}>
      {fo(<div style={{...txt(p.n || 260, p.color || '#ff4d5e'), WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>{p.text}</div>, 1600, 400)}
    </Pop>;
  }
  if (p.t === 'phone_chat') {
    const msgs = (p.text || '').split('|');
    return <Pop at={at} x={p.x} y={p.y} s={s} anim="pop" until={p.until}>
      <rect x={-130} y={-230} width={260} height={460} rx={34} fill={INK} /><rect x={-114} y={-206} width={228} height={412} rx={20} fill="#eef3fa" />
      {msgs.map((m, i) => {
        const shown = f >= at + 6 + i * (p.n || 8);
        if (!shown) return null;
        const left = i % 2 === 0;
        return <g key={i} transform={`translate(${left ? -100 : 100},${-170 + i * 68})`}>{fo(<div style={{...txt(30, left ? INK : '#fff'), background: left ? '#fff' : '#3a7bfd', borderRadius: 18, padding: '4px 16px',
          border: `3px solid ${INK}`, whiteSpace: 'nowrap', transform: `translateX(${left ? '45%' : '-45%'})`}}>{m}</div>, 10, 60)}</g>;
      })}
    </Pop>;
  }
  if (p.t === 'hearts') {
    return <g>{Array.from({length: p.n || 6}).map((_, i) => { const k = f - at - i * 6; if (k < 0) return null; const y = p.y - k * 5; return <g key={i} transform={`translate(${p.x + Math.sin(k / 8 + i) * 40 + (i - 3) * 20},${y}) scale(0.32)`} opacity={Math.max(0, 1 - k / 60)}>
      <g transform="translate(-90,-90)"><foreignObject width={180} height={180}><Icon name="heart" size={180} color="#ff4d5e" /></foreignObject></g></g>; })}</g>;
  }
  if (p.t === 'qrain') {
    return <g>{Array.from({length: p.n || 10}).map((_, i) => { const k = f - at - i * 3; if (k < 0) return null; const x = 160 + random(`q${i}`) * 1600, y = 120 + random(`qy${i}`) * 560;
      return <g key={i} transform={`translate(${x},${y}) rotate(${Math.sin(k / 6 + i) * 14}) scale(${Math.min(1, k / 6) * (0.4 + random(`qs${i}`) * 0.5)})`}><g transform="translate(-90,-90)"><foreignObject width={180} height={180}><Icon name="question" size={180} color={['#ff4d5e', '#3a86ff', '#ffd166'][i % 3]} /></foreignObject></g></g>; })}</g>;
  }
  if (p.t === 'sweat') return <Pop at={at} x={p.x} y={p.y} s={s} anim="float"><path d="M0,0 q-14,22 0,28 q14,-6 0,-28z" fill="#4cc9f0" stroke={INK} strokeWidth={3} /></Pop>;
  if (p.t === 'zzz') return <g>{[0, 1, 2].map((i) => { const k = (f - at + i * 15) % 45; return <text key={i} x={p.x + k} y={p.y - k * 1.4} style={txt(40 + i * 10) as any} fill={INK} opacity={1 - k / 45}>z</text>; })}</g>;
  if (p.t === 'spark') return null;
  if (p.t === 'motion') return <g>{[0, 1, 2, 3].map((i) => <line key={i} x1={p.x - 40 - ((f * 14 + i * 30) % 120)} y1={p.y + i * 26} x2={p.x - 140 - ((f * 14 + i * 30) % 120)} y2={p.y + i * 26} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.6} />)}</g>;
  if (p.t === 'spot') return <path d={`M${p.x - 60},0 h120 l${(p.s || 1) * 220},${GROUND} h-${(p.s || 1) * 440 + 120} z`} fill="#fff6a8" opacity={0.5 * lin(f, at, at + 8)} />;
  if (p.t === 'grid6') {
    const cols = ['#ff4d5e', '#2ec4b6', '#ff9f1c', INK, '#9b5de5', '#3a86ff'];
    return <g>{cols.map((c, i) => { const hi = p.n === 4 && i === 3; return <Pop key={i} at={at + i * 3} x={p.x + ((i % 3) - 1) * 300} y={p.y + Math.floor(i / 3) * 240} s={hi ? 1.15 + Math.sin(f / 4) * 0.05 : p.n ? 0.85 : 1} anim="pop">
      <rect x={-120} y={-95} width={240} height={190} rx={22} fill={c} stroke={INK} strokeWidth={7} opacity={p.n && !hi ? 0.45 : 1} />
      {fo(<div style={{...txt(140, '#fff'), WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>{i === 3 ? '?' : i + 1}</div>, 240, 190)}</Pop>; })}</g>;
  }
  if (p.t === 'orbit') {
    const icons = ['dumbbell', 'briefcase', 'music', 'globe', 'target', 'chart'];
    return <g>{icons.map((ic, i) => { const a = (i / icons.length) * Math.PI * 2 + (f - at) * 0.05; let x = p.x + Math.cos(a) * 430, y = p.y + Math.sin(a) * 200; let r = 0;
      if (p.anim === 'fall') { const k = Math.max(0, f - at - 4 - i * 3); y += k * k * 1.4; r = k * 10; }
      return <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(0.55)`}><circle r={100} fill="#fff" stroke={INK} strokeWidth={8} /><g transform="translate(-75,-75)"><foreignObject width={150} height={150}><Icon name={ic} size={150} color="#ff9f1c" /></foreignObject></g></g>; })}</g>;
  }
  if (p.t === 'comment') {
    const n = Math.floor(lin(f, at + 10, at + 36) * (p.text || '').length);
    return <Pop at={at} x={p.x} y={p.y} s={s} anim="pop">
      <rect x={-460} y={-90} width={920} height={180} rx={30} fill="#fff" stroke={INK} strokeWidth={7} /><circle cx={-370} cy={0} r={50} fill="#2ec4b6" stroke={INK} strokeWidth={5} />
      <g transform="translate(60,0)">{fo(<div style={{...txt(76), textAlign: 'left', width: 680}}>{(p.text || '').slice(0, n)}<span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span></div>, 680, 160)}</g>
    </Pop>;
  }
  if (p.t === 'subscribe') {
    const pressed = f > at + 24;
    return <Pop at={at} x={p.x} y={p.y} s={s * (pressed && f < at + 28 ? 0.9 : 1)} anim="pop">
      <rect x={-300} y={-80} width={600} height={160} rx={80} fill={pressed ? '#8d8d8d' : '#ff3b3b'} stroke={INK} strokeWidth={8} />
      {fo(<div style={txt(78, '#fff')}>{pressed ? 'SUBSCRIBED' : 'SUBSCRIBE'}</div>, 600, 160)}
    </Pop>;
  }
  if (p.t === 'heartbreak') {
    const k = Math.max(0, f - at);
    const half = (side: number) => <g transform={`translate(${side * Math.min(60, k * 4)},${Math.min(40, k * k * 0.2)}) rotate(${side * Math.min(25, k * 2)})`}>
      <g transform="translate(-90,-90)"><foreignObject width={180} height={180} style={{clipPath: side < 0 ? 'polygon(0 0,50% 0,44% 30%,56% 45%,45% 62%,55% 78%,50% 100%,0 100%)' : 'polygon(50% 0,100% 0,100% 100%,50% 100%,55% 78%,45% 62%,56% 45%,44% 30%)'}}>
        <Icon name="heart" size={180} color="#ff4d5e" /></foreignObject></g></g>;
    return <g transform={`translate(${p.x},${p.y}) scale(${s})`}>{half(-1)}{half(1)}</g>;
  }
  return null;
};

// ------------------------------------------------------------------ actors
const ActorView: React.FC<{a: Actor; idx: number}> = ({a, idx}) => {
  const f = useCurrentFrame();
  const at = a.at ?? 0;
  const sp = useSpr(at, 13);
  if (f < at) return null;
  const pose = poseAt(a.poses, f);
  let face: Face = a.face || 'neutral';
  if (a.faces) a.faces.forEach(([t, fc]) => { if (f >= t) face = fc; });
  let x = a.move ? kf(a.move, f) : a.x;
  let y = a.y ?? GROUND;
  if (a.enter === 'left') x -= (1 - sp) * 1200;
  if (a.enter === 'right') x += (1 - sp) * 1200;
  if (a.enter === 'drop') y -= (1 - sp) * 900;
  const sc = a.enter === 'pop' ? sp : 1;
  const size = a.size ?? 1.65;
  let holdEl: React.ReactNode = null;
  if (a.hold) {
    const [hx, hy] = handPos(pose, 'r', size, a.flip);
    const icon = a.hold.startsWith('sign:') ? null : a.hold;
    holdEl = <g transform={`translate(${hx},${hy})`}>
      {icon && <g transform="translate(-45,-60)"><foreignObject width={90} height={90} style={{overflow: 'visible'}}><Icon name={icon} size={90} color={icon === 'phone' ? '#3a86ff' : '#ff9f1c'} /></foreignObject></g>}
      {a.hold.startsWith('sign:') && <g transform="translate(0,-90)"><rect x={-150} y={-60} width={300} height={110} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
        <line x1={0} y1={50} x2={0} y2={95} stroke="#8b5a2b" strokeWidth={10} />{fo(<div style={txt(44)}>{a.hold.slice(5)}</div>, 300, 110)}</g>}
    </g>;
  }
  return <g transform={`translate(${x},${y}) scale(${sc})`}>
    <ellipse cx={0} cy={4} rx={70 * size} ry={10 * size} fill="#000" opacity={0.08} />
    <Stickman pose={pose} f={f} who={a.who} face={face} size={size} flip={a.flip} blinkSeed={idx} />
    {holdEl}
  </g>;
};

export const StickShot: React.FC<{spec: StickShotSpec; dur: number}> = ({spec, dur}) => {
  const f = useCurrentFrame();
  const z = spec.cam?.z ? interpolate(f, [0, dur], spec.cam.z, {extrapolateRight: 'clamp'}) : 1 + 0.04 * (f / dur);
  const cx = spec.cam?.x ? interpolate(f, [0, dur], spec.cam.x, {extrapolateRight: 'clamp'}) : 960;
  const cy = spec.cam?.y ? interpolate(f, [0, dur], spec.cam.y, {extrapolateRight: 'clamp'}) : 540;
  const shk = spec.shake !== undefined && f >= spec.shake && f < spec.shake + 10 ? (1 - (f - spec.shake) / 10) * 16 : 0;
  const sx = shk ? (random(`k${f}`) - 0.5) * 2 * shk : 0, sy = shk ? (random(`l${f}`) - 0.5) * 2 * shk : 0;
  const boil = Math.floor(f / 4) % 4;
  return (
    <AbsoluteFill style={{transform: `translate(${960 - cx + sx}px, ${540 - cy + sy}px) scale(${z})`, transformOrigin: `${cx}px ${cy}px`}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={`boil${boil}`}><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={boil * 7 + 1} /><feDisplacementMap in="SourceGraphic" scale={4} /></filter>
      </svg>
      <div style={{position: 'absolute', inset: 0, filter: `url(#boil${boil})`}}>
        <Background kind={spec.bg} />
        <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
          {(spec.props || []).filter((p) => p.t === 'spot').map((p, i) => <PropView key={`s${i}`} p={p} />)}
          {(spec.actors || []).map((a, i) => <ActorView key={i} a={a} idx={i} />)}
          {(spec.props || []).filter((p) => p.t !== 'spot').map((p, i) => <PropView key={i} p={p} />)}
        </svg>
      </div>
      {spec.title && <Title {...spec.title} />}
      {spec.flash !== undefined && f >= spec.flash && f < spec.flash + 6 && <AbsoluteFill style={{background: '#fff', opacity: 0.7 * (1 - (f - spec.flash) / 6)}} />}
    </AbsoluteFill>
  );
};

const Title: React.FC<{text: string; at?: number; color?: string; y?: number}> = ({text, at = 4, color = '#ffd166', y = 70}) => {
  const f = useCurrentFrame();
  const sp = useSpr(at, 10);
  if (f < at) return null;
  const u = lin(f, at + 4, at + 14);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: y}}>
      <div style={{transform: `scale(${0.4 + sp * 0.6}) rotate(${(1 - sp) * -8 - 2}deg)`, position: 'relative'}}>
        <div style={{...txt(80, color === INK ? '#fff' : INK), background: color, border: `7px solid ${INK}`, borderRadius: 20, padding: '4px 40px', boxShadow: `10px 12px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
        <svg width="100%" height={30} style={{position: 'absolute', left: 0, bottom: -34}}><path d="M10,15 q200,-14 400,0 t400,0" stroke="#ff4d5e" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} /></svg>
      </div>
    </AbsoluteFill>
  );
};
