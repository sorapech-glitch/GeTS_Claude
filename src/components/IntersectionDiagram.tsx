"use client";

import type { ApproachId, ApproachState } from "@/lib/types";

/**
 * A 4-way intersection drawn as SVG, using left-hand traffic (as in
 * Thailand). Purely presentational: the parent supplies the signal color,
 * queue length, and detector state per approach and drives any animation
 * by updating props over time.
 *
 * Geometry (viewBox 440×440, center 220):
 * - Intersection box: x/y 164–276
 * - Each road has one approach lane and one exit lane (left-hand traffic),
 *   so e.g. vehicles arriving from the north queue in the eastern half of
 *   the vertical road.
 */

export interface IntersectionDiagramProps {
  north: ApproachState;
  south: ApproachState;
  east: ApproachState;
  west: ApproachState;
  /** Draw detector zones on the approach lanes. */
  showDetectors?: boolean;
  /** Accessible description of what the diagram currently shows. */
  title: string;
  className?: string;
}

const SIGNAL_FILL: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f5b301",
  red: "#ef4444",
};

const ROAD = { min: 164, max: 276, center: 220 };
const CAR = { len: 26, width: 18, gap: 11 };
const MAX_QUEUE = 8;
const CAR_COLORS = ["#cbd5e1", "#93c5fd", "#e2e8f0", "#a5b4fc", "#d1d5db"];

/** Per-approach geometry for queue cars, detector zones, and signal heads. */
function approachGeometry(id: ApproachId) {
  switch (id) {
    case "north": // arriving from top, heading south — eastern half
      return { laneCenter: 248, stop: ROAD.min, axis: "v" as const, dir: -1, head: { x: 288, y: 106 }, label: { x: 298, y: 96, text: "N" } };
    case "south": // arriving from bottom, heading north — western half
      return { laneCenter: 192, stop: ROAD.max, axis: "v" as const, dir: 1, head: { x: 132, y: 282 }, label: { x: 142, y: 348, text: "S" } };
    case "west": // arriving from left, heading east — northern half
      return { laneCenter: 192, stop: ROAD.min, axis: "h" as const, dir: -1, head: { x: 106, y: 132 }, label: { x: 96, y: 146, text: "W" } };
    case "east": // arriving from right, heading west — southern half
      return { laneCenter: 248, stop: ROAD.max, axis: "h" as const, dir: 1, head: { x: 314, y: 256 }, label: { x: 344, y: 252, text: "E" } };
  }
}

function QueueCars({ id, count }: { id: ApproachId; count: number }) {
  const geo = approachGeometry(id);
  const n = Math.max(0, Math.min(MAX_QUEUE, Math.round(count)));
  const cars = [];
  for (let i = 0; i < n; i++) {
    const front = geo.stop + geo.dir * (6 + i * (CAR.len + CAR.gap));
    const fill = CAR_COLORS[i % CAR_COLORS.length];
    if (geo.axis === "v") {
      const y = geo.dir === -1 ? front - CAR.len : front;
      cars.push(
        <g key={i} style={{ transition: "opacity 0.3s" }}>
          <rect x={geo.laneCenter - CAR.width / 2} y={y} width={CAR.width} height={CAR.len} rx={5} fill={fill} stroke="#475569" strokeWidth="1" />
          <rect x={geo.laneCenter - CAR.width / 2 + 3} y={y + 6} width={CAR.width - 6} height={5} rx={2} fill="#475569" opacity={0.5} />
          <rect x={geo.laneCenter - CAR.width / 2 + 3} y={y + CAR.len - 10} width={CAR.width - 6} height={5} rx={2} fill="#475569" opacity={0.5} />
        </g>
      );
    } else {
      const x = geo.dir === -1 ? front - CAR.len : front;
      cars.push(
        <g key={i} style={{ transition: "opacity 0.3s" }}>
          <rect x={x} y={geo.laneCenter - CAR.width / 2} width={CAR.len} height={CAR.width} rx={5} fill={fill} stroke="#475569" strokeWidth="1" />
          <rect x={x + 6} y={geo.laneCenter - CAR.width / 2 + 3} width={5} height={CAR.width - 6} rx={2} fill="#475569" opacity={0.5} />
          <rect x={x + CAR.len - 10} y={geo.laneCenter - CAR.width / 2 + 3} width={5} height={CAR.width - 6} rx={2} fill="#475569" opacity={0.5} />
        </g>
      );
    }
  }
  return <>{cars}</>;
}

