"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10 px-4">
      {/* Main typography */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        className="text-center z-10 pointer-events-none"
      >
        <span className="text-sm md:text-lg tracking-[0.3em] text-white/50 uppercase mb-4 block">
          Creative Portfolio
        </span>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mix-blend-difference text-white">
          Hi, I'm <span className="text-gradient">Talha</span>
        </h1>
        <p className="mt-6 text-xl md:text-3xl font-light text-white/70 max-w-2xl mx-auto mix-blend-difference">
          a software developer crafting digital experiences.
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 mix-blend-difference text-white"
      >
        <span className="text-xs uppercase tracking-widest text-white/70">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
