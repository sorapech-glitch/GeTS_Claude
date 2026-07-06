# Traffic Signal Learning Center — Design & Content Guide

This document is the single source of truth for how pages, components, and
content in this project are written. Follow it exactly so the site stays
consistent.

## 1. Mission and tone

Educational website for **Genius Traffic System** teaching Fixed Time,
Vehicle Actuated (VA), and Adaptive traffic signal control to beginners,
government officers, sales engineers, and technical staff.

- **Thai first, English second.** Every user-visible string is bilingual.
- Professional, easy to understand, visual-first, not academic.
- Premium B2B technology feel: Apple-style clarity, Tesla-style technical
  confidence, Google-style usability.
- **Never overclaim.** Especially for Adaptive control: it improves response
  to changing conditions but depends on detector quality, road capacity,
  configuration, and traffic behavior. It does not "solve congestion".
- The site is for education and sales support, **not** certified traffic
  engineering design.

## 2. Tech conventions

- Next.js 15 App Router + TypeScript strict + Tailwind CSS v4.
- Import alias: `@/*` → `src/*`.
- **Page pattern:** `src/app/<route>/page.tsx` is a *server* component that
  only exports `metadata` and renders a client page component:

```tsx
// src/app/fixed-time/page.tsx
import type { Metadata } from "next";
import { FixedTimePage } from "@/components/pages/FixedTimePage";

export const metadata: Metadata = {
  title: "Fixed Time Control",
  description: "…Thai description…",
};

export default function Page() {
  return <FixedTimePage />;
}
```

- The real page lives in `src/components/pages/<Name>Page.tsx` and starts
  with `"use client"`.
- No external network calls, no paid APIs, no external images. All visuals
  are inline SVG / CSS.

## 3. Bilingual content (i18n)

```tsx
import { useLanguage } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

const { lang, t } = useLanguage(); // lang: "th" | "en"
t({ th: "รอบสัญญาณไฟ", en: "Cycle time" });
```

- ALL user-visible text goes through `t()` or comes from data files as `Bi`.
- Technical terms keep the English term visible even in Thai mode, e.g.
  Thai copy may read "รอบสัญญาณไฟ (Cycle Time)". Thai users must learn the
  English vocabulary — this is intentional.
- Thai copy: natural, polite-neutral (ไม่ต้องมีครับ/ค่ะ), short sentences,
  concrete examples. English copy: plain, direct.

## 4. Design tokens (Tailwind classes)

Defined in `src/app/globals.css` via `@theme`:

- **Navy brand scale:** `navy-50 … navy-950` (e.g. `bg-navy-900`,
  `text-navy-600`, `border-navy-100`). Dark bands use `bg-navy-900`/`950`.
- **Signal colors** — use ONLY to represent actual signal states or
  advantage/limitation semantics: `signal-green`, `signal-green-deep`,
  `signal-yellow`, `signal-yellow-deep`, `signal-red`, `signal-red-deep`.
- **Tech accent (cyan)** for detectors/data/interactive highlights:
  `accent-50 … accent-700`.
- **System accents:** Fixed Time = `blue`, VA = `cyan`, Adaptive = `violet`
  (`SystemAccent` type; map through `ACCENT_STYLES` from `@/components/ui`).
- **Animations:** `animate-signal-pulse`, `animate-fade-up`,
  `animate-dash-flow` (for SVG stroke-dashoffset flow).
- Font is set globally; don't override families.

Layout rhythm: pages are a stack of `<Section>` blocks; alternate white and
`bg-navy-50` (`<Section className="bg-navy-50">`); at most one dark
(`dark`) section per page besides the hero. Cards: `rounded-2xl`, generous
padding, `border-navy-100`.

## 5. Shared component APIs

From `@/components/ui`:

- `Section({ children, className?, dark?, id? })` — page band with max-w-7xl
  container.
- `SectionHeading({ eyebrow?, title, description?, dark?, align? })`
- `PageHero({ eyebrow?, title, subtitle?, children? })` — dark navy page
  header; `children` renders a visual in a 2-col grid.
