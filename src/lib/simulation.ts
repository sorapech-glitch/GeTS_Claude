/**
 * Educational traffic-signal simulation engine (pure TypeScript, no React).
 *
 * Models ONE simplified 4-way intersection:
 * - MAIN road = East–West  (ถนนหลัก แนวตะวันออก–ตะวันตก)
 * - SIDE road = North–South (ถนนรอง แนวเหนือ–ใต้)
 *
 * The engine is tick-based: `tick(state, settings)` advances exactly ONE
 * simulated second and returns a new state. The UI decides how fast to
 * call it (e.g. every 200 ms real time).
 *
 * IMPORTANT: this is a simplified TEACHING model — arrival and departure
 * rates, gap logic, and the adaptive allocation rule are intentionally
 * simple so learners can see the behavior of each control mode. It is NOT
 * a traffic engineering calculator.
 */

import type {
  ApproachId,
  Bi,
  DemandLevel,
  LightColor,
  SimulatorSettings,
  SystemId,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Yellow (amber) interval — fixed for every mode. */
export const YELLOW_TIME = 3;
/** All-red clearance interval — fixed for every mode. */
export const ALL_RED_TIME = 2;
/** One car departs per approach every SATURATION_HEADWAY seconds of green. */
export const SATURATION_HEADWAY = 2;
/** Queues are capped so the simulation stays readable (UI shows "+n"). */
export const MAX_QUEUE_PER_APPROACH = 30;

/** Average arrivals per second PER APPROACH for each demand level. */
const ARRIVAL_RATE: Record<DemandLevel, number> = {
  low: 1 / 12, // ≈ 1 car / 12 s
  medium: 1 / 5, // ≈ 1 car / 5 s
  high: 1 / 2.5, // ≈ 1 car / 2.5 s
};

/** Decay factor for the "recent arrivals" running count (≈30 s memory). */
const RECENT_ARRIVALS_DECAY = 1 - 1 / 30;
/** Smoothing factor for the waiting-cars average used for the wait level. */
const WAIT_SMOOTHING = 0.05;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** The six phases of the simplified two-phase signal cycle. */
export type SimPhase =
  | "main-green"
  | "main-yellow"
  | "all-red-to-side"
  | "side-green"
  | "side-yellow"
  | "all-red-to-main";

export type Road = "main" | "side";

/** Why the most recent green phase ended (the key teaching signal). */
export type GreenEndReason =
  | "gap-out" // no vehicle arrived within the gap time → ended early
  | "max-out" // vehicles kept coming but Max Green was reached
  | "side-call" // green was resting past Max Green and ended when a call arrived
  | "fixed-time" // the pre-set schedule expired (demand ignored)
  | "adaptive-plan"; // the green computed for this cycle was used up

export interface GreenEndEvent {
  road: Road;
  reason: GreenEndReason;
  /** Simulation time (s) when the green ended. */
  atTime: number;
}

export interface SimStats {
  /** Total cars that crossed the stop line. */
  served: number;
  /** Accumulated car-seconds of waiting (each waiting car adds 1 per tick). */
  totalWait: number;
  /** Cars currently queued across all four approaches. */
  waitingNow: number;
}

export interface SimState {
  /** Simulated seconds since start. */
  time: number;
  phase: SimPhase;
  /** Seconds spent in the current phase. */
  phaseElapsed: number;
  /** Seconds of green in the current/most recent green phase. */
  greenElapsed: number;
  /** Queued cars per approach. */
  queues: Record<ApproachId, number>;
  /** Detector call state per road (true = a vehicle is waiting and detected). */
  calls: { main: boolean; side: boolean };
  /** Seconds since a vehicle last arrived on each road (drives gap-out). */
  lastGap: { main: number; side: number };
  stats: SimStats;
  /** The most recent green-phase ending and why — for the explanation panel. */
  lastGreenEnd: GreenEndEvent | null;
  /** Green seconds the adaptive mode allocated for the current cycle. */
  adaptiveAllocation: { main: number; side: number } | null;
  /** Exponentially smoothed total waiting cars (stable wait-level readout). */
  smoothedWaiting: number;
  /** Decayed running count of recent arrivals per road (adaptive input). */
  recentArrivals: { main: number; side: number };
  /** Fractional departure progress per approach (1 car per 2 s of green). */
  departureCredit: Record<ApproachId, number>;
  /**
   * `phaseElapsed` at which the current side-road call registered during
   * the VA main green, or `null` while no call is active. Lets the engine
   * tell a true max-out (call waiting while demand extended green to the
   * cap) from a rested green answering a late call.
   */
  sideCallRegisteredAt: number | null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const MAIN_APPROACHES: ApproachId[] = ["east", "west"];
const SIDE_APPROACHES: ApproachId[] = ["north", "south"];

function roadOf(approach: ApproachId): Road {
  return approach === "east" || approach === "west" ? "main" : "side";
}

/** Total queued cars on one road. */
export function roadQueue(state: SimState, road: Road): number {
  const ids = road === "main" ? MAIN_APPROACHES : SIDE_APPROACHES;
  return ids.reduce((sum, id) => sum + state.queues[id], 0);
}

/**
 * Fixed-time green split: whatever is left of the cycle after the two
 * yellows and two all-reds is divided ≈ 60:40 between main and side.
 */
export function fixedGreenSplit(settings: SimulatorSettings): {
  main: number;
  side: number;
} {
  const lost = 2 * (YELLOW_TIME + ALL_RED_TIME);
  const available = Math.max(10, settings.cycleLength - lost);
  const main = Math.round(available * 0.6);
  return { main, side: available - main };
}

/**
 * Adaptive allocation for one cycle: split a green budget between main
 * and side in proportion to (current queue + recent arrivals), clamped
 * to [minGreen, maxGreen]. The budget is minGreen + maxGreen so an even
 * split lands mid-range. Simplified on purpose — for teaching only.
 */
export function computeAdaptiveAllocation(
  state: SimState,
  settings: SimulatorSettings
): { main: number; side: number } {
  const mainScore = roadQueue(state, "main") + state.recentArrivals.main;
  const sideScore = roadQueue(state, "side") + state.recentArrivals.side;
  const budget = settings.minGreen + settings.maxGreen;
  const clamp = (v: number) =>
    Math.min(settings.maxGreen, Math.max(settings.minGreen, Math.round(v)));
  const total = mainScore + sideScore;
  if (total <= 0) {
    // No information yet — fall back to a 60:40 default split.
    return { main: clamp(budget * 0.6), side: clamp(budget * 0.4) };
  }
  return {
    main: clamp((budget * mainScore) / total),
    side: clamp((budget * sideScore) / total),
  };
}

/** True when the mode actually reacts to detectors this tick. */
function usesDetectors(settings: SimulatorSettings): boolean {
  return settings.mode !== "fixed" && settings.detectorEnabled;
}

/* ------------------------------------------------------------------ */
/* State creation                                                      */
/* ------------------------------------------------------------------ */

export function createInitialState(settings: SimulatorSettings): SimState {
  const state: SimState = {
    time: 0,
    phase: "main-green",
    phaseElapsed: 0,
    greenElapsed: 0,
    queues: { north: 0, south: 0, east: 0, west: 0 },
    calls: { main: false, side: false },
    lastGap: { main: 99, side: 99 },
    stats: { served: 0, totalWait: 0, waitingNow: 0 },
    lastGreenEnd: null,
    adaptiveAllocation: null,
    smoothedWaiting: 0,
    recentArrivals: { main: 0, side: 0 },
    departureCredit: { north: 0, south: 0, east: 0, west: 0 },
    sideCallRegisteredAt: null,
  };
  if (settings.mode === "adaptive" && settings.detectorEnabled) {
    state.adaptiveAllocation = computeAdaptiveAllocation(state, settings);
  }
  return state;
}

/* ------------------------------------------------------------------ */
/* Tick — advance exactly one simulated second                         */
/* ------------------------------------------------------------------ */

export function tick(
  state: SimState,
  settings: SimulatorSettings,
  rng: () => number = Math.random
): SimState {
  // Shallow-clone every nested object we mutate (keeps tick pure).
  const next: SimState = {
    ...state,
    queues: { ...state.queues },
    calls: { ...state.calls },
    lastGap: { ...state.lastGap },
    stats: { ...state.stats },
    recentArrivals: { ...state.recentArrivals },
    departureCredit: { ...state.departureCredit },
    adaptiveAllocation: state.adaptiveAllocation
      ? { ...state.adaptiveAllocation }
      : null,
  };

  next.time += 1;
  next.phaseElapsed += 1;

  /* ---- 1. Stochastic arrivals ---------------------------------- */
  next.recentArrivals.main *= RECENT_ARRIVALS_DECAY;
  next.recentArrivals.side *= RECENT_ARRIVALS_DECAY;
  const arrived: Record<Road, boolean> = { main: false, side: false };
  const approaches: ApproachId[] = ["north", "south", "east", "west"];
  for (const approach of approaches) {
    const road = roadOf(approach);
    const demand = road === "main" ? settings.mainDemand : settings.sideDemand;
    if (rng() < ARRIVAL_RATE[demand]) {
      if (next.queues[approach] < MAX_QUEUE_PER_APPROACH) {
        next.queues[approach] += 1;
      }
      arrived[road] = true;
      next.recentArrivals[road] += 1;
    }
  }
  next.lastGap.main = arrived.main ? 0 : Math.min(99, next.lastGap.main + 1);
  next.lastGap.side = arrived.side ? 0 : Math.min(99, next.lastGap.side + 1);

  /* ---- 2. Departures (green only, after the all-red clearance) -- */
  const greenApproaches: ApproachId[] =
    next.phase === "main-green"
      ? MAIN_APPROACHES
      : next.phase === "side-green"
        ? SIDE_APPROACHES
        : [];
  for (const approach of approaches) {
    if (greenApproaches.includes(approach) && next.queues[approach] > 0) {
      next.departureCredit[approach] += 1 / SATURATION_HEADWAY;
      while (next.departureCredit[approach] >= 1 && next.queues[approach] > 0) {
        next.departureCredit[approach] -= 1;
        next.queues[approach] -= 1;
        next.stats.served += 1;
      }
    } else {
      // No banking of unused green — the credit only builds while a queue
      // is actually discharging.
      next.departureCredit[approach] = 0;
    }
  }

  /* ---- 3. Waiting statistics ------------------------------------ */
  next.stats.waitingNow =
    next.queues.north + next.queues.south + next.queues.east + next.queues.west;
  next.stats.totalWait += next.stats.waitingNow;
  next.smoothedWaiting =
    next.smoothedWaiting * (1 - WAIT_SMOOTHING) +
    next.stats.waitingNow * WAIT_SMOOTHING;

  /* ---- 4. Detector calls ---------------------------------------- */
  const detectorsOn = usesDetectors(settings);
  next.calls.main = detectorsOn && roadQueue(next, "main") > 0;
  next.calls.side = detectorsOn && roadQueue(next, "side") > 0;

  /* ---- 5. Phase logic ------------------------------------------- */
  advancePhase(next, settings);

  if (next.phase === "main-green" || next.phase === "side-green") {
    next.greenElapsed = next.phaseElapsed;
  }

  return next;
}

/** Mutates `next` in place (it is already a fresh clone). */
function advancePhase(next: SimState, settings: SimulatorSettings): void {
  const split = fixedGreenSplit(settings);
  const detectorsOn = usesDetectors(settings);

  switch (next.phase) {
    case "main-yellow":
      if (next.phaseElapsed >= YELLOW_TIME) {
        enterPhase(next, "all-red-to-side");
      }
      break;

    case "all-red-to-side":
      if (next.phaseElapsed >= ALL_RED_TIME) {
        enterPhase(next, "side-green");
        next.greenElapsed = 0;
      }
      break;

    case "side-yellow":
      if (next.phaseElapsed >= YELLOW_TIME) {
        enterPhase(next, "all-red-to-main");
      }
      break;

    case "all-red-to-main":
      if (next.phaseElapsed >= ALL_RED_TIME) {
        enterPhase(next, "main-green");
        next.greenElapsed = 0;
        next.sideCallRegisteredAt = null;
        // A new cycle starts: adaptive mode re-plans its green split now.
        if (settings.mode === "adaptive" && settings.detectorEnabled) {
          next.adaptiveAllocation = computeAdaptiveAllocation(next, settings);
        }
      }
      break;

    case "main-green": {
      const end = mainGreenEnd(next, settings, split, detectorsOn);
      if (end) {
        next.lastGreenEnd = { road: "main", reason: end, atTime: next.time };
        enterPhase(next, "main-yellow");
      }
      break;
    }

    case "side-green": {
      const end = sideGreenEnd(next, settings, split, detectorsOn);
      if (end) {
        next.lastGreenEnd = { road: "side", reason: end, atTime: next.time };
        enterPhase(next, "side-yellow");
      }
      break;
    }
  }
}

function enterPhase(next: SimState, phase: SimPhase): void {
  next.phase = phase;
  next.phaseElapsed = 0;
}

/** Decide whether (and why) the main-road green ends this second. */
function mainGreenEnd(
  next: SimState,
  settings: SimulatorSettings,
  split: { main: number; side: number },
  detectorsOn: boolean
): GreenEndReason | null {
  // Fixed mode — or VA/Adaptive with detectors switched off — follows the
  // pre-set schedule and completely ignores demand (the teachable moment).
  if (settings.mode === "fixed" || !detectorsOn) {
    return next.phaseElapsed >= split.main ? "fixed-time" : null;
  }

  if (settings.mode === "va") {
    // Main green is the RESTING phase: with no side-road call it never ends.
    if (!next.calls.side) {
      next.sideCallRegisteredAt = null;
      return null;
    }
    // Remember when this call first registered (during main green the side
    // queue can only grow, so the call stays active until the phase ends).
    if (next.sideCallRegisteredAt === null) {
      next.sideCallRegisteredAt = next.phaseElapsed;
    }
    if (next.phaseElapsed < settings.minGreen) return null;
    if (next.phaseElapsed >= settings.maxGreen) {
      // If the call only arrived at/after the Max Green mark, the green was
      // RESTING (not being extended by demand) — ending now is a response
      // to the vehicle call, not a max-out.
      return next.sideCallRegisteredAt >= settings.maxGreen
        ? "side-call"
        : "max-out";
    }
    if (next.lastGap.main >= settings.gapTime) return "gap-out";
    return null;
  }

  // Adaptive: follow this cycle's plan, but allow an early gap-out when the
  // main road runs empty while the side road is waiting.
  const alloc =
    next.adaptiveAllocation ?? computeAdaptiveAllocation(next, settings);
  next.adaptiveAllocation = alloc;
  if (next.phaseElapsed >= Math.max(settings.minGreen, alloc.main)) {
    return "adaptive-plan";
  }
  if (
    next.phaseElapsed >= settings.minGreen &&
    next.calls.side &&
    roadQueue(next, "main") === 0 &&
    next.lastGap.main >= settings.gapTime
  ) {
    return "gap-out";
  }
  return null;
}

/** Decide whether (and why) the side-road green ends this second. */
function sideGreenEnd(
  next: SimState,
  settings: SimulatorSettings,
  split: { main: number; side: number },
  detectorsOn: boolean
): GreenEndReason | null {
  if (settings.mode === "fixed" || !detectorsOn) {
    return next.phaseElapsed >= split.side ? "fixed-time" : null;
  }

  if (settings.mode === "va") {
    // Serve at least Min Green, then extend by the gap time per arriving
    // vehicle until either the gap runs dry (gap-out) or Max Green (max-out).
    if (next.phaseElapsed < settings.minGreen) return null;
    if (next.phaseElapsed >= settings.maxGreen) return "max-out";
    if (next.lastGap.side >= settings.gapTime) return "gap-out";
    return null;
  }

  const alloc =
    next.adaptiveAllocation ?? computeAdaptiveAllocation(next, settings);
  next.adaptiveAllocation = alloc;
  if (next.phaseElapsed >= Math.max(settings.minGreen, alloc.side)) {
    return "adaptive-plan";
  }
  if (
    next.phaseElapsed >= settings.minGreen &&
    roadQueue(next, "side") === 0 &&
    next.lastGap.side >= settings.gapTime
  ) {
    return "gap-out";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Derived values for the UI                                           */
/* ------------------------------------------------------------------ */

/** Signal color per approach for the current phase. */
export function signalsForPhase(phase: SimPhase): Record<ApproachId, LightColor> {
  const main: LightColor =
    phase === "main-green" ? "green" : phase === "main-yellow" ? "yellow" : "red";
  const side: LightColor =
    phase === "side-green" ? "green" : phase === "side-yellow" ? "yellow" : "red";
  return { east: main, west: main, north: side, south: side };
}

/**
 * Seconds remaining in the current phase, or `null` when the end is not
 * predetermined (e.g. VA resting on main green with no side-road call).
 * For VA greens with an active call this is the time to MAX-OUT — a
 * gap-out can end the phase earlier.
 */
export function phaseRemaining(
  state: SimState,
  settings: SimulatorSettings
): number | null {
  const split = fixedGreenSplit(settings);
  const detectorsOn = usesDetectors(settings);
  const left = (target: number) => Math.max(0, target - state.phaseElapsed);

  switch (state.phase) {
    case "main-yellow":
    case "side-yellow":
      return left(YELLOW_TIME);
    case "all-red-to-side":
    case "all-red-to-main":
      return left(ALL_RED_TIME);
    case "main-green":
      if (settings.mode === "fixed" || !detectorsOn) return left(split.main);
      if (settings.mode === "adaptive") {
        return left(
          Math.max(settings.minGreen, state.adaptiveAllocation?.main ?? split.main)
        );
      }
      return state.calls.side ? left(settings.maxGreen) : null;
    case "side-green":
      if (settings.mode === "fixed" || !detectorsOn) return left(split.side);
      if (settings.mode === "adaptive") {
        return left(
          Math.max(settings.minGreen, state.adaptiveAllocation?.side ?? split.side)
        );
      }
      return left(settings.maxGreen);
  }
}

/* ------------------------------------------------------------------ */
/* computeOutputs — the teaching readouts                              */
/* ------------------------------------------------------------------ */

export type WaitLevel = "low" | "medium" | "high";

export interface SimOutputs {
  waitLevel: WaitLevel;
  suggestedSystem: { id: SystemId; reason: Bi };
  /** What the controller is doing RIGHT NOW, in plain bilingual language. */
  explanation: Bi;
}

const ROAD_LABEL: Record<Road, Bi> = {
  main: { th: "ถนนหลัก (E–W)", en: "the main road (E–W)" },
  side: { th: "ถนนรอง (N–S)", en: "the side road (N–S)" },
};

export function computeOutputs(
  state: SimState,
  settings: SimulatorSettings
): SimOutputs {
  /* Wait level from the smoothed average queue per approach. */
  const avgQueue = state.smoothedWaiting / 4;
  const waitLevel: WaitLevel =
    avgQueue < 2 ? "low" : avgQueue < 4.5 ? "medium" : "high";

  return {
    waitLevel,
    suggestedSystem: suggestSystem(settings),
    explanation: explainNow(state, settings),
  };
}

/** Rule-based system suggestion for the CURRENT settings (teaching rule). */
function suggestSystem(settings: SimulatorSettings): {
  id: SystemId;
  reason: Bi;
} {
  const { mainDemand, sideDemand, detectorEnabled } = settings;

  if (!detectorEnabled) {
    return {
      id: "fixed-time",
      reason: {
        th: "ไม่มีอุปกรณ์ตรวจจับรถ (Detector) ระบบที่ทำงานได้จริงคือ Fixed Time — เหมาะเมื่อปริมาณรถคาดการณ์ได้ล่วงหน้า",
        en: "With no detectors, Fixed Time is the only workable option — best when demand is predictable.",
      },
    };
  }
  if (mainDemand === "high" && sideDemand === "medium") {
    return {
      id: "adaptive",
      reason: {
        th: "ทั้งสองถนนมีรถมากและไม่เท่ากัน ระบบ Adaptive แบ่งเวลาเขียว (Green Time) ใหม่ตามแถวรถจริงได้ทุก ๆ รอบ",
        en: "Both roads are busy and uneven — Adaptive re-balances green time from measured queues every cycle.",
      },
    };
  }
  if (mainDemand !== sideDemand) {
    return {
      id: "vehicle-actuated",
      reason: {
        th: "ปริมาณรถสองถนนต่างกัน ระบบ VA ให้ไฟเขียวถนนรองเฉพาะเมื่ออุปกรณ์ตรวจจับพบรถจริง",
        en: "Demand differs between the two roads — VA serves the side road only when detectors see real vehicles.",
      },
    };
  }
  if (mainDemand === "low") {
    return {
      id: "vehicle-actuated",
      reason: {
        th: "รถน้อยทั้งสองถนน ระบบ VA ช่วยข้ามไฟเขียวที่ไม่มีรถ ลดการรอโดยไม่จำเป็น",
        en: "Light traffic on both roads — VA skips empty greens and cuts unnecessary waiting.",
      },
    };
  }
  if (mainDemand === "high") {
    return {
      id: "adaptive",
      reason: {
        th: "รถหนาแน่นทั้งสองถนน ระบบ Adaptive ปรับสัดส่วนเวลาเขียวตามแถวรถที่วัดได้ต่อเนื่อง",
        en: "Heavy demand on both roads — Adaptive keeps re-tuning the green split from measured queues.",
      },
    };
  }
  return {
    id: "fixed-time",
    reason: {
      th: "ปริมาณรถปานกลางและสม่ำเสมอทั้งสองถนน Fixed Time ที่ตั้งเวลาไว้ดีก็เพียงพอ",
      en: "Moderate, steady demand on both roads — a well-timed Fixed Time plan is enough.",
    },
  };
}

/** Live explanation of what the controller just did / is doing. */
function explainNow(state: SimState, settings: SimulatorSettings): Bi {
  const split = fixedGreenSplit(settings);
  const detectorsOn = usesDetectors(settings);

  // A green phase ended within the last ~6 s (covers yellow + all-red):
  // explain WHY it ended — this is the most valuable teaching moment.
  const end = state.lastGreenEnd;
  if (end && state.time - end.atTime <= YELLOW_TIME + ALL_RED_TIME + 1) {
    const road = ROAD_LABEL[end.road];
    switch (end.reason) {
      case "gap-out":
        return {
          th: `ไฟเขียว${road.th}จบก่อนเวลา (gap-out) เพราะไม่มีรถมาเพิ่มภายใน ${settings.gapTime} วินาที`,
          en: `Green on ${road.en} ended early (gap-out) — no vehicle arrived within the ${settings.gapTime}-second gap time.`,
        };
      case "max-out":
        return {
          th: `ไฟเขียว${road.th}ถูกตัดที่เพดานสูงสุด (max-out) ${settings.maxGreen} วินาที แม้ยังมีรถมาต่อเนื่อง เพื่อไม่ให้อีกฝั่งรอนานเกินไป`,
          en: `Green on ${road.en} hit the ${settings.maxGreen}-second Max Green (max-out) even though vehicles kept arriving — so the other road never waits forever.`,
        };
      case "side-call":
        return {
          th: `ไฟเขียว${road.th}ค้างรออยู่ (resting) และสิ้นสุดทันทีที่อุปกรณ์ตรวจจับพบรถบนถนนรอง (vehicle call) — ไม่ใช่การชนเพดาน Max Green`,
          en: `Green on ${road.en} had been resting and ended the moment detectors registered a side-road vehicle call — it did not hit Max Green.`,
        };
      case "fixed-time":
        return {
          th: `ไฟเขียว${road.th}จบตามตารางเวลาที่ตั้งไว้ ไม่ว่าจะมีรถมากหรือน้อย`,
          en: `Green on ${road.en} ended on schedule — regardless of how many vehicles were there.`,
        };
      case "adaptive-plan":
        return {
          th: `ไฟเขียว${road.th}จบตามแผนที่ระบบ Adaptive คำนวณจากแถวรถของรอบนี้`,
          en: `Green on ${road.en} ended per the plan Adaptive computed from this cycle's queues.`,
        };
    }
  }

  // Otherwise, describe the current behavior.
  if (settings.mode === "fixed") {
    return {
      th: `ระบบนับเวลาตามตาราง: เขียวถนนหลัก ${split.main} วินาที / ถนนรอง ${split.side} วินาที ทุก ๆ รอบ โดยไม่ดูปริมาณรถเลย`,
      en: `The controller follows its schedule: ${split.main} s main-road green / ${split.side} s side-road green every cycle — demand is never checked.`,
    };
  }
  if (!detectorsOn) {
    return {
      th: "อุปกรณ์ตรวจจับรถ (Detector) ปิดอยู่ ระบบจึงมองไม่เห็นรถและทำงานเหมือน Fixed Time — ลองเปิดอุปกรณ์ตรวจจับเพื่อเห็นความแตกต่าง",
      en: "Detectors are OFF, so the controller cannot see any vehicles and behaves exactly like Fixed Time — switch detectors on to see the difference.",
    };
  }
  if (settings.mode === "va") {
    if (state.phase === "main-green" && !state.calls.side) {
      return {
        th: "ไฟเขียวค้างที่ถนนหลัก (resting phase) เพราะอุปกรณ์ตรวจจับยังไม่พบรถบนถนนรอง — ไม่มีรถ ก็ไม่ต้องสลับไฟ",
        en: "Green is resting on the main road because detectors see no side-road vehicles — no call, no switch.",
      };
    }
    if (state.phase === "main-green") {
      return {
        th: `อุปกรณ์ตรวจจับพบรถบนถนนรอง (vehicle call) ระบบกำลังรอช่องว่าง ${settings.gapTime} วินาที (gap-out) หรือครบ Max Green ${settings.maxGreen} วินาที จึงจะสลับเฟส`,
        en: `A side-road vehicle call is registered — the controller is waiting for a ${settings.gapTime}-second gap (gap-out) or the ${settings.maxGreen}-second Max Green before switching.`,
      };
    }
    if (state.phase === "side-green") {
      return {
        th: `ไฟเขียวถนนรองต่อเวลา (extend) ตามรถที่มาถึงทีละคัน สูงสุดไม่เกิน Max Green ${settings.maxGreen} วินาที`,
        en: `Side-road green extends with each arriving vehicle, capped at the ${settings.maxGreen}-second Max Green.`,
      };
    }
    return {
      th: "ช่วงเปลี่ยนเฟส: ไฟเหลือง 3 วินาที และแดงทุกทิศ (All-Red) 2 วินาที เพื่อเคลียร์ทางแยกอย่างปลอดภัย",
      en: "Phase change in progress: 3 s yellow then 2 s all-red to clear the intersection safely.",
    };
  }
  // Adaptive with detectors on.
  const alloc = state.adaptiveAllocation;
  if (alloc) {
    return {
      th: `รอบนี้ระบบ Adaptive แบ่งเวลาเขียวตามแถวรถที่วัดได้: ถนนหลัก ${alloc.main} วินาที / ถนนรอง ${alloc.side} วินาที และจะคำนวณใหม่ในรอบถัดไป`,
      en: `This cycle, Adaptive allocated green from measured queues: ${alloc.main} s main / ${alloc.side} s side — it will re-plan next cycle.`,
    };
  }
  return {
    th: "ระบบ Adaptive กำลังรวบรวมข้อมูลแถวรถจากอุปกรณ์ตรวจจับ เพื่อคำนวณสัดส่วนเวลาเขียวของรอบถัดไป",
    en: "Adaptive is collecting queue data from the detectors to compute the next cycle's green split.",
  };
}
