"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";
import { systemsById } from "@/data/systems";
import type { Bi, KeyTerm, LightColor } from "@/lib/types";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  PageHero,
  ProsConsGrid,
  Section,
  SectionHeading,
} from "@/components/ui";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { IntersectionDiagram } from "@/components/IntersectionDiagram";
import { CorridorCoordination } from "@/components/CorridorCoordination";

/* ------------------------------------------------------------------ */
/* Adaptive demo model                                                 */
/*                                                                     */
/* A fixed-length cycle (30 s) whose green split is RECOMPUTED at the  */
/* start of every cycle from the queues measured at that moment:       */
/*   N–S green share = (qN + qS) / total queued, clamped 20–80%.       */
/* Demand rotates through three scenarios so the split visibly moves.  */
/* ------------------------------------------------------------------ */

/** 1 simulated second plays in ~150 ms of real time (~6.7× faster). */
const MS_PER_SIM_SECOND = 150;
const TICK_MS = 50;

const YELLOW_TIME = 3;
/** All-red clearance between phases — both directions red. */
const ALL_RED_TIME = 2;
/** Green seconds shared between N–S and E–W each cycle. */
const GREEN_BUDGET = 20;
const DEMO_CYCLE = GREEN_BUDGET + (YELLOW_TIME + ALL_RED_TIME) * 2; // 30 s
const DISCHARGE_RATE = 1.0;
const DEMAND_LOOP = 120;

