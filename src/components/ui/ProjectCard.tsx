"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  href: string;
  color: string;
  onHover: (id: string | null) => void;
}

export function ProjectCard({ id, title, description, href, color, onHover }: ProjectCardProps) {
  return (
    <Link href={href} className="block w-full pointer-events-auto">
      <motion.div
        className="group relative w-full rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-5 sm:p-6 md:p-8 overflow-hidden transition-colors min-h-[160px] sm:min-h-[200px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        onTouchStart={() => onHover(id)}
        onTouchEnd={() => onHover(null)}
      >
        {/* Hover Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 120%, ${color}33 0%, transparent 70%)`
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between gap-3 sm:gap-4">
          <h2 
            className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
            style={{ backgroundImage: `linear-gradient(to right, #fff, ${color})` }}
          >
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-light max-w-sm leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/50 group-hover:text-white transition-colors duration-300">
            View Project
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
