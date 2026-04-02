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
        "flex items-center justify-center shadow-lg transform",
        "w-20 h-20 rounded-full border-4",
        "text-4xl font-bold transition-all duration-300",
        "focus:outline-none focus:ring-4 focus:ring-white/40",
        disabled
          ? "border-white/10 text-white/20 cursor-not-allowed"
          : "border-white/40 text-white hover:border-white hover:bg-white hover:text-black active:scale-90",
      ].join(" ")}
    >
      {direction === "left" ? "←" : "→"}
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
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "block rounded-full transition-all duration-300",
            i === current
              ? "w-5 h-2 bg-white"
              : "w-2 h-2 bg-white/30",
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
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-black select-none">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 shrink-0">
        {/* Game title */}
        <h1 className="text-3xl font-bold tracking-widest uppercase text-white drop-shadow-sm">
          Blur & Guess
        </h1>

        {/* Timer + controls */}
        <div className="flex items-start gap-6">
          {/* Timer display & Progress */}
          <div className="flex flex-col items-end min-w-[140px]">
            <span
              className={[
                "font-mono text-7xl font-bold tabular-nums tracking-tighter transition-colors duration-300 drop-shadow-md",
                timerColor,
              ].join(" ")}
            >
              {formatTime(timeLeft)}
            </span>
            {/* Progress Bar under Timer */}
            <div className="w-full h-2 bg-white/10 mt-1 rounded-full overflow-hidden">
              <div
                className={["h-full transition-all duration-1000 ease-linear", timeLeft <= 3 ? "bg-red-500" : "bg-white"].join(" ")}
                style={{ width: `${(timeLeft / TIMER_START) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer action buttons */}
          <div className="flex flex-col gap-1 justify-center">
            <button
              onClick={() => setTimerActive((a) => !a)}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              {!timerActive || isRevealed ? "Start" : "Pause"}
            </button>
            <button
              onClick={resetTimer}
              className="px-3 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setIsRevealed(true)}
              disabled={isRevealed}
              className="px-3 py-1 rounded text-xs font-medium bg-blue-500/80 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reveal
            </button>
          </div>
        </div>
      </header>

      {/* Thin separator */}
      <div className="h-px bg-white/10 shrink-0 mx-8" />

      {/* ── Center — Image ───────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center p-8 min-h-0">
        <div
          className="relative w-full h-full max-w-4xl max-h-[65vh] rounded-2xl overflow-hidden
                      bg-white/5 ring-1 ring-white/10 shadow-2xl"
        >
          {IMAGES.map((img, i) => (
            <div
              key={img.id}
              className={[
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              ].join(" ")}
            >
              {img.src === "/placeholder.svg" ? (
                /* Placeholder when no real image is provided */
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-24 h-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-lg font-medium">No image loaded</p>
                  <p className="text-sm">
                    Update <code className="font-mono text-white/50">IMAGE_PATHS</code> in{" "}
                    <code className="font-mono text-white/50">page.tsx</code>
                  </p>
                </div>
              ) : (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-contain transition-all duration-500 ease-in-out"
                  style={{ filter: isRevealed ? 'blur(0px)' : `blur(${img.blurLevel ?? DEFAULT_BLUR}px)` }}
                  priority={i === currentIndex}
                />
              )}
            </div>
          ))}

          {/* Image counter badge */}
          <span className="absolute top-3 right-3 bg-black/60 text-white/60 text-xs font-mono px-2 py-1 rounded-md backdrop-blur-sm">
            {currentIndex + 1} / {IMAGES.length}
          </span>

          {/* Answer Revealed Indicator */}
          <div
            className={[
              "absolute top-3 left-3 px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all duration-500 ease-in-out",
              isRevealed ? "opacity-100 bg-green-500/80 text-white shadow-lg" : "opacity-0 pointer-events-none translate-y-[-10px]"
            ].join(" ")}
          >
            Answer Revealed
          </div>
        </div>
      </section>

      {/* ── Bottom — Navigation ──────────────────────────────────────────── */}
      <footer className="flex items-center justify-center gap-8 pb-6 shrink-0">
        <NavButton
          direction="left"
          onClick={handlePrev}
        />

        <DotIndicator total={IMAGES.length} current={currentIndex} />

        <NavButton
          direction="right"
          onClick={handleNext}
        />
      </footer>
    </main>
  );
}
