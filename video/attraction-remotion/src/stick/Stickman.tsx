import React from 'react';

// Skeleton units (scaled by `size`): angles in degrees, 0 = pointing straight down, + = towards facing side
export type Pose = {lean: number; head: number; la1: number; la2: number; ra1: number; ra2: number; ll1: number; ll2: number; rl1: number; rl2: number; lift?: number};
const P = (lean: number, head: number, la1: number, la2: number, ra1: number, ra2: number, ll1: number, ll2: number, rl1: number, rl2: number, lift = 0): Pose =>
  ({lean, head, la1, la2, ra1, ra2, ll1, ll2, rl1, rl2, lift});

// "l" = back limb, "r" = front limb (figure faces right; flip mirrors)
const STATIC: Record<string, Pose> = {
  stand: P(0, 0, -12, 4, 12, -4, -6, 0, 6, 0),
  sad: P(14, 22, -4, 2, 4, -2, -5, 0, 5, 0),
  shrug: P(0, -6, -70, -100, 70, 100, -6, 0, 6, 0),
  think: P(0, -10, -10, 0, 40, 140, -6, 0, 6, 0),
  point: P(-4, 0, -14, 4, 92, 0, -8, 0, 8, 0),
  cheer: P(-6, -14, -140, -15, 140, 15, -10, 0, 10, 0),
  heart: P(0, 0, 40, 130, 40, 130, -6, 0, 6, 0),
  phone: P(6, 18, -10, 2, 46, 120, -5, 0, 5, 0),
  facepalm: P(10, 20, -8, 2, 60, 150, -5, 0, 5, 0),
  flex: P(0, -6, -95, -80, 95, 80, -14, 0, 14, 0),
  kneel: P(6, 10, -20, 10, 50, 60, -80, 100, 30, -10),
  sit: P(-4, 0, 30, 40, 30, 40, 90, -90, 90, -90),
  arms_open: P(-4, -8, -115, 0, 115, 0, -10, 0, 10, 0),
  hug: P(4, 4, 70, 70, 70, 70, -6, 0, 6, 0),
  listen: P(8, 14, -10, 2, 30, 125, -5, 0, 5, 0),
  stop: P(-4, 0, -12, 4, 85, -90, -8, 0, 8, 0),
  cross_arms: P(0, -4, 35, 110, 35, 110, -8, 0, 8, 0),
  lean_in: P(16, 8, 20, 30, 20, 30, -10, 0, 14, 0),
  fall: P(70, 30, -150, 0, 150, 0, -40, 20, 40, -20),
};

const sin = Math.sin;
// animated poses: functions of frame
const ANIM: Record<string, (f: number) => Pose> = {
  idle: (f) => ({...STATIC.stand, lean: sin(f / 20) * 1.5, head: sin(f / 26) * 3, la1: -12 + sin(f / 20) * 3, ra1: 12 - sin(f / 20) * 3}),
  walk: (f) => { const s = sin(f / 4.2); return P(4, 0, -s * 32, 10, s * 32, -10, s * 30, Math.max(0, -s) * 40, -s * 30, Math.max(0, s) * 40, Math.abs(sin(f / 4.2)) * 4); },
  run: (f) => { const s = sin(f / 2.6); return P(18, -6, -s * 60, 80, s * 60, 80, s * 50, 40 + Math.max(0, -s) * 60, -s * 50, 40 + Math.max(0, s) * 60, Math.abs(s) * 12); },
  talk: (f) => ({...STATIC.stand, ra1: 50 + sin(f / 5) * 25, ra2: 60 + sin(f / 7) * 30, head: sin(f / 6) * 5}),
  wave: (f) => ({...STATIC.stand, ra1: 100, ra2: 55 + sin(f / 3) * 30}),
  cheer_jump: (f) => ({...STATIC.cheer, lift: Math.abs(sin(f / 5)) * 50, ll1: -20 - Math.abs(sin(f / 5)) * 20, rl1: 20 + Math.abs(sin(f / 5)) * 20}),
  jump: (f) => ({...STATIC.cheer, lift: Math.abs(sin(f / 6)) * 70, ll1: -30, ll2: 50, rl1: 30, rl2: -50}),
  dance: (f) => P(sin(f / 4) * 10, sin(f / 4) * 10, -120 + sin(f / 4) * 40, 40, 120 + sin(f / 4) * 40, -40, -15 + sin(f / 4) * 10, 10, 15 + sin(f / 4) * 10, -10, Math.abs(sin(f / 4)) * 12),
  lift: (f) => { const u = (sin(f / 6) + 1) / 2; return P(0, -4, -100 - u * 60, -110 + u * 110, 100 + u * 60, 110 - u * 110, -14, 0, 14, 0); },
  type: (f) => ({...STATIC.phone, ra2: 120 + sin(f * 1.2) * 8, head: 20}),
  clap: (f) => ({...STATIC.stand, la1: 60, la2: 60 + sin(f / 2) * 25, ra1: 60, ra2: 60 + sin(f / 2) * 25}),
  sad_walk: (f) => ({...ANIM.walk(f * 0.6), lean: 16, head: 25, la1: -6, ra1: 6}),
  shiver: (f) => ({...STATIC.cross_arms, lean: sin(f * 2) * 2}),
  breathe_sad: (f) => ({...STATIC.sad, head: 22 + sin(f / 15) * 2}),
  angry: (f) => ({...STATIC.stand, la1: -30, la2: -20, ra1: 30, ra2: 20, head: -4 + sin(f * 1.5) * 2, lean: sin(f * 1.5) * 2}),
  calm_breath: (f) => ({...STATIC.stand, la1: -25, la2: 40, ra1: 25, ra2: -40, head: -6 + sin(f / 18) * 2}),
};

