"use client";

/**
 * Home page — product-landing composition:
 * hero → module cards → compact comparison strip → audience strip → CTA band.
 */

import type { ReactNode } from "react";
import { HeroSection } from "@/components/HeroSection";
import { LearningCard } from "@/components/LearningCard";
import {
  ACCENT_STYLES,
  Badge,
  ButtonLink,
  Card,
  Section,
  SectionHeading,
  type BadgeTone,
} from "@/components/ui";
import { systems } from "@/data/systems";
import { useLanguage } from "@/lib/i18n";
import type { Bi, SystemAccent } from "@/lib/types";

const BADGE_TONE: Record<SystemAccent, BadgeTone> = {
  blue: "blue",
  cyan: "accent",
  violet: "violet",
};

interface Audience {
  id: string;
  title: Bi;
  description: Bi;
  icon: ReactNode;
}

const AUDIENCES: Audience[] = [
  {
    id: "beginner",
    title: { th: "ผู้เริ่มต้น", en: "Beginners" },
    description: {
      th: "ไม่ต้องมีพื้นฐาน เริ่มจากศูนย์ได้ทันที",
      en: "No background needed — start from zero.",
    },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5 19.5c1.2-3.2 3.9-4.8 7-4.8s5.8 1.6 7 4.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "government",
    title: { th: "เจ้าหน้าที่ภาครัฐ", en: "Government officers" },
    description: {
      th: "เข้าใจแต่ละระบบก่อนตัดสินใจเชิงนโยบาย",
      en: "Understand each system before policy decisions.",
    },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20h16M5 10h14M12 4 4.5 7.8h15L12 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 10v7m5-7v7m5-7v7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "sales",
    title: { th: "วิศวกรฝ่ายขาย", en: "Sales engineers" },
    description: {
      th: "อธิบายจุดแข็งและข้อจำกัดให้ลูกค้าได้อย่างมั่นใจ",
      en: "Explain strengths and limits to customers with confidence.",
    },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="7.5"
          width="16"
          height="12"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M4 12.5h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "technical",
    title: { th: "ทีมเทคนิค", en: "Technical staff" },
    description: {
      th: "ทบทวนศัพท์เทคนิคและหลักการทำงานของระบบ",
      en: "Review the terminology and operating principles.",
    },
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14.5 6.5a4 4 0 0 0-5.3 5L4 16.7V20h3.3l5.2-5.2a4 4 0 0 0 5-5.3l-2.7 2.7-2.5-.7-.7-2.5 2.9-2.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <HeroSection />

      {/* ---- Choose your module ---- */}
      <Section id="modules">
        <SectionHeading
          align="center"
          eyebrow={t({ th: "บทเรียน", en: "Modules" })}
          title={t({ th: "เลือกบทเรียน", en: "Choose your module" })}
          description={t({
            th: "เรียนตามลำดับจากพื้นฐานถึงขั้นสูง หรือข้ามไปยังระบบที่สนใจได้เลย",
            en: "Follow the path from basics to advanced, or jump straight to the system you care about.",
          })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {systems.map((system, i) => (
            <LearningCard
              key={system.id}
              system={system}
              index={i}
              className="animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            />
          ))}
        </div>
      </Section>

      {/* ---- Compact comparison strip ---- */}
      <Section className="bg-navy-50">
        <SectionHeading
          align="center"
          eyebrow={t({ th: "เปรียบเทียบ", en: "Compare" })}
          title={t({
            th: "สามระบบ ตัดสินใจเรื่องไฟเขียวต่างกันอย่างไร",
            en: "How each system decides green time",
          })}
          description={t({
            th: "สรุปสั้น ๆ หนึ่งประโยคต่อระบบ ก่อนดูตารางเปรียบเทียบฉบับเต็ม",
            en: "One sentence per system — then dive into the full comparison table.",
          })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {systems.map((system, i) => (
            <div
              key={system.id}
              className="animate-fade-up h-full"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <Card className="flex h-full flex-col">
                <h3 className="flex items-center gap-2.5 text-lg font-bold text-navy-900">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${ACCENT_STYLES[system.accent].bg}`}
                  />
                  {t(system.shortName)}
                </h3>
                <p className="mt-3 flex-1 text-navy-700">
                  {t(system.comparison.howItWorks)}
                </p>
                <div className="mt-5 border-t border-navy-100 pt-4">
                  <Badge tone={BADGE_TONE[system.accent]}>
                    {t({ th: "เหมาะกับ", en: "Best for" })}
                  </Badge>
                  <p className="mt-2 text-sm font-medium text-navy-800">
                    {t(system.comparison.bestFor)}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/compare" variant="primary">
            {t({
              th: "ดูตารางเปรียบเทียบฉบับเต็ม",
              en: "See the full comparison table",
            })}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ButtonLink>
        </div>
      </Section>

      {/* ---- Who is this for ---- */}
      <Section>
        <SectionHeading
          align="center"
          eyebrow={t({ th: "กลุ่มเป้าหมาย", en: "Audience" })}
          title={t({ th: "ใครควรเรียน", en: "Who is this for" })}
          description={t({
            th: "เนื้อหาออกแบบให้เข้าใจง่าย ใช้ได้จริงทั้งงานสอน งานขาย และงานเทคนิค",
            en: "Designed to be easy to understand and useful for teaching, sales, and technical work alike.",
          })}
        />
        <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {AUDIENCES.map((audience, i) => (
            <li
              key={audience.id}
              className="animate-fade-up flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600"
              >
                {audience.icon}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-navy-900">
                  {t(audience.title)}
                </h3>
                <p className="mt-0.5 text-sm text-navy-600">
                  {t(audience.description)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---- Bottom CTA band ---- */}
      <Section dark>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t({
              th: "พร้อมทดลองด้วยตัวเองหรือยัง",
              en: "Ready to try it yourself?",
            })}
          </h2>
          <p className="mt-4 text-lg text-navy-200">
            {t({
              th: "เปิดซิมูเลเตอร์เพื่อดูว่าแต่ละระบบส่งผลต่อแถวรถอย่างไร แล้ววัดความเข้าใจด้วยแบบทดสอบสั้น ๆ",
              en: "Open the simulator to see how each system affects vehicle queues, then check your understanding with a short quiz.",
            })}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/simulator" variant="secondary">
              {t({ th: "ลองซิมูเลเตอร์", en: "Try the simulator" })}
            </ButtonLink>
            <ButtonLink href="/quiz" variant="onDark">
              {t({ th: "ทำแบบทดสอบ", en: "Take the quiz" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
