import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, Scene} from './theme';
import {Icon, Person} from './icons';
import {Burst, Card, Flash, Kinetic, Particles, Pop, Rays, Rings, Sweep, clamp01, ease, lin, textStyle, useSpr} from './fx';
import mediaManifest from './data/media.json';

export type TP = {p: any; dur: number; sc: Scene; ink: string; id: number};
const M = mediaManifest as {veo: string[]; pins: string[]};

const Stage: React.FC<{children: React.ReactNode; gap?: number; dir?: 'row' | 'column'}> = ({children, gap = 40, dir = 'column'}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190, flexDirection: dir, gap}}>{children}</AbsoluteFill>
);
const At: React.FC<{x: number; y: number; children: React.ReactNode; z?: number}> = ({x, y, children, z}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', zIndex: z}}>{children}</div>
);
const Title: React.FC<{t: string; delay?: number; bg?: string; color?: string; size?: number; rot?: number; from?: any}> = ({t, delay = 4, bg = C.yellow, color = C.ink, size = 76, rot = -2, from = 'slam'}) =>
  t ? <Pop delay={delay} from={from}><Card bg={bg} color={bg === C.ink && color === C.ink ? C.white : color} size={size} rot={rot}>{t}</Card></Pop> : null;
const drawP = (f: number, d: number, len = 18) => lin(f, d, d + len);
const fillP = (f: number, d: number) => lin(f, d + 10, d + 20);

const HeroIcon: React.FC<{name: string; delay?: number; size?: number; color?: string; spin?: boolean; float?: number}> = ({name, delay = 0, size = 320, color = C.red, spin, float = 8}) => {
  const f = useCurrentFrame();
  const s = useSpr(delay, 9, 160);
  return (
    <div style={{transform: `scale(${0.3 + 0.7 * s}) rotate(${spin ? (1 - s) * -90 : Math.sin(f / 18) * 4}deg) translateY(${Math.sin(f / 15) * float}px)`, opacity: f >= delay ? 1 : 0}}>
      <Icon name={name} size={size} color={color} draw={drawP(f, delay)} fill={fillP(f, delay)} />
    </div>
  );
};

// ---------------------------------------------------------------------------------- templates
const slam: React.FC<TP> = ({p, sc, ink}) => {
  const f = useCurrentFrame();
  const lines: string[] = p.lines;
  return (
    <>
      {p.icon && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190, opacity: 0.22}}>
        <div style={{transform: `scale(${2.6 + f * 0.01}) rotate(${f * 0.4}deg)`}}><Icon name={p.icon} size={300} color={sc.accent} fill={1} draw={1} /></div>
      </AbsoluteFill>}
      <Burst delay={2} color={sc.accent} />
      <Rings delay={2} color={sc.accent2} />
      <Stage gap={0}>
        {lines.map((l, i) => (
          <div key={i} style={{marginTop: i ? -10 : 0}}>
            <Kinetic text={l} size={Math.min(lines.length === 1 ? 230 : 150, Math.floor(1750 / (Array.from(l).length * 0.5)))} delay={i * 7} stagger={3} mode="slam" color={i === lines.length - 1 ? sc.accent : ink === C.white ? C.white : C.ink}
              stroke={ink === C.white ? C.ink : C.white} />
          </div>
        ))}
      </Stage>
      {p.end && <Particles seed="end" n={60} mode="confetti" />}
    </>
  );
};

const number: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const s = useSpr(0, 13, 120);
  const n = p.count ? Math.round(lin(f, 0, 18) * p.n) : p.n;
  return (
    <>
      <Rays color={sc.accent} opacity={0.18} speed={1.2} />
      <Rings delay={4} color={C.white} count={4} max={1400} />
      <Burst delay={4} color={sc.accent} n={20} r0={200} r1={700} />
      <Flash delay={3} />
      <Stage>
        <div style={{transform: `scale(${0.2 + s * 0.8 + Math.sin(f / 10) * 0.02}) rotate(${(1 - s) * 360}deg)`}}>
          <div style={{...textStyle(p.n > 99 ? 300 : 440, sc.accent, C.ink, 0.06), textShadow: `14px 18px 0 ${C.ink}`}}>{n}</div>
        </div>
        {p.title && <Title t={p.title} delay={10} size={70} bg={C.white} />}
      </Stage>
    </>
  );
};

const cross: React.FC<TP> = ({p, sc, dur}) => {
  const items = p.items as {icon: string; label: string}[];
  const st = Math.min(14, Math.floor((dur - 20) / Math.max(1, items.length)));
  const f = useCurrentFrame();
  return (
    <Stage dir="row" gap={110}>
      {items.map((it, i) => {
        const d = i * st;
        const xd = d + 12;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative'}}>
            <Pop delay={d} from="drop" float={6}>
              <div style={{background: C.white, borderRadius: '50%', border: `8px solid ${C.ink}`, boxShadow: `10px 12px 0 ${C.ink}`, padding: 34}}>
                <Icon name={it.icon} size={items.length > 1 ? 200 : 300} color={sc.accent2} draw={drawP(f, d, 12)} fill={fillP(f, d - 4)} />
              </div>
            </Pop>
            <Pop delay={d + 5} from="up"><Card size={items.length > 1 ? 56 : 80} bg={sc.accent} rot={i % 2 ? 2 : -2}>{it.label}</Card></Pop>
            {p.mark === 'x' && <div style={{position: 'absolute', top: -30}}><Pop delay={xd} from="slam"><Icon name="x" size={items.length > 1 ? 300 : 420} color={C.red} draw={drawP(f, xd, 6)} /></Pop></div>}
            {p.mark === 'x' && <div style={{position: 'absolute', top: 100, left: '50%'}}><Burst delay={xd + 2} color={C.red} r0={60} r1={300} n={10} /></div>}
          </div>
        );
      })}
    </Stage>
  );
};

