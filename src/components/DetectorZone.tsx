"use client";

/**
 * DetectorZone — a reusable top-down visual of a single road lane with a
 * detector zone just before the stop line, wired to a small controller
 * pill ("CALL" indicator).
 *
 * Purely presentational: the parent drives `active`. When `active` is
 * true, a car sits on the zone, the zone glows cyan, detection waves
 * pulse, and the CALL indicator lights up — visualizing
 * "รถแตะโซนตรวจจับ → ระบบบันทึกการเรียก (Vehicle Call)".
 *
 * Motion is CSS-only (transform transition + opacity pulse), so the
 * global `prefers-reduced-motion` rule in globals.css disables it
 * automatically.
 */

export interface DetectorZoneProps {
  /** A vehicle is on the zone and a vehicle call is registered. */
  active: boolean;
  /** Optional caption rendered under the visual. */
  label?: string;
  /** Override the default accessible description. */
  ariaLabel?: string;
  className?: string;
}

export function DetectorZone({
  active,
  label,
  ariaLabel,
  className = "",
}: DetectorZoneProps) {
  const zoneStroke = active ? "#22d3ee" : "#94a3b8";
  const zoneFill = active ? "rgba(34,211,238,0.28)" : "rgba(148,163,184,0.12)";
  const defaultAria = active
    ? "มีรถอยู่บนโซนตรวจจับหน้าเส้นหยุด ระบบบันทึกการเรียกแล้ว (A vehicle is on the detector zone before the stop line — a vehicle call is registered)"
    : "โซนตรวจจับหน้าเส้นหยุดยังว่าง ไม่มีการเรียก (The detector zone before the stop line is empty — no vehicle call)";

  return (
    <figure className={`inline-flex w-full flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 390 170"
        role="img"
        aria-label={ariaLabel ?? defaultAria}
        className="h-auto w-full max-w-md"
      >
        {/* Controller pill with CALL indicator */}
        <rect x="286" y="8" width="86" height="30" rx="9" fill="#0a1428" stroke="#24427a" strokeWidth="1.5" />
        {active && (
          <circle cx="303" cy="23" r="8" fill="rgba(34,211,238,0.4)" className="animate-signal-pulse" />
        )}
        <circle
          cx="303"
          cy="23"
          r="5"
          fill={active ? "#22d3ee" : "#1b3157"}
          stroke="#24427a"
          strokeWidth="1"
          style={{ transition: "fill 0.3s" }}
        />
        <text
          x="314"
          y="27"
          fontSize="11.5"
          fontWeight="700"
          fill={active ? "#a5f3fc" : "#8fa9db"}
          style={{ transition: "fill 0.3s" }}
        >
          CALL
        </text>

        {/* Wire from the detector zone up to the controller */}
        <path
          d="M248 66 V23 H284"
          fill="none"
          stroke={active ? "#22d3ee" : "#94a3b8"}
          strokeWidth="2"
          strokeDasharray="6 5"
          opacity={active ? 1 : 0.5}
          className={active ? "animate-dash-flow" : undefined}
          style={{ transition: "stroke 0.3s, opacity 0.3s" }}
        />

        {/* Road */}
        <rect x="0" y="60" width="390" height="70" fill="#334155" />
        <rect x="0" y="60" width="390" height="3" fill="#f8fafc" opacity="0.55" />
        <rect x="0" y="127" width="390" height="3" fill="#f8fafc" opacity="0.55" />

        {/* Travel-direction arrow */}
        <line x1="104" y1="95" x2="136" y2="95" stroke="#f8fafc" strokeWidth="2.5" opacity="0.5" />
        <path d="M132 88 148 95 132 102 Z" fill="#f8fafc" opacity="0.5" />

        {/* Detector zone (before the stop line) */}
        <rect
          x="240"
          y="66"
          width="80"
          height="58"
          rx="6"
          fill={zoneFill}
          stroke={zoneStroke}
          strokeWidth="2.5"
          strokeDasharray="6 4"
          style={{ transition: "fill 0.3s, stroke 0.3s" }}
        />

        {/* Detection waves above the zone (only while active) */}
        {active && (
          <g
            className="animate-signal-pulse"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M266 60a14 14 0 0 1 28 0" />
            <path d="M258 52a22 22 0 0 1 44 0" />
          </g>
        )}

        {/* Stop line */}
        <rect x="328" y="64" width="6" height="62" fill="#f8fafc" />

        {/* Small red signal beyond the stop line (the car is waiting) */}
        <rect x="352" y="86" width="3.5" height="40" fill="#64748b" />
        <circle cx="354" cy="76" r="8" fill="#0a1428" stroke="#24427a" strokeWidth="1.2" />
        <circle cx="354" cy="76" r="5" fill="#ef4444" />

        {/* Car — slides onto the zone when active */}
        <g
          style={{
            transform: `translateX(${active ? 258 : 40}px)`,
            transition: "transform 0.7s ease",
          }}
        >
          <rect x="0" y="80" width="46" height="30" rx="7" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
          <rect x="10" y="84" width="7" height="22" rx="2" fill="#475569" opacity="0.55" />
          <rect x="28" y="84" width="7" height="22" rx="2" fill="#475569" opacity="0.55" />
        </g>

        {/* Micro labels (bilingual technical terms kept visible) */}
        <text x="240" y="150" textAnchor="middle" fontSize="12" fontWeight="600" fill="#24427a">
          โซนตรวจจับ (Detector Zone)
        </text>
        <text x="348" y="150" textAnchor="middle" fontSize="12" fontWeight="600" fill="#64748b">
          เส้นหยุด (Stop)
        </text>
      </svg>
      {label && (
        <figcaption className="text-center text-sm font-medium text-navy-600">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
