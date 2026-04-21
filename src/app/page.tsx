"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./style.css"; // We will rename the original style.css to src/app/style.css 

const projeler = [
    'havadurumu',
    'avmarket',
    'snake',
    'muzik',
    'gorevler',
    'chatbot',
    'yazihizi',
    'pomodoro',
    'solitaire'
];

export default function Home() {
    return (
        <>
            <div className="arkaplan"></div>

            <div className="container">
                <header>
                    <h1>projelerim.</h1>
                    <p>web geliştirme çalışmalarım</p>
                    <Link href="/portfolio" className="portfolio-banner">
                        🚀 Yeni 3D Portföyümü İncele!
                    </Link>
                </header>

                <main>
                    <div id="proje-listesi" className="proje-grid">
                        {projeler.map((klasorAdi, i) => (
                            <ProjectCard key={klasorAdi} klasorAdi={klasorAdi} sira={i} />
                        ))}
                    </div>
                </main>

                <footer>
                    <p>t4lhster &copy; 2026</p>
                </footer>
            </div>
        </>
    );
}

function ProjectCard({ klasorAdi, sira }: { klasorAdi: string, sira: number }) {
    const cardRef = useRef<HTMLAnchorElement>(null);

    const baslik = klasorAdi
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!cardRef.current) return;
        const r = cardRef.current.getBoundingClientRect();
        cardRef.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
        cardRef.current.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    return (
        <Link 
            href={`/${klasorAdi}/index.html`}
            className="proje-kart" 
            style={{ animationDelay: `${sira * 0.08}s` }}
            ref={cardRef}
            onMouseMove={handleMouseMove}
        >
            <div className="ikon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <h3>{baslik}</h3>
            <p className="alt-yazi">projeyi aç</p>
        </Link>
    );
}
