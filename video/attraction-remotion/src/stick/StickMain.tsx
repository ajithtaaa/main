import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import shotsData from '../data/stick_shots.json';
import {Caption, Tracker} from '../Main';
import {StickShot, StickShotSpec, INK} from './StickScene';

type S = {id: number; scene: number; from: number; to: number; cs: number; ce: number; text: string; spec: StickShotSpec; tpl: string; props: any};
const SHOTS = shotsData as unknown as S[];
export const STICK_TOTAL = SHOTS[SHOTS.length - 1].to;
const SCENE_STARTS = Array.from(new Set(SHOTS.map((s) => s.scene))).map((k) => SHOTS.find((s) => s.scene === k)!.from);

const Wrap: React.FC<{s: S; children: React.ReactNode}> = ({s, children}) => {
  const f = useCurrentFrame();
  const dur = s.to - s.from;
  const i = interpolate(f, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = interpolate(f, [dur, dur + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = s.id % 4;
  const tx = v === 1 ? (1 - i) * 220 : v === 3 ? (1 - i) * -220 : 0;
  const sc = v === 0 ? 1.15 - 0.15 * i : v === 2 ? 0.9 + 0.1 * i : 1;
  return <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${sc * (1 + o * 0.12)})`, opacity: 1 - o}}>{children}</AbsoluteFill>;
};

// ink circle wipe between story sections
const InkWipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - at;
  if (f < -9 || f > 9) return null;
  const r = f < 0 ? interpolate(f, [-9, 0], [0, 1300]) : interpolate(f, [0, 9], [1300, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}><circle cx={960} cy={480} r={r} fill={INK} />
        <circle cx={960} cy={480} r={Math.max(0, r - 40)} fill="none" stroke="#ffd166" strokeWidth={14} strokeDasharray="40 30" /></svg>
    </AbsoluteFill>
  );
};

export const StickMain: React.FC = () => (
  <AbsoluteFill style={{background: '#fbf7ee'}}>
    {SHOTS.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from + 5} layout="none">
        <Wrap s={s}><StickShot spec={s.spec} dur={s.to - s.from} /></Wrap>
      </Sequence>
    ))}
    {SCENE_STARTS.slice(1).map((at, i) => <InkWipe key={i} at={at} />)}
    <Tracker />
    {SHOTS.map((s, i) => <Caption key={`c${s.id}`} s={s as any} next={SHOTS[i + 1] as any} ink="#fff" />)}
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(60,40,20,0.18) 100%)'}} />
  </AbsoluteFill>
);