const people: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const mode = p.mode;
  const sL = useSpr(0, 12, 140), sR = useSpr(4, 12, 140);
  const near = mode === 'love' || mode === 'support' ? lin(f, 10, 40, 0, 120) : 0;
  return (
    <>
      <Rays color={sc.accent} opacity={0.12} />
      <AbsoluteFill>
        {mode !== 'her' && <At x={1920 / 2 + 330 - near + (1 - sR) * 900} y={560}><Person kind="man" size={480} mouth={mode === 'crush' || mode === 'love' ? 'smile' : 'flat'} arm={mode === 'support' ? 0.6 + Math.sin(f / 5) * 0.1 : 0} /></At>}
        <At x={1920 / 2 - 330 + near - (1 - sL) * 900 + (mode === 'her' ? 330 : 0)} y={560}><Person kind="woman" size={470} mouth={mode === 'her' ? 'flat' : 'smile'} /></At>
        {(mode === 'love' || mode === 'crush' || mode === 'notice') && (
          <At x={960} y={mode === 'notice' ? 300 : 330}>
            <div style={{transform: `scale(${useSpr(12, 8, 200) * (1 + Math.sin(f / 4) * 0.08)})`}}><Icon name={mode === 'notice' ? 'eye' : 'heart'} size={220} color={mode === 'notice' ? C.teal : C.red} /></div>
          </At>
        )}
        {mode === 'crush' && Array.from({length: 6}).map((_, i) => {
          const k = (f - 8 - i * 6);
          if (k < 0) return null;
          return <At key={i} x={700 + i * 50 + Math.sin(k / 6 + i) * 40} y={620 - k * 9}><div style={{opacity: clamp01(1 - k / 40)}}><Icon name="heart" size={70} color={C.pink} /></div></At>;
        })}
        {mode === 'support' && <At x={1290} y={300}><Pop delay={8} from="rot"><Icon name="megaphone" size={170} color={C.yellow} /></Pop></At>}
      </AbsoluteFill>
      {(mode === 'love' || mode === 'crush') && <Burst delay={12} color={C.pink} r0={120} r1={380} />}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 50}}><Title t={p.title} delay={6} bg={sc.accent} /></AbsoluteFill>
    </>
  );
};

const lock: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const open = p.open && f > 22;
  const jig = !open ? Math.sin(f * 1.7) * lin(f, 6, 18, 0, 8) * (f < 30 ? 1 : 0.2) : 0;
  return (
    <>
      <Rays color={open ? C.yellow : sc.accent} opacity={open ? 0.35 : 0.12} speed={open ? 2 : 0.4} />
      {open && <Flash delay={22} color={C.yellow} max={0.6} dur={10} />}
      {open && <Particles seed="lock" delay={22} n={40} spread={900} />}
      <Stage>
        <Pop delay={0} from="drop"><div style={{transform: `rotate(${jig}deg)`}}><Icon name={open ? 'lockopen' : 'lock'} size={340} color={C.yellow} draw={drawP(f, 0)} fill={fillP(f, 0)} /></div></Pop>
        <Title t={p.title} delay={10} bg={C.red} color={C.white} size={96} />
      </Stage>
    </>
  );
};

const idcard: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const s = useSpr(0, 11, 150);
  return (
    <>
      <Rings delay={4} color={sc.accent} />
      <Stage>
        <div style={{transform: `perspective(1200px) rotateY(${(1 - s) * 120}deg) rotateZ(${-3 + Math.sin(f / 20) * 1.5}deg)`, background: C.white, border: `8px solid ${C.ink}`, borderRadius: 28,
          boxShadow: `16px 18px 0 ${C.ink}`, width: 1060, height: 460, display: 'flex', overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: p.upgrade ? C.green : C.blue}} />
          <div style={{position: 'absolute', top: 14, left: 30, ...textStyle(40, C.white, 'none')}}>{p.upgrade ? 'UPGRADED' : 'STORY'}</div>
          <div style={{marginTop: 100, marginLeft: 40}}><Person kind="man" size={330} mouth={p.upgrade ? 'smile' : 'flat'} color={p.upgrade ? C.green : C.blue} /></div>
          <div style={{marginTop: 130, marginLeft: 40}}>
            <Kinetic text={p.name} size={110} delay={8} color={C.ink} stroke="none" />
            {p.age && <Pop delay={16} from="left"><Card size={60} bg={C.yellow}>{p.age}</Card></Pop>}
          </div>
        </div>
      </Stage>
      {p.upgrade && <Particles seed="up" delay={10} n={40} />}
    </>
  );
};

const checks: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  return (
    <Stage gap={30}>
      <HeroIcon name={p.icon} size={250} color={sc.accent2} />
      {(p.items as string[]).map((t, i) => (
        <Pop key={i} delay={8 + i * 8} from={i % 2 ? 'right' : 'left'}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Icon name="check" size={90} color={C.green} draw={drawP(f, 14 + i * 8, 8)} />
            <Card size={70} bg={C.white} rot={i % 2 ? 2 : -2}>{t}</Card>
          </div>
        </Pop>
      ))}
    </Stage>
  );
};

const chat: React.FC<TP> = ({p, sc, dur}) => {
  const f = useCurrentFrame();
  const msgs: string[] = p.msgs;
  const step = p.fast ? 5 : Math.max(6, Math.floor((dur - 12) / msgs.length));
  const s = useSpr(0, 12, 140);
  const shown = msgs.filter((_, i) => f >= 6 + i * step);
  const scroll = Math.max(0, shown.length - 5) * 96;
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 170}}>
        <div style={{transform: `translateY(${(1 - s) * 900}px) rotate(${Math.sin(f / 16) * 2 - 2}deg)`, width: 470, height: 780, background: C.ink, borderRadius: 60, padding: 22, boxShadow: '20px 24px 0 rgba(0,0,0,0.35)'}}>
          <div style={{width: '100%', height: '100%', background: '#eef2f7', borderRadius: 40, overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', top: 20 - scroll, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 18, padding: 22}}>
              {shown.map((m, i) => {
                const left = i % 2 === 0;
                return (
                  <div key={i} style={{alignSelf: left ? 'flex-start' : 'flex-end'}}>
                    <Pop delay={6 + i * step} from="scale">
                      <div style={{background: left ? C.white : '#3a7bfd', color: left ? C.ink : C.white, fontFamily: FONT, fontWeight: 700, fontSize: 40, padding: '10px 26px', borderRadius: 28, boxShadow: '0 4px 0 rgba(0,0,0,0.15)'}}>{m}</div>
                    </Pop>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {p.clock && <At x={1420} y={320}><Pop delay={4} from="rot"><div style={{position: 'relative'}}><Icon name="clock" size={260} color={C.red} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 108, textAlign: 'center'}} /></div></Pop>
        <div style={{marginTop: 10, display: 'flex', justifyContent: 'center'}}><Pop delay={10} from="up"><Card bg={C.ink} color={C.white} size={56}>2:00 AM</Card></Pop></div></At>}
      {p.title && <At x={500} y={420}><Title t={p.title} delay={6} bg={C.red} color={C.white} size={84} rot={-6} /></At>}
      {p.fast && <Burst delay={4} color={sc.accent2} />}
    </>
  );
};

const quote: React.FC<TP> = ({p, sc, dur}) => {
  const f = useCurrentFrame();
  const words = (p.text as string).split(' ');
  const per = Math.max(2, Math.floor((dur * 0.7) / words.length));
  const bg = p.gold ? C.yellow : p.love ? C.pink : p.chat ? '#3a7bfd' : C.white;
  const fg = p.gold || !p.chat && !p.love ? C.ink : C.white;
  const s = useSpr(0, 12, 160);
  const crack = p.break ? lin(f, dur - 26, dur - 14) : 0;
  return (
    <>
      <At x={360} y={260}><div style={{...textStyle(400, sc.accent, C.ink, 0.04), transform: `scale(${s}) rotate(-10deg)`, opacity: 0.9}}>“</div></At>
      <Stage>
        <div style={{transform: `scale(${0.5 + s * 0.5}) rotate(${-1.5 + Math.sin(f / 22)}deg)`, maxWidth: 1400, background: bg, border: `8px solid ${C.ink}`, borderRadius: 40, boxShadow: `16px 18px 0 ${C.ink}`,
          padding: '40px 60px', display: 'flex', flexWrap: 'wrap', gap: '0 24px', justifyContent: 'center'}}>
          {words.map((w, i) => (
            <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.35, color: fg, opacity: f >= 4 + i * per ? 1 : 0.12,
              transform: `translateY(${f >= 4 + i * per ? 0 : 20}px)`, display: 'inline-block'}}>{w}</span>
          ))}
        </div>
        {(p.gold || p.love) && <Particles seed={`q${p.text}`} delay={10} n={30} />}
      </Stage>
      {p.break && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        {crack > 0 && <svg width={1400} height={500} viewBox="0 0 1400 500" style={{position: 'absolute'}}>
          <path d="M700,0 L660,120 L740,200 L650,320 L720,400 L690,500" fill="none" stroke={C.ink} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
        </svg>}
      </AbsoluteFill>}
      {p.break && <Flash delay={dur - 14} color={C.red} max={0.35} />}
      {p.love && <At x={1600} y={260}><HeroIcon name="heart" size={200} delay={10} /></At>}
    </>
  );
};

