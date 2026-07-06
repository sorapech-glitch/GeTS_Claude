"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";
import { systems } from "@/data/systems";
import type { Bi, SystemId } from "@/lib/types";
import {
  ACCENT_STYLES,
  Badge,
  ButtonLink,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { SystemComparisonTable } from "@/components/SystemComparisonTable";
import { DecisionGuide } from "@/components/DecisionGuide";

/* ------------------------------------------------------------------ */
/* Small inline icons (decorative)                                     */
/* ------------------------------------------------------------------ */

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SensorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="16" r="2.2" fill="currentColor" />
      <path
        d="M8 11a5.7 5.7 0 0 1 8 0m-11-3.5a10 10 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="19" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.6 10.4 10.4 6.6m3.2 0 3.8 3.8m-10.8 3.2 3.8 3.8m3.2 0 3.8-3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

/** One-word essence per system for the hero visual (page-specific prose). */
const HERO_ESSENCE: Record<SystemId, { icon: ReactNode; text: Bi }> = {
  "fixed-time": {
    icon: <ClockIcon />,
    text: {
      th: "ทำงานตามตารางเวลาที่ตั้งไว้",
      en: "Runs on a pre-set schedule",
    },
  },
  "vehicle-actuated": {
    icon: <SensorIcon />,
    text: {
      th: "ปรับไฟเขียวตามรถที่ตรวจจับได้จริง",
      en: "Adjusts green to detected vehicles",
    },
  },
  adaptive: {
    icon: <NetworkIcon />,
    text: {
      th: "ปรับตามข้อมูลสด ประสานทั้งโครงข่าย",
      en: "Adapts from live data, network-wide",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ComparePage() {
  const { t } = useLanguage();

  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow={
          <Badge tone="accent">
            {t({
              th: "สรุปครบ 3 บทเรียนในหน้าเดียว",
              en: "All three modules on one page",
            })}
          </Badge>
        }
        title={t({
          th: "เปรียบเทียบ 3 ระบบควบคุมสัญญาณไฟ",
          en: "Compare the three signal control systems",
        })}
        subtitle={t({
          th: "Fixed Time, Vehicle Actuated (VA) และ Adaptive ต่างกันอย่างไร ใช้อุปกรณ์อะไร และเหมาะกับแยกแบบไหน — ดูแบบเทียบข้างกันทีละหัวข้อ",
          en: "How do Fixed Time, Vehicle Actuated (VA), and Adaptive differ? What equipment do they need, and where does each fit? See them side by side, topic by topic.",
        })}
      >
        <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 sm:p-6">
          <ul className="space-y-3">
            {systems.map((sys) => {
              const accent = ACCENT_STYLES[sys.accent];
              const essence = HERO_ESSENCE[sys.id];
              return (
                <li
                  key={sys.id}
                  className="flex items-center gap-4 rounded-xl border border-navy-700 bg-navy-900/60 px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bg} text-white`}
                  >
                    {essence.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-white">
                      {t(sys.shortName)}
                    </span>
                    <span className="block text-sm text-navy-200">
                      {t(essence.text)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </PageHero>

      {/* 2 — At a glance */}
      <Section>
        <SectionHeading
          eyebrow={t({ th: "ภาพรวม", en: "At a glance" })}
          title={t({ th: "3 ระบบ 3 แนวคิด", en: "Three systems, three ideas" })}
          description={t({
            th: "หัวใจของแต่ละระบบในหนึ่งบรรทัด ก่อนลงรายละเอียดในตารางด้านล่าง",
            en: "Each system's essence in one line, before the full table below.",
          })}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {systems.map((sys) => {
            const accent = ACCENT_STYLES[sys.accent];
            return (
              <div
                key={sys.id}
                className={`rounded-2xl border ${accent.border} bg-white p-6 shadow-sm`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 w-10 rounded-full ${accent.bg}`}
                />
                <h3 className={`mt-4 text-lg font-bold leading-snug ${accent.text}`}>
                  {t(sys.name)}
                </h3>
                <p className="mt-2 leading-relaxed text-navy-600">{t(sys.tagline)}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 3 — Full comparison table */}
      <Section className="bg-navy-50" id="table">
        <SectionHeading
          eyebrow={t({ th: "ตารางเปรียบเทียบ", en: "Comparison table" })}
          title={t({
            th: "เทียบข้างกัน ทีละหัวข้อ",
            en: "Side by side, topic by topic",
          })}
          description={t({
            th: "เปรียบเทียบทั้ง 3 ระบบในหัวข้อเดียวกัน ตั้งแต่หลักการทำงาน อุปกรณ์ที่ต้องใช้ ไปจนถึงตัวอย่างการใช้งานจริง",
            en: "Compare all three systems on the same topics — from how they work and what equipment they need, to real example use cases.",
          })}
        />
        <SystemComparisonTable className="mt-10" />
      </Section>

      {/* 4 — Decision guide */}
      <Section id="decision-guide">
        <SectionHeading
          eyebrow={t({ th: "แนวทางการเลือก", en: "Decision guide" })}
          title={t({
            th: "เลือกระบบไหนดี?",
            en: "Which system should you choose?",
          })}
          description={t({
            th: "ไม่มีระบบใด “ดีที่สุด” สำหรับทุกแยก เริ่มจากคำถามง่าย ๆ ว่าจราจรผันผวนแค่ไหน แล้วตามเส้นทางที่ตรงกับสถานการณ์ของคุณ",
            en: "No system is “best” for every junction. Start from one simple question — how much does traffic vary — and follow the path that matches your situation.",
          })}
        />
        <DecisionGuide className="mt-10" />
      </Section>

      {/* 5 — CTA: try the simulator */}
      <Section dark>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
              {t({ th: "ขั้นตอนถัดไป", en: "Next step" })}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t({
                th: "ลองปรับค่าดูเองในซิมูเลเตอร์",
                en: "Try the settings yourself in the simulator",
              })}
            </h2>
            <p className="mt-3 max-w-2xl text-navy-200">
              {t({
                th: "สลับโหมด Fixed Time, VA และ Adaptive แล้วดูผลต่อแถวรถแบบสด ๆ ความแตกต่างของทั้ง 3 ระบบจะชัดเจนขึ้นทันที",
                en: "Switch between Fixed Time, VA, and Adaptive and watch the queues respond live — the differences become clear right away.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/simulator" variant="secondary">
              {t({ th: "เปิดซิมูเลเตอร์ (Simulator)", en: "Open the simulator" })}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink href="/quiz" variant="onDark">
              {t({ th: "ทำแบบทดสอบ (Quiz)", en: "Take the quiz" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
