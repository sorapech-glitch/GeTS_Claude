"use client";

/**
 * Interactive educational simulator: one 4-way intersection where learners
 * can switch between Fixed Time, Vehicle Actuated (VA), and Adaptive
 * control, tune the timing parameters, and watch queues, detector calls,
 * gap-outs, and max-outs happen live.
 *
 * All simulation logic lives in `@/lib/simulation` (pure, tick-based).
 * This component only owns the run loop and the presentation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { systemsById } from "@/data/systems";
import type {
  ApproachId,
  ApproachState,
  Bi,
  SimulatorScenario,
  SimulatorSettings,
  SystemAccent,
} from "@/lib/types";
import {
  ACCENT_STYLES,
  Badge,
  ButtonLink,
  Callout,
  Card,
  PageHero,
  Section,
  SectionHeading,
  type BadgeTone,
} from "@/components/ui";
import { IntersectionDiagram } from "@/components/IntersectionDiagram";
import { TrafficLightAnimation } from "@/components/TrafficLightAnimation";
import { SimulatorControlPanel } from "@/components/SimulatorControlPanel";
import { QueueVisualization } from "@/components/QueueVisualization";
import {
  computeOutputs,
  createInitialState,
  phaseRemaining,
  signalsForPhase,
  tick,
  type SimPhase,
  type SimState,
  type WaitLevel,
} from "@/lib/simulation";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** 1 simulated second plays in 200 ms of real time at 1× speed. */
const MS_PER_SIM_SECOND = 200;

const DEFAULT_SETTINGS: SimulatorSettings = {
  mode: "va",
  mainDemand: "medium",
  sideDemand: "low",
  detectorEnabled: true,
  cycleLength: 80,
  minGreen: 10,
  maxGreen: 40,
  gapTime: 3,
};

const PHASE_LABEL: Record<SimPhase, Bi> = {
  "main-green": { th: "ไฟเขียวถนนหลัก (Main Green)", en: "Main-road green" },
  "main-yellow": { th: "ไฟเหลืองถนนหลัก (Yellow)", en: "Main-road yellow" },
  "all-red-to-side": { th: "แดงทุกทิศ (All-Red)", en: "All-red clearance" },
  "side-green": { th: "ไฟเขียวถนนรอง (Side Green)", en: "Side-road green" },
  "side-yellow": { th: "ไฟเหลืองถนนรอง (Yellow)", en: "Side-road yellow" },
  "all-red-to-main": { th: "แดงทุกทิศ (All-Red)", en: "All-red clearance" },
};

const WAIT_META: Record<WaitLevel, { tone: BadgeTone; label: Bi }> = {
  low: { tone: "green", label: { th: "ต่ำ", en: "Low" } },
  medium: { tone: "yellow", label: { th: "ปานกลาง", en: "Medium" } },
  high: { tone: "red", label: { th: "สูง", en: "High" } },
};

const MODE_ACCENT: Record<SimulatorSettings["mode"], SystemAccent> = {
  fixed: "blue",
  va: "cyan",
  adaptive: "violet",
};

/** Teaching banner per mode (the Thai strings are part of the curriculum). */
const MODE_BANNER: Record<
  SimulatorSettings["mode"],
  { name: Bi; text: Bi }