const orbit: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const icons = ['dumbbell', 'briefcase', 'music', 'globe', 'target', 'chart'];
  return (
    <>
      <Rings delay={0} color={sc.accent} count={2} />
      <AbsoluteFill>
        <At x={960} y={460} z={2}><Pop from="scale"><Person kind="woman" size={340} mouth="smile" /></Pop></At>
        {icons.map((ic, i) => {
          const ang = (i / icons.length) * Math.PI * 2 + f * 0.05;
          let x = 960 + Math.cos(ang) * 470, y = 450 + Math.sin(ang) * 270;
          let rot = 0;
          if (p.fall) { const k = Math.max(0, f - 6 - i * 3); y += k * k * 1.6; rot = k * 12 * (i % 2 ? 1 : -1); }
          return <At key={i} x={x} y={y}><div style={{transform: `rotate(${rot}deg) scale(${useSpr(i * 2, 10, 180)})`, background: C.white, borderRadius: '50%', border: `6px solid ${C.ink}`, padding: 18}}>
            <Icon name={ic} size={110} color={sc.accent2} /></div></At>;
        })}
        {!p.fall && <svg width={1920} height={1080} style={{position: 'absolute'}}><ellipse cx={960} cy={450} rx={470} ry={270} fill="none" stroke={C.white} strokeOpacity={0.4} strokeWidth={4} strokeDasharray="14 18" strokeDashoffset={-f * 3} /></svg>}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={4} bg={p.fall ? C.blue : sc.accent} color={p.fall ? C.white : C.ink} /></AbsoluteFill>
    </>
  );
};

const empty: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const shrink = lin(f, 0, 30, 1, 0.15);
  return (
    <Stage>
      <div style={{width: 520 * shrink + 40, height: 520 * shrink + 40, borderRadius: '50%', border: `10px dashed ${C.white}`, transform: `rotate(${f * 3}deg)`, opacity: 0.8}} />
      <Title t={p.title} delay={6} bg={C.ink} color={C.white} size={90} />
    </Stage>
  );
};

const mystery: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill>{Array.from({length: 14}).map((_, i) => {
        const r = (k: string) => random(`m${i}${k}`);
        return <At key={i} x={r('x') * 1800 + 60} y={r('y') * 760 + 60}><Pop delay={i * 2} from="rot"><div style={{transform: `rotate(${Math.sin(f / 10 + i) * 15}deg)`}}>
          <Icon name="question" size={60 + r('s') * 120} color={[C.yellow, C.pink, C.white][i % 3]} /></div></Pop></At>;
      })}</AbsoluteFill>
      <Stage><div style={{...textStyle(210, C.white, C.ink)}}><Sweep delay={8} color={sc.accent2}><Kinetic text={p.title} size={210} stagger={2} mode="rot" color={C.white} /></Sweep></div></Stage>
    </>
  );
};

const depth: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        {Array.from({length: 9}).map((_, i) => {
          const k = ((i / 9 + f / 70) % 1);
          const sz = 1800 * (1 - k);
          return <div key={i} style={{position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `6px solid ${sc.accent}`, opacity: k}} />;
        })}
      </AbsoluteFill>
      <Stage><Pop from="slam"><div style={textStyle(260, C.white, C.ink)}>{p.title}</div></Pop></Stage>
    </>
  );
};

