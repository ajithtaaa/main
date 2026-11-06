// clay.js — claymation look: soft rounded shapes, matte pastel materials, warm studio light, big shadows.
import { fonts, caption, tag } from './common.js';
import { setup, mesh, THREE } from './three-common.js';
export default async function () {
  await fonts(); const { scene, camera, done } = setup({ bg: '#ffe2c4', fov: 40, sunPos: [6, 10, 8], sun: 2.4, amb: 1.4, sky: '#fff0e0', groundC: '#c89a7a', exposure: 1.05 });
  const ground = mesh(new THREE.CylinderGeometry(9, 9.4, 0.8, 64), '#f0c890', { rough: 1 }); ground.position.y = -0.4; scene.add(ground);
  const S = (r, c, pos, sc = [1, 1, 1]) => { const m = mesh(new THREE.SphereGeometry(r, 48, 32), c, { rough: 0.95 }); m.position.set(...pos); m.scale.set(...sc); scene.add(m); return m; };
  const Cap = (r, l, c, pos, rot = [0, 0, 0]) => { const m = mesh(new THREE.CapsuleGeometry(r, l, 12, 24), c, { rough: 0.95 }); m.position.set(...pos); m.rotation.set(...rot); scene.add(m); return m; };
  // clay Elon: rounded body, big head, dot eyes
  Cap(0.18, 0.6, '#3a3a5a', [-0.25, 0.5, 0]); Cap(0.18, 0.6, '#3a3a5a', [0.15, 0.5, 0]); Cap(0.5, 0.5, '#e8443a', [-0.05, 1.45, 0]);
  S(0.62, '#f2c49a', [-0.05, 2.55, 0]); S(0.66, '#5a3a2a', [-0.05, 2.75, -0.12], [1, 0.6, 1]);
  S(0.09, '#1a1a1a', [-0.25, 2.6, 0.55]); S(0.09, '#1a1a1a', [0.15, 2.6, 0.55]); S(0.04, '#ffffff', [-0.22, 2.64, 0.63]); S(0.04, '#ffffff', [0.18, 2.64, 0.63]);
  const smile = mesh(new THREE.TorusGeometry(0.16, 0.035, 12, 24, Math.PI), '#7a2a2a'); smile.position.set(-0.05, 2.38, 0.56); smile.rotation.z = Math.PI; scene.add(smile);
  Cap(0.15, 0.7, '#e8443a', [0.55, 2.0, 0.1], [0, 0, -0.7]); S(0.17, '#f2c49a', [0.85, 2.4, 0.1]); Cap(0.15, 0.6, '#e8443a', [-0.6, 1.4, 0], [0, 0, 0.4]);
  // clay car floating, puffy jets
  const car = new THREE.Group(); const cs = (geo, c, p, sc) => { const m = mesh(geo, c, { rough: 0.9 }); m.position.set(...p); if (sc) m.scale.set(...sc); car.add(m); };
  cs(new THREE.CapsuleGeometry(0.6, 2.0, 12, 32), '#e8443a', [0, 0, 0], [1, 0.7, 1.1]); car.children[0].rotation.z = Math.PI / 2; cs(new THREE.SphereGeometry(0.7, 32, 24), '#9fe0ff', [0, 0.45, 0], [1.2, 0.7, 0.9]);
  for (const [x, z] of [[-0.9, 0.65], [0.9, 0.65], [-0.9, -0.65], [0.9, -0.65]]) { const w = mesh(new THREE.TorusGeometry(0.28, 0.14, 16, 32), '#2a2a3a', { rough: 0.9 }); w.position.set(x, -0.4, z); car.add(w); }
  for (let i = 0; i < 4; i++) { const pf = mesh(new THREE.SphereGeometry(0.28 - i * 0.04, 24, 16), '#ffffff', { rough: 1, opacity: 0.9 - i * 0.15 }); pf.position.set(-0.6 + (i % 2) * 1.2, -0.9 - i * 0.35, 0); car.add(pf); }
  car.position.set(0.8, 5.0, -3.5); car.rotation.set(0.15, -0.5, 0.1); scene.add(car);
  for (const [x, z, h] of [[-4, -4, 2.2], [3.5, -5, 3], [-2, -6, 1.6]]) { Cap(0.25, h, '#7a5a3a', [x, h / 2, z]); S(1.0, '#7ac86a', [x, h + 0.6, z]); }
  const rocket = Cap(0.5, 4, '#f4f0e8', [4.5, 2.5, -3]); S(0.5, '#e8443a', [4.5, 5.2, -3], [1, 1.4, 1]);
  camera.position.set(0.5, 3.2, 11); camera.lookAt(0.4, 3.0, 0);
  const g = done(); caption(g, 'HE ACTUALLY DID IT.', 2, { y: 1560, stroke: '#5a2a1a' }); tag(g, 'CLAY 3D', { bg: '#c0603a' });
}
