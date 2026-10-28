import React from 'react';
import {C} from './theme';

// path helpers (viewBox 0 0 100 100)
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`;
const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} v${-(h - 2 * r)} q0,${-r} ${r},${-r} Z`;

type Part = {d: string; fill?: string; stroke?: string; sw?: number};
const HEART = 'M50,86 C20,64 8,48 12,32 C16,16 38,12 50,28 C62,12 84,16 88,32 C92,48 80,64 50,86 Z';

export const ICONS: Record<string, (main: string) => Part[]> = {
  heart: (m) => [{d: HEART, fill: m}, {d: circ(32, 34, 5), fill: '#ffffff99', stroke: 'none'}],
  glasses: () => [{d: 'M8,38 H92', fill: 'none', sw: 6}, {d: rect(10, 36, 34, 26, 10), fill: C.ink}, {d: rect(56, 36, 34, 26, 10), fill: C.ink}, {d: 'M16,42 L26,42 L18,54 Z', fill: '#ffffff88', stroke: 'none'}],
  money: () => [{d: rect(6, 26, 88, 48, 6), fill: '#4caf6a'}, {d: rect(14, 34, 72, 32, 4), fill: 'none', stroke: '#d8f5dd'}, {d: circ(50, 50, 12), fill: '#d8f5dd'}, {d: 'M44,44 H56 M44,50 H56 M47,44 Q58,46 46,56 L56,62', fill: 'none', stroke: '#2e7d45', sw: 3}],
  lock: (m) => [{d: 'M30,46 V32 A20,20 0 0,1 70,32 V46', fill: 'none', sw: 9, stroke: '#b0b4bd'}, {d: rect(18, 44, 64, 46, 8), fill: m}, {d: circ(50, 62, 6) + ' M47,64 L53,64 L55,78 L45,78 Z', fill: C.ink, stroke: 'none'}],
  lockopen: (m) => [{d: 'M30,46 V24 A20,20 0 0,1 70,24 V30', fill: 'none', sw: 9, stroke: '#b0b4bd'}, {d: rect(18, 44, 64, 46, 8), fill: m}, {d: circ(50, 62, 6), fill: C.ink, stroke: 'none'}],
  eye: (m) => [{d: 'M6,50 Q50,10 94,50 Q50,90 6,50 Z', fill: '#fff'}, {d: circ(50, 50, 18), fill: m}, {d: circ(50, 50, 8), fill: C.ink}, {d: circ(56, 43, 4), fill: '#fff', stroke: 'none'}],
  x: (m) => [{d: 'M18,18 L82,82 M82,18 L18,82', fill: 'none', stroke: m, sw: 16}],
  check: (m) => [{d: 'M14,54 L38,78 L88,22', fill: 'none', stroke: m, sw: 15}],
  question: (m) => [{d: 'M32,34 Q32,12 52,12 Q72,12 72,32 Q72,46 54,52 L54,66', fill: 'none', stroke: m, sw: 13}, {d: circ(54, 84, 7), fill: m, stroke: 'none'}],
  book: (m) => [{d: 'M50,24 Q30,14 10,20 V80 Q30,74 50,84 Q70,74 90,80 V20 Q70,14 50,24 Z', fill: m}, {d: 'M50,24 V84', fill: 'none'}],
  gift: (m) => [{d: rect(14, 40, 72, 48, 4), fill: m}, {d: rect(10, 28, 80, 16, 4), fill: m}, {d: 'M50,28 V88', fill: 'none', stroke: C.yellow, sw: 8}, {d: 'M50,28 Q30,8 30,24 Q32,30 50,28 Q70,8 70,24 Q68,30 50,28', fill: 'none', stroke: C.yellow, sw: 5}],
  phone: () => [{d: rect(26, 6, 48, 88, 9), fill: C.ink}, {d: rect(30, 14, 40, 70, 4), fill: '#eef2f7', stroke: 'none'}],
  clock: (m) => [{d: circ(50, 50, 42), fill: '#fff8ec'}, {d: 'M50,50 L50,24 M50,50 L68,58', fill: 'none', stroke: m, sw: 7}, {d: circ(50, 50, 5), fill: C.ink}],
  play: (m) => [{d: rect(8, 18, 84, 64, 16), fill: m}, {d: 'M42,34 L66,50 L42,66 Z', fill: '#fff'}],
  warn: (m) => [{d: 'M50,10 L92,86 H8 Z', fill: m}, {d: 'M50,36 V60', fill: 'none', sw: 9}, {d: circ(50, 72, 5), fill: C.ink}],
  target: () => [{d: circ(50, 50, 42), fill: C.red}, {d: circ(50, 50, 30), fill: '#fff'}, {d: circ(50, 50, 18), fill: C.red}, {d: circ(50, 50, 7), fill: '#fff'}],
  dumbbell: (m) => [{d: rect(26, 44, 48, 12, 4), fill: '#b0b4bd'}, {d: rect(6, 26, 14, 48, 5), fill: m}, {d: rect(80, 26, 14, 48, 5), fill: m}, {d: rect(18, 34, 10, 32, 4), fill: m}, {d: rect(72, 34, 10, 32, 4), fill: m}],
  briefcase: () => [{d: rect(34, 14, 32, 18, 6), fill: 'none', sw: 7}, {d: rect(8, 28, 84, 60, 9), fill: '#a0612f'}, {d: 'M8,52 H92', fill: 'none', sw: 6}, {d: rect(44, 46, 12, 14, 3), fill: C.yellow}],
  chart: (m) => [{d: 'M12,8 V88 H94', fill: 'none', sw: 7}, {d: rect(22, 60, 14, 26), fill: C.teal}, {d: rect(42, 44, 14, 42), fill: C.teal}, {d: rect(62, 26, 14, 60), fill: m}, {d: 'M20,54 L46,36 L60,44 L88,14', fill: 'none', stroke: C.yellow, sw: 6}],
  music: (m) => [{d: 'M36,74 V20 L84,10 V64', fill: 'none', sw: 8, stroke: m}, {d: circ(26, 76, 12), fill: m}, {d: circ(74, 66, 12), fill: m}],
  ear: () => [{d: 'M30,40 Q30,10 56,10 Q82,10 80,40 Q78,58 62,66 Q56,72 56,82 Q54,94 40,90', fill: C.skin, sw: 7}, {d: 'M46,40 Q46,26 58,26 Q68,26 66,40 Q64,48 56,50', fill: 'none', sw: 6}],
  calendar: (m) => [{d: rect(8, 16, 84, 78, 10), fill: '#fff'}, {d: rect(8, 16, 84, 24, 10), fill: m}, {d: 'M30,8 V24 M70,8 V24', fill: 'none', sw: 8}],
  shield: (m) => [{d: 'M50,6 L90,20 Q90,66 50,94 Q10,66 10,20 Z', fill: m}, {d: 'M30,50 L45,64 L72,36', fill: 'none', stroke: '#fff', sw: 9}],
  house: (m) => [{d: 'M50,8 L94,46 H6 Z', fill: C.red}, {d: rect(16, 44, 68, 48, 0), fill: m}, {d: rect(42, 60, 16, 32, 4), fill: C.ink}, {d: rect(22, 54, 14, 14), fill: '#fff3c4'}, {d: rect(64, 54, 14, 14), fill: '#fff3c4'}],
  star: (m) => [{d: 'M50,6 L61,38 L95,38 L68,58 L78,92 L50,72 L22,92 L32,58 L5,38 L39,38 Z', fill: m}],
  spark: (m) => [{d: 'M50,4 Q56,44 96,50 Q56,56 50,96 Q44,56 4,50 Q44,44 50,4 Z', fill: m}],
  bell: (m) => [{d: 'M20,74 Q26,64 26,44 Q26,18 50,16 Q74,18 74,44 Q74,64 80,74 Z', fill: m}, {d: circ(50, 82, 8), fill: m}, {d: circ(50, 12, 5), fill: m}],
  share: (m) => [{d: 'M74,22 L26,50 L74,78', fill: 'none', stroke: m, sw: 8}, {d: circ(74, 22, 13), fill: m}, {d: circ(26, 50, 13), fill: m}, {d: circ(74, 78, 13), fill: m}],
  megaphone: (m) => [{d: 'M18,38 L80,12 V88 L18,62 Z', fill: m}, {d: rect(6, 36, 14, 28, 3), fill: C.ink}, {d: 'M26,62 L40,66 L36,90 H26 Z', fill: C.ink}],
  mirror: () => [{d: 'M50,4 C78,4 88,30 88,48 C88,70 72,84 50,84 C28,84 12,70 12,48 C12,30 22,4 50,4 Z', fill: '#c4965a'}, {d: 'M50,12 C72,12 80,32 80,48 C80,66 68,76 50,76 C32,76 20,66 20,48 C20,32 28,12 50,12 Z', fill: '#cfe8f0', stroke: 'none'}, {d: 'M32,26 L42,20 L28,52 L24,44 Z', fill: '#ffffffaa', stroke: 'none'}, {d: 'M44,84 V94 M30,96 H70', fill: 'none', stroke: '#c4965a', sw: 7}],
  coffee: (m) => [{d: 'M18,34 H74 V62 Q74,86 46,86 Q18,86 18,62 Z', fill: '#fff'}, {d: 'M74,42 Q92,42 90,56 Q88,68 72,66', fill: 'none', sw: 7}, {d: 'M34,24 Q30,16 36,10 M50,24 Q46,16 52,10', fill: 'none', stroke: m, sw: 4}],
  film: (m) => [{d: rect(8, 22, 84, 58, 6), fill: m}, {d: rect(22, 32, 56, 38, 3), fill: '#fff8e1'}, {d: 'M14,30 V34 M14,46 V50 M14,62 V66 M86,30 V34 M86,46 V50 M86,62 V66', fill: 'none', stroke: '#fff', sw: 5}],
  chat: (m) => [{d: 'M10,18 Q10,10 18,10 H82 Q90,10 90,18 V58 Q90,66 82,66 H40 L22,84 L26,66 H18 Q10,66 10,58 Z', fill: m}, {d: circ(32, 38, 5) + circ(50, 38, 5) + circ(68, 38, 5), fill: '#fff', stroke: 'none'}],
  sleep: () => [{d: 'M22,24 H44 L22,50 H44 M56,46 H72 L56,66 H72 M78,70 H88 L78,82 H88', fill: 'none', stroke: '#fff', sw: 6}],
  globe: (m) => [{d: circ(50, 50, 42), fill: m}, {d: 'M8,50 H92 M50,8 Q24,50 50,92 Q76,50 50,8 M16,28 Q50,40 84,28 M16,72 Q50,60 84,72', fill: 'none', stroke: '#fff', sw: 4}],
  ignore: (m) => [{d: circ(50, 50, 40), fill: m}, {d: 'M30,40 H42 M58,40 H70 M34,66 H66', fill: 'none', stroke: C.ink, sw: 7}],
  jealous: () => [{d: circ(50, 50, 40), fill: '#7bd36a'}, {d: 'M28,36 L42,42 M72,36 L58,42 M34,70 Q50,58 66,70', fill: 'none', stroke: C.ink, sw: 7}],
  game: (m) => [{d: 'M14,40 Q14,26 30,26 H70 Q86,26 86,40 L92,70 Q94,84 80,82 L66,66 H34 L20,82 Q6,84 8,70 Z', fill: m}, {d: 'M28,44 H44 M36,36 V52', fill: 'none', stroke: '#fff', sw: 6}, {d: circ(64, 42, 5) + circ(74, 50, 5), fill: '#fff', stroke: 'none'}],
  calm: (m) => [{d: circ(50, 50, 40), fill: m}, {d: 'M28,44 Q36,38 44,44 M56,44 Q64,38 72,44 M34,62 Q50,74 66,62', fill: 'none', stroke: C.ink, sw: 6}],
  wave: () => [{d: 'M30,90 V44 Q30,36 37,36 Q44,36 44,44 V20 Q44,12 51,12 Q58,12 58,20 V40 V24 Q58,16 65,16 Q72,16 72,24 V48 Q78,40 84,46 Q88,52 80,64 Q70,84 56,90 Z', fill: C.skin}],
  flame: () => [{d: 'M50,96 Q14,90 18,58 Q22,36 40,20 Q38,40 52,46 Q46,24 62,4 Q66,30 80,46 Q94,66 82,84 Q70,96 50,96 Z', fill: C.orange}, {d: 'M50,94 Q30,90 32,70 Q34,56 46,46 Q46,62 58,66 Q70,74 66,86 Q60,94 50,94 Z', fill: C.yellow, stroke: 'none'}],
  sun: () => [{d: circ(50, 50, 24), fill: C.yellow}],
  bowl: (m) => [{d: 'M8,50 H92 Q90,90 50,90 Q10,90 8,50 Z', fill: m}, {d: 'M34,40 Q30,30 36,22 M50,40 Q46,28 52,18 M66,40 Q62,30 68,22', fill: 'none', stroke: '#fff', sw: 4}],
  bike: (m) => [{d: circ(22, 70, 16) + circ(78, 70, 16), fill: 'none', sw: 7}, {d: 'M22,70 L40,48 H66 L78,70 M40,48 L34,36 H48 M66,48 L62,34 H72', fill: 'none', sw: 6, stroke: m}],
  cloud: () => [{d: 'M24,74 Q6,74 8,58 Q10,44 26,44 Q28,24 48,22 Q66,22 72,38 Q92,38 92,56 Q92,74 74,74 Z', fill: '#c9d3e3'}],
  brain: (m) => [{d: 'M50,16 Q38,6 26,16 Q10,20 14,38 Q4,50 14,62 Q12,80 30,82 Q40,94 50,84 Q60,94 70,82 Q88,80 86,62 Q96,50 86,38 Q90,20 74,16 Q62,6 50,16 Z', fill: m}, {d: 'M50,16 V84 M30,36 Q40,40 36,50 M70,36 Q60,40 64,50 M30,64 Q40,60 44,68 M70,64 Q60,60 56,68', fill: 'none', stroke: '#fff', sw: 4}],
};