const grid6: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const cols = [C.red, C.teal, C.orange, C.ink, C.purple, C.blue];
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 36}}><Title t={p.title} delay={2} bg={C.white} size={70} /></AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 170}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 300px)', gap: 50}}>
          {cols.map((c, i) => {
            const hi = p.highlight === i + 1;
            return (
              <Pop key={i} delay={4 + i * 3} from="flip">
                <div style={{height: 230, background: c, border: `8px solid ${C.ink}`, borderRadius: 26, boxShadow: `10px 12px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: hi ? `scale(${1.15 + Math.sin(f / 4) * 0.05}) rotate(${Math.sin(f / 3) * 4}deg)` : p.highlight ? 'scale(0.9)' : undefined, opacity: p.highlight && !hi ? 0.45 : 1}}>
                  <div style={textStyle(170, C.white, C.ink, 0.06)}>{i === 3 ? '?' : i + 1}</div>
                </div>
              </Pop>
            );
          })}
        </div>
      </AbsoluteFill>
      {p.highlight && <Burst delay={6} color={C.red} />}
    </>
  );
};

const MediaFill: React.FC<{k: string; zoom?: boolean}> = ({k, zoom = true}) => {
  const f = useCurrentFrame();
  const pin = M.pins.find((x) => x.startsWith(k + '.'));
  const sc = zoom ? 1.05 + f * 0.0012 : 1;
  if (pin) return <Img src={staticFile(`pins/${pin}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`}} />;
  return <IllustratedScene k={k} />;
};

const IllustratedScene: React.FC<{k: string}> = ({k}) => {
  const f = useCurrentFrame();
  if (k === 'trek') {
    const sunY = 640 - lin(f, 0, 60, 0, 280);
    return <svg width={1920} height={1080}>
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7e5f" /><stop offset="1" stopColor="#feb47b" /></linearGradient></defs>
      <rect width={1920} height={1080} fill="url(#sky)" />
      <circle cx={960} cy={sunY} r={170} fill="#fff1c1" />
      <path d={`M${-100 - f},1080 L${400 - f},420 L${800 - f},820 L${1200 - f * 0.5},380 L${1700 - f * 0.5},860 L2100,600 L2100,1080 Z`} fill="#7a3e65" />
      <path d={`M-100,1080 L${300 - f * 2},720 L${900 - f * 2},1080 Z M${900 - f * 1.5},1080 L${1500 - f * 1.5},700 L${2200 - f * 1.5},1080 Z`} fill="#4a2545" />
      <g transform={`translate(${1150 - f * 0.8},640)`}><circle cx={0} cy={0} r={18} fill={C.ink} /><rect x={-10} y={16} width={20} height={56} fill={C.ink} /><circle cx={44} cy={8} r={16} fill={C.ink} /><rect x={36} y={22} width={18} height={50} fill={C.ink} /></g>
    </svg>;
  }
  if (k === 'food') {
    return <svg width={1920} height={1080}>
      <rect width={1920} height={1080} fill="#2a1446" />
      {Array.from({length: 60}).map((_, i) => <circle key={i} cx={(random(`fx${i}`) * 2200 - f * 2) % 2000 + 40} cy={random(`fy${i}`) * 600} r={10 + random(`fr${i}`) * 34}
        fill={['#ffd166', '#ff6b6b', '#ffe8a3', '#f78c6b'][i % 4]} opacity={0.35 + 0.35 * Math.sin(f / 6 + i)} />)}
      <rect y={700} width={1920} height={380} fill="#3b1a2a" />
      {Array.from({length: 5}).map((_, i) => <g key={i} transform={`translate(${i * 420 - 60 - f * 1.5},560)`}>
        <rect width={320} height={150} fill={[C.red, C.yellow, C.teal, C.orange, C.pink][i]} /><path d="M-20,0 L160,-90 L340,0 Z" fill="#f4ead8" />
        <rect x={20} y={40} width={280} height={30} fill="#ffffff55" /></g>)}
      {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${300 + i * 200},700 q-20,-40 0,-80 q20,-40 0,-80`} stroke="#ffffff44" strokeWidth={8} fill="none" transform={`translate(0,${-((f * 3 + i * 20) % 60)})`} />)}
    </svg>;
  }
  if (k === 'rain') {
    return <svg width={1920} height={1080}>
      <rect width={1920} height={1080} fill="#40566e" />
      <rect y={820} width={1920} height={260} fill="#26323f" />
      {Array.from({length: 14}).map((_, i) => <rect key={i} x={((i * 200 - f * 30) % 2200 + 2200) % 2200 - 100} y={930} width={100} height={12} fill={C.yellow} />)}
      <g transform={`translate(760,${560 + Math.sin(f / 2) * 4})`}><Icon name="bike" size={420} color={C.red} /></g>
      <g transform="translate(860,470)"><circle r={36} fill={C.ink} /><rect x={-30} y={30} width={70} height={110} rx={20} fill={C.blue} /></g>
      <g transform="translate(790,480)"><circle r={32} fill={C.ink} /><rect x={-28} y={26} width={62} height={100} rx={20} fill={C.red} /></g>
      {Array.from({length: 160}).map((_, i) => { const x = random(`rx${i}`) * 2000, y = (random(`ry${i}`) * 1100 + f * 40) % 1100; return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} stroke="#dbe8f5" strokeWidth={3} opacity={0.7} />; })}
    </svg>;
  }
  if (k === 'couple') {
    return <svg width={1920} height={1080}>
      <defs><linearGradient id="sun2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6f61" /><stop offset="1" stopColor="#ffd194" /></linearGradient></defs>
      <rect width={1920} height={1080} fill="url(#sun2)" />
      <circle cx={960} cy={560} r={260 + Math.sin(f / 12) * 6} fill="#fff1c9" />
      <rect y={760} width={1920} height={320} fill="#5b2a3c" />
      <g transform="translate(830,420)"><Person kind="woman" size={360} color={C.ink} /></g>
      <g transform="translate(980,400)"><Person kind="man" size={380} color={C.ink} /></g>
      {Array.from({length: 10}).map((_, i) => { const k2 = (f * 2 + i * 40) % 400; return <g key={i} transform={`translate(${760 + i * 45 + Math.sin(k2 / 30) * 30},${560 - k2})`} opacity={1 - k2 / 400}><Icon name="heart" size={60} color={C.pink} /></g>; })}
    </svg>;
  }
  return <AbsoluteFill style={{background: '#555'}} />;
};

const media: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const s = useSpr(0, 13, 150);
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 150}}>
        <div style={{width: 1500, height: 780, border: `14px solid ${C.white}`, borderRadius: 24, boxShadow: `18px 22px 0 ${C.ink}`, overflow: 'hidden',
          transform: `scale(${0.6 + s * 0.4}) rotate(${(1 - s) * 10 - 1.5}deg)`, background: '#222'}}>
          <div style={{width: 1920, height: 1080, transform: 'scale(0.82)', transformOrigin: '0 0', marginLeft: -40, marginTop: -40}}><MediaFill k={p.key} /></div>
        </div>
      </AbsoluteFill>
      <At x={960} y={110}><Title t={p.title} delay={6} bg={C.yellow} size={80} /></At>
      <Flash delay={0} max={0.5} />
    </>
  );
};

const icons4: React.FC<TP> = ({p, sc, dur}) => {
  const f = useCurrentFrame();
  const items = p.items as {icon: string; label: string; media?: string}[];
  const st = p.check ? 0 : Math.max(5, Math.floor((dur - 12) / items.length));
  return (
    <Stage dir="row" gap={60}>
      {items.map((it, i) => {
        const d = p.check ? (i === items.length - 1 ? 0 : -30) : i * st;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative'}}>
            <Pop delay={d} from="drop" float={8}>
              <div style={{background: C.white, borderRadius: 40, border: `8px solid ${C.ink}`, boxShadow: `12px 14px 0 ${C.ink}`, padding: 30}}>
                <Icon name={it.icon} size={210} color={sc.accent2 === C.white ? C.purple : sc.accent2} draw={d < 0 ? 1 : drawP(f, d, 12)} fill={d < 0 ? 1 : fillP(f, d - 4)} />
              </div>
            </Pop>
            <Pop delay={d + 4} from="up"><Card size={60} bg={sc.accent === C.ink ? C.yellow : sc.accent} rot={i % 2 ? 3 : -3}>{it.label}</Card></Pop>
            {p.check && <div style={{position: 'absolute', top: -50, right: -50}}><Pop delay={d + 8} from="slam"><Icon name="check" size={150} color={C.green} draw={d < 0 ? 1 : drawP(f, d + 8, 6)} /></Pop></div>}
          </div>
        );
      })}
    </Stage>
  );
};

