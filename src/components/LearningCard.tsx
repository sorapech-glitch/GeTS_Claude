"use client";

/**
 * A clickable module card for the home page. Accent-colored top edge,
 * per-system icon, tagline, a short definition excerpt, and a
 * "Start module" affordance. The whole card is one link.
 */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ACCENT_STYLES } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import type { SystemId, TrafficSystem } from "@/lib/types";

/** Small inline icons: clock (Fixed Time), sensor waves (VA), network (Adaptive). */
const SYSTEM_ICONS: Record<SystemId, ReactNode> = {
  "fixed-time": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "vehicle-actuated": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="15.5" r="1.8" fill="currentColor" />
      <path
        d="M8.5 12a5 5 0 0 1 7 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 9a9 9 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  adaptive: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18.5" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18.5" cy="18.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7.6 10.9l8.8-4.3M7.6 13.1l8.8 4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export interface LearningCardProps {
  system: TrafficSystem;
  /** Zero-based position in the learning path (renders "บทที่ n / Module n"). */
  index: number;
  className?: string;
  style?: CSSProperties;
}

export function LearningCard({
  system,
  index,
  className = "",
  style,
}: LearningCardProps) {
  const { t } = useLanguage();
  const accent = ACCENT_STYLES[system.accent];

  return (
    <Link
      href={system.href}
      className={`group block h-full min-h-12 ${className}`}
      style={style}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        {/* Accent top edge */}
        <div aria-hidden="true" className={`h-1.5 ${accent.bg}`} />
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.softBg} ${accent.text}`}
            >
              {SYSTEM_ICONS[system.id]}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-navy-400">
                {t({ th: `บทที่ ${index + 1}`, en: `Module ${index + 1}` })}
              </p>
              <h3 className="mt-0.5 text-xl font-bold text-navy-900">
                {t(system.shortName)}
              </h3>
            </div>
          </div>
          <p className="mt-4 font-medium leading-relaxed text-navy-800">
            {t(system.tagline)}
          </p>
          <p className="mt-3 line-clamp-3 text-sm text-navy-600">
            {t(system.definition)}
          </p>
          <span
            className={`mt-auto inline-flex items-center gap-2 pt-6 font-semibold ${accent.text}`}
          >
            {t({ th: "เรียนบทนี้", en: "Start module" })}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