export const getPose = (name: string, f: number): Pose => (ANIM[name] ? ANIM[name](f) : STATIC[name] || STATIC.stand);
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const o: any = {};
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => { o[k] = (a[k] || 0) + ((b[k] || 0) - (a[k] || 0)) * t; });
  return o;
};
// timeline of poses: [[frame, name], ...] blended over 7 frames
export const poseAt = (seq: [number, string][], f: number): Pose => {
  let i = 0;
  for (let k = 0; k < seq.length; k++) if (f >= seq[k][0]) i = k;
  const cur = getPose(seq[i][1], f);
  if (i === 0) return cur;
  const t = Math.min(1, (f - seq[i][0]) / 7);
  const e = t * t * (3 - 2 * t);
  return e >= 1 ? cur : mix(getPose(seq[i - 1][1], f), cur, e);
};

export type Face = 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' | 'love' | 'smirk' | 'cry' | 'determined' | 'shy' | 'sleep';
export type Who = 'arjun' | 'girl' | 'girl2' | 'guy' | 'grey';

const rad = (d: number) => (d * Math.PI) / 180;
const seg = (x: number, y: number, ang: number, len: number) => [x + Math.sin(rad(ang)) * len, y + Math.cos(rad(ang)) * len];

export const Stickman: React.FC<{pose: Pose; f: number; who?: Who; face?: Face; size?: number; flip?: boolean; ink?: string; blinkSeed?: number}> = ({
  pose, f, who = 'arjun', face = 'neutral', size = 1.25, flip = false, ink = '#1b1b1f', blinkSeed = 0,
}) => {
  const U = {torso: 95, ul: 58, ll: 58, ua: 48, fa: 46, hr: 30};
  const grey = who === 'grey';
  const col = grey ? '#9a9aa2' : ink;
  // hip height so the lowest foot touches the ground (y=0 at ground)
  const legY = (a1: number, a2: number) => Math.cos(rad(a1)) * U.ul + Math.cos(rad(a1 + a2)) * U.ll;
  const hipY = -Math.max(legY(pose.ll1, pose.ll2), legY(pose.rl1, pose.rl2)) - (pose.lift || 0);
  const hip = [0, hipY];
  const neck = [Math.sin(rad(pose.lean)) * U.torso, hipY - Math.cos(rad(pose.lean)) * U.torso];
  const shoulder = [neck[0] + (hip[0] - neck[0]) * 0.12, neck[1] + (hip[1] - neck[1]) * 0.12];
  const headC = [neck[0] + Math.sin(rad(pose.lean + pose.head * 0.6)) * (U.hr + 6), neck[1] - Math.cos(rad(pose.lean + pose.head * 0.6)) * (U.hr + 6)];
  const limb = (o: number[], a1: number, a2: number, l1: number, l2: number) => {
    const k = seg(o[0], o[1], a1 + pose.lean * 0.3, l1);
    const e = seg(k[0], k[1], a1 + a2 + pose.lean * 0.3, l2);
    return {d: `M${o[0]},${o[1]} L${k[0]},${k[1]} L${e[0]},${e[1]}`, end: e};
  };
  const la = limb(shoulder, pose.la1, pose.la2, U.ua, U.fa);
  const ra = limb(shoulder, pose.ra1, pose.ra2, U.ua, U.fa);
  const ll = limb(hip, pose.ll1, pose.ll2, U.ul, U.ll);
  const rl = limb(hip, pose.rl1, pose.rl2, U.ul, U.ll);
  const sw = 7.5;
  const blink = ((f + blinkSeed * 37) % 110) < 4;
  const [hx, hy] = headC;
  const hr = U.hr;
  const eyeY = hy - 2, ex1 = hx + 4, ex2 = hx + 17;
  const tilt = pose.head;
  const dress = who === 'girl' ? '#ff4d5e' : who === 'girl2' ? '#9b5de5' : null;
  const shirt = who === 'arjun' ? '#3a86ff' : who === 'guy' ? '#2ec4b6' : null;
  const eyes = () => {
    if (face === 'love') return <>{[ex1, ex2].map((x, i) => <path key={i} d={`M${x},${eyeY + 4} c-7,-5 -6,-11 0,-8 c6,-3 7,3 0,8z`} fill="#ff3b5c" />)}</>;
    if (face === 'sleep' || blink) return <>{[ex1, ex2].map((x, i) => <path key={i} d={`M${x - 4},${eyeY} q4,3 8,0`} stroke={col} strokeWidth={3} fill="none" />)}</>;
    if (face === 'happy' || face === 'shy') return <>{[ex1, ex2].map((x, i) => <path key={i} d={`M${x - 4},${eyeY + 1} q4,-6 8,0`} stroke={col} strokeWidth={3.2} fill="none" strokeLinecap="round" />)}</>;
    const r = face === 'surprised' ? 4.6 : 3.6;
    return <>{[ex1, ex2].map((x, i) => <circle key={i} cx={x} cy={eyeY} r={r} fill={col} />)}</>;
  };
  const brows = () => {
    if (face === 'angry' || face === 'determined') return <path d={`M${ex1 - 6},${eyeY - 12} l10,5 M${ex2 + 6},${eyeY - 12} l-10,5`} stroke={col} strokeWidth={3.2} strokeLinecap="round" />;
    if (face === 'sad' || face === 'cry') return <path d={`M${ex1 - 6},${eyeY - 7} l10,-5 M${ex2 + 6},${eyeY - 7} l-10,-5`} stroke={col} strokeWidth={3.2} strokeLinecap="round" />;
    if (face === 'surprised') return <path d={`M${ex1 - 5},${eyeY - 12} q5,-5 10,0 M${ex2 - 5},${eyeY - 12} q5,-5 10,0`} stroke={col} strokeWidth={3} fill="none" />;
    return null;
  };
  const mouth = () => {
    const mx = hx + 10, my = hy + 13;
    if (face === 'happy' || face === 'love') return <path d={`M${mx - 9},${my - 2} q9,11 18,0 z`} fill={col} />;
    if (face === 'shy' || face === 'smirk') return <path d={`M${mx - 6},${my} q7,5 13,-2`} stroke={col} strokeWidth={3} fill="none" strokeLinecap="round" />;
    if (face === 'sad' || face === 'cry') return <path d={`M${mx - 8},${my + 4} q8,-8 16,0`} stroke={col} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    if (face === 'surprised') return <ellipse cx={mx} cy={my + 2} rx={5} ry={7} fill={col} />;
    if (face === 'angry') return <path d={`M${mx - 8},${my + 3} l16,0`} stroke={col} strokeWidth={3.5} strokeLinecap="round" />;
    if (face === 'determined') return <path d={`M${mx - 7},${my + 1} q7,3 14,0`} stroke={col} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    if (face === 'sleep') return <ellipse cx={mx} cy={my + 2} rx={3} ry={3} fill={col} />;
    return <path d={`M${mx - 6},${my + 1} l12,0`} stroke={col} strokeWidth={3} strokeLinecap="round" />;
  };
  const tear = face === 'cry' ? <path d={`M${ex1},${eyeY + 6 + (f % 20)} q-4,6 0,8 q4,-2 0,-8z`} fill="#4cc9f0" /> : null;
  const blush = face === 'shy' || face === 'love' ? <><ellipse cx={ex1 - 3} cy={eyeY + 9} rx={5} ry={3} fill="#ff8fa3" opacity={0.7} /><ellipse cx={ex2 + 5} cy={eyeY + 9} rx={5} ry={3} fill="#ff8fa3" opacity={0.7} /></> : null;
  const hair = () => {
    if (who === 'arjun') return <path d={`M${hx - hr + 4},${hy - 10} l6,-26 l8,16 l8,-22 l8,18 l10,-20 l6,20 l10,-12 l2,22`} stroke={col} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />;
    if (who === 'girl') return <path d={`M${hx + 10},${hy - hr - 2} q-46,-4 -46,44 q0,40 -8,58 M${hx - 4},${hy - hr} q-30,10 -30,50`} stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (who === 'girl2') return <path d={`M${hx - 20},${hy - 20} q-20,-16 -34,6 q-8,14 6,30`} stroke={col} strokeWidth={8} fill="none" strokeLinecap="round" />;
    if (who === 'guy') return <path d={`M${hx - hr + 2},${hy - 6} q${hr},-${hr * 1.3} ${hr * 2 - 4},0`} stroke={col} strokeWidth={8} fill="none" strokeLinecap="round" />;
    return null;
  };
  return (
    <g transform={`scale(${flip ? -size : size},${size})`}>
      {dress && <path d={`M${shoulder[0]},${shoulder[1] + 4} L${hip[0] - 34},${hip[1] + 28} L${hip[0] + 34},${hip[1] + 28} Z`} fill={dress} stroke={col} strokeWidth={4} strokeLinejoin="round" />}
      <path d={ll.d} stroke={col} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={rl.d} stroke={col} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${hip[0]},${hip[1]} L${neck[0]},${neck[1]}`} stroke={shirt || col} strokeWidth={shirt ? sw * 2.2 : sw} strokeLinecap="round" />
      {shirt && <path d={`M${hip[0]},${hip[1]} L${neck[0]},${neck[1]}`} stroke={col} strokeWidth={sw} strokeLinecap="round" opacity={0} />}
      <path d={la.d} stroke={col} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={ra.d} stroke={col} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`rotate(${tilt * 0.5} ${hx} ${hy})`}>
        <circle cx={hx} cy={hy} r={hr} fill="#fffdf7" stroke={col} strokeWidth={sw} />
        {hair()}
        {brows()}{eyes()}{blush}{mouth()}{tear}
      </g>
    </g>
  );
};

// hand positions are handy for attaching props (phone, dumbbell...)
export const handPos = (pose: Pose, side: 'l' | 'r', size = 1.25, flip = false) => {
  const U = {torso: 95, ul: 58, ll: 58, ua: 48, fa: 46};
  const legY = (a1: number, a2: number) => Math.cos(rad(a1)) * U.ul + Math.cos(rad(a1 + a2)) * U.ll;
  const hipY = -Math.max(legY(pose.ll1, pose.ll2), legY(pose.rl1, pose.rl2)) - (pose.lift || 0);
  const neck = [Math.sin(rad(pose.lean)) * U.torso, hipY - Math.cos(rad(pose.lean)) * U.torso];
  const sh = [neck[0] + (0 - neck[0]) * 0.12, neck[1] + (hipY - neck[1]) * 0.12];
  const a1 = side === 'l' ? pose.la1 : pose.ra1, a2 = side === 'l' ? pose.la2 : pose.ra2;
  const k = seg(sh[0], sh[1], a1 + pose.lean * 0.3, U.ua);
  const e = seg(k[0], k[1], a1 + a2 + pose.lean * 0.3, U.fa);
  return [e[0] * size * (flip ? -1 : 1), e[1] * size];
};
