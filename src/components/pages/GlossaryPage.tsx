"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { glossaryTerms } from "@/data/glossary";
import type { GlossaryCategory, GlossaryTerm } from "@/lib/types";
import {
  Badge,
  ButtonLink,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import {
  GLOSSARY_CATEGORY_META,
  GlossaryCard,
} from "@/components/GlossaryCard";
import { ArrowRightIcon } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* Static helpers (data never changes at runtime)                      */
/* ------------------------------------------------------------------ */

type CategoryFilter = GlossaryCategory | "all";

const CATEGORY_ORDER: GlossaryCategory[] = [
  "timing",
  "detection",
  "performance",
  "coordination",
];

const CATEGORY_COUNTS: Record<GlossaryCategory, number> = {
  timing: glossaryTerms.filter((term) => term.category === "timing").length,
  detection: glossaryTerms.filter((term) => term.category === "detection")
    .length,
  performance: glossaryTerms.filter((term) => term.category === "performance")
    .length,
  coordination: glossaryTerms.filter(
    (term) => term.category === "coordination",
  ).length,
};

/** Dot colors for the hero category overview (paired with text labels). */
const CATEGORY_DOT: Record<GlossaryCategory, string> = {
  timing: "bg-blue-400",
  detection: "bg-accent-400",
  performance: "bg-violet-400",
  coordination: "bg-navy-400",
};

/** Match against both languages so search works whichever language is active. */
function matchesQuery(term: GlossaryTerm, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    term.en,
    term.th,
    term.explanation.th,
    term.explanation.en,
  ].some((text) => text.toLowerCase().includes(q));
}

