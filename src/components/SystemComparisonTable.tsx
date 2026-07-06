"use client";

import { useLanguage } from "@/lib/i18n";
import { systems } from "@/data/systems";
import { ACCENT_STYLES } from "@/components/ui";
import type { Bi, SystemComparisonRow } from "@/lib/types";

/**
 * Side-by-side comparison of the three control systems.
 * All row content is driven by each system's `comparison` field in
 * `src/data/systems.ts` — nothing is duplicated here.
 *
 * Desktop (md+): a real semantic <table> inside a horizontal-scroll
 * container, with the system-name column stuck to the left edge.
 * Mobile (<md): the same data rendered as stacked per-system cards.
 */

const COLUMNS: Array<{ key: keyof SystemComparisonRow; label: Bi }> = [
  {
    key: "howItWorks",
    label: { th: "หลักการทำงาน (How It Works)", en: "How it works" },
  },
  {
    key: "equipment",
    label: { th: "อุปกรณ์ที่ต้องใช้ (Equipment)", en: "Required equipment" },
  },
  {
    key: "bestFor",
    label: { th: "เหมาะกับ (Best For)", en: "Best for" },
  },
  {
    key: "strength",
    label: { th: "จุดแข็ง (Strength)", en: "Strength" },
  },
  {
    key: "limitation",
    label: { th: "ข้อจำกัด (Limitation)", en: "Limitation" },
  },
  {
    key: "exampleUseCase",
    label: { th: "ตัวอย่างการใช้งาน (Example)", en: "Example use case" },
  },
];

const SYSTEM_TYPE_LABEL: Bi = {
  th: "ประเภทระบบ (System Type)",
  en: "System type",
};

const CAPTION: Bi = {
  th: "ตารางเปรียบเทียบระบบควบคุมสัญญาณไฟจราจร 3 ระบบ — Fixed Time, Vehicle Actuated (VA) และ Adaptive — ในหัวข้อหลักการทำงาน อุปกรณ์ที่ต้องใช้ ความเหมาะสม จุดแข็ง ข้อจำกัด และตัวอย่างการใช้งาน",
  en: "Comparison of the three traffic signal control systems — Fixed Time, Vehicle Actuated (VA), and Adaptive — covering how they work, required equipment, best fit, strengths, limitations, and example use cases.",
};

export function SystemComparisonTable({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      {/* ------------------------------------------------------------ */}
      {/* Desktop: full table with sticky first column                  */}
      {/* ------------------------------------------------------------ */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-sm">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
            <caption className="sr-only">{t(CAPTION)}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 min-w-48 border-r border-navy-700 bg-navy-900 px-5 py-4 font-semibold text-white"
                >
                  {t(SYSTEM_TYPE_LABEL)}
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="bg-navy-900 px-5 py-4 font-semibold text-white"
                  >
                    {t(col.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systems.map((sys) => {
                const accent = ACCENT_STYLES[sys.accent];
                return (
                  <tr key={sys.id} className="align-top">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 min-w-48 border-r border-t border-navy-100 bg-white px-5 py-5 text-left align-top"
                    >
                      <span className="flex items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${accent.bg}`}
                        />
                        <span className={`text-base font-bold leading-snug ${accent.text}`}>
                          {t(sys.name)}
                        </span>
                      </span>
                    </th>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="border-t border-navy-100 px-5 py-5 leading-relaxed text-navy-700"
                      >
                        {t(sys.comparison[col.key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-navy-500">
          {t({
            th: "เคล็ดลับ: เลื่อนตารางไปทางขวาเพื่อดูครบทุกหัวข้อ — คอลัมน์ชื่อระบบจะติดอยู่ด้านซ้ายเสมอ",
            en: "Tip: scroll the table sideways to see every topic — the system-name column stays pinned on the left.",
          })}
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Mobile: stacked per-system cards (same data)                  */}
      {/* ------------------------------------------------------------ */}
      <div className="space-y-6 md:hidden">
        {systems.map((sys) => {
          const accent = ACCENT_STYLES[sys.accent];
          return (
            <section
              key={sys.id}
              className={`overflow-hidden rounded-2xl border ${accent.border} bg-white shadow-sm`}
            >
              <header className={`${accent.softBg} px-5 py-4`}>
                <h3 className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${accent.bg}`}
                  />
                  <span className={`text-lg font-bold leading-snug ${accent.text}`}>
                    {t(sys.name)}
                  </span>
                </h3>
              </header>
              <dl className="divide-y divide-navy-100">
                {COLUMNS.map((col) => (
                  <div key={col.key} className="px-5 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                      {t(col.label)}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-navy-700">
                      {t(sys.comparison[col.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </div>
  );
}
