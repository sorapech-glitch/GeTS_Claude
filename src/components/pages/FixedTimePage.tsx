"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { systemsById } from "@/data/systems";
import type { Bi, LightColor } from "@/lib/types";
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
import { IntersectionDiagram } from "@/components/IntersectionDiagram";
import { TrafficLightAnimation } from "@/components/TrafficLightAnimation";
import {
  FixedCycleTimeline,
  type CyclePhase,
} from "@/components/FixedCycleTimeline";

/* ------------------------------------------------------------------ */
/* Fixed 60-second cycle model                                         */
/*   N–S: green 0–25 s → yellow 25–28 s → all-red 28–30 s              */
/*   E–W: green 30–55 s → yellow 55–58 s → all-red 58–60 s             */
/* ------------------------------------------------------------------ */

const CYCLE = 60;
/** 1 simulated second plays in ~150 ms of real time (~6.7× faster). */
const MS_PER_SIM_SECOND = 150;
const TICK_MS = 50;

function nsSignal(t: number): LightColor {
  if (t < 25) return "green";
  if (t < 28) return "yellow";
  return "red";
}

function ewSignal(t: number): LightColor {
  if (t >= 30 && t < 55) return "green";
  if (t >= 55 && t < 58) return "yellow";
  return "red";
}

/** Cycle seconds at which each direction's light changes color. */
const NS_CHANGES = [25, 28, 60];
const EW_CHANGES = [30, 55, 58];

function secondsToNextChange(t: number, changes: number[]): number {
  for (const c of changes) {
    if (c > t) return c - t;
  }
  return (changes[0] ?? CYCLE) + CYCLE - t;
}

interface CycleSegment {
  start: number;
  end: number;
  tone: BadgeTone;
  /** What the signal head of the running phase shows during this interval. */
  signal: LightColor;
  label: Bi;
}

const CYCLE_SEGMENTS: CycleSegment[] = [
  {
    start: 0,
    end: 25,
    tone: "green",
    signal: "green",
    label: { th: "เฟสที่ 1: ไฟเขียวแนวเหนือ–ใต้ (N–S Green)", en: "Phase 1: North–South green" },
  },
  {
    start: 25,
    end: 28,
    tone: "yellow",
    signal: "yellow",
    label: { th: "เฟสที่ 1: ไฟเหลืองแนวเหนือ–ใต้ (N–S Yellow)", en: "Phase 1: North–South yellow" },
  },
  {
    start: 28,
    end: 30,
    tone: "red",
    signal: "red",
    label: { th: "แดงพร้อมกันทุกทิศ (All-Red)", en: "All-red clearance" },
  },
  {
    start: 30,
    end: 55,
    tone: "green",
    signal: "green",
    label: { th: "เฟสที่ 2: ไฟเขียวแนวตะวันออก–ตะวันตก (E–W Green)", en: "Phase 2: East–West green" },
  },
  {
    start: 55,
    end: 58,
    tone: "yellow",
    signal: "yellow",
    label: { th: "เฟสที่ 2: ไฟเหลืองแนวตะวันออก–ตะวันตก (E–W Yellow)", en: "Phase 2: East–West yellow" },
  },
  {
    start: 58,
    end: 60,
    tone: "red",
    signal: "red",
    label: { th: "แดงพร้อมกันทุกทิศ (All-Red)", en: "All-red clearance" },
  },
];

const TIMELINE_PHASES: CyclePhase[] = [
  {
    id: "ns",
    label: { th: "เฟสที่ 1 (Phase 1) · แนวเหนือ–ใต้ N–S", en: "Phase 1 · North–South (N–S)" },
    green: 25,
    yellow: 3,
    allRed: 2,
  },
  {
    id: "ew",
    label: { th: "เฟสที่ 2 (Phase 2) · แนวตะวันออก–ตะวันตก E–W", en: "Phase 2 · East–West (E–W)" },
    green: 25,
    yellow: 3,
    allRed: 2,
  },
];

/* ------------------------------------------------------------------ */
/* Simple queue model — arrivals build on red/yellow, drain on green.  */
/* N–S demand is deliberately low and E–W high, so every cycle shows   */
/* green time running with zero cars while the other side queues.      */
/* ------------------------------------------------------------------ */

