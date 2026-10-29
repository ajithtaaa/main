import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import mediaManifest from './data/media.json';
import shotsData from './data/shots.json';
import {C, FONT, SCENES, inkOn} from './theme';
import {TEMPLATES, VeoLayer} from './templates';
import {Grain, Particles, clamp01, ease, lin, shake, textStyle} from './fx';

type Shot = {id: number; scene: number; from: number; to: number; tpl: string; props: any; text: string; cs: number; ce: number};
const SHOTS = shotsData as Shot[];
export const TOTAL = SHOTS[SHOTS.length - 1].to;
const SCENE_STARTS = SCENES.map((_, k) => SHOTS.find((s) => s.scene === k)!.from);
const IMPACT = new Set(['slam', 'number', 'cross', 'grid6', 'lock', 'words3', 'versus', 'bubble']);
const POINT_SHOTS = [26, 34, 43, 56, 68, 75];

const sceneAt = (f: number) => {
  let k = 0;
  SCENE_STARTS.forEach((s, i) => { if (f >= s) k = i; });
  return k;
};

const Background: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const sc = SCENES[k];
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 120% at 30% 20%, ${sc.bg[1]} 0%, ${sc.bg[0]} 70%)`, overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => {
        const x = 960 + Math.sin(f / (90 + i * 30) + i * 2) * 700, y = 540 + Math.cos(f / (110 + i * 20) + i) * 380;
        return <div key={i} style={{position: 'absolute', left: x - 450, top: y - 450, width: 900, height: 900, borderRadius: '50%',
          background: [sc.accent, sc.accent2, sc.bg[1]][i], opacity: 0.16, filter: 'blur(90px)'}} />;
      })}
      <AbsoluteFill style={{opacity: sc.dark ? 0.07 : 0.09, backgroundImage: `repeating-linear-gradient(-30deg, ${sc.dark ? '#fff' : '#000'} 0 2px, transparent 2px 46px)`,
        backgroundPosition: `${f * 1.2}px 0`}} />
      <AbsoluteFill style={{opacity: 0.25, backgroundImage: `radial-gradient(${sc.dark ? '#ffffff' : '#00000055'} 2.2px, transparent 2.6px)`, backgroundSize: '34px 34px',
        maskImage: 'radial-gradient(circle at 85% 85%, black 0%, transparent 40%)', WebkitMaskImage: 'radial-gradient(circle at 85% 85%, black 0%, transparent 40%)'}} />
      <Particles seed={`bg${k}`} n={18} mode="float" colors={[sc.accent, '#ffffff']} />
    </AbsoluteFill>
  );
};

const ShotWrap: React.FC<{s: Shot; children: React.ReactNode}> = ({s, children}) => {
  const f = useCurrentFrame();
  const dur = s.to - s.from;
  const inP = lin(f, 0, 7);
  const outP = lin(f, dur - 1, dur + 6);
  const push = 1 + 0.045 * clamp01(f / Math.max(1, dur));
  const variant = s.id % 3;
  const enterScale = variant === 0 ? 1.25 - 0.25 * inP : variant === 1 ? 0.85 + 0.15 * inP : 1;
  const enterX = variant === 2 ? (1 - inP) * 260 * (s.id % 2 ? 1 : -1) : 0;
  const sh = IMPACT.has(s.tpl) || s.props.shake ? shake(f, 3, 22, 12) : {x: 0, y: 0, r: 0};
  const blur = (1 - inP) * 14 + outP * 18;
  return (
    <AbsoluteFill style={{transform: `translate(${enterX + sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${enterScale * push * (1 + outP * 0.25)})`, opacity: 1 - outP, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// AI (Veo) background clip for a whole story section, tinted to the section palette
const SceneVeo: React.FC<{k: number}> = ({k}) => {
  const file = (mediaManifest as {veo: string[]}).veo.find((x) => x === `scene${k}.mp4`);
  if (!file) return null;
  const from = SCENE_STARTS[k];
  const to = k + 1 < SCENE_STARTS.length ? SCENE_STARTS[k + 1] : TOTAL;
  const sc = SCENES[k];
  return (
    <Sequence from={from} durationInFrames={to - from + 10} layout="none">
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(`veo/${file}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: `linear-gradient(135deg, ${sc.bg[0]}, ${sc.bg[1]})`, opacity: 0.5, mixBlendMode: 'multiply'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
    </Sequence>
  );
};