/* ------------------------------------------------------------------ */
/* Small inline icons (decorative)                                     */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m15.8 15.8 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function GlossaryPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(
    () =>
      glossaryTerms.filter(
        (term) =>
          (category === "all" || term.category === category) &&
          matchesQuery(term, query),
      ),
    [query, category],
  );

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow={
          <Badge tone="accent">
            {t({ th: "คลังคำศัพท์", en: "Vocabulary reference" })}
          </Badge>
        }
        title={t({
          th: "อภิธานศัพท์สัญญาณไฟจราจร (Glossary)",
          en: "Traffic signal glossary",
        })}
        subtitle={t({
          th: "รวมคำศัพท์ที่ใช้บ่อยในงานควบคุมสัญญาณไฟจราจร พร้อมคำอธิบายสั้น ๆ และตัวอย่างตัวเลขที่ใช้จริง ค้นหาได้ทั้งภาษาไทยและภาษาอังกฤษ",
          en: "The traffic signal control terms you will meet most often, each with a short explanation and a realistic example. Search in Thai or English.",
        })}
      >
        <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 sm:p-6">
          <p className="text-sm font-semibold text-navy-200">
            {t({
              th: `คำศัพท์ ${glossaryTerms.length} คำ ใน 4 หมวดหมู่`,
              en: `${glossaryTerms.length} terms across 4 categories`,
            })}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CATEGORY_ORDER.map((cat) => (
              <li
                key={cat}
                className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900/60 px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORY_DOT[cat]}`}
                />
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold text-white">
                    {t(GLOSSARY_CATEGORY_META[cat].label)}
                  </span>
                  <span className="block text-navy-200">
                    {t({
                      th: `${CATEGORY_COUNTS[cat]} คำ`,
                      en: `${CATEGORY_COUNTS[cat]} terms`,
                    })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </PageHero>

      {/* 2 — Search, filter, and term cards */}
      <Section className="bg-navy-50" id="terms">
        <SectionHeading
          eyebrow={t({ th: "ค้นหา", en: "Search" })}
          title={t({
            th: "ค้นหาและกรองคำศัพท์",
            en: "Search and filter the terms",
          })}
          description={t({
            th: "พิมพ์คำที่ต้องการเป็นภาษาไทยหรืออังกฤษ หรือเลือกหมวดหมู่ด้านล่าง เพื่อเจอคำศัพท์ที่ต้องการเร็วขึ้น",
            en: "Type a keyword in Thai or English, or pick a category below, to find the term you need faster.",
          })}
        />

        {/* Controls */}
        <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
            {/* Text search */}
            <div>
              <label
                htmlFor="glossary-search"
                className="block text-sm font-semibold text-navy-800"
              >
                {t({ th: "ค้นหาคำศัพท์ (Search)", en: "Search terms" })}
              </label>
              <div className="relative mt-2">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
                >
                  <SearchIcon />
                </span>
                <input
                  id="glossary-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t({
                    th: "เช่น Cycle Time, gap, ไฟเขียว…",
                    en: "e.g. Cycle Time, gap, green…",
                  })}
                  className="min-h-12 w-full rounded-xl border border-navy-200 bg-white pl-11 pr-4 text-navy-900 placeholder:text-navy-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                />
              </div>
            </div>

            {/* Category filter chips */}
            <div>
              <span
                id="glossary-category-label"
                className="block text-sm font-semibold text-navy-800"
              >
                {t({ th: "หมวดหมู่ (Category)", en: "Category" })}
              </span>
              <div
                role="group"
                aria-labelledby="glossary-category-label"
                className="mt-2 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  aria-pressed={category === "all"}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    category === "all"
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-navy-200 bg-white text-navy-700 hover:border-navy-400 hover:bg-navy-50"
                  }`}
                >
                  {t({ th: "ทั้งหมด", en: "All" })}
                  <span className="tabular-nums opacity-70">
                    {glossaryTerms.length}
                  </span>
                </button>
                {CATEGORY_ORDER.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={active}
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
                        active
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-navy-200 bg-white text-navy-700 hover:border-navy-400 hover:bg-navy-50"
                      }`}
                    >
                      {t(GLOSSARY_CATEGORY_META[cat].label)}
                      <span className="tabular-nums opacity-70">
                        {CATEGORY_COUNTS[cat]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Result count */}
        <p aria-live="polite" className="mt-6 text-sm font-medium text-navy-600">
          {t({
            th: `แสดง ${filtered.length} จาก ${glossaryTerms.length} คำศัพท์`,
            en: `Showing ${filtered.length} of ${glossaryTerms.length} terms`,
          })}
        </p>

        {/* Cards / empty state */}
        {filtered.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((term) => (
              <GlossaryCard key={term.id} term={term} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-400"
            >
              <SearchIcon />
            </span>
            <p className="mt-4 text-lg font-semibold text-navy-900">
              {t({
                th: "ไม่พบคำศัพท์ที่ตรงกับการค้นหา",
                en: "No terms match your search",
              })}
            </p>
            <p className="mx-auto mt-2 max-w-md text-navy-600">
              {t({
                th: "ลองใช้คำค้นที่สั้นลง สะกดแบบอื่น หรือล้างตัวกรองหมวดหมู่ แล้วค้นหาอีกครั้ง",
                en: "Try a shorter keyword, a different spelling, or clear the category filter and search again.",
              })}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-navy-300 px-5 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-500 hover:bg-navy-50"
            >
              {t({
                th: "ล้างการค้นหาและตัวกรอง",
                en: "Clear search and filters",
              })}
            </button>
          </div>
        )}
      </Section>

      {/* 3 — Next module cross-link band */}
      <Section dark>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
              {t({ th: "บทเรียนถัดไป", en: "Next module" })}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {t({
                th: "ทดสอบความเข้าใจ",
                en: "Test your understanding",
              })}
            </h2>
            <p className="mt-3 max-w-2xl text-navy-200">
              {t({
                th: "รู้จักคำศัพท์ครบแล้ว ลองทำแบบทดสอบสั้น ๆ เพื่อเช็กว่าเข้าใจ Fixed Time, VA และ Adaptive มากแค่ไหน",
                en: "Now that you know the vocabulary, take a short quiz to check how well you understand Fixed Time, VA, and Adaptive control.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/quiz" variant="secondary">
              {t({ th: "ทำแบบทดสอบ (Quiz)", en: "Take the quiz" })}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink href="/simulator" variant="onDark">
              {t({ th: "เปิดซิมูเลเตอร์ (Simulator)", en: "Open the simulator" })}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
