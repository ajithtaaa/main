// isometric.js — tiny isometric diorama: orthographic camera, floating tile with launch pad, rocket, crowd and the flying car.
import { fonts, caption, tag } from './common.js';
import { setup, mesh, THREE } from './three-common.js';
export default async function () {
  await fonts(); const { scene, camera, done } = setup({ bg: '#1d2a44', ortho: 7.2, sunPos: [10, 16, 4], sun: 2.8, amb: 1.1, sky: '#bfd8ff', groundC: '#3a4a6a' });
  const box = (w, h, d, c, x, y, z, o) => { const m = mesh(new THREE.BoxGeometry(w, h, d), c, { flat: true, ...o }); m.position.set(x, y, z); scene.add(m); return m; };
  box(10, 0.6, 10, '#d9b98a', 0, -0.3, 0); box(10, 1.6, 10, '#8a6a4a', 0, -1.4, 0); box(10.02, 0.12, 10.02, '#e8cfa0', 0, 0.02, 0);
  box(3, 0.2, 3, '#7a8590', 2.2, 0.1, -2.2); for (let i = 0; i < 6; i++) box(0.2, 0.2, 3, '#ffd23f', 0.8 + i * 0.55, 0.22, -2.2);
  const r = mesh(new THREE.CylinderGeometry(0.45, 0.45, 5, 24), '#eef1f4', { rough: 0.4 }); r.position.set(2.6, 2.7, -2.6); scene.add(r); const nose = mesh(new THREE.ConeGeometry(0.45, 1.1, 24), '#eef1f4', { rough: 0.4 }); nose.position.set(2.6, 5.75, -2.6); scene.add(nose);
  box(0.5, 6, 0.5, '#2a3040', 3.5, 3, -3.4); for (let i = 0; i < 6; i++) box(1.3, 0.12, 0.12, '#2a3040', 2.9, 0.8 + i * 0.9, -3.4);
  const ramp = box(1.4, 0.15, 3.2, '#9aa6b2', -2.2, 0.6, 1.8); ramp.rotation.x = 0.35;
  const colors = ['#ff6a5a', '#5ab0ff', '#ffd23f', '#7ad87a', '#c08ae0', '#ff9a4a'];
  for (let i = 0; i < 14; i++) { const x = -4.3 + (i % 7) * 0.55, z = 3.6 + Math.floor(i / 7) * 0.6; box(0.28, 0.45, 0.28, colors[i % 6], x, 0.33, z); const h = mesh(new THREE.SphereGeometry(0.15, 12, 8), '#f2c49a'); h.position.set(x, 0.72, z); scene.add(h); }
  box(4.6, 0.3, 0.12, '#e8e8e8', -2.9, 0.3, 3.2);
  const car = new THREE.Group(); const cb = (w, h, d, c, x, y, z, o) => { const m = mesh(new THREE.BoxGeometry(w, h, d), c, { flat: true, ...o }); m.position.set(x, y, z); car.add(m); };
  cb(1.0, 0.3, 2.0, '#e8262b', 0, 0, 0); cb(0.8, 0.28, 1.0, '#9fe8ff', 0, 0.28, -0.1, { rough: 0.2 }); for (const [x, z] of [[-0.5, 0.6], [0.5, 0.6], [-0.5, -0.6], [0.5, -0.6]]) cb(0.15, 0.3, 0.3, '#111', x, -0.12, z);
  for (let i = 0; i < 5; i++) cb(0.12, 0.8, 0.12, '#bff4ff', -0.3 + (i % 3) * 0.3, -0.6, i < 3 ? 0.5 : -0.5, { emissive: '#7fe8ff', ei: 1.5, opacity: 0.7 });
  car.position.set(-1.0, 4.2, 0.2); car.rotation.set(0.2, 0.6, 0.5); scene.add(car);
  const el = box(0.3, 0.5, 0.3, '#d11f2a', -0.6, 0.35, 2.6); const eh = mesh(new THREE.SphereGeometry(0.17, 12, 8), '#f2c49a'); eh.position.set(-0.6, 0.78, 2.6); scene.add(eh);
  for (let i = 0; i < 60; i++) { const s = mesh(new THREE.SphereGeometry(0.03, 6, 4), '#ffffff', { emissive: '#ffffff' }); s.position.set((i * 7.3) % 16 - 8, 6 + (i * 3.1) % 6, -6 - (i % 5)); scene.add(s); }
  camera.position.set(14, 12, 14); camera.lookAt(0, 1.6, 0); camera.updateProjectionMatrix();
  const g = done(); caption(g, 'HE ACTUALLY DID IT.', 2, { y: 1600 }); tag(g, 'ISOMETRIC DIORAMA 3D', { bg: '#e8262b' });
}
