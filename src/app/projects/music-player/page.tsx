import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MusicPlayerPage() {
  return (
    <div className="min-h-[100dvh] bg-[#120a1f] text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-1/4 -right-1/4 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-fuchsia-600/20 rounded-full blur-[100px] sm:blur-[120px] md:blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-purple-700/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />
      
      <Link href="/portfolio" className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition-colors z-10 text-sm sm:text-base">
        <ArrowLeft size={18} />
        Back to Portfolio
      </Link>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-500 z-10 text-center">
        C# Music Player
      </h1>
      <p className="text-fuchsia-200/60 max-w-2xl text-center mb-6 sm:mb-8 z-10 text-sm sm:text-base px-2">
        High-fidelity audio visualization, refined playback mechanics, and glassmorphism UI.
      </p>
      
      <div className="w-full max-w-3xl h-[55vh] sm:h-[60vh] md:h-[700px] border border-white/10 rounded-3xl bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center z-10 shadow-[0_0_80px_rgba(192,38,211,0.15)] relative overflow-hidden">
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full border border-fuchsia-500/30 mb-6 sm:mb-8 flex items-center justify-center animate-[spin_10s_linear_infinite]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-fuchsia-500/20 rounded-full blur-md" />
        </div>
        <span className="text-fuchsia-300/40 uppercase tracking-widest text-xs sm:text-sm z-20">Music Player Interface Placeholder</span>
        
        {/* Subtle glass reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-3xl" />
      </div>
    </div>
  );
}
