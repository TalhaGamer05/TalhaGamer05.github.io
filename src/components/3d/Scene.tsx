"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════
const PARTICLE_COUNT = 3000;
const LERP_SPEED = 0.025;
const COLOR_LERP_SPEED = 0.035;
const SPREAD = 7;

// ─── All 9 projects ──────────────────────────────────────────────
const PROJECTS: Record<string, { emoji: string; color: THREE.Color }> = {
  havadurumu: { emoji: "⛅",  color: new THREE.Color("#38bdf8") },
  avmarket:   { emoji: "🛒",  color: new THREE.Color("#f97316") },
  snake:      { emoji: "🐍",  color: new THREE.Color("#10b981") },
  muzik:      { emoji: "🎵",  color: new THREE.Color("#c026d3") },
  gorevler:   { emoji: "✅",  color: new THREE.Color("#34d399") },
  chatbot:    { emoji: "🤖",  color: new THREE.Color("#6366f1") },
  yazihizi:   { emoji: "⌨️",  color: new THREE.Color("#fbbf24") },
  pomodoro:   { emoji: "🍅",  color: new THREE.Color("#ef4444") },
  solitaire:  { emoji: "🃏",  color: new THREE.Color("#ec4899") },
};
const DEFAULT_COLOR = new THREE.Color("#666666");

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Render an emoji onto an offscreen canvas and sample filled-pixel positions */
function sampleEmojiPoints(emoji: string, count: number, spread: number): Float32Array {
  const canvas = document.createElement("canvas");
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);
  ctx.font = `${size * 0.72}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);

  const imageData = ctx.getImageData(0, 0, size, size);
  const filled: [number, number][] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (imageData.data[(y * size + x) * 4 + 3] > 40) {
        filled.push([x, y]);
      }
    }
  }

  // Fallback circle if emoji didn't render on this platform
  if (filled.length < 80) {
    for (let i = 0; i < 800; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * size * 0.32;
      filled.push([size / 2 + Math.cos(a) * r, size / 2 + Math.sin(a) * r]);
    }
  }

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const px = filled[Math.floor(Math.random() * filled.length)];
    positions[i * 3]     = ((px[0] / size) - 0.5) * spread;
    positions[i * 3 + 1] = (-(px[1] / size) + 0.5) * spread; // flip Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.12;
  }
  return positions;
}

/** Random sphere-distributed particle positions */
function randomSpherePositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

// ═══════════════════════════════════════════════════════════════════
// PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════
function ParticleField({ activeProject }: { activeProject: string | null }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const { pointer } = useThree();

  // Pre‑compute idle and emoji target arrays
  const defaultPositions = useMemo(() => randomSpherePositions(PARTICLE_COUNT, 5), []);

  const emojiTargets = useMemo(() => {
    const targets: Record<string, Float32Array> = {};
    Object.entries(PROJECTS).forEach(([key, { emoji }]) => {
      targets[key] = sampleEmojiPoints(emoji, PARTICLE_COUNT, SPREAD);
    });
    return targets;
  }, []);

  // Imperatively create buffer attributes (stable references)
  useEffect(() => {
    if (!geoRef.current) return;

    const pos = new Float32Array(defaultPositions);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      col[i * 3]     = DEFAULT_COLOR.r;
      col[i * 3 + 1] = DEFAULT_COLOR.g;
      col[i * 3 + 2] = DEFAULT_COLOR.b;
      sizes[i] = 0.6 + Math.random() * 0.6; // per‑particle size jitter
    }

    geoRef.current.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geoRef.current.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    geoRef.current.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));
  }, [defaultPositions]);

  // ─── Per‑frame animation loop ────────────────────────────────
  useFrame((state) => {
    if (!geoRef.current || !pointsRef.current) return;

    const posAttr = geoRef.current.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geoRef.current.getAttribute("color") as THREE.BufferAttribute;
    if (!posAttr || !colAttr) return;

    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    const targetPos = activeProject ? emojiTargets[activeProject] ?? defaultPositions : defaultPositions;
    const targetCol = activeProject
      ? PROJECTS[activeProject]?.color ?? DEFAULT_COLOR
      : DEFAULT_COLOR;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Lerp position toward target
      posArr[i3]     += (targetPos[i3]     - posArr[i3])     * LERP_SPEED;
      posArr[i3 + 1] += (targetPos[i3 + 1] - posArr[i3 + 1]) * LERP_SPEED;
      posArr[i3 + 2] += (targetPos[i3 + 2] - posArr[i3 + 2]) * LERP_SPEED;

      // Idle floating motion when no project hovered
      if (!activeProject) {
        posArr[i3]     += Math.sin(time * 0.3 + i * 0.012) * 0.004;
        posArr[i3 + 1] += Math.cos(time * 0.25 + i * 0.015) * 0.004;
      }

      // Lerp color
      colArr[i3]     += (targetCol.r - colArr[i3])     * COLOR_LERP_SPEED;
      colArr[i3 + 1] += (targetCol.g - colArr[i3 + 1]) * COLOR_LERP_SPEED;
      colArr[i3 + 2] += (targetCol.b - colArr[i3 + 2]) * COLOR_LERP_SPEED;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Subtle parallax with cursor
    pointsRef.current.rotation.x += ((pointer.y * 0.15) - pointsRef.current.rotation.x) * 0.04;
    pointsRef.current.rotation.y += ((pointer.x * 0.15) - pointsRef.current.rotation.y) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTED SCENE WRAPPER
// ═══════════════════════════════════════════════════════════════════
export default function Scene({ activeProject }: { activeProject: string | null }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#050505"]} />
        <ParticleField activeProject={activeProject} />
      </Canvas>
    </div>
  );
}