const fireeye: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Rays color={C.orange} opacity={0.25} speed={1.5} />
      <Stage>
        <div style={{display: 'flex', gap: 80, alignItems: 'center'}}>
          {[0, 1].map((i) => (
            <div key={i} style={{position: 'relative'}}>
              <HeroIcon name="eye" size={330} color={C.orange} delay={i * 3} />
              <div style={{position: 'absolute', left: 95, top: 40, transform: `scale(${lin(f, 10, 20) * (1 + Math.sin(f / 2 + i) * 0.08)}, ${lin(f, 10, 20) * (1 + Math.cos(f / 2.3 + i) * 0.12)})`, transformOrigin: '50% 100%'}}>
                <Icon name="flame" size={150} color={C.orange} />
              </div>
            </div>
          ))}
        </div>
        <Title t={p.title} delay={14} bg={C.red} color={C.white} />
      </Stage>
      <Particles seed="fire" n={40} mode="float" colors={[C.orange, C.yellow]} />
    </>
  );
};

const portal: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const s = useSpr(0, 14, 90);
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        <div style={{width: 700 * s, height: 700 * s, borderRadius: '50%', background: `conic-gradient(${sc.accent}, ${C.pink}, ${C.teal}, ${sc.accent})`, transform: `rotate(${f * 6}deg)`, border: `10px solid ${C.ink}`}} />
        <div style={{position: 'absolute', width: 520 * s, height: 520 * s, borderRadius: '50%', background: C.ink}} />
        <div style={{position: 'absolute', transform: `scale(${lin(f, 6, 40, 1, 0.2)}) translateX(${lin(f, 6, 40, -700, 0)}px)`, opacity: lin(f, 30, 45, 1, 0)}}><Person kind="woman" size={300} mouth="smile" /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={4} bg={C.white} /></AbsoluteFill>
    </>
  );
};

const run: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const chase = p.mode === 'chase';
  const bob = Math.abs(Math.sin(f / 3)) * 18;
  return (
    <>
      <AbsoluteFill>
        <div style={{position: 'absolute', top: 760, left: 0, right: 0, height: 120, background: '#2b2b35'}} />
        {Array.from({length: 14}).map((_, i) => <div key={i} style={{position: 'absolute', top: 812, left: ((i * 180 - f * 26) % 2520 + 2520) % 2520 - 300, width: 100, height: 14, background: C.yellow}} />)}
        <At x={chase ? 1260 : 1000} y={560 - bob}><div style={{transform: `rotate(${chase ? 0 : 8}deg)`}}><Person kind={chase ? 'woman' : 'man'} size={420} mouth={chase ? 'flat' : 'smile'} arm={Math.sin(f / 3) * 0.3 + 0.2} /></div></At>
        {chase && <At x={640 + Math.sin(f / 5) * 20} y={560 - bob}><Person kind="man" size={400} arm={0.5 + Math.sin(f / 3) * 0.3} mouth="sad" /></At>}
        {chase && <At x={640} y={260}><Pop delay={10} from="slam"><Icon name="x" size={260} color={C.red} draw={drawP(f, 10, 6)} /></Pop></At>}
        {!chase && <At x={1720} y={520}><Pop delay={8} from="drop"><Icon name="target" size={260} /></Pop></At>}
        {Array.from({length: 8}).map((_, i) => <div key={i} style={{position: 'absolute', left: (chase ? 1080 : 820) - ((f * 30 + i * 60) % 400), top: 420 + i * 30, width: 120, height: 8, borderRadius: 4, background: C.white, opacity: 0.5}} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={4} bg={chase ? C.grey : sc.accent} color={C.ink} /></AbsoluteFill>
    </>
  );
};

const listen: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage dir="row" gap={60}>
        <HeroIcon name="ear" size={360} color={C.skin} />
        <svg width={360} height={360} viewBox="0 0 100 100">
          {[0, 1, 2, 3].map((i) => { const k = ((f / 20 + i / 4) % 1); return <path key={i} d={`M10,${50 - 10 - k * 40} Q${30 + k * 60},50 10,${50 + 10 + k * 40}`} transform="scale(-1,1) translate(-100,0)" fill="none" stroke={C.yellow} strokeWidth={5} opacity={1 - k} />; })}
        </svg>
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={6} bg={C.yellow} size={84} /></AbsoluteFill>
    </>
  );
};