- `Card({ children, className? })`
- `Badge({ children, tone?, className? })` — tones: `neutral | green |
  yellow | red | accent | blue | violet`.
- `Callout({ variant, title, children, className? })` — variants:
  `analogy` (lightbulb, cyan) · `example` (map pin, navy) · `info` (blue)
  · `warning` (amber). Use `analogy` for the module analogies, `example`
  for the real-world examples, `warning` for disclaimers/limitations.
- `ButtonLink({ href, variant?, children, className? })` — variants:
  `primary` (navy) · `secondary` (cyan, highest emphasis on dark) ·
  `outline` · `onDark`.
- `ProsConsGrid({ prosTitle, consTitle, pros, cons })` — advantages vs
  limitations, green/red left-edged cards.
- `ACCENT_STYLES[accent]` → `{ text, bg, softBg, border, ring }` classes.

From `@/components/TrafficLightAnimation`:

- `TrafficLightAnimation({ active, size?, countdown?, label?, ariaLabel? })`
  — presentational 3-light head; parent drives `active: "green" | "yellow"
  | "red"` and optional `countdown` seconds from its own timer.

From `@/components/IntersectionDiagram`:

- `IntersectionDiagram({ north, south, east, west, showDetectors?, title })`
  — SVG 4-way intersection, left-hand traffic. Each approach is an
  `ApproachState`: `{ signal: "green"|"yellow"|"red", queue?: number (0–8),
  detectorActive?: boolean }`. `title` (required) describes the current
  state for screen readers. Parent drives animation by updating props on a
  timer (e.g. `setInterval` at 1s or `requestAnimationFrame`).

Navbar and Footer are already wired in `src/app/layout.tsx` — do not touch.

## 6. Page composition pattern

1. `PageHero` (dark) — eyebrow `Badge`, H1 title, subtitle; optionally a
   live diagram as `children`.
2. "What is …" section with definition + `Callout variant="analogy"`.
3. Interactive/animated visual section.
4. Key terms/concepts (cards or definition grid).
5. `ProsConsGrid` for advantages/limitations.
6. Best-use-cases + `Callout variant="example"`.
7. Bottom cross-link band: "บทเรียนถัดไป / Next module" with `ButtonLink`s.

Keep hierarchy: one `h1` (in PageHero), `h2` per section, `h3` inside cards.

## 7. Data contracts

All content data lives in `src/data/*.ts`, typed by `src/lib/types.ts`:

- `systems.ts` → `export const systems: TrafficSystem[]` (order:
  fixed-time, vehicle-actuated, adaptive) and
  `export const systemsById: Record<SystemId, TrafficSystem>`.
- `glossary.ts` → `export const glossaryTerms: GlossaryTerm[]`.
- `quizQuestions.ts` → `export const quizQuestions: QuizQuestion[]`.
- `simulatorScenarios.ts` → `export const simulatorScenarios:
  SimulatorScenario[]`.

Pages must read shared content from these files rather than duplicating it,
except for page-specific prose.

## 8. Accessibility

- Semantic HTML (`nav`, `main`, `section`, `figure`, real `<button>`s).
- Every SVG diagram: `role="img"` + meaningful `aria-label`/`<title>`, or
  `aria-hidden="true"` if decorative.
- Interactive controls keyboard-usable, min target ~44px (`min-h-11`/
  `min-h-12`), visible focus (global `:focus-visible` style exists).
- Don't rely on color alone: pair signal colors with text labels.
- Text contrast: on white use `text-navy-600` or darker; on navy-900 use
  `text-navy-200` or lighter.

## 9. Required disclaimers (exact copy)

Simulator page must show:

> ผลลัพธ์นี้เป็นแบบจำลองเพื่อการเรียนรู้ ไม่ใช่ค่าการออกแบบสัญญาณไฟจราจรสำหรับใช้งานจริง
> (This is a simplified learning model — not real-world signal design values.)

Adaptive page must include the honest-limits framing described in §1.
