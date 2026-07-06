"use client";

/**
 * Vehicle Actuated (VA) learning module.
 *
 * Composition (per design guide §6):
 * hero → what is VA → detector technologies → vehicle-call demo →
 * how it works → interactive intersection demo → VA green timeline →
 * key terms → advantages/limitations → best use cases → next-module band.
 *
 * The centerpiece demo drives IntersectionDiagram from a precomputed,
 * deterministic per-second timeline (two rounds: a gap-out round and a
 * max-out round) so every teaching moment is guaranteed to appear.
 */

import { useEffect, useState, type ReactNode } from "react";
import { DetectorZone } from "@/components/DetectorZone";
import { IntersectionDiagram } from "@/components/IntersectionDiagram";
import {
  Badge,
  ButtonLink,
  Callout,
  Card,
  PageHero,
  ProsConsGrid,
  Section,
  SectionHeading,
  type BadgeTone,
} from "@/components/ui";
import { systemsById } from "@/data/systems";
import { useLanguage } from "@/lib/i18n";
import type { Bi, LightColor } from "@/lib/types";

const system = systemsById["vehicle-actuated"];

/* ------------------------------------------------------------------ */
/* Detector technologies                                                */
/* ------------------------------------------------------------------ */

interface DetectorDevice {
  id: string;
  name: Bi;
  how: Bi;
  strength: Bi;
  icon: ReactNode;
}