interface QueueMap {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface DemandPhase {
  /** Simulated second (within the 120 s loop) this phase runs until. */
  until: number;
  label: Bi;
  rates: QueueMap;
}

const DEMAND_PHASES: DemandPhase[] = [
  {
    until: 40,
    label: {
      th: "รถแน่นแนวตะวันออก–ตะวันตก (E–W)",
      en: "Heavy east–west traffic",
    },
    rates: { north: 0.06, south: 0.05, east: 0.3, west: 0.22 },
  },
  {
    until: 80,
    label: {
      th: "รถแน่นแนวเหนือ–ใต้ (N–S)",
      en: "Heavy north–south traffic",
    },
    rates: { north: 0.3, south: 0.22, east: 0.06, west: 0.05 },
  },
  {
    until: DEMAND_LOOP,
    label: {
      th: "รถสองแนวใกล้เคียงกัน",
      en: "Balanced demand",
    },
    rates: { north: 0.12, south: 0.1, east: 0.12, west: 0.1 },
  },
];

function demandPhaseAt(totalT: number): DemandPhase {
  const t = totalT % DEMAND_LOOP;
  return DEMAND_PHASES.find((p) => t < p.until) ?? DEMAND_PHASES[0];
}

/** The adaptive step: turn measured queues into next cycle's N–S green. */
function computeNsGreen(q: QueueMap): number {
  const ns = q.north + q.south;
  const ew = q.east + q.west;
  const total = ns + ew;
  const share = total < 0.5 ? 0.5 : Math.min(0.8, Math.max(0.2, ns / total));
  return Math.round(share * GREEN_BUDGET);
}

/** Signal for a phase that starts at `start` and holds green for `green` s. */
function phaseSignal(t: number, start: number, green: number): LightColor {
  if (t >= start && t < start + green) return "green";
  if (t >= start + green && t < start + green + YELLOW_TIME) return "yellow";
  return "red";
}

const INITIAL_QUEUES: QueueMap = { north: 1.2, south: 1.0, east: 5.2, west: 4.1 };

function stepQueue(queue: number, signal: LightColor, arrivalRate: number, dt: number): number {
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
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Icons for the four real-time data cards */

function QueueIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="5.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="10.5" y="10" width="5.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="18" y="10" width="3" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 18h18M21 4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V10m5.5 10V4M15 20v-8m5.5 8V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m12 15 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.6" fill="currentColor" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Real-time data cards content                                        */
/*                                                                     */
/* Term names and Thai translations come from the shared keyTerms in   */
/* src/data/systems.ts — only the icon and the input-focused prose     */
/* below are page-specific.                                            */
/* ------------------------------------------------------------------ */

interface DataCardContent {
  icon: ReactNode;
  keyTerm: KeyTerm;
  description: Bi;
}

const DATA_CARD_EXTRAS: Array<{ term: string; icon: ReactNode; description: Bi }> = [
  {
    term: "Queue Length",
    icon: <QueueIcon />,
    description: {
      th: "วัดจำนวนรถที่ต่อแถวรอหน้าไฟแดงของแต่ละทิศทาง ถ้าแถวของทิศทางไหนยาวขึ้นเรื่อย ๆ แปลว่าไฟเขียวที่ให้ยังไม่พอ ระบบจึงใช้ค่านี้เพิ่มเวลาเขียว (Green Time) ให้ทิศทางที่มีรถสะสมในรอบถัดไป",
      en: "Measures how many vehicles queue at the red on each approach. A growing queue means the current green is not enough, so the system uses this signal to shift more green time to that approach in the next cycles.",
    },
  },
  {
    term: "Traffic Volume",
    icon: <VolumeIcon />,
    description: {
      th: "นับจำนวนรถที่ผ่านจุดตรวจจับต่อหน่วยเวลา เช่น คันต่อชั่วโมง ระบบใช้ค่านี้ประเมินความต้องการใช้ทางของแต่ละทิศทาง เพื่อเลือกรอบสัญญาณ (Cycle Time) และสัดส่วนเวลาเขียว (Split) ที่เหมาะสม",
      en: "Counts vehicles passing a detector per unit time, e.g. vehicles per hour. The system uses it to estimate demand on each approach and choose a suitable cycle time and green split.",
    },
  },
  {
    term: "Degree of Saturation",
    icon: <GaugeIcon />,
    description: {
      th: "เปรียบเทียบปริมาณรถที่มาจริงกับความสามารถระบายรถของไฟเขียวที่ให้ ถ้าค่าเข้าใกล้ 100% ระบบรู้ว่าเฟสนั้นใกล้ล้น จึงเกลี่ยเวลาเขียวใหม่ให้ทุกทิศทางรับภาระใกล้เคียงกัน",
      en: "Compares actual arrivals with how much traffic the green can discharge. As it nears 100% the system knows that phase is close to overload, and rebalances green so every approach carries a similar load.",
    },
  },
  {
    term: "Travel Time",
    icon: <ClockIcon />,
    description: {
      th: "วัดเวลาที่รถใช้เดินทางระหว่างสองจุดบนเส้นทาง ระบบใช้ตรวจสอบผลของการปรับสัญญาณและค่าเหลื่อมเวลา (Offset) ระหว่างแยก ว่าทำให้การเดินทางทั้งเส้นทางเร็วขึ้นจริงหรือไม่",
      en: "Measures how long vehicles take between two points on the corridor. The system uses it to verify whether signal changes and inter-junction offsets actually make end-to-end journeys faster.",
    },
  },
];

const DATA_CARDS: DataCardContent[] = DATA_CARD_EXTRAS.flatMap(
  ({ term, icon, description }) => {
    const keyTerm = systemsById["adaptive"].keyTerms.find((k) => k.term === term);
    return keyTerm ? [{ keyTerm, icon, description }] : [];
  },
);

/* ------------------------------------------------------------------ */
/* Local vs Network mini-diagrams                                      */
/* ------------------------------------------------------------------ */

function LocalControlDiagram({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 220 150" role="img" aria-label={title} className="h-auto w-full max-w-56">
      <title>{title}</title>
      <rect width="220" height="150" rx="14" fill="#f2f6fc" />
      <rect x="94" y="0" width="32" height="150" fill="#334155" />
      <rect x="0" y="59" width="220" height="32" fill="#334155" />
      <rect x="94" y="59" width="32" height="32" fill="#3d4c63" />
      {/* Detector marks on the approaches */}
      <rect x="98" y="26" width="24" height="14" rx="3" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="98" y="110" width="24" height="14" rx="3" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="34" y="63" width="14" height="24" rx="3" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="172" y="63" width="14" height="24" rx="3" fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Controller node at the junction */}
      <circle cx="110" cy="75" r="13" fill="#8b5cf6" />
      <circle cx="110" cy="75" r="18" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

function NetworkControlDiagram({ title }: { title: string }) {
  const nodes = [55, 160, 265];
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label={title} className="h-auto w-full max-w-80">
      <title>{title}</title>
      <rect width="320" height="150" rx="14" fill="#f2f6fc" />
      {nodes.map((x) => (
        <rect key={`v-${x}`} x={x - 13} y="30" width="26" height="120" fill="#334155" />
      ))}
      <rect x="0" y="76" width="320" height="28" fill="#334155" />
      {nodes.map((x) => (
        <rect key={`b-${x}`} x={x - 13} y="76" width="26" height="28" fill="#3d4c63" />
      ))}
      {/* Communication links between the three controllers */}
      <path d="M 55 58 Q 107.5 30 160 58" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 4" />
      <path d="M 160 58 Q 212.5 30 265 58" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 4" />
      {nodes.map((x) => (
        <g key={`n-${x}`}>
          <circle cx={x} cy="90" r="11" fill="#8b5cf6" />
          <line x1={x} y1="79" x2={x} y2="60" stroke="#22d3ee" strokeWidth="2" />
          <circle cx={x} cy="58" r="4" fill="#22d3ee" />
        </g>
      ))}
      {/* Flow arrow along the corridor */}
      <path d="M 292 90 l 14 0 m -6 -5 6 5 -6 5" fill="none" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function AdaptivePage() {
  const { t } = useLanguage();
  const sys = systemsById["adaptive"];

  /* ---- Centerpiece demo state ---- */
  const [running, setRunning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cycleT, setCycleT] = useState(0);
  const [queues, setQueues] = useState<QueueMap>(() => roundQueues(INITIAL_QUEUES));
  const [nsGreen, setNsGreen] = useState(() => computeNsGreen(INITIAL_QUEUES));
  const [demandLabel, setDemandLabel] = useState<Bi>(DEMAND_PHASES[0].label);

  const cycleTRef = useRef(0);
  const totalTRef = useRef(0);
  const queuesRef = useRef<QueueMap>({ ...INITIAL_QUEUES });
  const nsGreenRef = useRef(computeNsGreen(INITIAL_QUEUES));

  // Respect prefers-reduced-motion: start paused; play only on request.
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

  // Demo clock: queues evolve every tick; the green split is re-optimized
  // from the measured queues at the start of every cycle.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const dt = TICK_MS / MS_PER_SIM_SECOND;
      let ct = cycleTRef.current + dt;
      if (ct >= DEMO_CYCLE) {
        ct -= DEMO_CYCLE;
        // The "adaptive" moment: measure queues → recompute the split.
        nsGreenRef.current = computeNsGreen(queuesRef.current);
        setNsGreen(nsGreenRef.current);
      }
      cycleTRef.current = ct;
      totalTRef.current += dt;

      const g = nsGreenRef.current;
      const ns = phaseSignal(ct, 0, g);
      const ew = phaseSignal(ct, g + YELLOW_TIME + ALL_RED_TIME, GREEN_BUDGET - g);
      const phase = demandPhaseAt(totalTRef.current);
      const q = queuesRef.current;
      q.north = stepQueue(q.north, ns, phase.rates.north, dt);
      q.south = stepQueue(q.south, ns, phase.rates.south, dt);
      q.east = stepQueue(q.east, ew, phase.rates.east, dt);
      q.west = stepQueue(q.west, ew, phase.rates.west, dt);

      setCycleT(ct);
      setQueues(roundQueues(q));
      setDemandLabel(phase.label);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const nsSig = phaseSignal(cycleT, 0, nsGreen);
  const ewSig = phaseSignal(cycleT, nsGreen + YELLOW_TIME + ALL_RED_TIME, GREEN_BUDGET - nsGreen);
  const ewGreen = GREEN_BUDGET - nsGreen;
  const nsPct = Math.round((nsGreen / GREEN_BUDGET) * 100);
  const ewPct = 100 - nsPct;

  const liveCaption: Bi =
    nsPct >= 58
      ? {
          th: "ระบบกำลังเพิ่มไฟเขียวให้แนวเหนือ–ใต้ (N–S) เพราะมีรถสะสมมากกว่า",
          en: "The system is giving north–south (N–S) more green because its queues are longer.",
        }
      : nsPct <= 42
        ? {
            th: "ระบบกำลังเพิ่มไฟเขียวให้แนวตะวันออก–ตะวันตก (E–W) เพราะมีรถสะสมมากกว่า",
            en: "The system is giving east–west (E–W) more green because its queues are longer.",
          }
        : {
            th: "รถสองแนวใกล้เคียงกัน ระบบจึงแบ่งเวลาเขียวเกือบเท่ากัน",
            en: "Demand is similar in both directions, so green time is split almost evenly.",
          };

  const diagramTitle = t({
    th: `สี่แยกจำลองแบบ Adaptive — รถรอ: เหนือ ${queues.north} ใต้ ${queues.south} ตะวันออก ${queues.east} ตะวันตก ${queues.west} คัน แนวเหนือ–ใต้ได้ไฟเขียว ${nsPct}% ของรอบ`,
    en: `Simulated adaptive intersection — queues: north ${queues.north}, south ${queues.south}, east ${queues.east}, west ${queues.west}. North–south holds ${nsPct}% of the green budget.`,
  });

  const splitBarAria = t({
    th: `สัดส่วนไฟเขียวรอบนี้: แนวเหนือ–ใต้ ${nsPct}% (${nsGreen} วินาที) แนวตะวันออก–ตะวันตก ${ewPct}% (${ewGreen} วินาที)`,
    en: `Green split this cycle: north–south ${nsPct}% (${nsGreen}s), east–west ${ewPct}% (${ewGreen}s).`,
  });

  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow={
          <Badge tone="violet">
            {t({ th: "บทเรียนที่ 3 จาก 3 · ระบบขั้นสูงสุด", en: "Module 3 of 3 · The most advanced system" })}
          </Badge>
        }
        title={t(sys.name)}
        subtitle={t(sys.tagline)}
      >
        <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 sm:p-6">
          <IntersectionDiagram
            north={{ signal: "red", queue: 1 }}
            south={{ signal: "red", queue: 1 }}
            east={{ signal: "green", queue: 4, detectorActive: true }}
            west={{ signal: "green", queue: 3, detectorActive: true }}
            showDetectors
            title={t({
              th: "ตัวอย่างสี่แยกแบบ Adaptive: อุปกรณ์ตรวจจับเห็นรถสะสมแนวตะวันออก–ตะวันตก ระบบจึงจัดไฟเขียวให้แนวนั้นมากกว่า",
              en: "Example adaptive intersection: detectors see queues building east–west, so the system allocates more green there.",
            })}
            className="mx-auto"
          />
          <p className="mt-3 text-center text-sm text-navy-200">
            {t({
              th: "Detector เห็นรถสะสมฝั่งไหน ระบบเกลี่ยไฟเขียวไปฝั่งนั้น — หัวใจของ Adaptive",
              en: "Wherever detectors see queues build, green time follows — the essence of Adaptive.",
            })}
          </p>
        </div>
      </PageHero>

      {/* 2 — What is Adaptive */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "บทนำ", en: "Introduction" })}
          title={t({ th: "Adaptive คืออะไร", en: "What is Adaptive control?" })}
        />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-navy-700">{t(sys.definition)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="violet">
                {t({ th: "ใช้ข้อมูลจราจรเรียลไทม์", en: "Uses real-time traffic data" })}
              </Badge>
              <Badge tone="violet">
                {t({ th: "ปรับแผนต่อเนื่องอัตโนมัติ", en: "Re-optimizes continuously" })}
              </Badge>
              <Badge tone="violet">
                {t({ th: "ประสานหลายแยก (Coordination)", en: "Coordinates multiple junctions" })}
              </Badge>
            </div>
          </div>
          <Callout variant="analogy" title={t({ th: "เปรียบเทียบง่าย ๆ", en: "A simple analogy" })}>
            <p>{t(sys.analogy)}</p>
          </Callout>
        </div>
      </Section>

      {/* 3 — Real-time data the system uses */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "วัตถุดิบของระบบ", en: "The system's inputs" })}
          title={t({
            th: "ข้อมูลเรียลไทม์ที่ระบบใช้",
            en: "Real-time data the system uses",
          })}
          description={t({
            th: "Adaptive ตัดสินใจได้ดีเท่าที่ข้อมูลบอกเท่านั้น สี่ค่านี้คือวัตถุดิบหลักที่ป้อนเข้าสู่การคำนวณปรับสัญญาณ",
            en: "Adaptive decisions are only as good as the data behind them. These four measurements feed the optimization.",
          })}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DATA_CARDS.map((card) => (
            <Card key={card.keyTerm.term} className="h-full">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-system-violet"
              >
                {card.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">{card.keyTerm.term}</h3>
              <p className="text-sm font-medium text-violet-600">{card.keyTerm.th}</p>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{t(card.description)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 4 — How it works */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "ขั้นตอนการทำงาน", en: "How it works" })}
          title={t({ th: "Adaptive ทำงานอย่างไร", en: "How Adaptive works" })}
          description={t({
            th: "จากข้อมูลตรวจจับต่อเนื่อง สู่แผนสัญญาณที่ปรับตามสถานการณ์ ทั้งระดับแยกเดี่ยวและทั้งโครงข่าย",
            en: "From continuous detection to a signal plan that keeps adjusting — at a single junction and across the network.",
          })}
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sys.howItWorks.map((step, i) => (
            <li key={i}>
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-system-violet text-base font-bold text-white"
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-navy-700">{t(step)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5 — Centerpiece demo: green follows the queues */}
      <Section className="bg-navy-50" id="demo">
        <SectionHeading
          eyebrow={t({ th: "เดโมอินเทอร์แอกทีฟ", en: "Interactive demo" })}
          title={t({
            th: "ดูไฟเขียวย้ายตามรถสะสมแบบเรียลไทม์",
            en: "Watch green time follow the queues",
          })}
          description={t({
            th: "สถานการณ์รถจะสลับไปมาระหว่างแน่นฝั่ง E–W แน่นฝั่ง N–S และสมดุล ทุกต้นรอบระบบวัดแถวรถแล้วแบ่งเวลาเขียวใหม่ — สังเกตแถบสัดส่วนไฟเขียวด้านขวาขยับตาม",
            en: "Demand rotates between heavy E–W, heavy N–S, and balanced. At the start of every cycle the system measures the queues and re-splits the green — watch the split bar move.",
          })}
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Live intersection */}
          <Card>
            <h3 className="text-lg font-semibold text-navy-900">
              {t({ th: "สี่แยกจำลอง", en: "Simulated intersection" })}
            </h3>
            <IntersectionDiagram
              north={{ signal: nsSig, queue: queues.north, detectorActive: queues.north >= 1 }}
              south={{ signal: nsSig, queue: queues.south, detectorActive: queues.south >= 1 }}
              east={{ signal: ewSig, queue: queues.east, detectorActive: queues.east >= 1 }}
              west={{ signal: ewSig, queue: queues.west, detectorActive: queues.west >= 1 }}
              showDetectors
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

          {/* Controls + live green split */}
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setRunning((r) => !r)}
                >
                  {running ? <PauseIcon /> : <PlayIcon />}
                  {running
                    ? t({ th: "หยุดชั่วคราว (Pause)", en: "Pause" })
                    : t({ th: "เล่น (Play)", en: "Play" })}
                </Button>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="violet">
                    {t({ th: "สถานการณ์: ", en: "Scenario: " })}
                    {t(demandLabel)}
                  </Badge>
                  <span className="font-mono text-sm tabular-nums text-navy-600">
                    {t({ th: "วินาทีที่", en: "Second" })} {Math.floor(cycleT)} / {DEMO_CYCLE}
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

              {/* Green split bar */}
              <div className="mt-8">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-sm font-semibold text-navy-900">
                    {t({
                      th: "สัดส่วนไฟเขียวรอบนี้ (Green Split)",
                      en: "Green split this cycle",
                    })}
                  </p>
                  <p className="font-mono text-sm tabular-nums text-navy-600">
                    N–S {nsGreen}s · E–W {ewGreen}s
                  </p>
                </div>
                <div
                  role="img"
                  aria-label={splitBarAria}
                  className="mt-2 flex h-12 overflow-hidden rounded-lg"
                >
                  <div
                    className="flex items-center justify-center overflow-hidden bg-system-violet"
                    style={{ width: `${nsPct}%`, transition: "width 0.6s ease" }}
                  >
                    <span className="whitespace-nowrap px-1 text-xs font-bold text-white sm:text-sm">
                      N–S {nsPct}%
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-center overflow-hidden bg-accent-500"
                    style={{ width: `${ewPct}%`, transition: "width 0.6s ease" }}
                  >
                    <span className="whitespace-nowrap px-1 text-xs font-bold text-navy-950 sm:text-sm">
                      E–W {ewPct}%
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-navy-500">
                  {t({
                    th: `แบ่งจากงบไฟเขียวรวม ${GREEN_BUDGET} วินาทีต่อรอบ (ไม่รวมไฟเหลืองช่วงละ ${YELLOW_TIME} วินาที และช่วงแดงพร้อมกันทุกทิศ (All-Red) ช่วงละ ${ALL_RED_TIME} วินาที) คำนวณใหม่ทุกต้นรอบจากแถวรถที่วัดได้`,
                    en: `Shared from a ${GREEN_BUDGET}-second green budget per cycle (plus ${YELLOW_TIME}s of yellow and ${ALL_RED_TIME}s of all-red clearance per phase), recomputed each cycle from the measured queues.`,
                  })}
                </p>
              </div>

              {/* Live caption */}
              <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                  {t({ th: "ระบบกำลังทำอะไรอยู่", en: "What the system is doing" })}
                </p>
                <p className="mt-1 font-medium text-navy-800">{t(liveCaption)}</p>
              </div>
            </Card>

            <Callout
              variant="info"
              title={t({ th: "ต่างจาก Fixed Time และ VA อย่างไร", en: "How this differs from Fixed Time and VA" })}
            >
              <p>
                {t({
                  th: "Fixed Time ให้เวลาเขียวเท่าเดิมทุกรอบ ส่วน VA ต่อขยายไฟเขียวทีละคันตามรถที่ผ่าน Detector แต่ Adaptive มองภาพรวมของทุกทิศทาง แล้วปรับสัดส่วนเวลาเขียวทั้งแผนใหม่ตามรถสะสมจริง และยังประสานกับแยกข้างเคียงได้ด้วย",
                  en: "Fixed Time gives the same green every cycle. VA extends green car by car at the detector. Adaptive looks at all approaches together, re-splits the whole plan around real queues — and can coordinate with neighboring junctions too.",
                })}
              </p>
            </Callout>
          </div>
        </div>

        <p className="mt-6 text-sm text-navy-500">
          {t({
            th: "หมายเหตุ: เดโมถูกเร่งความเร็วประมาณ 6–7 เท่า และใช้ตรรกะอย่างง่ายเพื่อการเรียนรู้ ตัวเลขทั้งหมดเป็นค่าตัวอย่าง ไม่ใช่ค่าการออกแบบสัญญาณไฟจริง",
            en: "Note: the demo runs about 6–7× faster than real time with simplified logic for teaching. All numbers are examples — not real signal design values.",
          })}
        </p>
      </Section>

      {/* 6 — Local vs Network control */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "สองระดับการควบคุม", en: "Two levels of control" })}
          title={t({
            th: "ควบคุมเฉพาะแยก หรือควบคุมเป็นเครือข่าย",
            en: "Local control vs network control",
          })}
          description={t({
            th: "Adaptive ทำงานได้สองระดับ ตั้งแต่ปรับแยกเดียวให้ฉลาดขึ้น ไปจนถึงประสานทั้งเส้นทางหรือทั้งโครงข่าย",
            en: "Adaptive works at two levels — from making one junction smarter to coordinating a whole corridor or network.",
          })}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="h-full">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-navy-900">
                {t({ th: "ควบคุมเฉพาะแยก (Local)", en: "Local control (single junction)" })}
              </h3>
              <Badge tone="violet">Local</Badge>
            </div>
            <div className="mt-5 flex justify-center">
              <LocalControlDiagram
                title={t({
                  th: "แผนภาพแยกเดียว มีอุปกรณ์ตรวจจับทั้งสี่ทิศทางและตัวควบคุมประจำแยก",
                  en: "Diagram of a single junction with detectors on all four approaches and its own controller.",
                })}
              />
            </div>
            <p className="mt-5 text-navy-700">
              {t({
                th: "ระบบวัดรถของแยกนั้นแล้วปรับรอบสัญญาณและเวลาเขียวของ \"แยกเดียว\" ให้สมดุลกับรถแต่ละทิศทาง เหมือนเดโมด้านบน",
                en: "The system measures traffic at one junction and rebalances that junction's own cycle and green times — exactly like the demo above.",
              })}
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-900">
              {t({ th: "เหมาะเมื่อ", en: "Appropriate when" })}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-navy-600">
              {[
                {
                  th: "แยกเดี่ยวที่อยู่ห่างจากแยกอื่นมาก จนไม่จำเป็นต้องประสานกัน",
                  en: "The junction stands alone, far from neighbors, so coordination adds little.",
                },
                {
                  th: "จราจรผันผวนเฉพาะจุด เช่น หน้าห้างสรรพสินค้า โรงเรียน หรือทางเข้านิคม",
                  en: "Demand fluctuates locally — outside a mall, a school, or an industrial estate gate.",
                },
                {
                  th: "ต้องการเริ่มต้นทีละแยกก่อน แล้วค่อยขยายเป็นเครือข่ายภายหลัง",
                  en: "You want to start with one junction and grow into a network later.",
                },
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-system-violet" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="h-full">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-navy-900">
                {t({ th: "ควบคุมเป็นเครือข่าย (Network / Corridor)", en: "Network / corridor control" })}
              </h3>
              <Badge tone="accent">Network</Badge>
            </div>
            <div className="mt-5 flex justify-center">
              <NetworkControlDiagram
                title={t({
                  th: "แผนภาพถนนสายหลักที่มี 3 แยกเชื่อมต่อกันด้วยระบบสื่อสาร ทำงานประสานกันเป็นเครือข่าย",
                  en: "Diagram of a corridor of 3 junctions linked by communications, operating as one coordinated network.",
                })}
              />
            </div>
            <p className="mt-5 text-navy-700">
              {t({
                th: "หลายแยกแลกเปลี่ยนข้อมูลและทำงานร่วมกัน ระบบปรับค่าเหลื่อมเวลา (Offset) ให้กลุ่มรถ (Platoon) ที่ออกจากแยกหนึ่งไปถึงแยกถัดไปตอนไฟเขียวพอดี เกิดเป็น Green Wave ทั้งเส้นทาง",
                en: "Junctions share data and act together. The system tunes offsets so platoons leaving one junction arrive at the next on green — a corridor-long green wave.",
              })}
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-900">
              {t({ th: "เหมาะเมื่อ", en: "Appropriate when" })}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-navy-600">
              {[
                {
                  th: "แยกหลายแยกเรียงต่อกันบนถนนสายหลัก และอยู่ใกล้กันพอให้กลุ่มรถวิ่งถึงกันเป็นขบวน",
                  en: "Several junctions sit in sequence on an arterial, close enough for platoons to carry between them.",
                },
                {
                  th: "ต้องการให้รถเคลื่อนต่อเนื่องทั้งเส้นทาง ลดการหยุดซ้ำ ๆ ทุกแยก",
                  en: "The goal is continuous corridor flow, not stop-and-go at every junction.",
                },
                {
                  th: "มีระบบสื่อสารเชื่อมทุกแยก และมีศูนย์ควบคุมหรือทีมงานดูแลภาพรวม",
                  en: "Communications link every junction, with a control center or team overseeing the whole.",
                },
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* 7 — Green wave / corridor coordination */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "การประสานสัญญาณ", en: "Coordination" })}
          title={t({
            th: "Green Wave: ไฟเขียวไล่ตามขบวนรถ",
            en: "Green wave: greens that chase the platoon",
          })}
          description={t({
            th: "กดเล่นแล้วสังเกตไฟเขียวของแต่ละแยกเริ่มไล่กันทีละ 4 วินาที พอดีกับจังหวะที่ขบวนรถวิ่งไปถึง",
            en: "Press play and watch each junction's green start 4 seconds after the last — exactly as the platoon arrives.",
          })}
        />
        <CorridorCoordination className="mt-10" />
        <p className="mt-4 text-sm text-navy-500">
          {t({
            th: "หมายเหตุ: ภาพเคลื่อนไหวถูกเร่งความเร็วประมาณ 6–7 เท่า และลดรายละเอียดเพื่อการเรียนรู้",
            en: "Note: the animation runs about 6–7× faster than real time and is simplified for teaching.",
          })}
        </p>
      </Section>

      {/* 8 — Honest expectations (required framing) */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "ความคาดหวังที่ถูกต้อง", en: "Honest expectations" })}
          title={t({
            th: "Adaptive ไม่ใช่ไม้กายสิทธิ์",
            en: "Adaptive is not a magic wand",
          })}
          description={t({
            th: "ก่อนตัดสินใจลงทุน ควรเข้าใจว่าระบบนี้ทำอะไรได้จริง และอะไรที่ทำไม่ได้",
            en: "Before investing, be clear about what this system really does — and what it cannot do.",
          })}
        />
        <Callout
          variant="warning"
          title={t({
            th: "Adaptive ไม่ใช่ไม้กายสิทธิ์ (Adaptive is not a magic wand)",
            en: "Adaptive is not a magic wand",
          })}
          className="mt-8"
        >
          <p>
            {t({
              th: "Adaptive ช่วยให้สัญญาณไฟ \"ตอบสนอง\" ต่อสภาพจราจรที่เปลี่ยนแปลงได้ดีขึ้น แต่ผลลัพธ์ที่ได้จริงขึ้นอยู่กับปัจจัยเหล่านี้เสมอ",
              en: "Adaptive improves how signals respond to changing conditions — but real-world results always depend on these factors:",
            })}
          </p>
          <ul className="mt-3 space-y-2">
            {[
              {
                th: "คุณภาพอุปกรณ์ตรวจจับ (Detector Quality) — ถ้าข้อมูลที่วัดได้ผิด ระบบก็ตัดสินใจผิดตาม",
                en: "Detector quality — if the measured data is wrong, the system's decisions are wrong too.",
              },
              {
                th: "ความจุของถนน (Road Capacity) — ถ้ารถมามากกว่าที่ถนนรับได้ แถวรถก็ยังสะสม ไม่ว่าสัญญาณจะฉลาดแค่ไหน",
                en: "Road capacity — when demand exceeds what the road can carry, queues still build no matter how smart the signals are.",
              },
              {
                th: "การตั้งค่าระบบ (Configuration) — ต้องตั้งค่าและดูแลโดยผู้เชี่ยวชาญอย่างต่อเนื่อง ไม่ใช่ติดตั้งแล้วจบ",
                en: "System configuration — it needs expert setup and ongoing care. It is not install-and-forget.",
              },
              {
                th: "พฤติกรรมการจราจร (Traffic Behavior) — การจอดกีดขวาง การฝ่าสัญญาณ หรืออุบัติเหตุ อยู่นอกการควบคุมของระบบ",
                en: "Traffic behavior — illegal parking, red-light running, and incidents are outside the system's control.",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-yellow-deep" />
                <span>{t(item)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-semibold">
            {t({
              th: "สรุปตรงไปตรงมา: Adaptive ช่วยใช้ความจุถนนที่มีอยู่ให้คุ้มค่าที่สุด แต่สร้างความจุที่ไม่มีอยู่จริงขึ้นมาไม่ได้ และไม่ได้ทำให้รถติดหายไปโดยอัตโนมัติ",
              en: "The honest summary: Adaptive makes the best use of the capacity a road already has — it cannot create capacity that does not exist, and it does not make congestion disappear by itself.",
            })}
          </p>
        </Callout>
      </Section>

      {/* 9 — Key terms */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "คำศัพท์สำคัญ", en: "Key terms" })}
          title={t({ th: "คำศัพท์สำคัญของ Adaptive", en: "Key terms for Adaptive" })}
          description={t({
            th: "หกคำนี้จะเจอบ่อยที่สุดเวลาอ่านสเปกหรือคุยกับทีมเทคนิคเรื่องระบบ Adaptive",
            en: "The six terms you will meet most often in Adaptive specs and technical discussions.",
          })}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sys.keyTerms.map((term) => (
            <Card key={term.term} className="h-full">
              <h3 className="text-lg font-semibold text-navy-900">{term.term}</h3>
              <p className="text-sm font-medium text-violet-600">{term.th}</p>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{t(term.description)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 10 — Advantages / limitations */}
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

      {/* 11 — Best use cases */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "การนำไปใช้", en: "Where it fits" })}
          title={t({
            th: "Adaptive เหมาะกับสถานการณ์แบบไหน",
            en: "Where Adaptive works best",
          })}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {sys.bestUseCases.map((useCase, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-navy-100 bg-white p-5">
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

      {/* 12 — Next module */}
      <Section dark>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
              {t({ th: "บทเรียนถัดไป", en: "Next module" })}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t({ th: "เปรียบเทียบทั้ง 3 ระบบ", en: "Compare all 3 systems" })}
            </h2>
            <p className="mt-3 max-w-2xl text-navy-200">
              {t({
                th: "เรียนครบทั้งสามระบบแล้ว ขั้นต่อไปคือดูภาพรวมแบบเทียบข้างกัน ว่าระบบไหนเหมาะกับแยกแบบไหน งบประมาณเท่าไร",
                en: "You have covered all three systems. Next, see them side by side — which fits which junction, and at what cost.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/compare" variant="secondary">
              {t({ th: "ไปหน้าเปรียบเทียบ", en: "Go to the comparison" })}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink href="/fixed-time" variant="onDark">
              {t({ th: "ทบทวนบทเรียน Fixed Time", en: "Revisit the Fixed Time module" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
