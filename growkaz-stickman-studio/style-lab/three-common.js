// three-common.js — render one three.js frame and composite it into a 2D canvas for captions/tags.
import * as THREE from 'three';
import { W, H, canvas } from './common.js';
export { THREE };
export function setup(o = {}) {
  const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
  const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H, false);
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = o.exposure || 1.0;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(o.bg || '#9fd4ff'); if (o.fog) scene.fog = new THREE.Fog(o.bg, o.fog[0], o.fog[1]);
  const camera = o.ortho ? new THREE.OrthographicCamera(-o.ortho, o.ortho, o.ortho * H / W, -o.ortho * H / W, 0.1, 500) : new THREE.PerspectiveCamera(o.fov || 50, W / H, 0.1, 500);
  const sun = new THREE.DirectionalLight('#fff4e0', o.sun ?? 2.6); sun.position.set(...(o.sunPos || [8, 14, 6])); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -20; sc.right = sc.top = 20; sc.far = 80; scene.add(sun);
  scene.add(new THREE.HemisphereLight(o.sky || '#cfe8ff', o.groundC || '#6a8a5a', o.amb ?? 1.2));
  const done = () => { R.render(scene, camera); const c = canvas(); const g = c.getContext('2d'); g.drawImage(glc, 0, 0); return g; };
  return { THREE, scene, camera, R, done };
}
export function mesh(geo, color, o = {}) { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0, emissive: o.emissive || '#000', emissiveIntensity: o.ei ?? 1, transparent: !!o.opacity, opacity: o.opacity ?? 1, flatShading: !!o.flat })); m.castShadow = m.receiveShadow = true; if (o.pos) m.position.set(...o.pos); return m; }