const DETECTOR_DEVICES: DetectorDevice[] = [
  {
    id: "camera",
    name: {
      th: "กล้องตรวจจับ (Video Detection Camera)",
      en: "Video Detection Camera",
    },
    how: {
      th: "ติดตั้งบนเสาสูงมองลงมายังแยก ใช้การวิเคราะห์ภาพ (Video Analytics) ตรวจว่ามีรถอยู่ในโซนที่กำหนดหรือไม่ กล้องหนึ่งตัวมองเห็นได้หลายเลนพร้อมกัน",
      en: "Mounted high on a pole looking down at the junction, it uses video analytics to check whether vehicles are inside defined zones. One camera can watch several lanes at once.",
    },
    strength: {
      th: "เห็นหลายเลนและปรับโซนตรวจจับได้ง่ายโดยไม่ต้องแตะผิวถนน แต่ความแม่นยำขึ้นกับสภาพแสง ฝน หมอก และความสะอาดของเลนส์",
      en: "Covers many lanes and zones are easy to reconfigure without touching the road — but accuracy depends on lighting, rain, fog, and lens cleanliness.",
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 10.5 21 7v8l-6-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="9" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "loop",
    name: {
      th: "ขดลวดใต้ผิวถนน (Inductive Loop)",
      en: "Inductive Loop",
    },
    how: {
      th: "ขดลวดฝังใต้ผิวถนนสร้างสนามแม่เหล็กไฟฟ้าอ่อน ๆ เมื่อโครงโลหะของรถอยู่เหนือขดลวด ค่าความเหนี่ยวนำ (Inductance) จะเปลี่ยน ระบบจึงรู้ทันทีว่ามีรถอยู่",
      en: "A wire coil cut into the pavement generates a weak electromagnetic field. When a vehicle's metal body sits above the coil, the inductance changes and the system knows a vehicle is present.",
    },
    strength: {
      th: "แม่นยำสูงและไม่ถูกรบกวนจากแสงหรือฝน แต่ต้องตัดผิวถนนเพื่อติดตั้ง และชำรุดได้เมื่อถนนถูกขุดซ่อมหรือผิวทางทรุดตัว",
      en: "Very accurate and unaffected by light or rain — but installation requires cutting the pavement, and loops break when the road is dug up or deforms.",
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 4.5h18" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" />
        <rect x="5" y="9" width="14" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="8.5" y="12" width="7" height="3" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 13.5h2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "radar",
    name: {
      th: "เรดาร์ (Radar)",
      en: "Radar",
    },
    how: {
      th: "ส่งคลื่นไมโครเวฟ (Microwave) ออกไปยังช่องจราจร แล้ววัดคลื่นที่สะท้อนกลับจากตัวรถ บอกได้ทั้งการมีอยู่ ความเร็ว และทิศทางของรถ",
      en: "Transmits microwave signals toward the traffic lanes and measures the reflection from vehicle bodies — detecting presence, speed, and direction.",
    },
    strength: {
      th: "ทำงานได้ดีทั้งกลางคืน ฝนตก และหมอกลง ติดตั้งข้างทางโดยไม่ตัดผิวถนน แต่ต้องเล็งมุมติดตั้งให้ถูกต้อง และวัตถุโลหะรอบแยกอาจรบกวนสัญญาณ",
      en: "Works well at night, in rain, and in fog, and installs roadside without cutting the pavement — but aiming must be precise, and nearby metal objects can interfere.",
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="9" width="8" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M13.5 10.5a4 4 0 0 1 0 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 8.5a7 7 0 0 1 0 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18.5 6.5a10.5 10.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "tof",
    name: {
      th: "เซนเซอร์ TOF (Time-of-Flight)",
      en: "TOF Sensor (Time-of-Flight)",
    },
    how: {
      th: "ยิงพัลส์แสงอินฟราเรดหรือเลเซอร์ลงไปยังช่องจราจร แล้ววัดเวลาที่แสงสะท้อนกลับ (Time of Flight) เพื่อคำนวณระยะ จึงรู้ว่ามีรถอยู่ในโซนหรือไม่ และประเมินขนาดรถได้",
      en: "Fires infrared or laser light pulses at the lane and measures how long the reflection takes to return (time of flight) to compute distance — detecting vehicles in the zone and estimating their size.",
    },
    strength: {
      th: "วัดระยะแม่นยำและแยกขนาดรถได้ ติดตั้งโดยไม่ตัดผิวถนน แต่ระยะครอบคลุมแคบกว่ากล้อง และฝุ่นหรือฝนหนักลดประสิทธิภาพ",
      en: "Precise ranging that can distinguish vehicle sizes, installed without cutting the road — but coverage is narrower than a camera, and heavy dust or rain reduces performance.",
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="8" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.5 8v9m0 0-2-2.2m2 2.2 2-2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 17V8m0 0-2 2.2m2-2.2 2 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Deterministic demo timeline                                          */
/* ------------------------------------------------------------------ */

const MIN_GREEN = 6;
const MAX_GREEN = 16;
const GAP_TIME = 3;

type SimPhase =
  | "main-green"
  | "main-quiet"
  | "vehicle-call"
  | "main-yellow"
  | "min-green"
  | "extension"
  | "gap-out"
  | "max-out"
  | "side-yellow";

interface SimFrame {
  ew: LightColor;
  ns: LightColor;
  northQueue: number;
  ewQueue: number;
  detector: boolean;
  phase: SimPhase;
  /** Seconds since the side-road green started (0 when not side green). */
  sideElapsed: number;
  /** Remaining gap seconds during extension (null when not counting). */
  gapRemain: number | null;
  /** Extensions granted so far in the current side green. */
  extensions: number;
}

function buildTimeline(): SimFrame[] {
  const frames: SimFrame[] = [];
  const push = (f: Partial<SimFrame>) => {
    frames.push({
      ew: "green",
      ns: "red",
      northQueue: 0,
      ewQueue: 0,
      detector: false,
      phase: "main-green",
      sideElapsed: 0,
      gapRemain: null,
      extensions: 0,
      ...f,
    });
  };
  const mainGreen = (phase: SimPhase, seconds: number, ewQueueStart = 0) => {
    for (let i = 0; i < seconds; i++) {
      push({ phase, ewQueue: Math.max(0, ewQueueStart - i * 2) });
    }
  };
  const side = (
    phase: SimPhase,
    elapsed: number,
    northQueue: number,
    detector: boolean,
    gapRemain: number | null,
    extensions: number,
    ewQueue: number,
  ) => {
    push({ ew: "red", ns: "green", phase, sideElapsed: elapsed, northQueue, detector, gapRemain, extensions, ewQueue });
  };
  const sideYellow = (northQueues: number[], ewQueue: number) => {
    for (const q of northQueues) {
      push({ ew: "red", ns: "yellow", phase: "side-yellow", northQueue: q, ewQueue });
    }
  };

  /* ---- Round 1: quiet main road → one call → served green → gap-out ---- */
  mainGreen("main-green", 4, 6); // leftover main-road queue clears
  mainGreen("main-quiet", 6); // no side-road demand: "no car = no switch"
  push({ phase: "vehicle-call", detector: true, northQueue: 1 });
  push({ phase: "vehicle-call", northQueue: 1 });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 1 });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 2, detector: true, ewQueue: 1 });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 2, ewQueue: 1 });
  // Side green: minimum green first…
  side("min-green", 1, 2, true, null, 0, 2);
  side("min-green", 2, 1, true, null, 0, 2);
  side("min-green", 3, 1, true, null, 0, 3);
  side("min-green", 4, 0, false, null, 0, 3);
  side("min-green", 5, 1, true, null, 0, 3); // a late car keeps demand alive
  side("min-green", 6, 0, false, null, 0, 4);
  // …then extensions while cars keep crossing, gap-out when they stop.
  side("extension", 7, 1, true, GAP_TIME, 1, 4);
  side("extension", 8, 0, false, 2, 1, 4);
  side("extension", 9, 1, true, GAP_TIME, 2, 4);
  side("extension", 10, 0, false, 2, 2, 5);
  side("extension", 11, 0, false, 1, 2, 5);
  side("gap-out", 12, 0, false, 0, 2, 5);
  sideYellow([0, 0, 0], 5);

  /* ---- Round 2: heavy side-road arrivals → green rides to max-out ---- */
  mainGreen("main-green", 4, 5);
  mainGreen("main-quiet", 5);
  push({ phase: "vehicle-call", detector: true, northQueue: 1 });
  push({ phase: "vehicle-call", northQueue: 2, detector: true });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 2 });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 3, detector: true, ewQueue: 1 });
  push({ ew: "yellow", phase: "main-yellow", northQueue: 3, ewQueue: 1 });
  side("min-green", 1, 3, true, null, 0, 2);
  side("min-green", 2, 3, true, null, 0, 2);
  side("min-green", 3, 2, true, null, 0, 3);
  side("min-green", 4, 3, true, null, 0, 3);
  side("min-green", 5, 2, true, null, 0, 3);
  side("min-green", 6, 2, true, null, 0, 4);
  side("extension", 7, 2, true, GAP_TIME, 1, 4);
  side("extension", 8, 1, true, 2, 1, 4);
  side("extension", 9, 2, true, GAP_TIME, 2, 5);
  side("extension", 10, 1, true, 2, 2, 5);
  side("extension", 11, 2, true, GAP_TIME, 3, 5);
  side("extension", 12, 1, true, 2, 3, 6);
  side("extension", 13, 2, true, GAP_TIME, 4, 6);
  side("extension", 14, 1, true, 2, 4, 6);
  side("extension", 15, 2, true, GAP_TIME, 5, 6);
  side("max-out", 16, 2, true, 2, 5, 6);
  sideYellow([1, 0, 0], 6);

  return frames;
}

