"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function FloatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Slow continuous rotation
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.003;

    // Mouse parallax effect
    const targetX = (state.pointer.x * Math.PI) / 4;
    const targetY = (state.pointer.y * Math.PI) / 4;

    // Smoothly interpolate to target position (parallax)
    meshRef.current.rotation.y += 0.05 * (targetX - meshRef.current.rotation.y);
    meshRef.current.rotation.x += 0.05 * (targetY - meshRef.current.rotation.x);
    
    // Floating up and down
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <Icosahedron ref={meshRef} args={[2, 4]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#ffffff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        wireframe={true}
      />
    </Icosahedron>
  );
}
