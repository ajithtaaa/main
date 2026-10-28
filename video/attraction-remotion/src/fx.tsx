import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, FONT} from './theme';

export const useSpr = (delay = 0, damping = 12, stiffness = 170, mass = 0.8) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness, mass}});
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const lin = (f: number, a: number, b: number, from = 0, to = 1, e = ease) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

type PopFrom = 'scale' | 'up' | 'down' | 'left' | 'right' | 'rot' | 'drop' | 'slam' | 'flip';
export const Pop: React.FC<{delay?: number; from?: PopFrom; children: React.ReactNode; style?: React.CSSProperties; float?: number}> = ({
  delay = 0, from = 'scale', children, style, float = 0,
}) => {
  const f = useCurrentFrame();
  const s = useSpr(delay, from === 'slam' ? 14 : 11, from === 'slam' ? 260 : 170);
  let tr = '';
  if (from === 'scale') tr = `scale(${s})`;
  if (from === 'up') tr = `translateY(${(1 - s) * 260}px)`;
  if (from === 'down') tr = `translateY(${(s - 1) * 260}px)`;
  if (from === 'left') tr = `translateX(${(s - 1) * 900}px) rotate(${(1 - s) * -10}deg)`;
  if (from === 'right') tr = `translateX(${(1 - s) * 900}px) rotate(${(1 - s) * 10}deg)`;
  if (from === 'rot') tr = `scale(${s}) rotate(${(1 - s) * -180}deg)`;
  if (from === 'drop') tr = `translateY(${(s - 1) * 700}px)`;
  if (from === 'slam') tr = `scale(${1 + (1 - s) * 2.4})`;
  if (from === 'flip') tr = `perspective(800px) rotateY(${(1 - s) * 90}deg)`;
  const fl = float ? `translateY(${Math.sin((f - delay) / 14) * float}px)` : '';
  const op = f < delay ? 0 : from === 'slam' ? clamp01((f - delay) / 3) : 1;
  return <div style={{transform: `${tr} ${fl}`, opacity: op, display: 'inline-block', ...style}}>{children}</div>;
};

export const textStyle = (size: number, color = C.white, stroke = C.ink, sw = 0.12): React.CSSProperties => ({
  fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.25, color,
  WebkitTextStroke: stroke === 'none' ? undefined : `${Math.round(size * sw)}px ${stroke}`,
  paintOrder: 'stroke fill', textShadow: stroke === 'none' ? undefined : `0 ${size * 0.06}px 0 ${stroke}`,
  whiteSpace: 'nowrap',
});

