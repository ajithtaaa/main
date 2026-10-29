import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stickman, getPose, Face, Who} from './Stickman';
import {FONT} from '../theme';

const INK = '#1b1b1f';
const INFO: Record<string, {name: string; ml: string; role: string; colors: string[]; notes: string[]}> = {
  arjun: {name: 'Arjun', ml: 'അർജുൻ', role: '26 · നായകൻ / the hero', colors: ['#3a86ff', '#1b1b1f', '#fffdf7'],
    notes: ['Spiky black hair (5 spikes)', 'Blue T-shirt torso', 'Round head, dot eyes', 'Faces right by default']},
  girl: {name: 'The girl', ml: 'അവൾ', role: 'Arjun\'s first crush', colors: ['#ff4d5e', '#1b1b1f', '#fffdf7'],
    notes: ['Long flowing hair', 'Red triangle dress', 'Rosy blush when shy', 'Usually faces left']},
};

const label = (size = 30, color = INK): React.CSSProperties => ({fontFamily: FONT, fontWeight: 700, fontSize: size, color, lineHeight: 1.2, textAlign: 'center'});

const Fig: React.FC<{who: Who; pose: string; face: Face; size?: number; flip?: boolean; w: number; h: number; f?: number; head?: boolean}> = ({who, pose, face, size = 1.1, flip, w, h, f = 30, head}) => {
  const vb = head ? `${-40 * size} ${-300 * size} ${100 * size} ${100 * size}` : `${-150} ${-400} 300 420`;
  return (
    <svg width={w} height={h} viewBox={vb} style={{overflow: head ? 'hidden' : 'visible'}}>
      {!head && <line x1={-140} y1={0} x2={140} y2={0} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      <Stickman pose={getPose(pose, f)} f={f} who={who} face={face} size={size} flip={flip} />
    </svg>
  );
};

const Cell: React.FC<{title: string; children: React.ReactNode; w: number}> = ({title, children, w}) => (
  <div style={{width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
    {children}
    <div style={label(22)}>{title}</div>
  </div>
);

const FACES: [Face, string][] = [['neutral', 'neutral'], ['happy', 'happy'], ['love', 'in love'], ['shy', 'shy'], ['surprised', 'surprised'], ['sad', 'sad'], ['cry', 'crying'], ['angry', 'angry'], ['determined', 'determined'], ['smirk', 'confident']];
const POSES: [string, string][] = [['idle', 'idle'], ['walk', 'walk'], ['run', 'run'], ['talk', 'talk'], ['wave', 'wave'], ['heart', 'heart hands'], ['sad', 'slumped'], ['think', 'think'], ['cheer', 'cheer'], ['phone', 'phone'], ['flex', 'flex'], ['shrug', 'shrug']];

export const CharacterSheet: React.FC<{who: Who}> = ({who}) => {
  const info = INFO[who];
  return (
    <AbsoluteFill style={{background: '#fbf7ee', padding: '34px 50px', fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, borderBottom: `5px solid ${INK}`, paddingBottom: 14}}>
        <div style={{...label(78), fontWeight: 800}}>{info.ml}</div>
        <div style={{...label(44), fontWeight: 800}}>{info.name}</div>
        <div style={{...label(30, '#555')}}>{info.role}</div>
        <div style={{flex: 1}} />
        {info.colors.map((c) => <div key={c} style={{width: 54, height: 54, borderRadius: 12, background: c, border: `4px solid ${INK}`}} />)}
        <div style={{...label(26), marginLeft: 10}}>CHARACTER SHEET</div>
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 18}}>
        <div style={{display: 'flex', gap: 10, alignItems: 'flex-end', background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 18px'}}>
          <Cell title="facing right" w={210}><Fig who={who} pose="stand" face="happy" w={210} h={300} /></Cell>
          <Cell title="facing left" w={210}><Fig who={who} pose="stand" face="happy" flip w={210} h={300} /></Cell>
        </div>
        <div style={{flex: 1, background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 18px'}}>
          <div style={{...label(28), textAlign: 'left', fontWeight: 800}}>EXPRESSIONS</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {FACES.map(([fc, t]) => <Cell key={fc} title={t} w={118}><Fig who={who} pose="stand" face={fc} head w={112} h={112} size={1.6} f={fc === 'cry' ? 12 : 30} /></Cell>)}
          </div>
          <div style={{display: 'flex', gap: 18, marginTop: 8}}>
            {info.notes.map((n) => <div key={n} style={{...label(22, '#333'), background: '#fff3b0', border: `3px solid ${INK}`, borderRadius: 10, padding: '2px 12px'}}>{n}</div>)}
          </div>
        </div>
      </div>
      <div style={{marginTop: 18, background: '#fff', border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 18px'}}>
        <div style={{...label(28), textAlign: 'left', fontWeight: 800}}>KEY POSES</div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {POSES.map(([p, t], i) => <Cell key={p} title={t} w={140}><Fig who={who} pose={p} face={p === 'sad' ? 'sad' : p === 'heart' ? 'love' : p === 'think' ? 'neutral' : 'happy'} w={150} h={250} size={1.15} f={8 + i * 3} /></Cell>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CAST: [Who, string, string, string][] = [
  ['arjun', 'അർജുൻ', 'Arjun', 'hero'], ['girl', 'അവൾ', 'First crush', 'red dress'], ['girl2', 'പുതിയ കൂട്ടുകാരി', 'New partner', 'purple dress, bun'],
  ['guy', 'പയ്യൻ', 'Show-off guy', 'teal shirt'], ['grey', 'ആൾക്കൂട്ടം', 'Crowd', 'grey, background'],
];
export const CastSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#fbf7ee', padding: '40px 60px', fontFamily: FONT}}>
    <div style={{...label(64), fontWeight: 800, textAlign: 'left', borderBottom: `5px solid ${INK}`, paddingBottom: 10}}>CAST · കഥാപാത്രങ്ങൾ</div>
    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 60}}>
      {CAST.map(([w, ml, en, note], i) => (
        <div key={w} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Fig who={w} pose={['wave', 'idle', 'heart', 'flex', 'idle'][i]} face={['happy', 'happy', 'love', 'smirk', 'neutral'][i] as Face} flip={w === 'girl' || w === 'girl2'} w={320} h={460} size={1.25} f={20} />
          <div style={{...label(46), fontWeight: 800}}>{ml}</div>
          <div style={label(30)}>{en}</div>
          <div style={{...label(22, '#555')}}>{note}</div>
        </div>
      ))}
    </div>
    <div style={{...label(26, '#444'), marginTop: 50}}>Line: 7.5px round-cap ink · Head: off-white fill · Lines "boil" every 4 frames for a hand-drawn feel · Font: Anek Malayalam</div>
  </AbsoluteFill>
);