const versus: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const sl = useSpr(p.step ? -40 : 0, 12, 150), sr = useSpr(p.step ? -40 : 6, 12, 150);
  const markD = p.step ? 4 : 999;
  const loser = p.win === 'right' ? 'left' : 'right';
  const side = (which: 'left' | 'right') => {
    const win = p.win === which;
    const s = which === 'left' ? sl : sr;
    return (
      <div style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, background: which === 'left' ? '#00000033' : '#ffffff18',
        transform: `translateX(${(1 - s) * (which === 'left' ? -1000 : 1000)}px)`, paddingBottom: 190}}>
        <Card size={80} bg={p.step && f > markD ? (win ? (p.flip ? C.orange : C.green) : C.grey) : C.white} rot={which === 'left' ? -3 : 3}
          style={{transform: `scale(${p.step && f > markD ? (win ? 1.12 : 0.86) : 1}) rotate(${which === 'left' ? -3 : 3}deg)`}}>{p[which]}</Card>
        {p.step ? <Pop delay={markD} from="slam"><Icon name={win ? (p.flip ? 'warn' : 'check') : 'x'} size={220} color={win ? (p.flip ? C.orange : C.green) : C.red} draw={drawP(f, markD, 7)} /></Pop> : null}
      </div>
    );
  };
  return (
    <>
      <AbsoluteFill style={{flexDirection: 'row'}}>{side('left')}{side('right')}</AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        <div style={{width: 12, height: 900, background: C.white, transform: `rotate(8deg) scaleY(${lin(f, 0, 10)})`}} />
        <div style={{position: 'absolute'}}><Pop delay={6} from="rot"><div style={{width: 160, height: 160, borderRadius: '50%', background: sc.accent === C.ink ? C.red : sc.accent, border: `8px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...textStyle(70, C.ink, 'none')}}>VS</div></Pop></div>
      </AbsoluteFill>
      {p.step ? <Burst delay={markD} color={C.green} /> : null}
    </>
  );
};

const calendar: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const n = p.flip ? Math.round(lin(f, 0, 30) * p.n) : p.n;
  return (
    <Stage dir="row" gap={70}>
      <Pop from="drop">
        <div style={{position: 'relative'}}>
          <Icon name="calendar" size={380} color={p.flip ? C.green : C.red} draw={drawP(f, 0)} fill={1} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...textStyle(n > 99 ? 120 : 170, C.ink, 'none')}}>{n}</div>
        </div>
      </Pop>
      {Array.from({length: 4}).map((_, i) => { const k = f - 4 - i * 4; return k > 0 && k < 30 ? <At key={i} x={660 + k * 12} y={300 - k * 6 + k * k * 0.6}><div style={{width: 120, height: 140, background: C.white, border: `4px solid ${C.ink}`, transform: `rotate(${k * 10}deg)`, opacity: 1 - k / 30}} /></At> : null; })}
      <Title t={p.title} delay={8} bg={sc.accent === C.ink ? C.yellow : sc.accent} size={90} rot={3} from="right" />
    </Stage>
  );
};

const smile: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Rays color={C.yellow} opacity={0.25} speed={1} />
      <Stage>
        <div style={{transform: `scale(${1 + lin(f, 8, 16) * 0.1})`}}><Person kind="woman" size={480} mouth={f > 10 ? 'smile' : 'flat'} /></div>
        <Title t={p.title} delay={12} bg={C.pink} color={C.white} />
      </Stage>
      <Particles seed="smile" delay={10} n={30} />
      <Burst delay={10} color={C.yellow} />
    </>
  );
};

const crowd: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  return (
    <>
      {p.spot && <AbsoluteFill style={{alignItems: 'center'}}><div style={{width: 700, height: 1080, background: 'linear-gradient(#fff6c8cc, #fff6c800)', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', opacity: lin(f, 0, 8)}} /></AbsoluteFill>}
      <AbsoluteFill>{Array.from({length: 7}).map((_, i) => {
        const me = p.spot && i === 3;
        return <At key={i} x={210 + i * 250} y={600}><Pop delay={i * 2} from="up"><div style={{transform: me ? `scale(${1.25 + Math.sin(f / 5) * 0.03})` : 'none'}}>
          <Person kind="man" size={320} grey={!me} mouth={me ? 'smile' : 'flat'} /></div></Pop></At>;
      })}</AbsoluteFill>
      {p.spot && <Particles seed="spot" delay={4} n={26} spread={500} />}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={6} bg={p.spot ? C.yellow : C.grey} size={84} /></AbsoluteFill>
    </>
  );
};

const study: React.FC<TP> = ({p, sc}) => (
  <Stage dir="row" gap={80}>
    <HeroIcon name="brain" size={360} color={C.pink} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start'}}>
      <Title t={p.title} delay={6} bg={C.white} size={70} from="right" />
      {[0, 1, 2].map((i) => <Pop key={i} delay={12 + i * 4} from="left"><div style={{width: 520 - i * 90, height: 26, borderRadius: 13, background: C.white, opacity: 0.7}} /></Pop>)}
    </div>
  </Stage>
);

const chart: React.FC<TP> = ({p, sc, dur}) => {
  const f = useCurrentFrame();
  const vals = p.spike ? [0.2, 0.9, 0.6, 0.3, 0.15] : [0.15, 0.3, 0.5, 0.75, 1];
  return (
    <Stage>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: 520, borderBottom: `10px solid ${C.white}`, padding: '0 40px'}}>
        {vals.map((v, i) => {
          const h = 500 * v * lin(f, 2 + i * 4, 16 + i * 4);
          return <div key={i} style={{width: 130, height: h, background: i === vals.indexOf(Math.max(...vals)) ? C.yellow : C.white, border: `6px solid ${C.ink}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />;
        })}
      </div>
      <Title t={p.title} delay={10} bg={p.spike ? C.orange : C.green} color={C.white} size={84} />
      {p.up && <At x={1500} y={260}><Pop delay={18} from="up"><div style={textStyle(200, C.yellow, C.ink)}>↑</div></Pop></At>}
    </Stage>
  );
};

const memories: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const keys = ['trek', 'food', 'rain'];
  return (
    <>
      <AbsoluteFill>{keys.map((k, i) => {
        const t = lin(f, i * 4, 30 + i * 4);
        const x = interpolate(t, [0, 1], [300 + i * 660, 960]), y = interpolate(t, [0, 1], [420, 440]);
        return <At key={k} x={x} y={y}><div style={{width: 480, height: 300, border: `10px solid ${C.white}`, overflow: 'hidden', transform: `scale(${1 - t * 0.7}) rotate(${(i - 1) * 8 * (1 - t)}deg)`, opacity: 1 - lin(f, 26, 34),
          boxShadow: `10px 12px 0 ${C.ink}`}}><div style={{transform: 'scale(0.26)', transformOrigin: '0 0'}}><IllustratedScene k={k} /></div></div></At>;
      })}</AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        <div style={{transform: `scale(${useSpr(28, 7, 200) * (1 + Math.sin(f / 4) * 0.06)})`}}><Icon name="heart" size={380} color={C.red} /></div>
      </AbsoluteFill>
      <Burst delay={30} color={C.pink} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={30} bg={C.yellow} size={74} /></AbsoluteFill>
    </>
  );
};

const comment: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const n = Math.floor(lin(f, 14, 40) * p.text.length);
  return (
    <Stage>
      <Pop from="up">
        <div style={{width: 1100, background: C.white, borderRadius: 30, border: `8px solid ${C.ink}`, boxShadow: `14px 16px 0 ${C.ink}`, padding: '36px 40px', display: 'flex', gap: 30, alignItems: 'center'}}>
          <div style={{width: 110, height: 110, borderRadius: '50%', background: C.teal}} />
          <div style={{flex: 1, borderBottom: `5px solid ${C.ink}`, ...textStyle(80, C.ink, 'none')}}>{p.text.slice(0, n)}<span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span></div>
        </div>
      </Pop>
      <Pop delay={8} from="right"><Card bg={C.red} color={C.white} size={60}>COMMENT</Card></Pop>
    </Stage>
  );
};

const shield: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Rays color={C.teal} opacity={0.2} speed={1} />
      <Rings delay={6} color={C.teal} count={4} />
      <Stage>
        <div style={{transform: `scale(${1 + Math.sin(f / 8) * 0.03})`}}><HeroIcon name="shield" size={380} color={C.teal} /></div>
        <Title t={p.title} delay={10} bg={C.white} size={90} />
      </Stage>
    </>
  );
};

const equals: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const join = lin(f, 18, 30);
  return (
    <Stage dir="row" gap={40}>
      <Pop from="left"><Card bg={C.blue} color={C.white} size={100} rot={-3} style={{transform: `translateX(${join * 40}px) rotate(-3deg)`}}>{p.left}</Card></Pop>
      <Pop delay={10} from="slam"><div style={textStyle(200, C.yellow, C.ink)}>=</div></Pop>
      <Pop delay={4} from="right"><Card bg={C.teal} color={C.white} size={100} rot={3} style={{transform: `translateX(${-join * 40}px) rotate(3deg)`}}>{p.right}</Card></Pop>
      <Burst delay={20} color={C.yellow} />
    </Stage>
  );
};

const clock: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const a = lin(f, 0, 30, -360, 0);
  return (
    <Stage dir="row" gap={80}>
      <div style={{position: 'relative', width: 380, height: 380}}>
        <Icon name="clock" size={380} color={C.red} />
        <svg width={380} height={380} viewBox="-6 -6 112 112" style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={50} y1={50} x2={50} y2={18} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
        </svg>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <Title t={p.title} delay={6} bg={C.white} size={80} from="right" />
        <Pop delay={30} from="slam"><Icon name="check" size={200} color={C.green} draw={drawP(f, 30, 6)} /></Pop>
      </div>
    </Stage>
  );
};