export const Icon: React.FC<{name: string; size?: number; color?: string; draw?: number; fill?: number; stroke?: string; style?: React.CSSProperties}> = ({
  name, size = 300, color = C.red, draw = 1, fill = 1, stroke = C.ink, style,
}) => {
  const parts = (ICONS[name] || ICONS.star)(color);
  return (
    <svg width={size} height={size} viewBox="-6 -6 112 112" style={{overflow: 'visible', ...style}}>
      {parts.map((p, i) => {
        const isLine = p.fill === 'none';
        return (
          <path key={i} d={p.d} pathLength={1}
            fill={isLine ? 'none' : p.fill}
            fillOpacity={isLine ? 0 : fill}
            stroke={p.stroke === 'none' ? (isLine ? undefined : 'none') : p.stroke || stroke}
            strokeWidth={p.sw || 4.5}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={draw < 1 ? 1 : undefined}
            strokeDashoffset={draw < 1 ? 1 - draw : undefined}
            style={{filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.18))'}}
          />
        );
      })}
    </svg>
  );
};

// flat pictogram figure
export const Person: React.FC<{kind?: 'man' | 'woman'; size?: number; color?: string; grey?: boolean; arm?: number; mouth?: 'smile' | 'flat' | 'sad'; style?: React.CSSProperties}> = ({
  kind = 'man', size = 360, color, grey, arm = 0, mouth = 'flat', style,
}) => {
  const body = grey ? '#8d8f99' : color || (kind === 'man' ? C.blue : C.red);
  const skin = grey ? '#b9bbc4' : C.skin;
  const hair = grey ? '#6b6d77' : C.ink;
  return (
    <svg width={size * 0.7} height={size} viewBox="0 0 70 100" style={{overflow: 'visible', ...style}}>
      {kind === 'woman' && <path d="M19,22 Q19,6 35,6 Q51,6 51,22 V50 Q35,56 19,50 Z" fill={hair} />}
      <path d="M8,100 V72 Q8,52 35,52 Q62,52 62,72 V100 Z" fill={body} stroke={C.ink} strokeWidth={2.5} />
      <g transform={`rotate(${-arm * 150} 58 62)`}>
        <path d="M56,60 Q66,70 66,88" stroke={body} strokeWidth={9} strokeLinecap="round" fill="none" />
        <circle cx={66} cy={90} r={5} fill={skin} />
      </g>
      <rect x={30} y={40} width={10} height={14} fill={skin} />
      <circle cx={35} cy={28} r={15} fill={skin} stroke={C.ink} strokeWidth={2.5} />
      {kind === 'man' ? <path d="M20,26 Q20,10 35,10 Q50,10 50,26 Q44,18 35,19 Q26,18 20,26 Z" fill={hair} /> : <path d="M20,28 Q20,11 35,11 Q50,11 50,28 Q42,20 35,18 Q28,20 20,28 Z" fill={hair} />}
      <circle cx={29.5} cy={29} r={1.8} fill={C.ink} /><circle cx={40.5} cy={29} r={1.8} fill={C.ink} />
      {mouth === 'smile' && <path d="M29,35 Q35,40 41,35" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />}
      {mouth === 'flat' && <path d="M31,36 H39" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />}
      {mouth === 'sad' && <path d="M29,38 Q35,33 41,38" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />}
    </svg>
  );
};
