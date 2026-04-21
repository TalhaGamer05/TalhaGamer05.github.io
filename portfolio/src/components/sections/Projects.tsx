"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const projects = [
  { id: "havadurumu", title: "Hava Durumu", desc: "Enterprise-grade weather dashboard with Mapbox and charts.", link: "../havadurumu/index.html" },
  { id: "avmarket", title: "Av Market", desc: "E-commerce platform for hunting and fishing gear.", link: "../avmarket/index.html" },
  { id: "snake", title: "Snake", desc: "Classic snake game with modern glassmorphism touches.", link: "../snake/index.html" },
  { id: "muzik", title: "Müzik", desc: "Audio visualizer with interactive elements.", link: "../muzik/index.html" },
  { id: "gorevler", title: "Görevler", desc: "Task management app with complex sorting and filtering.", link: "../gorevler/index.html" },
  { id: "chatbot", title: "Chatbot", desc: "AI-based conversational bot interface.", link: "../chatbot/index.html" },
  { id: "yazihizi", title: "Yazı Hızı", desc: "Typing speed test with real-time statistics.", link: "../yazihizi/index.html" },
  { id: "pomodoro", title: "Pomodoro", desc: "Productivity timer with custom themes.", link: "../pomodoro/index.html" },
  { id: "solitaire", title: "Solitaire", desc: "Spider solitaire with auto-solver logic.", link: "../solitaire/index.html" },
];

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!sectionRef.current || !containerRef.current) return;

    const sections = gsap.utils.toArray(".project-card");
    
    const tl = gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + containerRef.current!.offsetWidth,
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-background/50 z-10 flex items-center">
      <div className="absolute top-20 left-10 md:left-20 z-20">
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Selected Works</h2>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex h-full items-center pl-10 md:pl-20 mt-20"
        style={{ width: `${projects.length * 100}vw` }}
      >
        {projects.map((project, i) => (
          <div 
            key={project.id} 
            className="project-card flex-shrink-0 w-[80vw] md:w-[40vw] h-[60vh] mr-10 md:mr-20 glass-card rounded-3xl p-8 flex flex-col justify-between group transition-transform duration-500 hover:-translate-y-4"
          >
            <div className="w-full h-[60%] bg-white/5 rounded-2xl overflow-hidden relative border border-white/10">
              {/* Fallback pattern since we don't have images */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <span className="text-white/40 text-sm tracking-widest font-bold block mb-2">0{i + 1}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/60 text-sm max-w-sm">{project.desc}</p>
              </div>
              
              <div className="flex gap-4">
                <Link href={project.link} target="_blank" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
