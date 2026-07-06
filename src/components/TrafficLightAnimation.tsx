"use client";

import type { LightColor } from "@/lib/types";

const SIZES = {
  sm: { light: 16, pad: 6, gap: 6 },
  md: { light: 26, pad: 9, gap: 9 },
  lg: { light: 38, pad: 12, gap: 12 },
} as const;

const LIGHT_META: Record<
  LightColor,
  { on: string; glow: string; labelTh: string; labelEn: string }
> = {
  red: { on: "#ef4444", glow: "rgba(239,68,68,0.55)", labelTh: "ไฟแดง", labelEn: "Red" },
  yellow: { on: "#f5b301", glow: "rgba(245,179,1,0.55)", labelTh: "ไฟเหลือง", labelEn: "Yellow" },
  green: { on: "#22c55e", glow: "rgba(34,197,94,0.55)", labelTh: "ไฟเขียว", labelEn: "Green" },
};

const ORDER: LightColor[] = ["red", "yellow", "green"];

export interface TrafficLightAnimationProps {
  /** Which light is currently on. */
  active: LightColor;
  size?: keyof typeof SIZES;
  /** Optional remaining-seconds readout under the housing. */
  countdown?: number;
  /** Optional label under the light (e.g., approach name). */
  label?: string;
  /** Accessible description; defaults to the active light. */
  ariaLabel?: string;
  className?: string;
}

/**
 * A signal head with three lights. Purely presentational — the parent
 * drives `active` (and optionally `countdown`) from its own timing logic,
 * so the same component works for Fixed Time, VA, and Adaptive demos.
 */
export function TrafficLightAnimation({
  active,
  size = "md",
  countdown,
  label,
  ariaLabel,
  className = "",
}: TrafficLightAnimationProps) {
  const s = SIZES[size];
  const width = s.light + s.pad * 2;
  const height = s.light * 3 + s.gap * 2 + s.pad * 2;

  return (
    <figure
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="img"
      aria-label={
        ariaLabel ??
        `${label ? `${label}: ` : ""}${LIGHT_META[active].labelTh} (${LIGHT_META[active].labelEn})`
      }
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <rect
          x="0.75"
          y="0.75"
          width={width - 1.5}
          height={height - 1.5}
          rx={s.pad + 2}
          fill="#0a1428"
          stroke="#24427a"
          strokeWidth="1.5"
        />
        {ORDER.map((color, i) => {
          const cy = s.pad + s.light / 2 + i * (s.light + s.gap);
          const isOn = color === active;
          return (
            <g key={color}>
              {isOn && (
                <circle
                  cx={width / 2}
                  cy={cy}
                  r={s.light / 2 + 3}
                  fill={LIGHT_META[color].glow}
                  className="animate-signal-pulse"
                />
              )}
              <circle
                cx={width / 2}
                cy={cy}
                r={s.light / 2}
                fill={isOn ? LIGHT_META[color].on : "#1b3157"}
                stroke={isOn ? "none" : "#12203d"}
                strokeWidth="1"
                style={{ transition: "fill 0.3s ease" }}
              />
            </g>
          );
        })}
      </svg>
      {(countdown !== undefined || label) && (
        <figcaption className="text-center">
          {countdown !== undefined && (
            <span
              className="block font-mono text-lg font-bold tabular-nums text-navy-900"
              aria-hidden="true"
            >
              {Math.max(0, Math.ceil(countdown))}
            </span>
          )}
          {label && (
            <span className="block text-xs font-medium text-navy-600">{label}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
