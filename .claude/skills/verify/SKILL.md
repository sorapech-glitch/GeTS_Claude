---
name: verify
description: Build, launch, and drive the Traffic Signal Learning Center end-to-end to verify changes at the browser surface.
---

# Verifying the Traffic Signal Learning Center

## Build & launch

```bash
npm run build                      # must pass first
npm run start -- --port 3100 &     # production server
curl -sf http://localhost:3100/    # ready within ~2s
```

Dev server (`npm run dev`) also works but production build catches
prerender/hydration issues.

## Drive (Playwright)

Chromium is pre-installed in remote sessions at `/opt/pw-browsers/chromium`
(`executablePath`), with `playwright` installed in a scratch dir
(`npm i playwright` — browsers are NOT downloaded, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).

Routes: `/`, `/fixed-time`, `/vehicle-actuated`, `/adaptive`, `/compare`,
`/simulator`, `/glossary`, `/quiz`.

Flows worth driving after a change:

- **Language toggle**: navbar buttons named `ไทย` / `EN`. Assert an `h1`
  changes on `/fixed-time` (its title is language-dependent). The choice
  persists across navigation via localStorage (`gets-lang`).
- **Animations tick**: on `/fixed-time`, `body` innerText changes within
  ~2.5s (countdowns).
- **Glossary**: search input is `input[type="search"]` (role *searchbox*,
  not textbox). Category chips are buttons with `aria-pressed`. Deep links
  `/glossary#<term-id>` (e.g. `#gap-time`) must scroll to a visible card.
- **Simulator**: exact Thai disclaimer string must be present
  (`ผลลัพธ์นี้เป็นแบบจำลองเพื่อการเรียนรู้ ...`). Mode buttons Fixed/VA/Adaptive;
  detector toggle is `[role="switch"]` with `aria-checked`; 4 range sliders.
  Adaptive mode must show "This is a simplified learning model."
  State (queues/timer) changes over a few seconds while playing.
- **Quiz**: start button `เริ่มทำแบบทดสอบ`; choice buttons' accessible names
  start with the letter chip, e.g. `A90 วินาที` — match with `/^[ABCD]/`
  (NOT `/^[ABCD]\b/`, Thai/digits defeat the word boundary). Answer → feedback
  + explanation → `ข้อถัดไป` / `ดูผลคะแนน` → score `X / 10` + verdict.
  Questions reshuffle on retry.
- **Mobile (390×844)**: hamburger `เปิด/ปิดเมนู` opens `#mobile-menu`;
  `/compare` and `/simulator` must not overflow horizontally
  (`document.documentElement.scrollWidth <= clientWidth`).

## Gotchas

- `prefers-reduced-motion` starts demos paused — Playwright defaults to
  no-preference, so animations run in tests.
- All pages are statically prerendered; hydration errors surface as
  `pageerror` console events — always capture them.
- No favicon requests should 404 (src/app/icon.svg provides the icon).
