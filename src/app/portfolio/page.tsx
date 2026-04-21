"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";

// Lazy-load the heavy 3D scene (no SSR for WebGL)
const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false });

export default function PortfolioHub() {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <div className="relative min-h-[100dvh] bg-black overflow-hidden font-sans selection:bg-fuchsia-500/30">
      
      {/* 3D Global Layer */}
      <Scene activeProject={activeProject} />

      {/* Front UI Layer */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 min-h-[100dvh] flex flex-col justify-center pointer-events-none">
        
        {/* Header Intro */}
        <motion.div 
          className="mb-10 sm:mb-16 md:mb-20 max-w-2xl pointer-events-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 mb-4 sm:mb-6 drop-shadow-lg leading-tight">
            Creative <br/>
            <span className="italic font-light tracking-tighter">Developer.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-lg leading-relaxed">
            Crafting premium interactive multimedia experiences fusing WebGL, bleeding-edge React, and performant Node.js ecosystems.
          </p>
        </motion.div>

        {/* Project Cards Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ProjectCard
              id="snake-game"
              title="AI Snake"
              description="A high-performance algorithmic approach to the classic snake game inside the Canvas."
              href="/projects/snake-game"
              color="#10b981"
              onHover={setActiveProject}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ProjectCard
              id="weather-dashboard"
              title="Sky Cast"
              description="Enterprise-grade weather visualization with real-time mapping and physics."
              href="/projects/weather-dashboard"
              color="#38bdf8"
              onHover={setActiveProject}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.8 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <ProjectCard
              id="music-player"
              title="Sonic"
              description="A beautiful glassmorphic music player with live C#-powered audio features."
              href="/projects/music-player"
              color="#c026d3"
              onHover={setActiveProject}
            />
          </motion.div>

        </div>

        {/* Footer hint — hidden on small touch screens */}
        <motion.div 
          className="hidden sm:flex absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs sm:text-sm tracking-widest uppercase flex-col items-center gap-2 pointer-events-auto cursor-default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          Hover to interact
          <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>

      </main>
    </div>
  );
}
