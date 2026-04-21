"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, Preload } from "@react-three/drei";
import FloatingShape from "./3d/FloatingShape";
import { Suspense } from "react";

export default function Canvas3D() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          
          <Float
            speed={1.5}
            rotationIntensity={1}
            floatIntensity={2}
          >
            <FloatingShape />
          </Float>
          
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