// words fly in one by one
export const Kinetic: React.FC<{text: string; size?: number; delay?: number; stagger?: number; color?: string; stroke?: string; hl?: string; mode?: 'up' | 'slam' | 'rot'}> = ({
  text, size = 140, delay = 0, stagger = 4, color = C.white, stroke = C.ink, hl, mode = 'up',
}) => {
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.28}px`, maxWidth: 1700}}>
      {words.map((w, i) => (
        <Word key={i} delay={delay + i * stagger} mode={mode}>
          <span style={{...textStyle(size, hl && i === words.length - 1 ? hl : color, stroke)}}>{w}</span>
        </Word>
      ))}
    </div>
  );
};
const Word: React.FC<{delay: number; mode: string; children: React.ReactNode}> = ({delay, mode, children}) => {
  const f = useCurrentFrame();
  const s = useSpr(delay, 10, 190, 0.7);
  const op = f < delay ? 0 : 1;
  const tr = mode === 'slam' ? `scale(${1 + (1 - s) * 3}) rotate(${(1 - s) * 8}deg)` : mode === 'rot' ? `rotate(${(1 - s) * -30}deg) scale(${s})` : `translateY(${(1 - s) * 140}px) rotate(${(1 - s) * 12}deg) scale(${0.6 + s * 0.4})`;
  return <span style={{display: 'inline-block', transform: tr, opacity: op, transformOrigin: '50% 80%'}}>{children}</span>;
};

// bold label card
export const Card: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number; pad?: number; style?: React.CSSProperties}> = ({
  children, bg = C.yellow, color = C.ink, size = 72, rot = -2, pad = 0.35, style,
}) => (
  <div style={{background: bg, color, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.3, padding: `${size * pad * 0.6}px ${size * pad * 1.3}px`,
    border: `6px solid ${C.ink}`, borderRadius: 18, boxShadow: `10px 12px 0 ${C.ink}`, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

export const Burst: React.FC<{delay?: number; color?: string; n?: number; r0?: number; r1?: number; dur?: number; width?: number}> = ({
  delay = 0, color = C.yellow, n = 14, r0 = 140, r1 = 520, dur = 14, width = 14,
}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0 || f > dur) return null;
  const p = f / dur;
  const a = r0 + (r1 - r0) * ease(p);
  const b = r0 + (r1 - r0) * ease(Math.max(0, p - 0.35) / 0.65);
  return (
    <svg width={1200} height={1200} viewBox="-600 -600 1200 1200" style={{position: 'absolute', left: '50%', top: '50%', marginLeft: -600, marginTop: -600, pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + random(`b${i}${delay}`) * 0.3;
        return <line key={i} x1={Math.cos(ang) * b} y1={Math.sin(ang) * b} x2={Math.cos(ang) * a} y2={Math.sin(ang) * a} stroke={color} strokeWidth={width * (1 - p)} strokeLinecap="round" />;
      })}
    </svg>
  );
};

export const Rings: React.FC<{delay?: number; color?: string; count?: number; max?: number; dur?: number}> = ({delay = 0, color = C.white, count = 3, max = 900, dur = 26}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const p = clamp01((f - i * 5) / dur);
        if (p <= 0 || p >= 1) return null;
        const r = max * ease(p);
        return <div key={i} style={{position: 'absolute', width: r, height: r, borderRadius: '50%', border: `${14 * (1 - p)}px solid ${color}`, opacity: 1 - p}} />;
      })}
    </AbsoluteFill>
  );
};

export const Particles: React.FC<{seed: string; n?: number; colors?: string[]; delay?: number; spread?: number; mode?: 'burst' | 'float' | 'confetti'}> = ({
  seed, n = 26, colors = [C.yellow, C.pink, C.teal, C.white], delay = 0, spread = 700, mode = 'burst',
}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        let x = 960, y = 540, op = 1, s = 1;
        if (mode === 'burst') {
          const ang = r('a') * Math.PI * 2, sp = spread * (0.4 + r('s') * 0.6);
          const p = clamp01(f / 30);
          x += Math.cos(ang) * sp * ease(p); y += Math.sin(ang) * sp * ease(p) + p * p * 120; op = 1 - p; s = 1 - p * 0.5;
        } else if (mode === 'confetti') {
          x = r('x') * 1920; y = -60 + ((f * (4 + r('v') * 6) + r('y') * 1200) % 1200); s = 0.6 + r('s');
        } else {
          x = r('x') * 1920 + Math.sin(f / 30 + i) * 30; y = 1100 - ((f * (1 + r('v') * 2) + r('y') * 1200) % 1240); op = 0.5; s = 0.4 + r('s') * 0.8;
        }
        const size = 10 + r('z') * 18;
        const shape = i % 3;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size * s, height: shape === 1 ? size * s * 0.45 : size * s,
          borderRadius: shape === 0 ? '50%' : 3, background: colors[i % colors.length], opacity: op, transform: `rotate(${f * 8 * (r('r') - 0.5)}deg)`}} />;
      })}
    </AbsoluteFill>
  );
};

export const Rays: React.FC<{color?: string; opacity?: number; n?: number; speed?: number}> = ({color = '#ffffff', opacity = 0.12, n = 18, speed = 0.25}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity, pointerEvents: 'none'}}>
      <svg width={2600} height={2600} viewBox="-1300 -1300 2600 2600" style={{transform: `rotate(${f * speed}deg)`}}>
        {Array.from({length: n}).map((_, i) => {
          const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
          return <path key={i} d={`M0,0 L${Math.cos(a0) * 1400},${Math.sin(a0) * 1400} L${Math.cos(a1) * 1400},${Math.sin(a1) * 1400} Z`} fill={color} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{delay?: number; color?: string; dur?: number; max?: number}> = ({delay = 0, color = '#fff', dur = 6, max = 0.7}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0 || f > dur) return null;
  return <AbsoluteFill style={{background: color, opacity: max * (1 - f / dur), pointerEvents: 'none'}} />;
};

// camera shake offset after an impact
export const shake = (f: number, at: number, amp = 26, dur = 14) => {
  const k = f - at;
  if (k < 0 || k > dur) return {x: 0, y: 0, r: 0};
  const d = 1 - k / dur;
  return {x: (random(`sx${at}${k}`) - 0.5) * 2 * amp * d, y: (random(`sy${at}${k}`) - 0.5) * 2 * amp * d, r: (random(`sr${at}${k}`) - 0.5) * 2 * d};
};

// marker highlight that sweeps behind text
export const Sweep: React.FC<{delay?: number; color?: string; children: React.ReactNode; dur?: number}> = ({delay = 0, color = C.yellow, children, dur = 10}) => {
  const f = useCurrentFrame();
  const p = lin(f, delay, delay + dur);
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{position: 'absolute', left: -20, right: -20, top: '18%', bottom: '4%', background: color, transformOrigin: 'left', transform: `scaleX(${p}) skewX(-8deg)`, borderRadius: 8}} />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.32}}>
      <svg width="100%" height="100%">
        <filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 6} /></filter>
        <rect width="100%" height="100%" filter={`url(#g${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};