function DetectorZone({ id, active }: { id: ApproachId; active: boolean }) {
  const geo = approachGeometry(id);
  const LEN = 62;
  const OFFSET = 4;
  const stroke = active ? "#22d3ee" : "#94a3b8";
  const fill = active ? "rgba(34,211,238,0.28)" : "rgba(148,163,184,0.12)";
  const common = {
    fill,
    stroke,
    strokeWidth: 2,
    strokeDasharray: "6 4",
    rx: 4,
    style: { transition: "fill 0.3s, stroke 0.3s" },
  };
  if (geo.axis === "v") {
    const y = geo.dir === -1 ? geo.stop - OFFSET - LEN : geo.stop + OFFSET;
    return <rect x={geo.laneCenter - 24} y={y} width={48} height={LEN} {...common} />;
  }
  const x = geo.dir === -1 ? geo.stop - OFFSET - LEN : geo.stop + OFFSET;
  return <rect x={x} y={geo.laneCenter - 24} width={LEN} height={48} {...common} />;
}

function SignalHead({ id, signal }: { id: ApproachId; signal: ApproachState["signal"] }) {
  const geo = approachGeometry(id);
  const { x, y } = geo.head;
  const lights: Array<{ color: "red" | "yellow" | "green"; cy: number }> = [
    { color: "red", cy: y + 10 },
    { color: "yellow", cy: y + 26 },
    { color: "green", cy: y + 42 },
  ];
  return (
    <g>
      <rect x={x} y={y} width={20} height={52} rx={6} fill="#0a1428" stroke="#24427a" strokeWidth="1.2" />
      {lights.map((l) => {
        const on = l.color === signal;
        return (
          <g key={l.color}>
            {on && <circle cx={x + 10} cy={l.cy} r={8.5} fill={SIGNAL_FILL[l.color]} opacity={0.35} />}
            <circle
              cx={x + 10}
              cy={l.cy}
              r={5.5}
              fill={on ? SIGNAL_FILL[l.color] : "#1b3157"}
              style={{ transition: "fill 0.3s" }}
            />
          </g>
        );
      })}
    </g>
  );
}

export function IntersectionDiagram({
  north,
  south,
  east,
  west,
  showDetectors = false,
  title,
  className = "",
}: IntersectionDiagramProps) {
  const approaches: Array<[ApproachId, ApproachState]> = [
    ["north", north],
    ["south", south],
    ["east", east],
    ["west", west],
  ];

  return (
    <svg
      viewBox="0 0 440 440"
      role="img"
      aria-label={title}
      className={`h-auto w-full max-w-md ${className}`}
    >
      <title>{title}</title>
      {/* Background */}
      <rect width="440" height="440" rx="20" fill="#f2f6fc" />

      {/* Roads */}
      <rect x={ROAD.min} y="0" width={ROAD.max - ROAD.min} height="440" fill="#334155" />
      <rect x="0" y={ROAD.min} width="440" height={ROAD.max - ROAD.min} fill="#334155" />
      <rect x={ROAD.min} y={ROAD.min} width={ROAD.max - ROAD.min} height={ROAD.max - ROAD.min} fill="#3d4c63" />

      {/* Center dividers (dashed, outside the intersection box) */}
      {[
        { x1: ROAD.center, y1: 0, x2: ROAD.center, y2: ROAD.min - 8 },
        { x1: ROAD.center, y1: ROAD.max + 8, x2: ROAD.center, y2: 440 },
        { x1: 0, y1: ROAD.center, x2: ROAD.min - 8, y2: ROAD.center },
        { x1: ROAD.max + 8, y1: ROAD.center, x2: 440, y2: ROAD.center },
      ].map((line, i) => (
        <line key={i} {...line} stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="14 12" opacity="0.75" />
      ))}

      {/* Stop lines (across the approach lane only) */}
      <line x1={ROAD.center + 2} y1={ROAD.min - 2} x2={ROAD.max - 2} y2={ROAD.min - 2} stroke="#f8fafc" strokeWidth="4" />
      <line x1={ROAD.min + 2} y1={ROAD.max + 2} x2={ROAD.center - 2} y2={ROAD.max + 2} stroke="#f8fafc" strokeWidth="4" />
      <line x1={ROAD.min - 2} y1={ROAD.min + 2} x2={ROAD.min - 2} y2={ROAD.center - 2} stroke="#f8fafc" strokeWidth="4" />
      <line x1={ROAD.max + 2} y1={ROAD.center + 2} x2={ROAD.max + 2} y2={ROAD.max - 2} stroke="#f8fafc" strokeWidth="4" />

      {/* Detector zones */}
      {showDetectors &&
        approaches.map(([id, state]) => (
          <DetectorZone key={id} id={id} active={Boolean(state.detectorActive)} />
        ))}

      {/* Queued cars */}
      {approaches.map(([id, state]) => (
        <QueueCars key={id} id={id} count={state.queue ?? 0} />
      ))}

      {/* Signal heads + compass labels */}
      {approaches.map(([id, state]) => {
        const geo = approachGeometry(id);
        return (
          <g key={id}>
            <SignalHead id={id} signal={state.signal} />
            <text
              x={geo.label.x}
              y={geo.label.y}
              fontSize="15"
              fontWeight="700"
              fill="#24427a"
              textAnchor="middle"
            >
              {geo.label.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
