"use client";

/**
 * Props-driven settings panel for the educational simulator.
 *
 * Everything here edits `SimulatorSettings` via `onChange(patch)` — the
 * parent owns the state. Controls that a mode does not use are disabled
 * with a short bilingual hint so learners understand WHY (e.g. Fixed Time
 * has no detectors). The panel also guards min-green < max-green.
 */

import { useId, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { simulatorScenarios } from "@/data/simulatorScenarios";
import type {
  Bi,
  DemandLevel,
  SimulatorMode,
  SimulatorScenario,
  SimulatorSettings,
} from "@/lib/types";

export interface SimulatorControlPanelProps {
  settings: SimulatorSettings;
  /** Merge a partial update into the settings (parent owns the state). */
  onChange: (patch: Partial<SimulatorSettings>) => void;
  /** Apply a preset scenario (parent replaces all settings + resets sim). */
  onApplyScenario: (scenario: SimulatorScenario) => void;
  activeScenarioId?: string | null;
  className?: string;
}

const MODES: Array<{ id: SimulatorMode; label: Bi }> = [
  { id: "fixed", label: { th: "Fixed Time", en: "Fixed Time" } },
  { id: "va", label: { th: "VA", en: "VA" } },
  { id: "adaptive", label: { th: "Adaptive", en: "Adaptive" } },
];

const DEMAND_OPTIONS: Array<{ id: DemandLevel; label: Bi }> = [
  { id: "low", label: { th: "น้อย (Low)", en: "Low" } },
  { id: "medium", label: { th: "ปานกลาง (Medium)", en: "Medium" } },
  { id: "high", label: { th: "มาก (High)", en: "High" } },
];

function FieldHint({ children }: { children: string }) {
  return <p className="mt-1.5 text-xs leading-snug text-navy-500">{children}</p>;
}

/** Labelled range slider with a live value readout in seconds. */
function SliderField({
  label,
  value,
  min,
  max,
  disabled,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  /** Shown when the control is disabled (why it does not apply). */
  hint?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const { t } = useLanguage();
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-navy-800">
          {label}
        </label>
        <span className="font-mono text-sm font-bold tabular-nums text-navy-900">
          {value}{" "}
          <span className="text-xs font-medium text-navy-500">
            {t({ th: "วินาที", en: "s" })}
          </span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-accent-600 disabled:cursor-not-allowed"
      />
      {disabled && hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

export function SimulatorControlPanel({
  settings,
  onChange,
  onApplyScenario,
  activeScenarioId = null,
  className = "",
}: SimulatorControlPanelProps) {
  const { t } = useLanguage();
  const mainDemandId = useId();
  const sideDemandId = useId();
  const detectorLabelId = useId();
  const [greenClampHint, setGreenClampHint] = useState(false);

  const isFixed = settings.mode === "fixed";
  const activeScenario =
    simulatorScenarios.find((s) => s.id === activeScenarioId) ?? null;

  /** Keep minGreen strictly below maxGreen (clamp + show a hint). */
  const setMinGreen = (value: number) => {
    if (value >= settings.maxGreen) {
      setGreenClampHint(true);
      onChange({ minGreen: settings.maxGreen - 1 });
    } else {
      setGreenClampHint(false);
      onChange({ minGreen: value });
    }
  };
  const setMaxGreen = (value: number) => {
    if (value <= settings.minGreen) {
      setGreenClampHint(true);
      onChange({ maxGreen: settings.minGreen + 1 });
    } else {
      setGreenClampHint(false);
      onChange({ maxGreen: value });
    }
  };

  const selectClasses =
    "mt-1.5 block min-h-11 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-accent-500";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ---- Scenario presets ---------------------------------- */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">
          {t({ th: "สถานการณ์ตัวอย่าง (Scenario)", en: "Preset scenarios" })}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {simulatorScenarios.map((scenario) => {
            const active = scenario.id === activeScenarioId;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onApplyScenario(scenario)}
                aria-pressed={active}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                  active
                    ? "border-accent-500 bg-accent-50 text-navy-900 ring-2 ring-cyan-500/20"
                    : "border-navy-200 bg-white text-navy-700 hover:border-navy-400"
                }`}
              >
                {t(scenario.name)}
              </button>
            );
          })}
        </div>
        {activeScenario && (
          <p className="mt-2 rounded-xl bg-accent-50 p-3 text-xs leading-relaxed text-navy-700">
            <span className="font-semibold text-navy-900">
              {t({ th: "บทเรียนจากสถานการณ์นี้: ", en: "Lesson: " })}
            </span>
            {t(activeScenario.lesson)}
          </p>
        )}
      </fieldset>

      {/* ---- Control mode --------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">
          {t({ th: "โหมดควบคุม (Control mode)", en: "Control mode" })}
        </legend>
        <div
          role="group"
          aria-label={t({ th: "เลือกโหมดควบคุม", en: "Choose control mode" })}
          className="mt-2 grid grid-cols-3 overflow-hidden rounded-xl border border-navy-200"
        >
          {MODES.map((mode) => {
            const active = settings.mode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange({ mode: mode.id })}
                aria-pressed={active}
                className={`min-h-11 px-2 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-navy-800 text-white"
                    : "bg-white text-navy-700 hover:bg-navy-50"
                }`}
              >
                {t(mode.label)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ---- Demand ---------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">
          {t({ th: "ปริมาณรถ (Demand)", en: "Traffic demand" })}
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={mainDemandId} className="text-sm font-medium text-navy-800">
              {t({ th: "ถนนหลัก (E–W)", en: "Main road (E–W)" })}
            </label>
            <select
              id={mainDemandId}
              value={settings.mainDemand}
              onChange={(e) =>
                onChange({ mainDemand: e.target.value as DemandLevel })
              }
              className={selectClasses}
            >
              {DEMAND_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={sideDemandId} className="text-sm font-medium text-navy-800">
              {t({ th: "ถนนรอง (N–S)", en: "Side road (N–S)" })}
            </label>
            <select
              id={sideDemandId}
              value={settings.sideDemand}
              onChange={(e) =>
                onChange({ sideDemand: e.target.value as DemandLevel })
              }
              className={selectClasses}
            >
              {DEMAND_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- Detector toggle ------------------------------------- */}
      <div className={isFixed ? "opacity-50" : ""}>
        <div className="flex items-center justify-between gap-3">
          <span id={detectorLabelId} className="text-sm font-semibold text-navy-900">
            {t({ th: "ตัวตรวจจับ (Detector)", en: "Detectors" })}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.detectorEnabled}
            aria-labelledby={detectorLabelId}
            disabled={isFixed}
            onClick={() => onChange({ detectorEnabled: !settings.detectorEnabled })}
            className={`relative inline-flex h-11 w-24 items-center rounded-full border transition-colors disabled:cursor-not-allowed ${
              settings.detectorEnabled
                ? "border-accent-500 bg-accent-500"
                : "border-navy-300 bg-navy-100"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1 h-9 w-9 rounded-full bg-white shadow transition-all ${
                settings.detectorEnabled ? "left-[calc(100%-2.5rem)]" : "left-1"
              }`}
            />
            <span
              aria-hidden="true"
              className={`w-full text-xs font-bold ${
                settings.detectorEnabled
                  ? "pr-10 text-right text-navy-950"
                  : "pl-10 text-left text-navy-500"
              }`}
            >
              {settings.detectorEnabled
                ? t({ th: "เปิด", en: "ON" })
                : t({ th: "ปิด", en: "OFF" })}
            </span>
          </button>
        </div>
        {isFixed && (
          <FieldHint>
            {t({
              th: "Fixed Time ไม่ใช้ตัวตรวจจับ — ระบบนับเวลาตามตารางเท่านั้น",
              en: "Fixed Time does not use detectors — it only follows its schedule.",
            })}
          </FieldHint>
        )}
        {!isFixed && !settings.detectorEnabled && (
          <FieldHint>
            {t({
              th: "เมื่อปิดตัวตรวจจับ ระบบ VA/Adaptive จะมองไม่เห็นรถ และทำงานเหมือน Fixed Time",
              en: "With detectors off, VA/Adaptive cannot see vehicles and behaves like Fixed Time.",
            })}
          </FieldHint>
        )}
      </div>

      {/* ---- Timing sliders --------------------------------------- */}
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold text-navy-900">
          {t({ th: "ตั้งค่าเวลา (Timing)", en: "Timing parameters" })}
        </legend>

        <SliderField
          label={t({ th: "รอบสัญญาณไฟ (Cycle Length)", en: "Cycle length" })}
          value={settings.cycleLength}
          min={40}
          max={120}
          disabled={!isFixed}
          hint={t({
            th: "ใช้เฉพาะโหมด Fixed Time — โหมด VA/Adaptive ปรับรอบเองตามรถ",
            en: "Fixed Time only — VA/Adaptive set their own cycle from traffic.",
          })}
          onChange={(v) => onChange({ cycleLength: v })}
        />

        <SliderField
          label={t({ th: "เวลาเขียวต่ำสุด (Min Green)", en: "Min green" })}
          value={settings.minGreen}
          min={5}
          max={20}
          disabled={isFixed}
          hint={t({
            th: "ใช้ในโหมด VA/Adaptive — Fixed Time ใช้ตารางเวลาคงที่",
            en: "Used by VA/Adaptive — Fixed Time follows its schedule.",
          })}
          onChange={setMinGreen}
        />

        <SliderField
          label={t({ th: "เวลาเขียวสูงสุด (Max Green)", en: "Max green" })}
          value={settings.maxGreen}
          min={20}
          max={60}
          disabled={isFixed}
          hint={t({
            th: "ใช้ในโหมด VA/Adaptive — Fixed Time ใช้ตารางเวลาคงที่",
            en: "Used by VA/Adaptive — Fixed Time follows its schedule.",
          })}
          onChange={setMaxGreen}
        />

        <SliderField
          label={t({ th: "ช่องว่างระหว่างรถ (Gap Time)", en: "Gap time" })}
          value={settings.gapTime}
          min={1}
          max={6}
          disabled={isFixed}
          hint={t({
            th: "Fixed Time ไม่ใช้ตัวตรวจจับ จึงไม่มีการต่อเวลาตามช่องว่าง (Gap)",
            en: "Fixed Time has no detectors, so gap-based extension does not apply.",
          })}
          onChange={(v) => onChange({ gapTime: v })}
        />

        {greenClampHint && !isFixed && (
          <p
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-snug text-navy-800"
          >
            {t({
              th: "Min Green ต้องน้อยกว่า Max Green เสมอ — ระบบปรับค่าให้อัตโนมัติ",
              en: "Min Green must stay below Max Green — the value was adjusted automatically.",
            })}
          </p>
        )}
      </fieldset>
    </div>
  );
}