const calm: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const heat = lin(f, 0, 12, 1, 0);
  return (
    <Stage>
      <div style={{position: 'relative'}}>
        <div style={{transform: `translateX(${Math.sin(f * 2) * 10 * heat}px)`}}><Icon name="calm" size={360} color={heat > 0.5 ? C.red : C.yellow} /></div>
        {Array.from({length: 6}).map((_, i) => { const k = (f * 4 + i * 30) % 160; return <div key={i} style={{position: 'absolute', left: 140 + (i - 3) * 30, top: -k, width: 20, height: 40, borderRadius: 10, background: '#ffffff88', opacity: heat}} />; })}
      </div>
      <Title t={p.title} delay={6} bg={C.white} size={80} />
    </Stage>
  );
};

const home: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 190}}>
        <div style={{width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(#ffd16688, #ffd16600 70%)', transform: `scale(${1 + Math.sin(f / 10) * 0.05})`}} />
      </AbsoluteFill>
      <Stage>
        <div style={{position: 'relative'}}>
          <HeroIcon name="house" size={420} color={C.yellow} />
          <div style={{position: 'absolute', left: 150, top: 200}}><Pop delay={8} from="up"><Person kind="woman" size={200} mouth="smile" /></Pop></div>
          {p.heart && <div style={{position: 'absolute', left: 300, top: -20}}><Pop delay={4} from="rot"><Icon name="heart" size={140} color={C.pink} /></Pop></div>}
        </div>
        <Title t={p.title} delay={10} bg={C.white} size={80} />
      </Stage>
      <Particles seed={`home${p.title}`} n={24} mode="float" colors={[C.yellow, C.white]} />
    </>
  );
};

const volume: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const loud = f < 30;
  return (
    <Stage dir="row" gap={80}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, height: 360}}>
        {Array.from({length: 9}).map((_, i) => {
          const lvl = loud ? 0.4 + 0.6 * Math.abs(Math.sin(f / 3 + i)) : 0.25;
          const on = i / 8 <= lvl;
          return <div key={i} style={{width: 46, height: 60 + i * 34, borderRadius: 10, background: on ? (i > 5 ? C.red : C.yellow) : '#ffffff33', border: `4px solid ${C.ink}`}} />;
        })}
      </div>
      <div style={{position: 'relative'}}>
        <HeroIcon name="megaphone" size={300} color={C.red} />
        <div style={{position: 'absolute', inset: 0}}><Pop delay={12} from="slam"><Icon name="x" size={300} color={C.red} draw={drawP(f, 12, 6)} /></Pop></div>
      </div>
      <At x={960} y={110}><Title t={p.title} delay={6} bg={C.white} size={80} /></At>
    </Stage>
  );
};

const bubble: React.FC<TP> = ({p, sc}) => {
  const f = useCurrentFrame();
  const col = {teal: C.teal, pink: C.pink, orange: C.orange}[p.col as string] || C.teal;
  return (
    <>
      <AbsoluteFill><At x={380} y={560}><Pop from="left"><Person kind="man" size={460} mouth="smile" arm={p.brave ? 0.7 : 0} /></Pop></At></AbsoluteFill>
      <AbsoluteFill><At x={1180} y={370}>
        <Pop delay={4} from="scale">
          <div style={{background: col, border: `8px solid ${C.ink}`, borderRadius: 60, padding: '36px 70px', boxShadow: `14px 16px 0 ${C.ink}`, position: 'relative', ...textStyle(120, C.white, C.ink, 0.08)}}>
            “{p.text}”
            <div style={{position: 'absolute', left: 40, bottom: -50, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: `56px solid ${C.ink}`}} />
          </div>
        </Pop>
      </At></AbsoluteFill>
      <AbsoluteFill><At x={1640} y={210}><Pop delay={14} from="slam"><Icon name="check" size={190} color={C.green} draw={drawP(f, 14, 6)} /></Pop></At></AbsoluteFill>
      <Burst delay={4} color={col} />
    </>
  );
};

const respect: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Rays color={C.yellow} opacity={0.3} speed={1.4} />
      <Stage>
        <div style={{position: 'relative'}}>
          <div style={{transform: `scale(${1.1 + Math.sin(f / 10) * 0.02})`}}><Person kind="man" size={460} mouth="smile" /></div>
          <div style={{position: 'absolute', left: 90, top: -110}}><Pop delay={10} from="drop"><Icon name="star" size={150} color={C.yellow} /></Pop></div>
        </div>
        <Title t={p.title} delay={8} bg={C.yellow} size={80} />
      </Stage>
      <Particles seed="respect" delay={8} n={40} />
    </>
  );
};

const fan: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{alignItems: 'center'}}><div style={{width: 800, height: 1080, background: 'linear-gradient(#ffffffbb, #ffffff00)', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)'}} /></AbsoluteFill>
      <AbsoluteFill>
        <At x={960} y={520}><Pop from="up"><Person kind="woman" size={440} mouth="smile" /></Pop></At>
        <At x={960} y={200}><Pop delay={6} from="rot"><div style={{transform: `rotate(${f * 2}deg)`}}><Icon name="star" size={170} color={C.yellow} /></div></Pop></At>
        <At x={1450} y={620}><Pop delay={8} from="right"><div style={{transform: `rotate(${Math.sin(f / 3) * 8}deg)`}}><Person kind="man" size={360} arm={0.8 + Math.sin(f / 2) * 0.15} mouth="smile" /></div></Pop></At>
        <At x={1560} y={330}><Pop delay={12} from="scale"><Card bg={C.red} color={C.white} size={56} rot={8}>#1 FAN</Card></Pop></At>
      </AbsoluteFill>
      <Particles seed="fan" n={50} mode="confetti" />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 30}}><Title t={p.title} delay={4} bg={C.white} size={68} /></AbsoluteFill>
    </>
  );
};

const dream: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <div style={{position: 'relative', width: 700, height: 440}}>
        <div style={{position: 'absolute', left: 140, top: 140}}><Person kind="woman" size={300} mouth="smile" /></div>
        <svg width={700} height={440} style={{position: 'absolute'}}><path d="M400,120 Q420,20 520,40 Q600,-10 640,70 Q700,90 660,150 Q680,220 590,210 Q540,260 480,210 Q400,220 410,160 Z" fill={C.white} stroke={C.ink} strokeWidth={8} pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - lin(f, 4, 20)} fillOpacity={lin(f, 14, 22)} /></svg>
        <div style={{position: 'absolute', left: 480, top: 60}}><Pop delay={18} from="rot"><Icon name="spark" size={110} color={C.yellow} /></Pop></div>
      </div>
      <Title t={p.title} delay={10} bg={C.yellow} size={74} />
    </Stage>
  );
};

