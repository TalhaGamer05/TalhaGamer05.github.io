"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Sparkles,
  Float,
  MeshDistortMaterial,
  ContactShadows,
} from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

// ─── Project → Emoji / Color Map ─────────────────────────────────
const EMOJI_MAP: Record<string, { emoji: string; color: string; colorVec: THREE.Color }> = {
  "snake-game":        { emoji: "🐍", color: "#10b981", colorVec: new THREE.Color("#10b981") },
  "weather-dashboard": { emoji: "⛅", color: "#38bdf8", colorVec: new THREE.Color("#38bdf8") },
  "music-player":      { emoji: "🎵", color: "#c026d3", colorVec: new THREE.Color("#c026d3") },
};
const DEFAULT_COLOR = new THREE.Color("#ffffff");
const DEFAULT_EMOJI = "🔮";

// ─── Interactive Sparkle Field ───────────────────────────────────
function InteractiveParticles({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { pointer, viewport } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const tx = (pointer.x * viewport.width) / 20;
    const ty = (pointer.y * viewport.height) / 20;
    groupRef.current.position.x += (tx - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.05;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={400} scale={18} size={2.5} speed={0.4} opacity={0.4} color={color} />
    </group>
  );
}

// ─── Animated Aura Blob ──────────────────────────────────────────
function AuraBlob({ activeProject }: { activeProject: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<any>(null!);
  const scaleTarget = useRef({ v: 2.5 });
  const targetColor = useRef(new THREE.Color("#ffffff"));

  useEffect(() => {
    gsap.to(scaleTarget.current, {
      v: activeProject ? 1.8 : 2.5,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
    const c = activeProject ? EMOJI_MAP[activeProject]?.colorVec ?? DEFAULT_COLOR : DEFAULT_COLOR;
    targetColor.current.copy(c);
  }, [activeProject]);

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return;
    const s = scaleTarget.current.v;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.08);
    matRef.current.color.lerp(targetColor.current, 0.06);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshDistortMaterial
        ref={matRef}
        color="#ffffff"
        speed={2}
        distort={0.4}
        transparent
        opacity={0.15}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// ─── Morphing Emoji via Html (real DOM emoji in 3D space) ────────
function MorphingEmoji({ activeProject }: { activeProject: string | null }) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  // GSAP animation state
  const anim = useRef({ scale: 1, rotY: 0 });
  const [displayEmoji, setDisplayEmoji] = useState(DEFAULT_EMOJI);
  const [glowColor, setGlowColor] = useState("#ffffff");

  useEffect(() => {
    const tl = gsap.timeline();

    // 1) Shrink & spin out
    tl.to(anim.current, {
      scale: 0,
      rotY: -Math.PI,
      duration: 0.3,
      ease: "power3.in",
    });

    // 2) Swap emoji at the midpoint
    tl.call(() => {
      const data = activeProject ? EMOJI_MAP[activeProject] : null;
      setDisplayEmoji(data?.emoji ?? DEFAULT_EMOJI);
      setGlowColor(data?.color ?? "#ffffff");
    });

    // 3) Spring back in (bigger when active)
    tl.to(anim.current, {
      scale: activeProject ? 1.4 : 1,
      rotY: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.4)",
    });

    return () => { tl.kill(); };
  }, [activeProject]);

  // Apply GSAP values + cursor parallax every frame
  useFrame(() => {
    if (!groupRef.current || !innerRef.current) return;

    // Parallax
    const trx = (pointer.y * Math.PI) / 8;
    const try_ = (pointer.x * Math.PI) / 8;
    groupRef.current.rotation.x += (trx - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y += (try_ - groupRef.current.rotation.y) * 0.08;

    // GSAP driven
    const s = anim.current.scale;
    innerRef.current.scale.set(s, s, s);
    innerRef.current.rotation.y = anim.current.rotY;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={activeProject ? 0.5 : 1.5} floatingRange={[-0.3, 0.3]}>
        <AuraBlob activeProject={activeProject} />

        <group ref={innerRef}>
          {/* Real DOM emoji rendered inside the 3D scene via Html */}
          <Html
            center
            transform
            distanceFactor={6}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                fontSize: "8rem",
                lineHeight: 1,
                filter: `drop-shadow(0 0 40px ${glowColor}80) drop-shadow(0 0 80px ${glowColor}40)`,
                transition: "filter 0.5s ease",
                userSelect: "none",
                willChange: "filter",
              }}
            >
              {displayEmoji}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}

// ─── Exported Scene ──────────────────────────────────────────────
export default function Scene({ activeProject }: { activeProject: string | null }) {
  const currentColor = activeProject ? EMOJI_MAP[activeProject]?.color ?? "#ffffff" : "#ffffff";

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color={currentColor} />
        <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} color="#ffffff" />

        <Environment preset="city" />

        <MorphingEmoji activeProject={activeProject} />
        <InteractiveParticles color={currentColor} />

        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color={currentColor} />
      </Canvas>
    </div>
  );
}
