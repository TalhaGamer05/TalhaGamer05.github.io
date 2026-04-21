"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  title: string;
  emoji: string;
  description: string;
  href: string;
  color: string;
  onHover: (id: string | null) => void;
}

export function ProjectCard({ id, title, emoji, description, href, color, onHover }: ProjectCardProps) {
  return (
    <Link href={href} className="block w-full pointer-events-auto">
      <motion.div
        className="group relative w-full rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-4 sm:p-5 overflow-hidden transition-colors cursor-pointer"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        onTouchStart={() => onHover(id)}
        onTouchEnd={() => onHover(null)}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 110%, ${color}30 0%, transparent 65%)`,
          }}
        />

        {/* Top border glow line */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-start gap-3 sm:gap-4">
          {/* Emoji icon */}
          <div className="text-2xl sm:text-3xl mt-0.5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            {emoji}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <h2
              className="text-base sm:text-lg font-bold text-white/90 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300 truncate"
              style={{ backgroundImage: `linear-gradient(135deg, #fff, ${color})` }}
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-white/40 font-light leading-relaxed line-clamp-2">
              {description}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-xs font-medium tracking-wider uppercase text-white/30 group-hover:text-white/70 transition-colors duration-300">
              Aç
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
