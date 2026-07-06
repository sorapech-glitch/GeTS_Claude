"use client";

import { useLanguage } from "@/lib/i18n";
import type { Bi, GlossaryCategory, GlossaryTerm } from "@/lib/types";
import { Badge, type BadgeTone } from "@/components/ui";

/**
 * Category metadata shared by the glossary card badge and the
 * category filter chips on the glossary page.
 */
export const GLOSSARY_CATEGORY_META: Record<
  GlossaryCategory,
  { label: Bi; tone: BadgeTone }
> = {
  timing: {
    label: { th: "เวลาสัญญาณ (Timing)", en: "Timing" },
    tone: "blue",
  },
  detection: {
    label: { th: "การตรวจจับ (Detection)", en: "Detection" },
    tone: "accent",
  },
  performance: {
    label: { th: "ประสิทธิภาพ (Performance)", en: "Performance" },
    tone: "violet",
  },
  coordination: {
    label: { th: "การประสานสัญญาณ (Coordination)", en: "Coordination" },
    tone: "green",
  },
};

/**
 * One glossary entry: English term prominent, Thai translation under it,
 * a category badge, the explanation, and the example in a subtle inset box.
 * The article carries `id={term.id}` so other pages can deep-link to it,
 * e.g. `/glossary#gap-time`.
 */
export function GlossaryCard({
  term,
  className = "",
}: {
  term: GlossaryTerm;
  className?: string;
}) {
  const { t } = useLanguage();
  const meta = GLOSSARY_CATEGORY_META[term.category];

  return (
    <article
      id={term.id}
      aria-labelledby={`${term.id}-title`}
      className={`flex h-full scroll-mt-24 flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-sm target:border-accent-300 target:ring-2 target:ring-accent-500/30 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={`${term.id}-title`}
            className="text-lg font-bold leading-snug text-navy-900"
          >
            {term.en}
          </h3>
          <p className="mt-1 text-sm font-medium text-navy-600">{term.th}</p>
        </div>
        <Badge tone={meta.tone} className="shrink-0">
          {t(meta.label)}
        </Badge>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
        {t(term.explanation)}
      </p>

      <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-600">
          {t({ th: "ตัวอย่าง (Example)", en: "Example" })}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
          {t(term.example)}
        </p>
      </div>
    </article>
  );
}
