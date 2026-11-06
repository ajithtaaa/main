// voxel.js — blocky voxel world: grass/dirt blocks, block-built Elon, block car with glowing jets, square sun.
import { fonts, caption, tag } from './common.js';
import { setup, mesh, THREE } from './three-common.js';
export default async function () {
  await fonts(); const { scene, camera, done } = setup({ bg: '#7cc4ff', fov: 55, sunPos: [10, 18, 8] });
  const B = (x, y, z, c, s = 1) => { const m = mesh(new THREE.BoxGeometry(s, s, s), c, { flat: true }); m.position.set(x, y, z); scene.add(m); return m; };
  for (let x = -12; x <= 12; x++) for (let z = -16; z <= 6; z++) { const h = (Math.sin(x * 0.7) + Math.cos(z * 0.5)) > 1.3 ? 1 : 0; B(x, -0.5 + h, z, (x + z) % 2 ? '#5fb83a' : '#56ac34'); if (h) B(x, -0.5, z, '#8a5a32'); }
  for (const [x, z] of [[-7, -6], [6, -9], [-9, -12]]) { for (let y = 0; y < 3; y++) B(x, 0.5 + y, z, '#6a4422'); for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy < 2; dy++) B(x + dx, 3.5 + dy, z + dz, '#2f8a2a'); }
  for (let y = 0; y < 10; y++) B(4, 0.5 + y, -7, '#d8dde2'); B(4, 10.5, -7, '#c0c6cc');
  // blocky Elon
  const E = new THREE.Group(); const p = (w, h, d, c, x, y, z) => { const m = mesh(new THREE.BoxGeometry(w, h, d), c, { flat: true }); m.position.set(x, y, z); E.add(m); };
  p(0.5, 0.75, 0.3, '#2a2a3a', -0.13, 0.38, 0); p(0.5, 0.75, 0.3, '#2a2a3a', 0.13, 0.38, 0); p(0.55, 0.75, 0.35, '#d11f2a', 0, 1.13, 0); p(0.5, 0.5, 0.5, '#e8b88a', 0, 1.75, 0); p(0.52, 0.16, 0.52, '#4a3020', 0, 2.02, 0);
  p(0.06, 0.08, 0.02, '#111', -0.11, 1.8, 0.26); p(0.06, 0.08, 0.02, '#111', 0.11, 1.8, 0.26);
  const arm = mesh(new THREE.BoxGeometry(0.2, 0.75, 0.2), '#d11f2a', { flat: true }); arm.position.set(0.38, 1.6, 0); arm.rotation.z = Math.PI * 0.85; E.add(arm); p(0.2, 0.7, 0.2, '#d11f2a', -0.38, 1.1, 0);
  E.position.set(-0.6, 0, 3); E.rotation.y = 0.25; E.scale.setScalar(1.3); scene.add(E);
  // block car + jets
  const C = new THREE.Group(); const q = (w, h, d, c, x, y, z, o) => { const m = mesh(new THREE.BoxGeometry(w, h, d), c, { flat: true, ...o }); m.position.set(x, y, z); C.add(m); };
  q(3.2, 0.6, 1.6, '#d11f2a', 0, 0, 0); q(1.6, 0.5, 1.4, '#7fd8ff', -0.1, 0.55, 0, { rough: 0.2 }); for (const [x, z] of [[-1.1, 0.8], [1.1, 0.8], [-1.1, -0.8], [1.1, -0.8]]) q(0.6, 0.6, 0.3, '#1a1a1a', x, -0.3, z);
  for (let i = 0; i < 5; i++) q(0.3, 1.4, 0.3, '#bff4ff', -1.2 + i * 0.6, -1.1, 0, { emissive: '#7fe8ff', ei: 1.4, opacity: 0.75 });
  C.position.set(1.2, 5.6, -2); C.rotation.set(0, -0.5, 0.12); scene.add(C);
  const sunB = mesh(new THREE.BoxGeometry(3, 3, 0.2), '#fff6a0', { emissive: '#ffe85a', ei: 1.5 }); sunB.position.set(-8, 16, -20); scene.add(sunB);
  for (const [x, y] of [[-4, 12], [7, 13], [0, 15]]) for (let i = 0; i < 4; i++) B(x + i, y, -18, '#ffffff', 1);
  camera.position.set(2, 3.4, 11); camera.lookAt(0.5, 3.4, 0);
  const g = done(); caption(g, 'HE ACTUALLY DID IT.', 2, { y: 1560 }); tag(g, 'VOXEL BLOCKS 3D', { bg: '#3a7a2a' });
}
