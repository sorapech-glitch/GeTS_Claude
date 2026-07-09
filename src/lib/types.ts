/**
 * Shared types for the Traffic Signal Learning Center.
 * All user-facing text is bilingual via the `Bi` type (Thai primary, English secondary).
 */

/** Bilingual string: Thai is the primary language, English the secondary. */
export interface Bi {
  th: string;
  en: string;
}

export type SystemId = "fixed-time" | "vehicle-actuated" | "adaptive";

/** Visual accent used to theme each system consistently across the site. */
export type SystemAccent = "blue" | "cyan" | "violet";

export interface KeyTerm {
  /** English term, e.g. "Cycle Time" */
  term: string;
  /** Thai translation, e.g. "รอบสัญญาณไฟ" */
  th: string;
  description: Bi;
}

export interface SystemComparisonRow {
  howItWorks: Bi;
  equipment: Bi;
  bestFor: Bi;
  strength: Bi;
  limitation: Bi;
  exampleUseCase: Bi;
}

export interface TrafficSystem {
  id: SystemId;
  /** Route of the learning module, e.g. "/fixed-time" */
  href: string;
  name: Bi;
  shortName: Bi;
  tagline: Bi;
  /** Answer to "What is …?" — 2–4 sentences, beginner friendly. */
  definition: Bi;
  /** The everyday analogy, e.g. "Fixed Time เหมือนนาฬิกาปลุก…" */
  analogy: Bi;
  /** The concrete real-world example for this system. */
  example: Bi;
  /** Ordered how-it-works steps (3–6 items). */
  howItWorks: Bi[];
  keyTerms: KeyTerm[];
  advantages: Bi[];
  limitations: Bi[];
  bestUseCases: Bi[];
  comparison: SystemComparisonRow;
  accent: SystemAccent;
}

export type GlossaryCategory =
  | "timing"
  | "detection"
  | "performance"
  | "coordination";

export interface GlossaryTerm {
  id: string;
  /** English term, e.g. "Gap Time" */
  en: string;
  /** Thai translation */
  th: string;
  /** Simple explanation, 1–3 sentences. */
  explanation: Bi;
  /** Small concrete example. */
  example: Bi;
  category: GlossaryCategory;
}

export interface QuizChoice {
  id: string;
  text: Bi;
}

export interface QuizQuestion {
  id: string;
  question: Bi;
  choices: QuizChoice[];
  correctChoiceId: string;
  /** Shown after answering — explains why the correct answer is correct. */
  explanation: Bi;
  relatedSystem?: SystemId;
}

/* ------------------------------------------------------------------ */
/* Simulator                                                           */
/* ------------------------------------------------------------------ */

export type DemandLevel = "low" | "medium" | "high";

export type SimulatorMode = "fixed" | "va" | "adaptive";

export interface SimulatorSettings {
  mode: SimulatorMode;
  mainDemand: DemandLevel;
  sideDemand: DemandLevel;
  /** Whether detectors are active (VA / Adaptive only make sense with detectors). */
  detectorEnabled: boolean;
  /** Total cycle length in seconds (Fixed Time). */
  cycleLength: number;
  /** Minimum green in seconds. */
  minGreen: number;
  /** Maximum green in seconds. */
  maxGreen: number;
  /** Gap time (unit extension) in seconds. */
  gapTime: number;
}

export interface SimulatorScenario {
  id: string;
  name: Bi;
  description: Bi;
  settings: SimulatorSettings;
  /** The teaching point this scenario demonstrates. */
  lesson: Bi;
}

/* ------------------------------------------------------------------ */
/* Signal visuals                                                      */
/* ------------------------------------------------------------------ */

export type LightColor = "green" | "yellow" | "red";

export type ApproachId = "north" | "south" | "east" | "west";

export interface ApproachState {
  signal: LightColor;
  /** Number of queued cars to draw (clamped to 0–8). */
  queue?: number;
  /** Highlight the detector zone (a vehicle is being detected). */
  detectorActive?: boolean;
}