const TIMELINE: SimFrame[] = buildTimeline();

const PHASE_CAPTIONS: Record<SimPhase, Bi> = {
  "main-green": {
    th: "ถนนหลัก (E–W) ได้ไฟเขียวค้างไว้ ระหว่างรอการเรียกจากถนนรอง",
    en: "The main road (E–W) holds green while waiting for a side-road call.",
  },
  "main-quiet": {
    th: "ไม่มีรถ = ไม่ต้องสลับไฟ — ถนนรอง (N–S) ไม่มีการเรียก ไฟเขียวถนนหลักจึงค้างต่อไป",
    en: "No car = no need to switch — with no side-road (N–S) call, the main road keeps its green.",
  },
  "vehicle-call": {
    th: "รถแตะโซนตรวจจับบนถนนรอง (N) → ระบบบันทึกการเรียก (Vehicle Call)",
    en: "A vehicle touches the detector zone on the side road (N) → the controller registers a vehicle call.",
  },
  "main-yellow": {
    th: "ตู้ควบคุมตอบสนองการเรียก: ปิดไฟเขียวถนนหลักอย่างปลอดภัยด้วยไฟเหลือง",
    en: "The controller answers the call: the main-road green ends safely through yellow.",
  },
  "min-green": {
    th: "ถนนรองได้ไฟเขียวอย่างน้อยเท่าเวลาเขียวขั้นต่ำ (Minimum Green) เพื่อให้รถออกตัวได้ปลอดภัย",
    en: "The side road gets green for at least the minimum green, so vehicles can start off safely.",
  },
  extension: {
    th: "มีรถผ่าน Detector ต่อเนื่อง → ต่อขยายไฟเขียว (Extension) และเริ่มนับ Gap Time ใหม่ทุกคัน",
    en: "Vehicles keep crossing the detector → the green extends and the gap timer resets with every car.",
  },
  "gap-out": {
    th: "ช่องว่างระหว่างรถเกิน Gap Time = รถหมดแล้ว → ตัดจบไฟเขียว (Gap-out)",
    en: "The gap between vehicles exceeded the gap time — demand has ended, so the green terminates (gap-out).",
  },
  "max-out": {
    th: "รถยังมาต่อเนื่อง แต่ไฟเขียวชนเพดาน Maximum Green → ตัดจบเพื่อไม่ให้ทิศทางอื่นรอนานเกินไป (Max-out)",
    en: "Vehicles keep arriving, but the green hit the maximum green cap — it ends so other directions don't wait too long (max-out).",
  },
  "side-yellow": {
    th: "ไฟเหลืองถนนรอง แล้วคืนไฟเขียวให้ถนนหลักตามเดิม",
    en: "Side-road yellow, then green returns to the main road.",
  },
};

const STATUS_BADGES: Record<SimPhase, { tone: BadgeTone; text: Bi }> = {
  "main-green": { tone: "neutral", text: { th: "รอการเรียก", en: "Waiting for a call" } },
  "main-quiet": { tone: "neutral", text: { th: "ไม่มีการเรียก — เขียวค้าง", en: "No call — green holds" } },
  "vehicle-call": { tone: "accent", text: { th: "Vehicle Call — บันทึกการเรียก", en: "Vehicle Call registered" } },
  "main-yellow": { tone: "yellow", text: { th: "ไฟเหลือง (Yellow)", en: "Yellow" } },
  "min-green": { tone: "green", text: { th: "Minimum Green", en: "Minimum Green" } },
  extension: { tone: "yellow", text: { th: "Extension — ต่อขยายไฟเขียว", en: "Extension — green extended" } },
  "gap-out": { tone: "neutral", text: { th: "Gap-out — รถหมด ตัดจบ", en: "Gap-out — demand ended" } },
  "max-out": { tone: "red", text: { th: "Max-out — ชนเพดานเวลาเขียว", en: "Max-out — hit the green cap" } },
  "side-yellow": { tone: "yellow", text: { th: "ไฟเหลือง (Yellow)", en: "Yellow" } },
};

/* ------------------------------------------------------------------ */
/* Vehicle-call mini demo (DetectorZone)                                */
/* ------------------------------------------------------------------ */

