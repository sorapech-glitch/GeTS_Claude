"use client";

/**
 * Home page hero — dark navy, premium landing feel, with a live animated
 * intersection demo. The signal sequence (green E–W → yellow → all-red →
 * green N–S → …) is driven by a 1-second tick and a fixed 12-step schedule,
 * so queues visibly shrink on green and rebuild on red.
 */

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui";
import { IntersectionDiagram } from "@/components/IntersectionDiagram";
import { useLanguage } from "@/lib/i18n";
import type { Bi, LightColor } from "@/lib/types";

const TICK_MS = 1000;
const CYCLE_LENGTH = 12;

/* 12-tick schedule: E–W green (4) → yellow (1) → all-red (1) →
   N–S green (4) → yellow (1) → all-red (1) → repeat. */
const EW_SIGNAL: LightColor[] = [
  "green", "green", "green", "green", "yellow", "red",
  "red", "red", "red", "red", "red", "red",
];
const NS_SIGNAL: LightColor[] = [
  "red", "red", "red", "red", "red", "red",
  "green", "green", "green", "green", "yellow", "red",
];
/* Queues shrink during green, rebuild during red (values loop cleanly). */
const EAST_QUEUE = [4, 3, 2, 1, 0, 0, 1, 2, 3, 3, 4, 4];
const WEST_QUEUE = [3, 2, 1, 0, 0, 0, 1, 1, 2, 2, 3, 3];
const NORTH_QUEUE = [2, 3, 3, 4, 4, 5, 4, 3, 1, 0, 0, 1];
const SOUTH_QUEUE = [1, 2, 2, 3, 3, 4, 3, 2, 1, 0, 0, 1];

const PHASE_EW_GREEN: Bi = {
  th: "ไฟเขียวแนวตะวันออก–ตะวันตก (E–W)",
  en: "East–West green",
};
const PHASE_NS_GREEN: Bi = {
  th: "ไฟเขียวแนวเหนือ–ใต้ (N–S)",
  en: "North–South green",
};
const PHASE_YELLOW: Bi = {
  th: "ไฟเหลือง เตรียมเปลี่ยนเฟส (Yellow)",
  en: "Yellow — phase changing",
};
const PHASE_ALL_RED: Bi = {
  th: "แดงพร้อมกันทุกทิศทาง (All-Red)",
  en: "All-red clearance",
};

function phaseFor(tick: number): Bi {
  if (EW_SIGNAL[tick] === "green") return PHASE_EW_GREEN;
  if (NS_SIGNAL[tick] === "green") return PHASE_NS_GREEN;
  if (EW_SIGNAL[tick] === "yellow" || NS_SIGNAL[tick] === "yellow") {
    return PHASE_YELLOW;
  }
  return PHASE_ALL_RED;
}

export function HeroSection() {
  const { t } = useLanguage();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setTick((v) => (v + 1) % CYCLE_LENGTH),
      TICK_MS
    );
    return () => clearInterval(id);
  }, []);

  const phase = phaseFor(tick);
  const diagramTitle = `${t({
    th: "สี่แยกจำลองแบบเคลื่อนไหว สถานะปัจจุบัน:",
    en: "Animated four-way intersection demo. Current state:",
  })} ${t(phase)}`;

  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      {/* Subtle grid texture */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.06]"
      >
        <defs>
          <pattern
            id="home-hero-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M40 0H0v40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#home-hero-grid)" />
      </svg>
      {/* Soft glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-80 w-80 rounded-full bg-system-violet/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy + CTAs */}
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-400">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-accent-400"
              />
              Genius Traffic System
            </p>
            <h1
              className="animate-fade-up mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "0.1s" }}
            >
              Traffic Signal Learning Center
            </h1>
            <p
              className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-navy-200"
              style={{ animationDelay: "0.2s" }}
            >
              {t({
                th: "เรียนรู้ระบบสัญญาณไฟจราจร ตั้งแต่ Fixed Time, Vehicle Actuated ไปจนถึง Adaptive Control",
                en: "Learn traffic signal control — from Fixed Time and Vehicle Actuated to Adaptive Control",
              })}
            </p>
            <div
              className="animate-fade-up mt-9 flex flex-wrap gap-3"
              style={{ animationDelay: "0.3s" }}
            >
              <ButtonLink href="/fixed-time" variant="secondary">
                {t({ th: "เริ่มเรียนรู้", en: "Start Learning" })}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ButtonLink>
              <ButtonLink href="/simulator" variant="onDark">
                {t({ th: "ลองซิมูเลเตอร์", en: "Try Simulator" })}
              </ButtonLink>
              <ButtonLink href="/compare" variant="onDark">
                {t({ th: "เปรียบเทียบระบบ", en: "Compare Systems" })}
              </ButtonLink>
            </div>
            <p
              className="animate-fade-up mt-8 text-sm text-navy-400"
              style={{ animationDelay: "0.4s" }}
            >
              {t({
                th: "เนื้อหาฟรีสองภาษา ไทย/EN • เหมาะตั้งแต่ผู้เริ่มต้นจนถึงทีมเทคนิค",
                en: "Free bilingual content (TH/EN) • for everyone from beginners to technical teams",
              })}
            </p>
          </div>

          {/* Live animated intersection */}
          <figure
            className="animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="relative mx-auto w-full max-w-md rounded-3xl border border-navy-700/70 bg-navy-900/60 p-4 shadow-2xl backdrop-blur sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-400">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 animate-signal-pulse rounded-full bg-accent-400"
                  />
                  {t({ th: "เดโมสด", en: "Live demo" })}
                </span>
                <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-medium text-navy-200">
                  {t(phase)}
                </span>
              </div>
              <IntersectionDiagram
                north={{ signal: NS_SIGNAL[tick], queue: NORTH_QUEUE[tick] }}
                south={{ signal: NS_SIGNAL[tick], queue: SOUTH_QUEUE[tick] }}
                east={{ signal: EW_SIGNAL[tick], queue: EAST_QUEUE[tick] }}
                west={{ signal: EW_SIGNAL[tick], queue: WEST_QUEUE[tick] }}
                title={diagramTitle}
                className="mx-auto rounded-2xl"
              />
              <figcaption className="mt-3 text-center text-xs text-navy-300">
                {t({
                  th: "สัญญาณไฟสลับเฟสอัตโนมัติ และแถวรถจะลดลงเมื่อได้ไฟเขียว",
                  en: "Signals cycle through phases automatically — queues shrink on green.",
                })}
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
