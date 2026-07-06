# Traffic Signal Learning Center — Genius Traffic System

เว็บไซต์เรียนรู้ระบบควบคุมสัญญาณไฟจราจรแบบสองภาษา (ไทย/อังกฤษ) —
สอนหลักการทำงานของ **Fixed Time**, **Vehicle Actuated (VA)** และ
**Adaptive Traffic Signal Control** ด้วยคำอธิบายง่าย ๆ ตัวอย่างจริง
แผนภาพเคลื่อนไหว และซิมูเลเตอร์ขนาดเล็ก

A bilingual (Thai-first / English) educational website that teaches how
traffic signal control systems work — Fixed Time, Vehicle Actuated (VA),
and Adaptive Control — using simple explanations, real-world examples,
animated diagrams, and mini simulations. Built for beginners, government
officers, sales engineers, and technical staff.

> **หมายเหตุ / Note:** เว็บไซต์นี้จัดทำเพื่อการเรียนรู้และสนับสนุนงานขาย
> ไม่ใช่เอกสารออกแบบทางวิศวกรรมจราจรที่ผ่านการรับรอง —
> for education and sales support, not certified traffic engineering design.

## Getting started

```bash
npm install
npm run dev      # development server → http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript check
```

No environment variables, databases, or paid/external APIs are required —
everything runs locally. All visuals are inline SVG/CSS.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- Custom lightweight i18n (`src/lib/i18n.tsx`) — Thai primary, English
  toggle in the navbar, persisted in `localStorage`

## Pages

| Route                | Content                                                        |
| -------------------- | -------------------------------------------------------------- |
| `/`                  | Hero, 3 learning cards, short comparison, CTAs                 |
| `/fixed-time`        | Fixed Time module + animated fixed-cycle intersection/timeline |
| `/vehicle-actuated`  | VA module + detector types + demand-driven signal demo         |
| `/adaptive`          | Adaptive module + green-wave corridor + honest-limits section  |
| `/compare`           | Comparison table + decision guide                              |
| `/simulator`         | Educational simulator (Fixed / VA / Adaptive modes)            |
| `/glossary`          | 16 terms with Thai explanations, search + category filter      |
| `/quiz`              | 10-question quiz with instant feedback and score               |

## Project structure

```
src/
  app/                  # App Router: one folder per route (server shells)
  components/           # Reusable components (Navbar, diagrams, cards, …)
    pages/              # Client page components ("use client")
  data/                 # Editable educational content (systems, glossary,
                        # quiz questions, simulator scenarios) — bilingual
  lib/                  # types.ts, i18n.tsx, simulation.ts
docs/DESIGN_GUIDE.md    # Design & content contract for contributors
```

Educational copy lives in `src/data/*.ts` as plain typed objects
(`{ th, en }` per string), so non-developers can edit content without
touching components.

## Editing content

- **System modules** → `src/data/systems.ts`
- **Glossary terms** → `src/data/glossary.ts`
- **Quiz questions** → `src/data/quizQuestions.ts`
- **Simulator presets** → `src/data/simulatorScenarios.ts`

See `docs/DESIGN_GUIDE.md` for tone, design tokens, component APIs, and
accessibility rules before contributing.
