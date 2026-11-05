# Video studio (Three.js + Remotion)

- **Three.js** (via `@remotion/three` + React Three Fiber + Drei) for 3D animation — `src/Scene.tsx`
- **Remotion** for captions (`@remotion/captions`) and rendering — `src/Captions.tsx`, `public/captions.json`

```bash
cd video
npm install
npm run studio   # live preview in the browser
npm run render   # writes out/video.mp4
```

Animate with `useCurrentFrame()`, not R3F's `useFrame()`, so renders are deterministic.
