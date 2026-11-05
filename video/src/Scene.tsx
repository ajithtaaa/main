import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { RoundedBox, Torus } from "@react-three/drei";

// IMPORTANT: never use useFrame()/clocks from react-three-fiber for animation.
// Derive everything from useCurrentFrame() so every rendered frame is deterministic.
export const Scene: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const rotY = frame * 0.03;
  const rotX = interpolate(frame, [0, 240], [0.3, -0.3]);
  const ringTilt = interpolate(frame, [0, 240], [0, Math.PI * 2]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#ff6ad5" />

      <group scale={pop} rotation={[rotX, rotY, 0]}>
        <RoundedBox args={[1.8, 1.8, 1.8]} radius={0.25} smoothness={6}>
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} />
        </RoundedBox>
      </group>

      <Torus args={[2.4, 0.06, 32, 128]} rotation={[Math.PI / 2.4, ringTilt, 0]} scale={pop}>
        <meshStandardMaterial color="#ffd166" emissive="#ffb300" emissiveIntensity={0.6} />
      </Torus>
    </>
  );
};