> = {
  fixed: {
    name: { th: "โหมด Fixed Time", en: "Fixed Time mode" },
    text: {
      th: "เวลาเขียวคงที่ ไม่สนใจปริมาณรถ — ระบบทำตามตารางเวลาเดิมทุกรอบ",
      en: "Green times are fixed and demand is ignored — the schedule repeats every cycle.",
    },
  },
  va: {
    name: { th: "โหมด Vehicle Actuated (VA)", en: "Vehicle Actuated (VA) mode" },
    text: {
      th: "ไฟเขียวยืดตามรถที่มาถึง สูงสุดไม่เกิน Max Green — ถนนรองได้ไฟเขียวเฉพาะเมื่อตัวตรวจจับพบรถ",
      en: "Green extends with each arriving vehicle up to Max Green — the side road is served only when detectors see a vehicle.",
    },
  },
  adaptive: {
    name: { th: "โหมด Adaptive", en: "Adaptive mode" },
    text: {
      th: "แบ่งเวลาเขียวใหม่ทุกๆ รอบตามแถวรถที่วัดได้จริง — นี่คือแบบจำลองอย่างง่ายเพื่อการเรียนรู้ (This is a simplified learning model.)",
      en: "Green time is re-allocated every cycle from measured queues. This is a simplified learning model.",
    },
  },
};

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function SimulatorPage() {
  const { t } = useLanguage();

  const [settings, setSettings] = useState<SimulatorSettings>(DEFAULT_SETTINGS);
  const [simState, setSimState] = useState<SimState>(() =>
    createInitialState(DEFAULT_SETTINGS)
  );
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // The interval callback reads settings via a ref, so tuning a slider
  // does not restart the run loop.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Autoplay on mount — but stay paused for users who prefer reduced
  // motion until they explicitly press play.
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRunning(true);
    }
  }, []);

  // Run loop: one engine tick = one simulated second.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSimState((s) => tick(s, settingsRef.current));
    }, MS_PER_SIM_SECOND / speed);
    return () => window.clearInterval(id);
  }, [running, speed]);

  const updateSettings = useCallback((patch: Partial<SimulatorSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    // Manual tuning means we are no longer exactly on a preset.
    setActiveScenarioId(null);
  }, []);

  const applyScenario = useCallback((scenario: SimulatorScenario) => {
    setSettings(scenario.settings);
    setActiveScenarioId(scenario.id);
    setSimState(createInitialState(scenario.settings));
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    setSimState(createInitialState(settingsRef.current));
  }, []);

  /* ---- Derived view state -------------------------------------- */
  const signals = signalsForPhase(simState.phase);
  const outputs = computeOutputs(simState, settings);
  const remaining = phaseRemaining(simState, settings);
  const detectorsRelevant = settings.mode !== "fixed" && settings.detectorEnabled;
  const suggested = systemsById[outputs.suggestedSystem.id];
  const waitMeta = WAIT_META[outputs.waitLevel];
  const banner = MODE_BANNER[settings.mode];
  const accent = ACCENT_STYLES[MODE_ACCENT[settings.mode]];

  const approachState = (id: ApproachId): ApproachState => ({
    signal: signals[id],
    queue: simState.queues[id],
    detectorActive: detectorsRelevant && simState.queues[id] > 0,
  });

  const mainCountdown = simState.phase.startsWith("main")
    ? (remaining ?? undefined)
    : undefined;
  const sideCountdown = simState.phase.startsWith("side")
    ? (remaining ?? undefined)
    : undefined;

  const { served, totalWait, waitingNow } = simState.stats;
  const avgWait = Math.round(totalWait / Math.max(1, served + waitingNow));

  const diagramTitle = t({
    th: `สี่แยกจำลอง — ${t(PHASE_LABEL[simState.phase])} รถรอรวม ${waitingNow} คัน`,
    en: `Simulated intersection — ${t(PHASE_LABEL[simState.phase])}, ${waitingNow} vehicles waiting`,
  });

  const transportButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors";

  return (
    <>
      <PageHero
        eyebrow={
          <Badge tone="accent">
            {t({ th: "เครื่องมือทดลอง (Interactive)", en: "Interactive tool" })}
          </Badge>
        }
        title={t({
          th: "ซิมูเลเตอร์สัญญาณไฟจราจร",
          en: "Traffic Signal Simulator",
        })}
        subtitle={t({
          th: "ทดลองควบคุมสี่แยกเดียวกันด้วย Fixed Time, Vehicle Actuated (VA) และ Adaptive แล้วสังเกตว่าแถวรถ (Queue), การตัดไฟก่อนเวลา (gap-out) และการแบ่งเวลาเขียว (Green Time) เปลี่ยนไปอย่างไร",
          en: "Run the same 4-way intersection under Fixed Time, Vehicle Actuated (VA), and Adaptive control — and watch how queues, gap-outs, and green-time allocation change.",
        })}
      />

      {/* ============================ Simulator ==================== */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          {/* ---- Left: control panel ---- */}
          <div>
            <Card>
              <h2 className="text-lg font-bold text-navy-900">
                {t({ th: "แผงควบคุม (Control Panel)", en: "Control panel" })}
              </h2>
              <p className="mt-1 text-sm text-navy-600">
                {t({
                  th: "เลือกสถานการณ์ตัวอย่าง หรือปรับค่าเองทีละตัว",
                  en: "Pick a preset scenario or tune each parameter yourself.",
                })}
              </p>
              <SimulatorControlPanel
                className="mt-5"
                settings={settings}
                onChange={updateSettings}
                onApplyScenario={applyScenario}
                activeScenarioId={activeScenarioId}
              />
            </Card>
          </div>

          {/* ---- Right: live view ---- */}
          <div className="space-y-6">
            {/* Mode teaching banner */}
            <div
              className={`rounded-2xl border p-4 ${accent.border} ${accent.softBg}`}
            >
              <p className="text-sm font-bold text-navy-900">{t(banner.name)}</p>
              <p className="mt-1 text-sm leading-relaxed text-navy-700">
                {t(banner.text)}
              </p>
            </div>

            <Card>
              {/* Transport controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className={`${transportButton} bg-navy-800 text-white hover:bg-navy-700`}
                >
                  {running ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" />
                      </svg>
                      {t({ th: "หยุดชั่วคราว", en: "Pause" })}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4 2.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                      </svg>
                      {t({ th: "เล่น", en: "Play" })}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className={`${transportButton} border border-navy-300 text-navy-800 hover:border-navy-500 hover:bg-navy-50`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t({ th: "เริ่มใหม่", en: "Reset" })}
                </button>
                <div
                  role="group"
                  aria-label={t({ th: "ความเร็วการจำลอง", en: "Simulation speed" })}
                  className="flex overflow-hidden rounded-xl border border-navy-200"
                >
                  {([1, 2] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={`min-h-11 px-4 text-sm font-semibold transition-colors ${
                        speed === s
                          ? "bg-navy-800 text-white"
                          : "bg-white text-navy-700 hover:bg-navy-50"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <span className="ml-auto font-mono text-sm font-bold tabular-nums text-navy-700">
                  <span className="sr-only">
                    {t({ th: "เวลาจำลอง", en: "Simulated time" })}{" "}
                  </span>
                  {formatClock(simState.time)}
                </span>
              </div>

              {/* Diagram + signal heads */}
              <div className="mt-6 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
                <IntersectionDiagram
                  north={approachState("north")}
                  south={approachState("south")}
                  east={approachState("east")}
                  west={approachState("west")}
                  showDetectors={detectorsRelevant}
                  title={diagramTitle}
                  className="mx-auto"
                />
                <div className="flex flex-row items-start justify-center gap-8 md:flex-col md:gap-6">
                  <TrafficLightAnimation
                    active={signals.east}
                    size="md"
                    countdown={mainCountdown}
                    label={t({ th: "ถนนหลัก (E–W)", en: "Main road (E–W)" })}
                  />
                  <TrafficLightAnimation
                    active={signals.north}
                    size="md"
                    countdown={sideCountdown}
                    label={t({ th: "ถนนรอง (N–S)", en: "Side road (N–S)" })}
                  />
                </div>
              </div>

              {/* Current phase readout */}
              <p className="mt-4 rounded-xl bg-navy-50 px-4 py-2.5 text-sm text-navy-700">
                <span className="font-semibold text-navy-900">
                  {t({ th: "เฟสปัจจุบัน: ", en: "Current phase: " })}
                </span>
                {t(PHASE_LABEL[simState.phase])}
                {remaining !== null && (
                  <span className="text-navy-500">
                    {" · "}
                    {t({
                      th: `เหลืออีกไม่เกิน ${remaining} วินาที`,
                      en: `up to ${remaining} s remaining`,
                    })}
                  </span>
                )}
                {remaining === null && (
                  <span className="text-navy-500">
                    {" · "}
                    {t({
                      th: "ค้างไว้จนกว่าจะมีรถบนถนนรอง (resting)",
                      en: "resting until a side-road vehicle arrives",
                    })}
                  </span>
                )}
              </p>

              <QueueVisualization
                className="mt-6"
                queues={simState.queues}
                signals={signals}
              />
            </Card>

            {/* ---- Status strip ---- */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card>
                <h3 className="text-sm font-semibold text-navy-900">
                  {t({ th: "ระดับการรอ (Waiting)", en: "Waiting level" })}
                </h3>
                <div className="mt-3">
                  <Badge tone={waitMeta.tone}>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-current"
                    />
                    {t(waitMeta.label)}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-1.5 text-sm text-navy-600">
                  <div className="flex justify-between gap-2">
                    <dt>{t({ th: "รถรออยู่ตอนนี้", en: "Waiting now" })}</dt>
                    <dd className="font-mono font-bold tabular-nums text-navy-900">
                      {waitingNow} {t({ th: "คัน", en: "cars" })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>{t({ th: "รถผ่านแยกแล้ว", en: "Vehicles served" })}</dt>
                    <dd className="font-mono font-bold tabular-nums text-navy-900">
                      {served} {t({ th: "คัน", en: "cars" })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>{t({ th: "รอเฉลี่ยต่อคัน", en: "Avg wait per car" })}</dt>
                    <dd className="font-mono font-bold tabular-nums text-navy-900">
                      ~{avgWait} {t({ th: "วินาที", en: "s" })}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-navy-900">
                  {t({
                    th: "ระบบที่เหมาะกับสถานการณ์นี้",
                    en: "Suggested system for this situation",
                  })}
                </h3>
                <Link
                  href={suggested.href}
                  className={`mt-3 block rounded-xl border p-3 transition-colors hover:border-navy-400 ${ACCENT_STYLES[suggested.accent].border} ${ACCENT_STYLES[suggested.accent].softBg}`}
                >
                  <span
                    className={`block text-base font-bold ${ACCENT_STYLES[suggested.accent].text}`}
                  >
                    {t(suggested.name)}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-navy-600 underline underline-offset-2">
                    {t({ th: "ไปที่บทเรียน →", en: "Open the module →" })}
                  </span>
                </Link>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  {t(outputs.suggestedSystem.reason)}
                </p>
              </Card>

              <Card className="sm:col-span-2 xl:col-span-1">
                <h3 className="text-sm font-semibold text-navy-900">
                  {t({
                    th: "ตอนนี้ระบบกำลังทำอะไร?",
                    en: "What is the controller doing?",
                  })}
                </h3>
                <p
                  aria-live="polite"
                  className="mt-3 text-sm leading-relaxed text-navy-700"
                >
                  {t(outputs.explanation)}
                </p>
              </Card>
            </div>

            {/* ---- Required disclaimer ---- */}
            <Callout
              variant="warning"
              title={t({
                th: "ข้อควรทราบ (Disclaimer)",
                en: "Please note (Disclaimer)",
              })}
            >
              <p>
                ผลลัพธ์นี้เป็นแบบจำลองเพื่อการเรียนรู้
                ไม่ใช่ค่าการออกแบบสัญญาณไฟจราจรสำหรับใช้งานจริง
              </p>
              <p className="mt-1 text-sm text-navy-600">
                This is a simplified learning model — not real-world signal
                design values.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      {/* ============================ Things to try ================= */}
      <Section className="bg-navy-50">
        <SectionHeading
          eyebrow={t({ th: "แนวทางการทดลอง", en: "Guided experiments" })}
          title={t({ th: "ลองทำดู 3 การทดลองนี้", en: "Three experiments to try" })}
          description={t({
            th: "แต่ละการทดลองใช้เวลาไม่ถึงหนึ่งนาที และแสดงจุดแข็ง–จุดอ่อนของแต่ละระบบให้เห็นชัดเจน",
            en: "Each takes under a minute and makes the strengths and weaknesses of each system easy to see.",
          })}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <Badge tone="blue">1</Badge>
            <h3 className="mt-3 text-base font-bold text-navy-900">
              {t({
                th: "Fixed Time เจอถนนรองว่างเปล่า",
                en: "Fixed Time with an empty side road",
              })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {t({
                th: "เลือกโหมด Fixed Time ตั้งถนนหลัก “มาก” ถนนรอง “น้อย” แล้วสังเกตไฟเขียวที่เสียไปกับถนนรองที่ไม่มีรถ ขณะที่แถวรถถนนหลักยาวขึ้น",
                en: "Set Fixed Time with high main-road and low side-road demand — watch green time wasted on the empty side road while the main-road queue grows.",
              })}
            </p>
          </Card>
          <Card>
            <Badge tone="accent">2</Badge>
            <h3 className="mt-3 text-base font-bold text-navy-900">
              {t({
                th: "ปิดตัวตรวจจับในโหมด VA",
                en: "Switch detectors off in VA mode",
              })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {t({
                th: "เลือกโหมด VA แล้วปิดตัวตรวจจับ (Detector) ระบบจะมองไม่เห็นรถและกลับไปทำงานเหมือน Fixed Time ทันที — ตัวตรวจจับคือหัวใจของ VA",
                en: "In VA mode, turn detectors off — the controller instantly behaves like Fixed Time. Detectors are the heart of VA.",
              })}
            </p>
          </Card>
          <Card>
            <Badge tone="violet">3</Badge>
            <h3 className="mt-3 text-base font-bold text-navy-900">
              {t({
                th: "Adaptive แบ่งเวลาเขียวใหม่",
                en: "Watch Adaptive re-allocate green",
              })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {t({
                th: "เลือกโหมด Adaptive ตั้งถนนหลัก “มาก” ถนนรอง “ปานกลาง” แล้วดูแผงอธิบายว่าแต่ละรอบระบบแบ่งเวลาเขียวหลัก/รองกี่วินาทีตามแถวรถจริง",
                en: "In Adaptive mode with high main and medium side demand, watch the explanation panel report the main/side green split it computes each cycle.",
              })}
            </p>
          </Card>
        </div>
      </Section>

      {/* ============================ Next module =================== */}
      <Section>
        <div className="rounded-3xl bg-navy-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t({ th: "บทเรียนถัดไป", en: "Next module" })}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-navy-200">
            {t({
              th: "เข้าใจพฤติกรรมของแต่ละระบบจากซิมูเลเตอร์แล้ว ลองทดสอบความเข้าใจ หรือย้อนดูตารางเปรียบเทียบทั้งสามระบบ",
              en: "Seen how each system behaves? Test your understanding, or revisit the side-by-side comparison of all three systems.",
            })}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/quiz" variant="secondary">
              {t({ th: "ทำแบบทดสอบ (Quiz)", en: "Take the quiz" })}
            </ButtonLink>
            <ButtonLink href="/compare" variant="onDark">
              {t({ th: "ตารางเปรียบเทียบระบบ", en: "Compare the systems" })}
            </ButtonLink>
            <ButtonLink href="/glossary" variant="onDark">
              {t({ th: "อภิธานศัพท์ (Glossary)", en: "Glossary" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
