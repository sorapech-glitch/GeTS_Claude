"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { Bi, LightColor } from "@/lib/types";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { Button } from "@/components/ui";

/**
 * CorridorCoordination — an animated "green wave" (Green Wave) along a
 * corridor of three coordinated junctions.
 *
 * All three junctions share the same cycle, but each one's green starts
 * OFFSET seconds after the previous junction. A platoon of cars released
 * from junction 1 travels at exactly the speed the offset was tuned for,
 * so it meets green after green without stopping.
 *
 * Self-contained: owns its clock, play/pause control, and respects
 * prefers-reduced-motion (starts paused with a static mid-wave frame).
 */

/* ------------------------------------------------------------------ */
/* Timing model (simulated seconds)                                    */
/* ------------------------------------------------------------------ */

const CYCLE = 26;
/** Offset between the green starts of successive junctions. */
const OFFSET = 4;
/** Second at which junction 1 turns green (platoon release time). */
const FIRST_GREEN = 6;
const GREEN_LEN = 10;
const YELLOW_LEN = 2;
/** 1 simulated second plays in ~150 ms of real time (~6.7× faster). */
const MS_PER_SIM_SECOND = 150;
const TICK_MS = 50;
/** Static frame shown before first play: mid-wave, platoon between J2 and J3. */
const INITIAL_T = 12;

/* ------------------------------------------------------------------ */
/* Geometry (SVG viewBox 760 × 260)                                    */
/* ------------------------------------------------------------------ */

/** Junction spacing is 230 px; SPEED × OFFSET = 230 so the wave matches. */
const JUNCTIONS = [140, 370, 600].map((x, i) => ({
  x,
  greenStart: FIRST_GREEN + OFFSET * i,
}));

const ROAD_TOP = 150;
const ROAD_H = 56;
const CAR_W = 26;
const CAR_H = 16;
const CAR_Y = ROAD_TOP + (ROAD_H - CAR_H) / 2;
/** Left edge of the lead queued car (front bumper just before J1 stop line). */
const QUEUE_HEAD_X = 84;
const CAR_SPACING = 28;
const CAR_COLORS = ["#e2e8f0", "#93c5fd", "#a5b4fc", "#cbd5e1"];
/** px per simulated second — tuned so the platoon rides the wave. */
const SPEED = 230 / OFFSET;

const SIGNAL_FILL: Record<LightColor, string> = {
  green: "#22c55e",
  yellow: "#f5b301",
  red: "#ef4444",
};

const SIGNAL_NAME: Record<LightColor, Bi> = {
  green: { th: "ไฟเขียว", en: "green" },
  yellow: { th: "ไฟเหลือง", en: "yellow" },
  red: { th: "ไฟแดง", en: "red" },
};

function junctionSignal(greenStart: number, t: number): LightColor {
  if (t >= greenStart && t < greenStart + GREEN_LEN) return "green";
  if (t >= greenStart + GREEN_LEN && t < greenStart + GREEN_LEN + YELLOW_LEN) {
    return "yellow";
  }
  return "red";
}