const naysay: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const pos = [[330, 260], [1590, 250], [380, 620], [1560, 640], [960, 160]];
  return (
    <>
      <AbsoluteFill><At x={960} y={520}><Person kind="woman" size={400} mouth="sad" /></At></AbsoluteFill>
      <AbsoluteFill>{pos.map(([x, y], i) => (
        <At key={i} x={x} y={y}><Pop delay={i * 4} from="scale"><div style={{background: '#7d7f8a', border: `6px solid ${C.ink}`, borderRadius: 40, padding: '16px 40px', transform: `rotate(${(i % 2 ? 1 : -1) * 6 + Math.sin(f / 4 + i) * 3}deg)`,
          ...textStyle(64, C.white, 'none')}}>{p.title}</div></Pop></At>
      ))}</AbsoluteFill>
    </>
  );
};

const mirror: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage dir="row" gap={120}>
        <Pop from="left"><Person kind="woman" size={460} mouth="smile" /></Pop>
        <div style={{position: 'relative'}}>
          <HeroIcon name="mirror" size={460} color={C.yellow} />
          <div style={{position: 'absolute', left: 150, top: 70, opacity: lin(f, 10, 20), transform: 'scaleX(-1)', filter: `drop-shadow(0 0 ${20 + Math.sin(f / 5) * 10}px #ffe9a8)`}}><Person kind="woman" size={260} mouth="smile" /></div>
        </div>
      </Stage>
      <Particles seed="mirror" delay={12} n={30} spread={500} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 30}}><Title t={p.title} delay={6} bg={C.pink} color={C.white} size={70} /></AbsoluteFill>
    </>
  );
};

const words3: React.FC<TP> = ({p}) => {
  const words: string[] = p.words;
  const cols = [C.pink, C.teal, C.blue];
  return (
    <>
      <Stage gap={30}>
        {words.map((w, i) => {
          const fresh = i === words.length - 1;
          return <Pop key={i} delay={fresh ? 0 : -60} from={fresh ? 'slam' : 'scale'}><Card bg={cols[i]} color={C.white} size={120} rot={[-3, 2, -2][i]}>{w}</Card></Pop>;
        })}
      </Stage>
      <Burst delay={2} color={cols[words.length - 1]} />
      <Particles seed={`w${words.length}`} delay={2} n={24} spread={600} />
    </>
  );
};

const share: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const t = lin(f, 10, 34);
  return (
    <>
      <AbsoluteFill>
        <At x={480} y={540}><Pop from="left"><Person kind="man" size={420} mouth="smile" /></Pop></At>
        <At x={1440} y={540}><Pop delay={4} from="right"><Person kind="man" size={420} color={C.green} mouth={t > 0.9 ? 'smile' : 'flat'} /></Pop></At>
        <At x={interpolate(t, [0, 1], [640, 1280])} y={420 - Math.sin(t * Math.PI) * 220}><div style={{transform: `rotate(${t * 360}deg)`}}><Icon name="play" size={150} color={C.red} /></div></At>
        <At x={960} y={760}><Pop delay={6} from="up"><Icon name="share" size={160} color={C.teal} /></Pop></At>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 40}}><Title t={p.title} delay={4} bg={C.yellow} size={80} /></AbsoluteFill>
    </>
  );
};

const next: React.FC<TP> = ({p}) => {
  const f = useCurrentFrame();
  const s = useSpr(4, 12, 150);
  return (
    <>
      <Rays color={C.yellow} opacity={0.2} />
      <Stage>
        <Pop from="down"><Card bg={C.ink} color={C.white} size={56}>അടുത്ത വീഡിയോ</Card></Pop>
        <div style={{transform: `perspective(1200px) rotateX(${(1 - s) * 80}deg) scale(${0.6 + s * 0.4})`, background: C.white, border: `10px solid ${C.ink}`, borderRadius: 34, boxShadow: `18px 20px 0 ${C.ink}`, padding: '30px 70px', display: 'flex', alignItems: 'center', gap: 50}}>
          <div style={{...textStyle(300, C.red, C.ink, 0.05), transform: `rotate(${Math.sin(f / 8) * 6}deg)`}}>{p.n}</div>
          <div><div style={textStyle(120, C.ink, 'none')}>{p.title}</div><div style={textStyle(56, C.red, 'none')}>{p.sub}</div></div>
        </div>
      </Stage>
    </>
  );
};

const subscribe: React.FC<TP> = () => {
  const f = useCurrentFrame();
  const press = 26;
  const pressed = f >= press;
  const k = f - press;
  const sc = pressed ? (k < 4 ? 0.9 : 1 + Math.max(0, 0.1 - (k - 4) * 0.02)) : 1;
  const cx = interpolate(f, [4, press], [1500, 1000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const cy = interpolate(f, [4, press], [900, 480], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <>
      <Stage dir="row" gap={50}>
        <Pop from="up"><div style={{transform: `scale(${sc})`, background: pressed ? '#8a8a8a' : C.red, borderRadius: 90, padding: '34px 80px', border: `8px solid ${C.ink}`, boxShadow: `12px 14px 0 ${C.ink}`, ...textStyle(90, C.white, 'none')}}>
          {pressed ? 'SUBSCRIBED' : 'SUBSCRIBE'}</div></Pop>
        <Pop delay={press + 4} from="rot"><div style={{transform: `rotate(${pressed ? Math.sin(k / 1.5) * 20 * Math.max(0, 1 - k / 30) : 0}deg)`, transformOrigin: '50% 10%'}}><Icon name="bell" size={200} color={C.yellow} /></div></Pop>
      </Stage>
      <AbsoluteFill><At x={cx} y={cy}><svg width={90} height={110} viewBox="0 0 30 36"><path d="M2,2 L2,28 L9,22 L14,33 L18,31 L13,20 L22,20 Z" fill={C.white} stroke={C.ink} strokeWidth={2} /></svg></At></AbsoluteFill>
      <Burst delay={press} color={C.yellow} />
      <Rings delay={press} color={C.white} />
      <Particles seed="sub" delay={press} n={40} />
    </>
  );
};

export const TEMPLATES: Record<string, React.FC<TP>> = {
  slam, number, cross, people, lock, idcard, checks, chat, quote, orbit, empty, mystery, depth, grid6, media, icons4, fireeye,
  portal, run, listen, versus, calendar, smile, crowd, study, chart, memories, comment, shield, equals, clock, calm, home,
  volume, bubble, respect, fan, dream, naysay, mirror, words3, share, next, subscribe,
};

export const VeoLayer: React.FC<{id: number}> = ({id}) => {
  const file = M.veo.find((x) => x.startsWith(`${id}.`) || x.startsWith(`shot${id}.`));
  if (!file) return null;
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`veo/${file}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(#00000055, #00000088)'}} />
    </AbsoluteFill>
  );
};
