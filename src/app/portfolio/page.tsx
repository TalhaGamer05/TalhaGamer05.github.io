"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("@/components/3d/Scene"), { ssr: false });

// ─── All 9 Projects ─────────────────────────────────────────────
const PROJECTS = [
  {
    id: "havadurumu",
    title: "Hava Durumu",
    emoji: "⛅",
    description: "Glassmorphism tasarımlı, harita ve grafik içeren hava durumu paneli.",
    href: "/havadurumu/index.html",
    color: "#38bdf8",
  },
  {
    id: "avmarket",
    title: "AV Market",
    emoji: "🛒",
    description: "Ürün listeleme ve sepet yönetimi ile online market projesi.",
    href: "/avmarket/index.html",
    color: "#f97316",
  },
  {
    id: "snake",
    title: "AI Snake Game",
    emoji: "🐍",
    description: "Canvas tabanlı, yüksek performanslı yapay zekâ yılan oyunu.",
    href: "/snake/index.html",
    color: "#10b981",
  },
  {
    id: "muzik",
    title: "Müzik Görselleştirici",
    emoji: "🎵",
    description: "Gerçek zamanlı ses analizi ve glassmorphism arayüzlü müzik çalar.",
    href: "/muzik/index.html",
    color: "#c026d3",
  },
  {
    id: "gorevler",
    title: "Görev Yöneticisi",
    emoji: "✅",
    description: "Sürükle-bırak destekli profesyonel görev takip uygulaması.",
    href: "/gorevler/index.html",
    color: "#34d399",
  },
  {
    id: "chatbot",
    title: "AI Chatbot",
    emoji: "🤖",
    description: "Yapay zekâ destekli, akıllı sohbet robotu arayüzü.",
    href: "/chatbot/index.html",
    color: "#6366f1",
  },
  {
    id: "yazihizi",
    title: "Yazı Hızı Testi",
    emoji: "⌨️",
    description: "WPM ölçümlü, anlık istatistikli klavye hız testi.",
    href: "/yazihizi/index.html",
    color: "#fbbf24",
  },
  {
    id: "pomodoro",
    title: "Pomodoro Zamanlayıcı",
    emoji: "🍅",
    description: "Özelleştirilebilir aralıklı, odak-mola döngüsü sayacı.",
    href: "/pomodoro/index.html",
    color: "#ef4444",
  },
  {
    id: "solitaire",
    title: "Spider Solitaire",
    emoji: "🃏",
    description: "God Mode akıllı çözücülü, tam özellikli kart oyunu.",
    href: "/solitaire/index.html",
    color: "#ec4899",
  },
];

export default function PortfolioHub() {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] overflow-hidden font-sans selection:bg-fuchsia-500/30">
      
      {/* 3D Particle Layer */}
      <Scene activeProject={activeProject} />

      {/* Front UI Layer */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 min-h-[100dvh] flex flex-col justify-center pointer-events-none">
        
        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-12 md:mb-16 pointer-events-auto text-center sm:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 mb-3 sm:mb-4 leading-tight">
            Projelerim<span className="text-white/20">.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/40 font-light max-w-md mx-auto sm:mx-0 leading-relaxed">
            Hover ile parçacıkların emojiye dönüşümünü izle, tıkla ve projeyi keşfet.
          </p>
        </motion.div>

        {/* ── 9-Card Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.06 }}
            >
              <ProjectCard
                id={project.id}
                title={project.title}
                emoji={project.emoji}
                description={project.description}
                href={project.href}
                color={project.color}
                onHover={setActiveProject}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-8 sm:mt-12 text-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-white/20 text-xs tracking-widest uppercase">
            t4lhster © 2026
          </p>
        </motion.div>

      </main>
    </div>
  );
}