interface QueueMap {
  north: number;
  south: number;
  east: number;
  west: number;
}

const ARRIVAL_RATE: QueueMap = { north: 0.08, south: 0.05, east: 0.22, west: 0.15 };
const DISCHARGE_RATE = 1.1;
/** Steady-state queues at t = 0 so the demo starts mid-story. */
const INITIAL_QUEUES: QueueMap = { north: 2.8, south: 1.8, east: 1.1, west: 0.8 };

function stepQueue(
  queue: number,
  signal: LightColor,
  arrivalRate: number,
  dt: number
): number {
  if (signal === "green") return Math.max(0, queue - DISCHARGE_RATE * dt);
  return Math.min(8, queue + arrivalRate * dt);
}

function roundQueues(q: QueueMap): QueueMap {
  return {
    north: Math.round(q.north),
    south: Math.round(q.south),
    east: Math.round(q.east),
    west: Math.round(q.west),
  };
}

/* ------------------------------------------------------------------ */
/* Small inline icons                                                  */
/* ------------------------------------------------------------------ */

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-1 shrink-0 text-signal-green-deep"
    >
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function FixedTimePage() {
  const { t } = useLanguage();
  const sys = systemsById["fixed-time"];
  const nextSys = systemsById["vehicle-actuated"];

  const [running, setRunning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [simT, setSimT] = useState(0);
  const [queues, setQueues] = useState<QueueMap>(() => roundQueues(INITIAL_QUEUES));
  const simTRef = useRef(0);
  const queuesRef = useRef<QueueMap>({ ...INITIAL_QUEUES });

  // Respect prefers-reduced-motion: keep the demo paused unless the user
  // explicitly presses play. Everyone else gets autoplay on mount.
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

  // The single clock driving the diagram, both signal heads, and the timeline.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const dt = TICK_MS / MS_PER_SIM_SECOND;
      const next = (simTRef.current + dt) % CYCLE;
      simTRef.current = next;

      const ns = nsSignal(next);
      const ew = ewSignal(next);
      const q = queuesRef.current;
      q.north = stepQueue(q.north, ns, ARRIVAL_RATE.north, dt);
      q.south = stepQueue(q.south, ns, ARRIVAL_RATE.south, dt);
      q.east = stepQueue(q.east, ew, ARRIVAL_RATE.east, dt);
      q.west = stepQueue(q.west, ew, ARRIVAL_RATE.west, dt);

      setSimT(next);
      setQueues(roundQueues(q));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const nsSig = nsSignal(simT);
  const ewSig = ewSignal(simT);
  const segment =
    CYCLE_SEGMENTS.find((s) => simT >= s.start && simT < s.end) ?? CYCLE_SEGMENTS[0];
  const nsCountdown = secondsToNextChange(simT, NS_CHANGES);
  const ewCountdown = secondsToNextChange(simT, EW_CHANGES);

  // The Fixed Time teaching moment: green is running for N–S with no cars
  // left, while E–W queues keep growing — and the timing never reacts.
  const wastedGreenNow =
    nsSig === "green" &&
    queues.north + queues.south === 0 &&
    queues.east + queues.west >= 3;

  const diagramTitle = t({
    th: `สี่แยกจำลองแบบ Fixed Time — ขณะนี้ ${segment.label.th} รถรอ: เหนือ ${queues.north} ใต้ ${queues.south} ตะวันออก ${queues.east} ตะวันตก ${queues.west} คัน`,
    en: `Simulated fixed-time intersection — currently ${segment.label.en}. Queues: north ${queues.north}, south ${queues.south}, east ${queues.east}, west ${queues.west}.`,
  });

  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow={
          <Badge tone="blue">
            {t({ th: "บทเรียนที่ 1 จาก 3 · ระบบพื้นฐาน", en: "Module 1 of 3 · The baseline system" })}
          </Badge>
        }
        title={t(sys.name)}
        subtitle={t(sys.tagline)}
      >
        <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 sm:p-6">
          <IntersectionDiagram
            north={{ signal: "green", queue: 0 }}
            south={{ signal: "green", queue: 0 }}
            east={{ signal: "red", queue: 5 }}
            west={{ signal: "red", queue: 4 }}
            title={t({
              th: "ตัวอย่างสี่แยก: แนวเหนือ–ใต้ได้ไฟเขียวทั้งที่ไม่มีรถ ขณะที่แนวตะวันออก–ตะวันตกมีรถต่อแถวรอไฟแดง",
              en: "Example intersection: north–south has green with no cars, while east–west vehicles queue at the red.",
            })}
            className="mx-auto"
          />
          <p className="mt-3 text-center text-sm text-navy-200">
            {t({
              th: "ไฟเขียวเปิดตามตารางเวลา แม้ไม่มีรถ — นี่คือหัวใจของ Fixed Time",
              en: "Green runs on schedule even with no cars — the essence of Fixed Time.",
            })}
          </p>
        </div>
      </PageHero>

      {/* 2 — What is Fixed Time */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "บทนำ", en: "Introduction" })}
          title={t({ th: "Fixed Time คืออะไร", en: "What is Fixed Time?" })}
        />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-navy-700">{t(sys.definition)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="blue">
                {t({ th: "ไม่ต้องใช้ Detector", en: "No detectors needed" })}
              </Badge>
              <Badge tone="blue">
                {t({ th: "ทำงานซ้ำเดิมทุกรอบ", en: "Repeats every cycle" })}
              </Badge>
              <Badge tone="blue">
                {t({ th: "ต้นทุนต่ำที่สุดใน 3 ระบบ", en: "Lowest cost of the three" })}
              </Badge>
            </div>
          </div>
          <Callout
            variant="analogy"
            title={t({ th: "เปรียบเทียบง่าย ๆ", en: "A simple analogy" })}
          >
            <p>{t(sys.analogy)}</p>
          </Callout>
        </div>
      </Section>

      {/* 3 — How it works */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "ขั้นตอนการทำงาน", en: "How it works" })}
          title={t({ th: "Fixed Time ทำงานอย่างไร", en: "How Fixed Time works" })}
          description={t({
            th: "จากการเก็บข้อมูลจราจรในอดีต สู่แผนเวลาที่ตู้ควบคุมทำงานวนซ้ำทุกวัน",
            en: "From historical traffic surveys to a timing plan the controller repeats every day.",
          })}
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sys.howItWorks.map((step, i) => (
            <li key={i}>
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-system-blue text-base font-bold text-white"
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-navy-700">{t(step)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4 — Interactive demo: one fixed 60 s cycle */}
      <Section id="demo">
        <SectionHeading
          eyebrow={t({ th: "เดโมอินเทอร์แอกทีฟ", en: "Interactive demo" })}
          title={t({
            th: "หนึ่งรอบสัญญาณไฟ (Cycle) 60 วินาที ที่ไม่เคยเปลี่ยน",
            en: "One 60-second cycle that never changes",
          })}
          description={t({
            th: "กดเล่นแล้วสังเกต: สัญญาณไฟเปลี่ยนตามเวลาที่ตั้งไว้เท่านั้น รถจะมากหรือน้อย จังหวะไฟก็เหมือนเดิมทุกรอบ",
            en: "Press play and watch: the lights change strictly on the pre-set clock. Heavy or empty, the rhythm never varies.",
          })}
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Live intersection */}
          <Card>
            <h3 className="text-lg font-semibold text-navy-900">
              {t({ th: "สี่แยกจำลอง", en: "Simulated intersection" })}
            </h3>
            <IntersectionDiagram
              north={{ signal: nsSig, queue: queues.north }}
              south={{ signal: nsSig, queue: queues.south }}
              east={{ signal: ewSig, queue: queues.east }}
              west={{ signal: ewSig, queue: queues.west }}
              title={diagramTitle}
              className="mx-auto mt-4"
            />
            <p className="mt-3 text-center text-sm text-navy-600">
              {t({
                th: `รถรอสะสม — เหนือ (N): ${queues.north} · ใต้ (S): ${queues.south} · ตะวันออก (E): ${queues.east} · ตะวันตก (W): ${queues.west} คัน`,
                en: `Waiting vehicles — N: ${queues.north} · S: ${queues.south} · E: ${queues.east} · W: ${queues.west}`,
              })}
            </p>
          </Card>

          {/* Controls, signal heads, and the teaching moment */}
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy-700 px-5 py-2 text-base font-semibold text-white transition-colors hover:bg-navy-600"
                >
                  {running ? <PauseIcon /> : <PlayIcon />}
                  {running
                    ? t({ th: "หยุดชั่วคราว (Pause)", en: "Pause" })
                    : t({ th: "เล่น (Play)", en: "Play" })}
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={segment.tone}>{t(segment.label)}</Badge>
                  <span className="font-mono text-sm tabular-nums text-navy-600">
                    {t({ th: "วินาทีที่", en: "Second" })} {Math.floor(simT)} / {CYCLE}
                  </span>
                </div>
              </div>

              {reducedMotion && (
                <p className="mt-3 text-sm text-navy-500">
                  {t({
                    th: "ระบบพบว่าคุณตั้งค่าลดการเคลื่อนไหว (Reduced Motion) เดโมจึงหยุดไว้ก่อน กดเล่นเมื่อพร้อม",
                    en: "Your device prefers reduced motion, so the demo starts paused. Press play when ready.",
                  })}
                </p>
              )}

              <div className="mt-8 flex items-start justify-center gap-12">
                <TrafficLightAnimation
                  active={nsSig}
                  countdown={nsCountdown}
                  label={t({ th: "แนวเหนือ–ใต้ (N–S)", en: "North–South (N–S)" })}
                  size="md"
                />
                <TrafficLightAnimation
                  active={ewSig}
                  countdown={ewCountdown}
                  label={t({ th: "แนวตะวันออก–ตะวันตก (E–W)", en: "East–West (E–W)" })}
                  size="md"
                />
              </div>
              <p className="mt-4 text-center text-xs text-navy-500">
                {t({
                  th: "ตัวเลขคือวินาทีนับถอยหลังก่อนไฟของแนวนั้นเปลี่ยนสี",
                  en: "The number counts down to that direction's next light change.",
                })}
              </p>
            </Card>

            {/* Wasted-green observation box */}
            <div
              className={`rounded-2xl border p-5 transition-colors ${
                wastedGreenNow
                  ? "border-amber-400 bg-amber-50"
                  : "border-navy-100 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-navy-900">
                  {t({ th: "จุดที่ต้องสังเกต", en: "Watch for this" })}
                </p>
                <Badge tone="yellow" className={wastedGreenNow ? "" : "invisible"}>
                  {t({ th: "กำลังเกิดขึ้นตอนนี้", en: "Happening now" })}
                </Badge>
              </div>
              <p className="mt-2 text-navy-700">
                {t({
                  th: "ทุกรอบจะมีช่วงที่แนวเหนือ–ใต้ (N–S) ได้ไฟเขียวทั้งที่ไม่มีรถเหลืออยู่ ขณะที่ฝั่งตะวันออก–ตะวันตก (E–W) ต่อแถวรอนานขึ้นเรื่อย ๆ — Fixed Time ไม่ตัดจบไฟเขียวก่อนเวลา เพราะทำงานตามนาฬิกาเท่านั้น ไม่รับรู้ว่ามีรถหรือไม่",
                  en: "Every cycle has a stretch where north–south holds a green with zero cars left, while east–west queues keep growing. Fixed Time never ends the green early — it follows the clock and knows nothing about the traffic.",
                })}
              </p>
              <p className="mt-2 text-sm text-navy-500">
                {t({
                  th: "ระบบ Vehicle Actuated (VA) ในบทถัดไปแก้จุดนี้ด้วยอุปกรณ์ตรวจจับรถ (Detector)",
                  en: "The next module shows how Vehicle Actuated (VA) control fixes this with detectors.",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Timing bar synced to the same clock */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-navy-900">
            {t({
              th: "แผนเวลาหนึ่งรอบสัญญาณไฟ (Cycle Timing Diagram)",
              en: "Cycle timing diagram",
            })}
          </h3>
          <p className="mt-1 text-sm text-navy-600">
            {t({
              th: "เส้นชี้ตำแหน่ง (Playhead) เดินไปพร้อมกับสี่แยกจำลองด้านบน ครบ 60 วินาทีแล้วเริ่มรอบใหม่ทันที",
              en: "The playhead moves in sync with the intersection above. After 60 seconds, the cycle simply starts again.",
            })}
          </p>
          <FixedCycleTimeline phases={TIMELINE_PHASES} elapsed={simT} className="mt-6" />

          {/* The phase currently running, synced to the playhead */}
          <div className="mt-8 flex flex-col items-center gap-1 border-t border-navy-100 pt-6">
            <TrafficLightAnimation
              active={segment.signal}
              countdown={segment.end - simT}
              label={t(segment.label)}
              size="md"
            />
            <p className="text-xs text-navy-500">
              {t({
                th: "ช่วงที่กำลังทำงานตอนนี้ พร้อมนับถอยหลังจนจบช่วง",
                en: "The interval running right now, counting down to its end.",
              })}
            </p>
          </div>
        </Card>

        <p className="mt-4 text-sm text-navy-500">
          {t({
            th: "หมายเหตุ: เดโมถูกเร่งความเร็วประมาณ 6–7 เท่า (1 วินาทีจำลอง ≈ 0.15 วินาทีจริง) และตัวเลขทั้งหมดเป็นค่าตัวอย่างเพื่อการเรียนรู้ ไม่ใช่ค่าการออกแบบสัญญาณไฟจริง",
            en: "Note: the demo runs about 6–7× faster than real time (1 simulated second ≈ 0.15 s), and all numbers are teaching examples — not real signal design values.",
          })}
        </p>
      </Section>

      {/* 5 — Key terms */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "คำศัพท์สำคัญ", en: "Key terms" })}
          title={t({ th: "คำศัพท์สำคัญของ Fixed Time", en: "Key terms for Fixed Time" })}
          description={t({
            th: "หกคำนี้คือพื้นฐานของทุกระบบสัญญาณไฟ จำคำภาษาอังกฤษไว้ เพราะใช้ต่อในบท VA และ Adaptive",
            en: "These six terms underpin every signal system — they return in the VA and Adaptive modules.",
          })}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sys.keyTerms.map((term) => (
            <Card key={term.term} className="h-full">
              <h3 className="text-lg font-semibold text-navy-900">{term.term}</h3>
              <p className="text-sm font-medium text-system-blue">{term.th}</p>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                {t(term.description)}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 6 — Advantages / limitations */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "ประเมินระบบ", en: "Evaluation" })}
          title={t({
            th: "ข้อดีและข้อจำกัด (Advantages & Limitations)",
            en: "Advantages & limitations",
          })}
        />
        <div className="mt-10">
          <ProsConsGrid
            prosTitle={t({ th: "ข้อดี (Advantages)", en: "Advantages" })}
            consTitle={t({ th: "ข้อจำกัด (Limitations)", en: "Limitations" })}
            pros={sys.advantages.map((item) => t(item))}
            cons={sys.limitations.map((item) => t(item))}
          />
        </div>
      </Section>

      {/* 7 — Best use cases */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "การนำไปใช้", en: "Where it fits" })}
          title={t({
            th: "Fixed Time เหมาะกับสถานการณ์แบบไหน",
            en: "Where Fixed Time works best",
          })}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {sys.bestUseCases.map((useCase, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-navy-100 bg-white p-5"
            >
              <CheckIcon />
              <span className="text-navy-700">{t(useCase)}</span>
            </li>
          ))}
        </ul>
        <Callout
          variant="example"
          title={t({ th: "ตัวอย่างการใช้งานจริง", en: "Real-world example" })}
          className="mt-8"
        >
          <p>{t(sys.example)}</p>
        </Callout>
      </Section>

      {/* 8 — Next module */}
      <Section dark>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
              {t({ th: "บทเรียนถัดไป", en: "Next module" })}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t(nextSys.name)}
            </h2>
            <p className="mt-3 max-w-2xl text-navy-200">{t(nextSys.tagline)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/vehicle-actuated" variant="secondary">
              {t({ th: "ไปบทเรียน VA", en: "Go to the VA module" })}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink href="/compare" variant="onDark">
              {t({ th: "เปรียบเทียบทั้ง 3 ระบบ", en: "Compare all 3 systems" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
