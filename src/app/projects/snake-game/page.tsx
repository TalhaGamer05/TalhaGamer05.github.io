import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SnakeGamePage() {
  return (
    <div className="min-h-[100dvh] bg-black text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative font-sans">
      <Link href="/portfolio" className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm sm:text-base">
        <ArrowLeft size={18} />
        Back to Portfolio
      </Link>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 text-center">
        AI Snake Game
      </h1>
      <p className="text-gray-400 max-w-2xl text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">
        Welcome to the Next.js integrated AI Snake Game. High-performance, intelligent pathfinding snake implementation.
      </p>
      <div className="w-full max-w-4xl h-[50vh] sm:h-[55vh] md:h-[600px] border border-green-500/30 rounded-xl bg-green-950/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <span className="text-green-500/50 uppercase tracking-widest text-xs sm:text-sm">Snake Canvas Placeholder</span>
      </div>
    </div>
  );
}