function VehicleCallDemo() {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={active ? "accent" : "neutral"}>
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${active ? "bg-accent-500 animate-signal-pulse" : "bg-navy-300"}`}
          />
          {active
            ? t({ th: "Vehicle Call: บันทึกแล้ว", en: "Vehicle Call: registered" })
            : t({ th: "Vehicle Call: ยังไม่มี", en: "Vehicle Call: none" })}
        </Badge>
      </div>
      <div className="mt-4 flex justify-center">
        <DetectorZone
          active={active}
          label={
            active
              ? t({
                  th: "รถอยู่บนโซนตรวจจับ → ระบบบันทึกการเรียก (Vehicle Call)",
                  en: "A vehicle is on the detector zone → the call is registered",
                })
              : t({
                  th: "รถยังมาไม่ถึงโซนตรวจจับ → ยังไม่มีการเรียก",
                  en: "No vehicle has reached the detector zone → no call yet",
                })
          }
        />
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          aria-pressed={active}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {active ? (
              <path d="M15 12H5m0 0 4-4m-4 4 4 4M19 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M9 12h10m0 0-4-4m4 4-4 4M5 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          {active
            ? t({ th: "นำรถออกจากโซน", en: "Move the vehicle away" })
            : t({ th: "ให้รถเข้าโซนตรวจจับ", en: "Drive a vehicle onto the zone" })}
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Centerpiece intersection demo                                        */
/* ------------------------------------------------------------------ */

function VaSimulator() {
  const { t } = useLanguage();
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Respect prefers-reduced-motion: start paused instead of auto-playing.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const simSecond = tick % TIMELINE.length;
  const frame = TIMELINE[simSecond];
  const sideGreen = frame.ns === "green";
  const status = STATUS_BADGES[frame.phase];
  const callLit = frame.detector || frame.phase === "vehicle-call";

  const watchFor: Bi[] = [
    {
      th: "ช่วงเงียบ: ถนนหลักถือไฟเขียวค้างไว้ เพราะไม่มีการเรียกจากถนนรอง",
      en: "Quiet period: the main road holds green because there is no side-road call.",
    },
    {
      th: "Vehicle Call: รถแตะโซนตรวจจับ (กรอบสีฟ้า) แล้วป้าย Vehicle Call จะสว่างขึ้น",
      en: "Vehicle Call: a car touches the detector zone (cyan box) and the Vehicle Call badge lights up.",
    },
    {
      th: "Minimum Green → Extension: ถนนรองได้เขียวขั้นต่ำก่อน แล้วต่อขยายตามรถที่ตามมาแต่ละคัน",
      en: "Minimum Green → Extension: the side road gets its minimum green, then extends with each following car.",
    },
    {
      th: "จบไฟเขียวได้ 2 แบบ: Gap-out (รถหมดก่อน) หรือ Max-out (ชนเพดาน Maximum Green)",
      en: "Green ends in one of two ways: gap-out (demand runs out) or max-out (the maximum green cap is hit).",
    },
  ];

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        {/* Live state badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="font-mono tabular-nums">
            t = {simSecond}s
          </Badge>
          <Badge tone={status.tone}>{t(status.text)}</Badge>
          <Badge tone={callLit ? "accent" : "neutral"} className={callLit ? "ring-2 ring-accent-400" : ""}>
            Vehicle Call
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="green" className={frame.phase === "min-green" ? "ring-2 ring-signal-green" : ""}>
            Min Green {sideGreen ? Math.min(frame.sideElapsed, MIN_GREEN) : 0}/{MIN_GREEN}s
          </Badge>
          <Badge tone="yellow" className={frame.phase === "extension" ? "ring-2 ring-signal-yellow" : ""}>
            Gap {frame.gapRemain ?? GAP_TIME}/{GAP_TIME}s
          </Badge>
          <Badge tone="neutral" className={frame.phase === "max-out" ? "ring-2 ring-signal-red" : ""}>
            Max Green {sideGreen ? frame.sideElapsed : 0}/{MAX_GREEN}s
          </Badge>
        </div>

        <div className="mt-4 flex justify-center">
          <IntersectionDiagram
            showDetectors
            north={{ signal: frame.ns, queue: frame.northQueue, detectorActive: frame.detector }}
            south={{ signal: frame.ns, queue: 0 }}
            east={{ signal: frame.ew, queue: frame.ewQueue }}
            west={{ signal: frame.ew, queue: Math.max(0, frame.ewQueue - 1) }}
            title={t(PHASE_CAPTIONS[frame.phase])}
          />
        </div>

        <p
          aria-live="polite"
          className="mt-3 min-h-16 rounded-xl bg-navy-50 px-4 py-3 text-center text-sm font-medium text-navy-800"
        >
          {t(PHASE_CAPTIONS[frame.phase])}
        </p>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {playing ? (
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              ) : (
                <path d="M7 4.5 19 12 7 19.5v-15Z" />
              )}
            </svg>
            {playing ? t({ th: "หยุดชั่วคราว", en: "Pause" }) : t({ th: "เล่น", en: "Play" })}
          </button>
          <button
            type="button"
            onClick={() => setTick(0)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-navy-300 px-5 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-500 hover:bg-navy-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 10a8 8 0 1 1 2 7M4 10V4m0 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t({ th: "เริ่มใหม่", en: "Restart" })}
          </button>
        </div>

        <p className="mt-4 text-xs text-navy-500">
          {t({
            th: "ค่าที่ใช้ในเดโม (Min 6 วิ / Max 16 วิ / Gap 3 วิ) เป็นตัวเลขเพื่อการเรียนรู้เท่านั้น ไม่ใช่ค่าการออกแบบสัญญาณไฟจริง",
            en: "The demo values (min 6s / max 16s / gap 3s) are for learning only — not real-world signal design values.",
          })}
        </p>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <h3 className="text-lg font-semibold text-navy-900">
            {t({ th: "สิ่งที่ควรสังเกต", en: "What to watch for" })}
          </h3>
          <ol className="mt-4 space-y-3">
            {watchFor.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-navy-700">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-bold text-accent-700"
                >
                  {i + 1}
                </span>
                {t(item)}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-navy-900">
            {t({ th: "ค่าที่ตั้งไว้ในเดโม", en: "Demo parameters" })}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-700">
            <li className="flex items-center gap-3">
              <Badge tone="green">Min Green</Badge>
              <span>
                6 {t({ th: "วินาที — เขียวขั้นต่ำเมื่อเฟสเริ่ม", en: "seconds — shortest green once a phase starts" })}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge tone="yellow">Gap Time</Badge>
              <span>
                3 {t({ th: "วินาที — ช่องว่างที่ถือว่ารถหมดแล้ว", en: "seconds — the gap that means demand has ended" })}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Badge tone="neutral">Max Green</Badge>
              <span>
                16 {t({ th: "วินาที — เพดานไฟเขียวของถนนรอง", en: "seconds — the ceiling on the side-road green" })}
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline of one VA green                                             */
/* ------------------------------------------------------------------ */

function VaGreenTimeline() {
  const { t } = useLanguage();
  const xAt = (s: number) => 50 + s * 40;
  const carArrivals = [1, 3, 7, 9];

  const legend: Array<{ chip: ReactNode; text: Bi }> = [
    {
      chip: <span aria-hidden="true" className="h-3 w-6 shrink-0 rounded-sm bg-signal-green" />,
      text: {
        th: "Minimum Green — เปิดครบเสมอเมื่อเฟสเริ่ม",
        en: "Minimum Green — always runs in full once the phase starts",
      },
    },
    {
      chip: <span aria-hidden="true" className="h-3 w-6 shrink-0 rounded-sm bg-green-300" />,
      text: {
        th: "Extension — ต่อขยายทีละช่วงตามรถแต่ละคันที่ผ่าน Detector",
        en: "Extension — added in small increments per detected vehicle",
      },
    },
    {
      chip: <span aria-hidden="true" className="h-4 w-1.5 shrink-0 rounded-sm bg-signal-red-deep" />,
      text: {
        th: "Gap-out — ไม่มีรถใหม่เกิน Gap Time ไฟเขียวจึงตัดจบ",
        en: "Gap-out — no new vehicle within the gap time, so the green ends",
      },
    },
    {
      chip: (
        <span aria-hidden="true" className="h-4 w-6 shrink-0 rounded-sm border-2 border-dashed border-signal-yellow-deep" />
      ),
      text: {
        th: "Maximum Green — เพดานสูงสุด ถึงรถจะมาต่อเนื่องก็ยาวเกินนี้ไม่ได้",
        en: "Maximum Green — the hard cap, even with continuous arrivals",
      },
    },
  ];

  return (
    <figure className="mt-10">
      <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white p-4 sm:p-6">
        <svg
          viewBox="0 0 750 200"
          role="img"
          aria-label={t({
            th: "ไทม์ไลน์ไฟเขียวหนึ่งรอบของระบบ VA: เขียวขั้นต่ำ 6 วินาที ต่อขยายตามรถที่มาจนถึงวินาทีที่ 9 เกิด Gap-out ที่วินาทีที่ 12 ก่อนถึงเพดาน Maximum Green 16 วินาที",
            en: "Timeline of one VA green: 6 seconds of minimum green, extensions for vehicles arriving up to second 9, gap-out at second 12, below the 16-second maximum green cap.",
          })}
          className="h-auto w-full min-w-[640px]"
        >
          <defs>
            <pattern id="va-unused-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 8 8 0" stroke="#94a3b8" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* Car arrival markers */}
          <text x={xAt(1) - 9} y="44" fontSize="11.5" fontWeight="600" fill="#334155">
            {t({ th: "รถผ่านโซนตรวจจับ ↓", en: "Vehicles crossing the detector ↓" })}
          </text>
          {carArrivals.map((s) => (
            <g key={s}>
              <rect x={xAt(s) - 9} y="56" width="18" height="11" rx="3" fill="#475569" />
              <line x1={xAt(s)} y1="69" x2={xAt(s)} y2="87" stroke="#475569" strokeWidth="1.8" />
              <path
                d={`M${xAt(s) - 4} 83 L${xAt(s)} 89 L${xAt(s) + 4} 83`}
                fill="none"
                stroke="#475569"
                strokeWidth="1.8"
              />
            </g>
          ))}

          {/* Green bar: min green → extensions → unused headroom */}
          <rect x={xAt(0)} y="92" width={6 * 40} height="30" fill="#22c55e" />
          <rect x={xAt(6)} y="92" width={6 * 40} height="30" fill="#86efac" />
          <rect x={xAt(12)} y="92" width={4 * 40} height="30" fill="#f1f5f9" />
          <rect x={xAt(12)} y="92" width={4 * 40} height="30" fill="url(#va-unused-hatch)" opacity="0.6" />
          <rect x={xAt(0)} y="92" width={16 * 40} height="30" fill="none" stroke="#64748b" strokeWidth="1.5" />
          <text x={xAt(3)} y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
            Min Green
          </text>
          <text x={xAt(9)} y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill="#14532d">
            Extension
          </text>
          <text x={xAt(14)} y="112" textAnchor="middle" fontSize="11" fill="#64748b">
            {t({ th: "ไม่ได้ใช้", en: "unused" })}
          </text>

          {/* Gap-out marker */}
          <line x1={xAt(12)} y1="62" x2={xAt(12)} y2="130" stroke="#b91c1c" strokeWidth="2.5" />
          <circle cx={xAt(12)} cy="62" r="4" fill="#b91c1c" />
          <text x={xAt(12)} y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#b91c1c">
            {t({ th: "Gap-out — ตัดจบไฟเขียว", en: "Gap-out — green ends" })}
          </text>

          {/* Maximum green cap */}
          <line
            x1={xAt(16)}
            y1="56"
            x2={xAt(16)}
            y2="140"
            stroke="#b45309"
            strokeWidth="2.5"
            strokeDasharray="6 5"
          />
          <text x={xAt(16)} y="30" textAnchor="end" fontSize="12" fontWeight="700" fill="#b45309">
            {t({ th: "เพดาน Maximum Green", en: "Maximum Green cap" })}
          </text>

          {/* Second ticks */}
          {[0, 6, 9, 12, 16].map((s) => (
            <text key={s} x={xAt(s)} y="138" textAnchor="middle" fontSize="11" fill="#64748b">
              {s}s
            </text>
          ))}

          {/* Gap-time bracket */}
          <path d={`M${xAt(9)} 148 v8 H${xAt(12)} v-8`} fill="none" stroke="#0e7490" strokeWidth="1.8" />
          <text x={xAt(10.5)} y="174" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0e7490">
            {t({ th: "Gap Time 3 วิ — ไม่มีรถคันใหม่", en: "Gap time 3s — no new vehicle" })}
          </text>
        </svg>
      </div>
      <figcaption className="mt-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {legend.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-navy-700">
              {item.chip}
              {t(item.text)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-navy-600">
          {t({
            th: "ในตัวอย่างนี้ไฟเขียวจบที่วินาทีที่ 12 เพราะรถหมดก่อนถึงเพดาน (Gap-out) — แต่ถ้ารถมาต่อเนื่องไม่ขาดสาย ไฟเขียวจะยืดไปจนถึง Maximum Green ที่ 16 วินาที แล้วถูกตัดจบ (Max-out)",
            en: "In this example the green ends at second 12 because demand ran out before the cap (gap-out) — with continuous arrivals it would stretch to the 16-second maximum green and terminate there (max-out).",
          })}
        </p>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export function VehicleActuatedPage() {
  const { t } = useLanguage();

  const callSteps: Array<{ title: Bi; body: Bi }> = [
    {
      title: { th: "รถแตะโซนตรวจจับ", en: "A vehicle touches the detector zone" },
      body: {
        th: "รถวิ่งมาถึงและหยุด (หรือวิ่งผ่าน) บนโซนตรวจจับหน้าเส้นหยุด อุปกรณ์ตรวจจับจึงรู้ว่ามีรถอยู่",
        en: "The vehicle arrives and stops on (or drives across) the detector zone before the stop line, so the detector knows it is there.",
      },
    },
    {
      title: { th: "Detector ส่งการเรียกไปตู้ควบคุม", en: "The detector sends a call to the controller" },
      body: {
        th: "Detector ส่งสัญญาณ \"การเรียกเฟส (Vehicle Call)\" ไปยังตู้ควบคุม ระบบบันทึกว่าทิศทางนี้มีรถรออยู่",
        en: "The detector sends a \"vehicle call\" to the controller — the system records that this movement has waiting demand.",
      },
    },
    {
      title: { th: "ตู้ควบคุมจัดคิวให้ไฟเขียว", en: "The controller schedules the green" },
      body: {
        th: "ตู้ควบคุมนำการเรียกไปจัดลำดับ เพื่อให้ไฟเขียวในจังหวะที่เหมาะสม — ถ้าไม่มีการเรียกเลย เฟสนั้นจะถูกข้ามไป",
        en: "The controller queues the call and serves green at the right moment — with no call at all, that phase is simply skipped.",
      },
    },
  ];

  return (
    <>
      {/* 1 ─ Hero */}
      <PageHero
        eyebrow={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{t({ th: "บทเรียนที่ 2", en: "Module 2" })}</Badge>
            <Badge tone="accent">Vehicle Actuated (VA)</Badge>
          </div>
        }
        title={t(system.name)}
        subtitle={t(system.tagline)}
      >
        <figure className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="flex justify-center">
            <IntersectionDiagram
              showDetectors
              north={{ signal: "red", queue: 1, detectorActive: true }}
              south={{ signal: "red", queue: 0 }}
              east={{ signal: "green", queue: 0 }}
              west={{ signal: "green", queue: 0 }}
              title={t({
                th: "แยกที่มีโซนตรวจจับ: ถนนหลัก (E–W) ไฟเขียว ส่วนถนนรอง (N) มีรถแตะโซนตรวจจับเพื่อเรียกไฟเขียว",
                en: "An intersection with detector zones: the main road (E–W) is green while a side-road (N) vehicle touches the detector zone to call for green.",
              })}
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-navy-200">
            {t({
              th: "กรอบสีฟ้าคือโซนตรวจจับ (Detector Zone) — รถบนถนนรองกำลังเรียกไฟเขียว",
              en: "The cyan boxes are detector zones — a side-road vehicle is calling for green.",
            })}
          </figcaption>
        </figure>
      </PageHero>

      {/* 2 ─ What is VA */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={t({ th: "ทำความรู้จัก", en: "Overview" })}
              title={t({ th: "Vehicle Actuated (VA) คืออะไร", en: "What is Vehicle Actuated (VA)?" })}
            />
            <p className="mt-6 text-lg leading-relaxed text-navy-700">{t(system.definition)}</p>
          </div>
          <div className="space-y-6">
            <Callout variant="analogy" title={t({ th: "เปรียบเทียบง่าย ๆ", en: "Everyday analogy" })}>
              {t(system.analogy)}
            </Callout>
            <Callout variant="info" title={t({ th: "สูตรจำง่าย", en: "Quick way to remember" })}>
              {t({
                th: "VA = Fixed Time + Detector + กติกา 3 ข้อ (Minimum Green, Maximum Green, Gap Time) — ไฟเขียวยืดหดตามรถจริง แต่ไม่หลุดกรอบเวลาที่ตั้งไว้",
                en: "VA = Fixed Time + detectors + three rules (minimum green, maximum green, gap time) — green stretches with real traffic but never leaves its configured bounds.",
              })}
            </Callout>
          </div>
        </div>
      </Section>

      {/* 3 ─ Detector technologies */}
      <Section className="bg-navy-50" id="detectors">
        <SectionHeading
          eyebrow={t({ th: "อุปกรณ์ตรวจจับ", en: "Detectors" })}
          title={t({ th: "อุปกรณ์ตรวจจับทำงานอย่างไร", en: "How detectors work" })}
          description={t({
            th: "VA จะฉลาดได้แค่ไหน ขึ้นอยู่กับ \"ตา\" ที่ใช้มองรถ — รู้จักเทคโนโลยีตรวจจับ 4 แบบที่พบบ่อย",
            en: "VA is only as smart as its eyes — meet the four common detection technologies.",
          })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {DETECTOR_DEVICES.map((device) => (
            <Card key={device.id} className="flex h-full flex-col">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700"
              >
                {device.icon}
              </span>
              <h3 className="mt-4 font-semibold text-navy-900">{t(device.name)}</h3>
              <p className="mt-2 flex-1 text-sm text-navy-700">{t(device.how)}</p>
              <div className="mt-4 border-t border-navy-100 pt-3">
                <Badge tone="accent">
                  {t({ th: "จุดแข็ง / ข้อควรระวัง", en: "Strengths / caveats" })}
                </Badge>
                <p className="mt-2 text-sm text-navy-600">{t(device.strength)}</p>
              </div>
            </Card>
          ))}
        </div>
        <Callout
          variant="info"
          className="mt-10"
          title={t({ th: "เลือกแบบไหนดี", en: "Which one to choose?" })}
        >
          {t({
            th: "ไม่มีเทคโนโลยีใดดีที่สุดในทุกหน้างาน การเลือก Detector ขึ้นกับสภาพแยก งบประมาณ และความพร้อมในการบำรุงรักษา — หลายโครงการจึงใช้หลายชนิดร่วมกัน",
            en: "No single technology wins everywhere — detector choice depends on site conditions, budget, and maintenance capability. Many projects combine several types.",
          })}
        </Callout>
      </Section>

      {/* 4 ─ Vehicle call concept + DetectorZone demo */}
      <Section id="vehicle-call">
        <SectionHeading
          eyebrow={t({ th: "แนวคิดสำคัญ", en: "Core concept" })}
          title={t({ th: "Vehicle Call — รถขอไฟเขียวได้อย่างไร", en: "Vehicle Call — how a vehicle requests green" })}
          description={t({
            th: "หัวใจของ VA คือการเรียกเฟส: รถแตะโซนตรวจจับ → ระบบบันทึกการเรียก → ตู้ควบคุมให้ไฟเขียวเมื่อถึงจังหวะ ลองกดปุ่มเพื่อจำลองดู",
            en: "The heart of VA is the phase call: a vehicle touches the detector zone → the call is registered → the controller serves green at the right moment. Press the button to try it.",
          })}
        />
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
          <VehicleCallDemo />
          <ol className="space-y-4">
            {callSteps.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 font-bold text-accent-700"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-navy-900">{t(step.title)}</h3>
                  <p className="mt-1 text-sm text-navy-700">{t(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 5 ─ How it works, step by step */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "ขั้นตอนการทำงาน", en: "How it works" })}
          title={t({ th: "VA ทำงานทีละขั้นอย่างไร", en: "VA, step by step" })}
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {system.howItWorks.map((step, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 font-bold text-accent-700"
              >
                {i + 1}
              </span>
              <p className="text-navy-700">{t(step)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 6 ─ Centerpiece interactive demo */}
      <Section id="demo">
        <SectionHeading
          eyebrow={t({ th: "เดโมโต้ตอบ", en: "Interactive demo" })}
          title={t({ th: "ดู VA ทำงานจริงที่แยกจำลอง", en: "Watch VA run a simulated junction" })}
          description={t({
            th: "ถนนหลัก (E–W) ถือไฟเขียวไว้ จนกว่ารถบนถนนรอง (N) จะแตะโซนตรวจจับ — สังเกตป้ายสถานะ Minimum Green, Extension, Gap และเวลาจำลองที่เปลี่ยนทุกวินาที",
            en: "The main road (E–W) holds green until a side-road (N) vehicle touches the detector zone — watch the Minimum Green, Extension, and Gap badges update every simulated second.",
          })}
        />
        <VaSimulator />
      </Section>

      {/* 7 ─ Timeline of one VA green */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "ไทม์ไลน์", en: "Timeline" })}
          title={t({ th: "หนึ่งไฟเขียวของ VA มีอะไรอยู่ข้างใน", en: "Inside one VA green" })}
          description={t({
            th: "อ่านจากซ้ายไปขวา: เขียวขั้นต่ำ → ต่อขยายตามรถแต่ละคัน → ตัดจบเมื่อรถหมด (Gap-out) โดยมีเพดาน Maximum Green กำกับเสมอ",
            en: "Read left to right: minimum green → per-vehicle extensions → termination when demand ends (gap-out), always bounded by the maximum green cap.",
          })}
        />
        <VaGreenTimeline />
      </Section>

      {/* 8 ─ Key terms */}
      <Section id="key-terms">
        <SectionHeading
          eyebrow={t({ th: "คำศัพท์สำคัญ", en: "Key terms" })}
          title={t({ th: "ศัพท์ที่ต้องรู้ของ VA", en: "VA vocabulary you need" })}
          description={t({
            th: "จำศัพท์อังกฤษควบคู่คำแปลไทย เพราะเอกสารเทคนิคและหน้าจอระบบจริงใช้คำเหล่านี้",
            en: "Learn the English terms alongside the Thai — real systems and technical documents use them.",
          })}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {system.keyTerms.map((term) => (
            <Card key={term.term}>
              <h3 className="text-lg font-bold text-navy-900">{term.term}</h3>
              <p className="mt-0.5 text-sm font-medium text-accent-600">{term.th}</p>
              <p className="mt-3 text-sm text-navy-700">{t(term.description)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 9 ─ Advantages / limitations */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "ชั่งน้ำหนัก", en: "Trade-offs" })}
          title={t({ th: "ข้อดีและข้อจำกัดของ VA", en: "Advantages and limitations of VA" })}
        />
        <div className="mt-10">
          <ProsConsGrid
            prosTitle={t({ th: "ข้อดี", en: "Advantages" })}
            consTitle={t({ th: "ข้อจำกัด", en: "Limitations" })}
            pros={system.advantages.map((item) => t(item))}
            cons={system.limitations.map((item) => t(item))}
          />
        </div>
      </Section>

      {/* 10 ─ Best use cases */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "การใช้งาน", en: "Use cases" })}
          title={t({ th: "VA เหมาะกับที่ไหน", en: "Where VA fits best" })}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {system.bestUseCases.map((useCase, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-signal-green-deep"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-navy-700">{t(useCase)}</p>
            </li>
          ))}
        </ul>
        <Callout
          variant="example"
          className="mt-10"
          title={t({ th: "ตัวอย่างสถานการณ์จริง", en: "Real-world example" })}
        >
          {t(system.example)}
        </Callout>
      </Section>

      {/* 11 ─ Next module band */}
      <Section dark>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Badge tone="violet">{t({ th: "บทเรียนถัดไป", en: "Next module" })}</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t({ th: "ระบบปรับตัวอัตโนมัติ (Adaptive)", en: "Adaptive Control" })}
          </h2>
          <p className="text-lg text-navy-200">
            {t({
              th: "VA ตอบสนองรถทีละแยก — บทต่อไปดูระบบที่วัดสภาพจราจรต่อเนื่อง แล้วปรับแผนและประสานหลายแยกพร้อมกัน",
              en: "VA reacts junction by junction — next, see the system that continuously measures traffic and re-tunes plans across multiple junctions at once.",
            })}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/adaptive" variant="secondary">
              {t({ th: "ไปต่อ: Adaptive Control", en: "Continue: Adaptive Control" })}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ButtonLink>
            <ButtonLink href="/fixed-time" variant="onDark">
              {t({ th: "ย้อนกลับ: Fixed Time", en: "Back: Fixed Time" })}
            </ButtonLink>
            <ButtonLink href="/simulator" variant="onDark">
              {t({ th: "ลองในซิมูเลเตอร์", en: "Try it in the simulator" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
