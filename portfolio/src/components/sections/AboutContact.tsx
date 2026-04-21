"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutContact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen flex flex-col items-center justify-center z-10 px-4 pt-32 pb-20 bg-background"
    >
      <motion.div 
        style={{ opacity, y }}
        className="max-w-4xl mx-auto text-center"
      >
        <span className="text-sm md:text-lg tracking-[0.2em] text-white/50 uppercase mb-8 block">
          About Me
        </span>
        <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-16">
          I specialize in building <span className="font-bold text-gradient">premium web applications</span> with a strong focus on aesthetics, deeply interactive experiences, and robust architectures.
        </h2>

        <div className="w-full h-[1px] bg-white/10 my-16"></div>

        <MagneticButton>
          <a href="mailto:contact@talha.dev" className="flex items-center justify-center w-full h-full text-white text-xl uppercase tracking-widest">
            Get in touch
          </a>
        </MagneticButton>

        <div className="mt-20 flex gap-8 justify-center">
          {['LinkedIn', 'GitHub', 'Twitter'].map((social) => (
            <a 
              key={social} 
              href="#" 
              className="text-white/50 hover:text-white uppercase tracking-widest text-sm transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full border border-white/20 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors duration-500 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-white translate-y-[100%] rounded-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"></div>
      <div className="relative mix-blend-difference w-full h-full flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
}
