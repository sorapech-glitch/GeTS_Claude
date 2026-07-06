"use client";

import { useLanguage } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

/**
 * FixedCycleTimeline — a horizontal stacked timing bar of one full signal
 * cycle. Each phase contributes a green / yellow / all-red segment drawn in
 * signal colors with second labels; a playhead marks the current position.
 *
 * Purely presentational: the parent owns the clock and passes `elapsed`
 * (seconds into the cycle), so the bar stays in sync with any other visual
 * driven by the same clock (e.g. an IntersectionDiagram).
 */

export interface CyclePhase {
  id: string;
  /** Phase label, e.g. "เฟสที่ 1 (Phase 1) · แนวเหนือ–ใต้ N–S". */
  label: Bi;
  /** Green time in seconds. */
  green: number;
  /** Yellow time in seconds. */
  yellow: number;
  /** All-red clearance time in seconds. */
  allRed: number;
}

export interface FixedCycleTimelineProps {
  /** Ordered phases making up one full cycle. */
  phases: CyclePhase[];
  /** Elapsed seconds into the cycle (0 ≤ elapsed < cycle time). */
  elapsed: number;
  className?: string;
}

type SegmentKind = "green" | "yellow" | "allRed";

interface Segment {
  key: string;
  kind: SegmentKind;
  seconds: number;
}

const SEGMENT_META: Record<SegmentKind, { bar: string; legend: Bi; short: Bi }> = {
  green: {
    bar: "bg-signal-green",
    legend: { th: "เวลาไฟเขียว (Green Time)", en: "Green Time" },
    short: { th: "เขียว (Green)", en: "Green" },
  },
  yellow: {
    bar: "bg-signal-yellow",
    legend: { th: "เวลาไฟเหลือง (Yellow Time)", en: "Yellow Time" },
    short: { th: "เหลือง (Yellow)", en: "Yellow" },
  },
  allRed: {
    bar: "bg-signal-red",
    legend: { th: "เวลาแดงพร้อมกัน (All-Red Time)", en: "All-Red Time" },
    short: { th: "แดงพร้อมกัน (All-Red)", en: "All-Red" },
  },
};

const LEGEND_ORDER: SegmentKind[] = ["green", "yellow", "allRed"];

export function FixedCycleTimeline({
  phases,
  elapsed,
  className = "",
}: FixedCycleTimelineProps) {
  const { t } = useLanguage();

  const segments: Segment[] = phases.flatMap((p) => {
    const list: Segment[] = [
      { key: `${p.id}-green`, kind: "green", seconds: p.green },
      { key: `${p.id}-yellow`, kind: "yellow", seconds: p.yellow },
      { key: `${p.id}-allRed`, kind: "allRed", seconds: p.allRed },
    ];
    return list.filter((s) => s.seconds > 0);
  });

  const cycle = segments.reduce((sum, s) => sum + s.seconds, 0);
  const safeElapsed = cycle > 0 ? Math.min(Math.max(elapsed, 0), cycle) : 0;
  const playheadPct = cycle > 0 ? (safeElapsed / cycle) * 100 : 0;

  const barAria = t({
    th:
      `แผนภาพเวลาหนึ่งรอบสัญญาณไฟ (Cycle Time) รวม ${cycle} วินาที: ` +
      phases
        .map(
          (p) =>
            `${p.label.th} — ไฟเขียว ${p.green} วินาที ไฟเหลือง ${p.yellow} วินาที แดงพร้อมกัน ${p.allRed} วินาที`
        )
        .join(" จากนั้น ") +
      ` ขณะนี้อยู่ที่วินาทีที่ ${Math.floor(safeElapsed)}`,
    en:
      `Timing diagram of one ${cycle}-second signal cycle: ` +
      phases
        .map(
          (p) =>
            `${p.label.en} — green ${p.green}s, yellow ${p.yellow}s, all-red ${p.allRed}s`
        )
        .join(", then ") +
      `. Currently at second ${Math.floor(safeElapsed)}.`,
  });

  return (
    <div className={className}>
      {/* Cycle Time label (the whole bar) + live second readout */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm font-semibold text-navy-900">
          {t({ th: "รอบสัญญาณไฟ (Cycle Time)", en: "Cycle Time" })}{" "}
          <span className="font-mono tabular-nums">
            = {cycle} {t({ th: "วินาที", en: "s" })}
          </span>
        </p>
        <p className="font-mono text-sm tabular-nums text-navy-600">
          t = {Math.floor(safeElapsed)}s / {cycle}s
        </p>
      </div>

      {/* Bracket spanning the whole cycle */}
      <div
        aria-hidden="true"
        className="mt-1.5 h-2 rounded-t-md border-x-2 border-t-2 border-navy-300"
      />

      {/* Stacked timing bar + synced playhead */}
      <div className="relative mt-1" role="img" aria-label={barAria}>
        <div className="flex h-12 overflow-hidden rounded-lg sm:h-14">
          {segments.map((s) => (
            <div
              key={s.key}
              className={`flex flex-col items-center justify-center overflow-hidden border-r border-white/70 last:border-r-0 ${SEGMENT_META[s.kind].bar}`}
              style={{ width: `${(s.seconds / cycle) * 100}%` }}
            >
              <span className="text-[11px] font-bold leading-tight text-navy-950 sm:text-sm">
                {s.seconds}s
              </span>
              {s.kind === "green" && (
                <span className="hidden text-[10px] font-medium leading-tight text-navy-950/80 sm:block">
                  {t(SEGMENT_META.green.short)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Playhead — synced to the parent clock */}
        <div
          className="pointer-events-none absolute -bottom-1.5 -top-1.5"
          style={{ left: `${playheadPct}%` }}
        >
          <span className="block h-full w-0.5 -translate-x-1/2 rounded-full bg-navy-900 ring-1 ring-white" />
          <span className="absolute -top-1 left-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-navy-900 ring-1 ring-white" />
        </div>
      </div>

      {/* Phase brackets with Split % labels */}
      <div className="mt-1 flex">
        {phases.map((p) => {
          const duration = p.green + p.yellow + p.allRed;
          const pct = cycle > 0 ? (duration / cycle) * 100 : 0;
          return (
            <div key={p.id} className="px-0.5" style={{ width: `${pct}%` }}>
              <div
                aria-hidden="true"
                className="h-2 rounded-b-md border-x-2 border-b-2 border-navy-300"
              />
              <p className="mt-1.5 text-center text-[11px] font-medium leading-snug text-navy-700 sm:text-xs">
                {t(p.label)}
                <span className="mt-0.5 block font-mono tabular-nums text-navy-500">
                  {duration}s · Split {Math.round(pct)}%
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend: pairs each signal color with its concept name */}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {LEGEND_ORDER.map((kind) => (
          <li key={kind} className="flex items-center gap-2 text-xs text-navy-600">
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-sm ${SEGMENT_META[kind].bar}`}
            />
            {t(SEGMENT_META[kind].legend)}
          </li>
        ))}
      </ul>
    </div>
  );
}
