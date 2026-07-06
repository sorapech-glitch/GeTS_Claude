"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { systemsById } from "@/data/systems";
import { ACCENT_STYLES, Badge, Callout } from "@/components/ui";
import type { Bi, SystemId } from "@/lib/types";

/**
 * "Which system should you choose?" — a visual decision flow.
 * One starting question (how much does traffic vary?) fans out into
 * three condition branches, each ending in a clickable outcome card
 * that links to the matching learning module. System names, routes,
 * accents, and taglines come from `src/data/systems.ts`.
 */

interface Branch {
  systemId: SystemId;
  condition: Bi;
  conditionDetail: Bi;
}

const BRANCHES: Branch[] = [
  {
    systemId: "fixed-time",
    condition: {
      th: "จราจรผันผวนน้อย (Low Variation)",
      en: "Low traffic variation",
    },
    conditionDetail: {
      th: "ปริมาณรถค่อนข้างคงที่ รูปแบบจราจรซ้ำเดิมทุกวัน คาดเดาได้",
      en: "Volumes are fairly steady and the daily pattern repeats predictably.",
    },
  },
  {
    systemId: "vehicle-actuated",
    condition: {
      th: "ผันผวนปานกลาง (Medium) + ติดตั้ง Detector ได้",
      en: "Medium variation + detectors available",
    },
    conditionDetail: {
      th: "ปริมาณรถขึ้นลงระหว่างวัน และสามารถติดตั้งพร้อมดูแลอุปกรณ์ตรวจจับรถ (Detector) ได้",
      en: "Demand fluctuates through the day, and vehicle detectors can be installed and maintained.",
    },
  },
  {
    systemId: "adaptive",
    condition: {
      th: "ผันผวนสูง (High) / ทั้งเส้นทางหรือโครงข่าย",
      en: "High variation / corridor or network",
    },
    conditionDetail: {
      th: "จราจรเปลี่ยนแปลงมากและคาดเดายาก หรือต้องประสานหลายแยกต่อเนื่องกัน (Corridor / Network)",
      en: "Traffic shifts a lot and is hard to predict, or several junctions must be coordinated as a corridor or network.",
    },
  },
];

function ArrowDownIcon() {
  return (
    <svg
      width="20"
      height="30"
      viewBox="0 0 20 30"
      fill="none"
      aria-hidden="true"
      className="mx-auto my-1.5 shrink-0 text-navy-400"
    >
      <path
        d="M10 2v22m0 0-6-6m6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="transition-transform group-hover:translate-x-0.5"
    >
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

export function DecisionGuide({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      {/* Start node */}
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-navy-300 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600">
          {t({ th: "จุดเริ่มต้น", en: "Start here" })}
        </p>
        <p className="mt-1.5 text-lg font-bold text-navy-900">
          {t({
            th: "จราจรที่แยกของคุณผันผวนแค่ไหน? (Traffic Variation)",
            en: "How much does traffic at your junction vary?",
          })}
        </p>
      </div>

      {/* Fan-out connector — desktop only, purely decorative */}
      <svg
        aria-hidden="true"
        viewBox="0 0 600 48"
        preserveAspectRatio="none"
        className="hidden h-12 w-full text-navy-300 md:block"
      >
        {["M300 2 100 46", "M300 2v44", "M300 2 500 46"].map((d) => (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Mobile connector */}
      <div className="md:hidden">
        <ArrowDownIcon />
      </div>

      {/* Three branches */}
      <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
        {BRANCHES.map((branch) => {
          const sys = systemsById[branch.systemId];
          const accent = ACCENT_STYLES[sys.accent];
          return (
            <li key={branch.systemId} className="flex h-full flex-col">
              {/* Condition */}
              <div className="flex-1 rounded-2xl border border-navy-200 bg-white p-5 text-center shadow-sm">
                <Badge tone="neutral">{t({ th: "ถ้า (If)", en: "If" })}</Badge>
                <p className="mt-3 font-bold text-navy-900">{t(branch.condition)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">
                  {t(branch.conditionDetail)}
                </p>
              </div>

              <ArrowDownIcon />

              {/* Outcome — clickable card linking to the module */}
              <Link
                href={sys.href}
                className={`group block rounded-2xl border-2 ${accent.border} ${accent.softBg} p-5 shadow-sm transition-shadow hover:shadow-md`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-500">
                  {t({ th: "ระบบที่เหมาะสม", en: "Suggested system" })}
                </p>
                <h3 className={`mt-1.5 text-xl font-bold leading-snug ${accent.text}`}>
                  {t(sys.name)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {t(sys.tagline)}
                </p>
                <span className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-navy-900">
                  {t({ th: "ไปที่บทเรียน", en: "Open the module" })}
                  <ArrowRightIcon />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Real projects mix systems */}
      <Callout
        variant="info"
        title={t({
          th: "โครงการจริงมักผสมหลายระบบและอัปเกรดทีละขั้น",
          en: "Real projects often mix systems and upgrade over time",
        })}
        className="mt-10"
      >
        <p>
          {t({
            th: "ไม่จำเป็นต้องเลือกระบบเดียวสำหรับทุกแยก หลายเมืองเริ่มจาก Fixed Time ก่อน แล้วติดตั้ง Detector เพิ่มเพื่ออัปเกรดเป็น VA ที่แยกที่จราจรผันผวน และขยายเป็น Adaptive เฉพาะเส้นทางหลักเมื่อมีงบประมาณ บุคลากร และการบำรุงรักษาที่พร้อม",
            en: "You do not need one system for every junction. Many cities start with Fixed Time, add detectors to upgrade busy junctions to VA, and expand to Adaptive only on major corridors once the budget, staff, and maintenance capability are in place.",
          })}
        </p>
      </Callout>
    </div>
  );
}
