import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WeatherDashboardPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-blue-500/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />
      
      <Link href="/portfolio" className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors z-10 text-sm sm:text-base">
        <ArrowLeft size={18} />
        Back to Portfolio
      </Link>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-500 z-10 text-center">
        Weather Dashboard
      </h1>
      <p className="text-blue-200/60 max-w-2xl text-center mb-6 sm:mb-8 z-10 text-sm sm:text-base px-2">
        Enterprise-grade web application featuring interactive mapping, dynamic data visualization, and a high-end glassmorphism aesthetic.
      </p>
      
      <div className="w-full max-w-5xl h-[50vh] sm:h-[55vh] md:h-[650px] border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center z-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <span className="text-blue-300/40 uppercase tracking-widest text-xs sm:text-sm z-20">Weather Interface Placeholder</span>
      </div>
    </div>
  );
}
