"use client";

/**
 * Live queue readout for the simulator: one row per approach (N, S, E, W)
 * with a small car icon per queued vehicle, the approach's current signal
 * state, and the exact queue count. Main-road (E–W) cars are navy, side-
 * road (N–S) cars are cyan — matching the road labels used everywhere on
 * the simulator page, and every color is paired with a text label.
 */

import { useLanguage } from "@/lib/i18n";
import type { ApproachId, Bi, LightColor } from "@/lib/types";

const MAX_ICONS = 12;

export interface QueueVisualizationProps {
  /** Queued cars per approach. */
  queues: Record<ApproachId, number>;
  /** Current signal color per approach. */
  signals: Record<ApproachId, LightColor>;
  className?: string;
}

interface RowMeta {
  id: ApproachId;
  compass: string;
  label: Bi;
  road: "main" | "side";
}

const ROWS: RowMeta[] = [
  {
    id: "east",
    compass: "E",
    label: { th: "จากทิศตะวันออก · ถนนหลัก", en: "From east · main road" },
    road: "main",
  },
  {
    id: "west",
    compass: "W",
    label: { th: "จากทิศตะวันตก · ถนนหลัก", en: "From west · main road" },
    road: "main",
  },
  {
    id: "north",
    compass: "N",
    label: { th: "จากทิศเหนือ · ถนนรอง", en: "From north · side road" },
    road: "side",
  },
  {
    id: "south",
    compass: "S",
    label: { th: "จากทิศใต้ · ถนนรอง", en: "From south · side road" },
    road: "side",
  },
];

/** Car body colors per road: main = navy, side = cyan. */
const CAR_FILL: Record<RowMeta["road"], string> = {
  main: "#24427a",
  side: "#0891b2",
};

const SIGNAL_META: Record<LightColor, { dot: string; label: Bi }> = {
  green: { dot: "bg-signal-green", label: { th: "เขียว", en: "Green" } },
  yellow: { dot: "bg-signal-yellow", label: { th: "เหลือง", en: "Yellow" } },
  red: { dot: "bg-signal-red", label: { th: "แดง", en: "Red" } },
};

/** Tiny top-view car icon (about one text-line tall). */
function CarIcon({ fill }: { fill: string }) {
  return (
    <svg
      width="22"
      height="13"
      viewBox="0 0 22 13"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="1" y="1.5" width="20" height="10" rx="4" fill={fill} />
      <rect x="5" y="3" width="3.5" height="7" rx="1.5" fill="white" opacity="0.55" />
      <rect x="13.5" y="3" width="3.5" height="7" rx="1.5" fill="white" opacity="0.55" />
    </svg>
  );
}

export function QueueVisualization({
  queues,
  signals,
  className = "",
}: QueueVisualizationProps) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-navy-900">
        {t({ th: "แถวรถสะสม (Queue) แต่ละทิศทาง", en: "Queued vehicles per approach" })}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {ROWS.map((row) => {
          const count = Math.max(0, Math.round(queues[row.id]));
          const shown = Math.min(count, MAX_ICONS);
          const overflow = count - shown;
          const signal = signals[row.id];
          const meta = SIGNAL_META[signal];
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-3 py-2"
              aria-label={t({
                th: `${t(row.label)}: รถรอ ${count} คัน สัญญาณไฟ${t(meta.label)}`,
                en: `${t(row.label)}: ${count} waiting, signal ${t(meta.label)}`,
              })}
            >
              {/* Approach label + signal state */}
              <div className="flex w-36 shrink-0 items-center gap-2 sm:w-44">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-xs font-bold text-navy-700"
                >
                  {row.compass}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-navy-700">
                    {t(row.label)}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-navy-500">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
                    />
                    {t(meta.label)}
                  </span>
                </span>
              </div>

              {/* Car icons */}
              <div
                aria-hidden="true"
                className="flex min-h-6 flex-1 flex-wrap items-center gap-1 overflow-hidden"
              >
                {Array.from({ length: shown }, (_, i) => (
                  <CarIcon key={i} fill={CAR_FILL[row.road]} />
                ))}
                {overflow > 0 && (
                  <span className="text-xs font-semibold text-navy-600">
                    +{overflow}
                  </span>
                )}
              </div>

              {/* Exact count */}
              <span className="w-14 shrink-0 text-right font-mono text-sm font-bold tabular-nums text-navy-900">
                {count}{" "}
                <span className="text-xs font-medium text-navy-500">
                  {t({ th: "คัน", en: "cars" })}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
