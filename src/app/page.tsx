"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameImage {
  id: number;
  src: string;   // path in /public  e.g. "/logos/apple.png"
  alt: string;
  blurLevel?: number; // 0–20, optional per-image override
}

// ─── Configuration — edit this to swap images ─────────────────────────────────

const IMAGE_PATHS = [
  "/logos/cloudflare3.png",
  "/logos/openAI.png",
  "/logos/figma.png",
  "/logos/discord3.png",
  "/logos/postman3.png",
  "/logos/stackoverflow.png"

];

const IMAGES: GameImage[] = IMAGE_PATHS.map((src, index) => ({
  id: index + 1,
  src,
  alt: `Logo ${index + 1}`
}));

const DEFAULT_BLUR = 18; // px — default blur applied to all images
const TIMER_START = 10;  // seconds per image

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Sub‑components ───────────────────────────────────────────────────────────

/** Left / Right arrow button */
function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className={[
        "flex items-center justify-center transition-all duration-300",
        "w-12 h-12 rounded-xl border",
        disabled
          ? "border-white/5 text-white/10 cursor-not-allowed"
          : "border-white/10 text-white hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:text-neon-cyan active:scale-90 shadow-[0_0_15px_rgba(0,242,255,0)] hover:shadow-[0_0_15px_rgba(0,242,255,0.2)]",
      ].join(" ")}
    >
      {direction === "left" ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      )}
    </button>
  );
}

/** Dot indicator row */
function DotIndicator({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1 rounded-full transition-all duration-500",
            i === current
              ? "w-8 bg-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]"
              : "w-2 bg-white/10",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_START);
  const [timerActive, setTimerActive] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentImage = IMAGES[currentIndex];

  const lastNavTime = useRef(0);

  const handlePrev = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTime.current < 400) return;
    lastNavTime.current = now;

    setCurrentIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
    setTimeLeft(TIMER_START);
    setIsRevealed(false);
  }, []);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastNavTime.current < 400) return;
    lastNavTime.current = now;

    setCurrentIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));
    setTimeLeft(TIMER_START);
    setIsRevealed(false);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!timerActive || isRevealed) return;
    if (timeLeft <= 0) {
      // Stop at 0, wait for manual reveal
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft, isRevealed]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input (though we have none, good practice)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault(); // Prevent scrolling
        setTimerActive((a) => !a);
      } else if (e.key === "Enter") {
        e.preventDefault(); // Prevent anything from activating
        setIsRevealed(true);
      } else if (e.key.toLowerCase() === "r") {
        setTimeLeft(TIMER_START);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(TIMER_START);
  };

  const timerColor =
    timeLeft <= 3
      ? "text-red-500 mix-blend-screen animate-pulse"
      : timeLeft <= 5
        ? "text-yellow-400"
        : "text-white";

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden select-none">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-6 shrink-0 glass-card mx-6 mt-6 rounded-2xl border-white/5">
        {/* Game title */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-neon-cyan">
            HACKVIET 1.0
          </h1>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">
            Blur Logo Challenge
          </span>
        </div>

        {/* Timer + controls */}
        <div className="flex items-center gap-10">
          {/* Timer display & Progress */}
          <div className="flex flex-col items-end min-w-[180px]">
            <span
              className={[
                "font-mono-custom text-8xl font-bold tabular-nums tracking-tighter transition-all duration-300 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]",
                timeLeft <= 3 ? "text-neon-pink" : "text-neon-cyan",
              ].join(" ")}
            >
              {formatTime(timeLeft)}
            </span>
            {/* Progress Bar under Timer */}
            <div className="w-full h-1.5 bg-white/5 mt-2 rounded-full overflow-hidden ring-1 ring-white/5">
              <div
                className={["h-full transition-all duration-1000 ease-linear", timeLeft <= 3 ? "bg-neon-pink" : "bg-neon-cyan"].join(" ")}
                style={{ width: `${(timeLeft / TIMER_START) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimerActive((a) => !a)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group"
              title={!timerActive || isRevealed ? "Start" : "Pause"}
            >
              {!timerActive || isRevealed ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white group-hover:fill-neon-cyan transition-colors" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white group-hover:fill-neon-cyan transition-colors" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
            
            <button
              onClick={resetTimer}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group"
              title="Reset"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white group-hover:stroke-neon-cyan transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>

            <button
              onClick={() => setIsRevealed(true)}
              disabled={isRevealed}
              className="px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
            >
              Reveal
            </button>
          </div>
        </div>
      </header>

      {/* ── Center — Image ───────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center p-12 min-h-0">
        <div
          className="relative w-full h-full max-w-5xl max-h-[70vh] rounded-[2rem] p-4 glass-card border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
        >
          {/* Cyber-frame corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-[2rem]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan/30 rounded-tr-[2rem]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-cyan/30 rounded-bl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/30 rounded-br-[2rem]" />

          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-black/40 ring-1 ring-white/5">
            {IMAGES.map((img, i) => (
              <div
                key={img.id}
                className={[
                  "absolute inset-0 transition-all duration-700 ease-in-out",
                  i === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0 pointer-events-none"
                ].join(" ")}
              >
                {img.src === "/placeholder.svg" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10 uppercase tracking-widest font-black italic">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-32 h-32 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p className="text-2xl">DATA_NOT_FOUND</p>
                  </div>
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain transition-all duration-500 ease-in-out p-12"
                    style={{ filter: isRevealed ? 'blur(0px)' : `blur(${img.blurLevel ?? DEFAULT_BLUR}px)` }}
                    priority={i === currentIndex}
                  />
                )}
              </div>
            ))}

            {/* Image counter badge */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-[10px] font-bold font-mono text-white/80 uppercase tracking-widest">
                LOGO {String(currentIndex + 1).padStart(2, '0')} / {String(IMAGES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Answer Revealed Indicator */}
            <div
              className={[
                "absolute top-6 left-6 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-xl border transition-all duration-500 ease-out z-20",
                isRevealed 
                  ? "opacity-100 bg-green-500/10 border-green-500/50 text-green-400 translate-y-0 shadow-[0_0_20px_rgba(34,197,94,0.2)]" 
                  : "opacity-0 pointer-events-none -translate-y-4"
              ].join(" ")}
            >
              IDENTITY_CONFIRMED
            </div>
            
            {/* Reveal Overlay - subtle scanning effect when blurred */}
            {!isRevealed && (
              <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent pointer-events-none z-10 animate-pulse shadow-[inset_0_0_100px_rgba(0,242,255,0.05)]" />
            )}
          </div>
        </div>
      </section>
      {/* ── Bottom — Navigation ──────────────────────────────────────────── */}
      <footer className="flex items-center justify-center gap-12 py-8 shrink-0 relative z-30">
        <div className="flex items-center gap-6 glass-card px-8 py-4 rounded-full border-white/5 shadow-2xl">
          <NavButton
            direction="left"
            onClick={handlePrev}
          />

          <DotIndicator total={IMAGES.length} current={currentIndex} />

          <NavButton
            direction="right"
            onClick={handleNext}
          />
        </div>
      </footer>
    </main>
  );
}