const StripeWipe: React.FC<{at: number; colors: string[]}> = ({at, colors}) => {
  const f = useCurrentFrame() - at;
  if (f < -8 || f > 10) return null;
  const p = (f + 8) / 18;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {colors.map((c, i) => {
        const x = interpolate(p, [0, 1], [-2600, 2600]) - i * 260;
        return <div key={i} style={{position: 'absolute', top: -400, left: x, width: 900, height: 1900, background: c, transform: 'rotate(18deg)'}} />;
      })}
    </AbsoluteFill>
  );
};

// word-by-word karaoke caption
const weight = (w: string) => Array.from(w).reduce((a, ch) => a + (/[ാ-്ൗം]/.test(ch) ? 0.35 : 1), 0) + 1.5;
export const Caption: React.FC<{s: Shot; next?: Shot; ink: string}> = ({s, next}) => {
  const f = useCurrentFrame();
  const words = s.text.split(' ');
  const ws = words.map(weight);
  const tot = ws.reduce((a, b) => a + b, 0);
  const prog = clamp01((f - s.cs) / Math.max(1, s.ce - s.cs)) * tot;
  const end = next ? next.cs - 2 : s.ce + 30;
  if (f < s.cs - 3 || f > end) return null;
  const pin = lin(f, s.cs - 3, s.cs + 4);
  let acc = 0;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 24px', maxWidth: 1700, transform: `translateY(${(1 - pin) * 40}px)`, opacity: pin}}>
        {words.map((w, i) => {
          const a = acc; acc += ws[i];
          const active = prog >= a && prog < acc;
          const done = prog >= acc;
          const k = active ? clamp01((prog - a) / ws[i]) : 0;
          return <span key={i} style={{...textStyle(64, active ? C.yellow : C.white, C.ink, 0.14), display: 'inline-block', opacity: done || active ? 1 : 0.7,
            transform: `scale(${active ? 1.06 - 0.03 * k : 1}) translateY(${active ? -5 : 0}px)`}}>{w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Tracker: React.FC = () => {
  const f = useCurrentFrame();
  const a = SHOTS[26].from - 4, b = SHOTS[81].from;
  if (f < a || f > b) return null;
  const cur = POINT_SHOTS.filter((id) => f >= SHOTS[id].from).length;
  const op = lin(f, a, a + 8) * (1 - lin(f, b - 8, b));
  const cols = [C.red, C.teal, C.pink, C.red, C.purple, C.orange];
  return (
    <div style={{position: 'absolute', right: 26, top: 22, display: 'flex', gap: 8, opacity: op}}>
      {cols.map((c, i) => {
        const on = i < cur, now = i === cur - 1;
        return <div key={i} style={{width: 44, height: 44, borderRadius: '50%', background: on ? c : '#ffffffcc', border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${now ? 1.2 + Math.sin(f / 6) * 0.05 : 1})`, ...textStyle(24, on ? C.white : C.ink, 'none')}}>{i + 1}</div>;
      })}
    </div>
  );
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const k = sceneAt(f);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      <Background k={k} />
      {SCENES.map((_, i) => <SceneVeo key={`v${i}`} k={i} />)}
      {SHOTS.map((s) => {
        const T = TEMPLATES[s.tpl];
        const sc = SCENES[s.scene];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from + 6} layout="none">
            <AbsoluteFill>
              <VeoLayer id={s.id} />
              <ShotWrap s={s}>{T ? <T p={s.props} dur={s.to - s.from} sc={sc} ink={inkOn(sc)} id={s.id} /> : null}</ShotWrap>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {SCENE_STARTS.slice(1).map((at, i) => <StripeWipe key={i} at={at} colors={[SCENES[i + 1].accent, C.ink, SCENES[i + 1].bg[1], C.white]} />)}
      <Tracker />
      {SHOTS.map((s, i) => <Caption key={`c${s.id}`} s={s} next={SHOTS[i + 1]} ink={C.white} />)}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
