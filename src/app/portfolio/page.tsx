"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import AboutContact from "@/components/sections/AboutContact";

// Dynamically import Canvas3D to avoid SSR issues with Three.js
const Canvas3D = dynamic(() => import("@/components/Canvas3D"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative w-full">
      {/* Absolute fixed 3D Canvas in the background */}
      <Canvas3D />
      
      {/* Scrollable Context */}
      <div className="relative z-10">
        <Hero />
        <Projects />
        <AboutContact />
      </div>
    </main>
  );
}
