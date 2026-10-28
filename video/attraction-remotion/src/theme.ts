export const FPS = 30;
export const FONT = '"Baloo Chettan 2", sans-serif';

export const C = {
  ink: '#16141f', paper: '#f4ead8', red: '#ff3b3b', yellow: '#ffc93c', teal: '#14b8a6', pink: '#ff5d8f',
  blue: '#3a6df0', orange: '#ff7a1a', purple: '#8b5cf6', green: '#22c55e', white: '#ffffff', grey: '#9aa0a6',
  skin: '#e8b48f', navy: '#141633',
};

export type Scene = {name: string; bg: [string, string]; accent: string; accent2: string; dark: boolean};

// one palette per story section
export const SCENES: Scene[] = [
  {name: 'hook', bg: ['#2a0f2e', '#d7263d'], accent: C.yellow, accent2: C.pink, dark: true},
  {name: 'tease', bg: ['#0b0d24', '#2b2f7a'], accent: C.yellow, accent2: C.red, dark: true},
  {name: 'arjun', bg: ['#fff3df', '#ffd59e'], accent: C.blue, accent2: C.red, dark: false},
  {name: 'reject', bg: ['#1f2026', '#4b4d5c'], accent: C.red, accent2: C.grey, dark: true},
  {name: 'mistake', bg: ['#062d33', '#0f766e'], accent: C.yellow, accent2: C.pink, dark: true},
  {name: 'six', bg: ['#ffd23f', '#ff8c1a'], accent: C.ink, accent2: C.red, dark: false},
  {name: 'p1', bg: ['#ff8a3d', '#c2185b'], accent: C.yellow, accent2: C.white, dark: true},
  {name: 'p2', bg: ['#0f4c5c', '#14b8a6'], accent: C.yellow, accent2: C.pink, dark: true},
  {name: 'p3', bg: ['#ff5d8f', '#7b2cbf'], accent: C.yellow, accent2: C.teal, dark: true},
  {name: 'comment', bg: ['#00b4d8', '#0353a4'], accent: C.yellow, accent2: C.white, dark: true},
  {name: 'p4', bg: ['#0d0f2b', '#5a0f3c'], accent: C.red, accent2: C.teal, dark: true},
  {name: 'p5', bg: ['#2e1f5e', '#8b5cf6'], accent: C.yellow, accent2: C.teal, dark: true},
  {name: 'p6', bg: ['#ffb703', '#fb5607'], accent: C.ink, accent2: C.white, dark: false},
  {name: 'secret', bg: ['#07040f', '#3c1053'], accent: C.pink, accent2: C.yellow, dark: true},
  {name: 'after', bg: ['#ffe5c4', '#ff9e7a'], accent: C.pink, accent2: C.blue, dark: false},
  {name: 'outro', bg: ['#e63946', '#6a040f'], accent: C.yellow, accent2: C.white, dark: true},
];

export const inkOn = (s: Scene) => (s.dark ? C.white : C.ink);