/** Left edge of car `index` (0 = platoon leader) at simulated time `t`. */
function carX(index: number, t: number): number {
  const queueX = QUEUE_HEAD_X - index * CAR_SPACING;
  if (t <= FIRST_GREEN) return queueX;
  return queueX + SPEED * (t - FIRST_GREEN);
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CorridorCoordination({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  const [running, setRunning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [simT, setSimT] = useState(INITIAL_T);
  const simTRef = useRef(INITIAL_T);

  // Respect prefers-reduced-motion: start paused (static frame) and only
  // animate when the user explicitly presses play.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches: boolean) => {
      setReducedMotion(matches);
      setRunning(!matches);
    };
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const next = (simTRef.current + TICK_MS / MS_PER_SIM_SECOND) % CYCLE;
      simTRef.current = next;
      setSimT(next);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const signals = JUNCTIONS.map((j) => junctionSignal(j.greenStart, simT));

  const svgLabel = t({
    th:
      `ถนนสายหลักที่มี 3 แยกประสานสัญญาณกันเป็น Green Wave ขณะนี้วินาทีที่ ${Math.floor(simT)} จาก ${CYCLE}: ` +
      JUNCTIONS.map((j, i) => `แยกที่ ${i + 1} ${SIGNAL_NAME[junctionSignal(j.greenStart, simT)].th}`).join(" · ") +
      ` ไฟเขียวแต่ละแยกเริ่มห่างกัน ${OFFSET} วินาที (Offset) ทำให้กลุ่มรถวิ่งผ่านได้ต่อเนื่อง`,
    en:
      `A corridor of 3 coordinated junctions forming a green wave, second ${Math.floor(simT)} of ${CYCLE}: ` +
      JUNCTIONS.map((j, i) => `junction ${i + 1} is ${SIGNAL_NAME[junctionSignal(j.greenStart, simT)].en}`).join(", ") +
      `. Each junction's green starts ${OFFSET} seconds after the previous one (the offset), letting the platoon flow through.`,
  });

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <svg viewBox="0 0 760 260" role="img" aria-label={svgLabel} className="h-auto w-full">
          <title>{svgLabel}</title>
          <rect width="760" height="260" fill="#f2f6fc" />

          {/* Junction labels + green-start times */}
          {JUNCTIONS.map((j, i) => (
            <g key={`label-${j.x}`}>
              <text x={j.x} y="20" fontSize="14" fontWeight="700" fill="#24427a" textAnchor="middle">
                {t({ th: `แยกที่ ${i + 1}`, en: `Junction ${i + 1}` })}
              </text>
              <text x={j.x} y="37" fontSize="11.5" fill="#2e56a3" textAnchor="middle">
                {t({
                  th: `เขียวเริ่มวินาทีที่ ${j.greenStart}`,
                  en: `Green at t = ${j.greenStart}s`,
                })}
              </text>
            </g>
          ))}

          {/* Offset arrows between junction columns */}
          {JUNCTIONS.slice(0, -1).map((j, i) => {
            const next = JUNCTIONS[i + 1];
            const midX = (j.x + next.x) / 2;
            return (
              <g key={`offset-${j.x}`}>
                <line
                  x1={j.x + 44}
                  y1="47"
                  x2={next.x - 50}
                  y2="47"
                  stroke="#0891b2"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <path d={`M ${next.x - 50} 47 l -9 -5 v 10 Z`} fill="#0891b2" />
                <text x={midX} y="40" fontSize="12" fontWeight="600" fill="#0e7490" textAnchor="middle">
                  Offset +{OFFSET}s
                </text>
              </g>
            );
          })}

          {/* Cross streets */}
          {JUNCTIONS.map((j) => (
            <rect key={`cross-${j.x}`} x={j.x - 20} y="112" width="40" height="148" fill="#334155" />
          ))}

          {/* Main corridor */}
          <rect x="0" y={ROAD_TOP} width="760" height={ROAD_H} fill="#334155" />
          {JUNCTIONS.map((j) => (
            <rect key={`box-${j.x}`} x={j.x - 20} y={ROAD_TOP} width="40" height={ROAD_H} fill="#3d4c63" />
          ))}

          {/* Green glow over a junction while its signal is green */}
          {JUNCTIONS.map((j, i) =>
            signals[i] === "green" ? (
              <rect
                key={`glow-${j.x}`}
                x={j.x - 20}
                y={ROAD_TOP}
                width="40"
                height={ROAD_H}
                fill="rgba(34,197,94,0.35)"
              />
            ) : null
          )}

          {/* Edge lines + one-way direction chevrons */}
          <line x1="0" y1={ROAD_TOP + 3} x2="760" y2={ROAD_TOP + 3} stroke="#f8fafc" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1={ROAD_TOP + ROAD_H - 3} x2="760" y2={ROAD_TOP + ROAD_H - 3} stroke="#f8fafc" strokeWidth="2" opacity="0.5" />
          {[690, 712].map((x) => (
            <path
              key={`chevron-${x}`}
              d={`M ${x} ${ROAD_TOP + ROAD_H / 2 - 8} l 10 8 l -10 8`}
              fill="none"
              stroke="#f8fafc"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          ))}

          {/* Stop lines before each junction */}
          {JUNCTIONS.map((j) => (
            <line
              key={`stop-${j.x}`}
              x1={j.x - 26}
              y1={ROAD_TOP + 2}
              x2={j.x - 26}
              y2={ROAD_TOP + ROAD_H - 2}
              stroke="#f8fafc"
              strokeWidth="4"
            />
          ))}

          {/* Signal heads (for the corridor direction) + poles */}
          {JUNCTIONS.map((j, i) => {
            const sig = signals[i];
            const headX = j.x - 46;
            const cx = j.x - 37;
            const lights: Array<{ color: LightColor; cy: number }> = [
              { color: "red", cy: 76 },
              { color: "yellow", cy: 90 },
              { color: "green", cy: 104 },
            ];
            return (
              <g key={`head-${j.x}`}>
                <line x1={cx} y1="112" x2={cx} y2={ROAD_TOP} stroke="#475569" strokeWidth="3" />
                <rect x={headX} y="66" width="18" height="46" rx="6" fill="#0a1428" stroke="#24427a" strokeWidth="1.2" />
                {lights.map((l) => {
                  const on = l.color === sig;
                  return (
                    <g key={l.color}>
                      {on && <circle cx={cx} cy={l.cy} r="8" fill={SIGNAL_FILL[l.color]} opacity="0.35" />}
                      <circle
                        cx={cx}
                        cy={l.cy}
                        r="5"
                        fill={on ? SIGNAL_FILL[l.color] : "#1b3157"}
                        style={{ transition: "fill 0.3s" }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Platoon of cars riding the green wave */}
          {CAR_COLORS.map((fill, i) => {
            const x = carX(i, simT);
            if (x > 770 || x < -CAR_W) return null;
            return (
              <g key={`car-${i}`}>
                <rect x={x} y={CAR_Y} width={CAR_W} height={CAR_H} rx="5" fill={fill} stroke="#475569" strokeWidth="1" />
                <rect x={x + 4} y={CAR_Y + 3} width="5" height={CAR_H - 6} rx="2" fill="#475569" opacity="0.5" />
                <rect x={x + CAR_W - 9} y={CAR_Y + 3} width="5" height={CAR_H - 6} rx="2" fill="#475569" opacity="0.5" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls + live status (text labels, not color alone) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <Button variant="primary" size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? <PauseIcon /> : <PlayIcon />}
          {running
            ? t({ th: "หยุดชั่วคราว (Pause)", en: "Pause" })
            : t({ th: "เล่น Green Wave (Play)", en: "Play the green wave" })}
        </Button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {JUNCTIONS.map((j, i) => {
            const sig = signals[i];
            return (
              <span key={`status-${j.x}`} className="flex items-center gap-1.5 text-sm text-navy-700">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: SIGNAL_FILL[sig], transition: "background-color 0.3s" }}
                />
                {t({
                  th: `แยก ${i + 1}: ${SIGNAL_NAME[sig].th}`,
                  en: `J${i + 1}: ${SIGNAL_NAME[sig].en}`,
                })}
              </span>
            );
          })}
          <span className="font-mono text-sm tabular-nums text-navy-600">
            t = {Math.floor(simT)}s / {CYCLE}s
          </span>
        </div>
      </div>

      {reducedMotion && (
        <p className="mt-3 text-sm text-navy-500">
          {t({
            th: "ระบบพบว่าคุณตั้งค่าลดการเคลื่อนไหว (Reduced Motion) ภาพเคลื่อนไหวจึงหยุดไว้ก่อน กดเล่นเมื่อพร้อม",
            en: "Your device prefers reduced motion, so the animation starts paused. Press play when ready.",
          })}
        </p>
      )}

      <figcaption className="mt-4 rounded-2xl border border-navy-100 bg-navy-50 p-5 text-navy-700">
        <p>
          {t({
            th: `ทั้ง 3 แยกใช้รอบสัญญาณ (Cycle) ยาวเท่ากันคือ ${CYCLE} วินาที แต่ไฟเขียวของแยกถัดไปเริ่มช้ากว่าแยกก่อนหน้าแยกละ ${OFFSET} วินาที — ค่าเหลื่อมเวลานี้คือ Offset เมื่อตั้ง Offset ให้พอดีกับเวลาที่กลุ่มรถ (Platoon) วิ่งไปถึง รถจะเจอไฟเขียวต่อเนื่องทุกแยกแทบไม่ต้องหยุด เรียกว่า Green Wave`,
            en: `All three junctions share the same ${CYCLE}-second cycle, but each junction's green starts ${OFFSET} seconds later than the previous one — that time shift is the Offset. When the offset matches the platoon's travel time, vehicles meet green after green with hardly a stop: a Green Wave.`,
          })}
        </p>
        <p className="mt-2">
          {t({
            th: "การทำให้หลายแยกทำงานสอดคล้องกันแบบนี้คือการประสานสัญญาณ (Coordination) ระบบ Adaptive จะวัดความเร็วและปริมาณรถจริง แล้วปรับค่า Offset ให้เองอย่างต่อเนื่อง",
            en: "Keeping junctions in step like this is Coordination. An Adaptive system measures real speeds and volumes, then keeps re-tuning the offsets automatically.",
          })}
        </p>
      </figcaption>
    </figure>
  );
}
