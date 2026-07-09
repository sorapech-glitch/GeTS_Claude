"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { quizQuestions } from "@/data/quizQuestions";
import { systems, systemsById } from "@/data/systems";
import type { Bi, QuizQuestion } from "@/lib/types";
import {
  ACCENT_STYLES,
  Badge,
  Button,
  ButtonLink,
  Callout,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { QuizCard } from "@/components/QuizCard";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Stage = "intro" | "quiz" | "result";

/** Fisher–Yates shuffle on a copy — the source array is never mutated. */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

interface ScoreTier {
  /** Ring color (hex — matches the signal color tokens in globals.css). */
  ring: string;
  badgeTone: "green" | "yellow" | "red";
  badge: Bi;
  verdict: Bi;
}

/** Verdict tiers: >=80% excellent · 50–79% good · <50% review the lessons. */
function getScoreTier(pct: number): ScoreTier {
  if (pct >= 80) {
    return {
      ring: "#15803d",
      badgeTone: "green",
      badge: { th: "ยอดเยี่ยม", en: "Excellent" },
      verdict: {
        th: "ยอดเยี่ยม! คุณเข้าใจภาพรวมของทั้งสามระบบเป็นอย่างดี",
        en: "Excellent! You understand all three control systems well.",
      },
    };
  }
  if (pct >= 50) {
    return {
      ring: "#b45309",
      badgeTone: "yellow",
      badge: { th: "ดี", en: "Good" },
      verdict: {
        th: "ทำได้ดี ลองทบทวนบางหัวข้อที่ยังพลาด แล้วกลับมาทำอีกครั้ง",
        en: "Good work — review the topics you missed, then try again.",
      },
    };
  }
  return {
    ring: "#b91c1c",
    badgeTone: "red",
    badge: { th: "ควรทบทวน", en: "Needs review" },
    verdict: {
      th: "ยังไม่แม่น ลองเรียนบทเรียนอีกครั้ง แล้วค่อยกลับมาทำแบบทดสอบใหม่",
      en: "Not quite there yet — revisit the lessons, then retake the quiz.",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Small inline icons (decorative — always paired with text)           */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Score ring (donut SVG)                                              */
/* ------------------------------------------------------------------ */

function ScoreRing({
  pct,
  score,
  total,
  color,
  ariaLabel,
}: {
  pct: number;
  score: number;
  total: number;
  color: string;
  ariaLabel: string;
}) {
  const R = 54;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const filled = (Math.max(0, Math.min(100, pct)) / 100) * CIRCUMFERENCE;

  return (
    <svg
      viewBox="0 0 140 140"
      width="170"
      height="170"
      role="img"
      aria-label={ariaLabel}
      className="shrink-0"
    >
      <circle cx="70" cy="70" r={R} fill="none" stroke="#e4ebf8" strokeWidth="11" />
      <circle
        cx="70"
        cy="70"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x="70"
        y="68"
        textAnchor="middle"
        fontSize="28"
        fontWeight="700"
        fill="#0a1428"
      >
        {pct}%
      </text>
      <text
        x="70"
        y="92"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#24427a"
      >
        {score} / {total}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function QuizPage() {
  const { t } = useLanguage();

  const [stage, setStage] = useState<Stage>("intro");
  /** Question order for the current attempt — shuffled on every (re)start. */
  const [order, setOrder] = useState<QuizQuestion[]>(quizQuestions);
  const [current, setCurrent] = useState(0);
  /** questionId → chosen choiceId. Answers are final once recorded. */
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const topRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLDivElement>(null);

  // Bring the active question / result into view when the stage advances.
  useEffect(() => {
    if (stage === "intro") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [stage, current]);

  // Move keyboard focus onto the result heading when the quiz finishes, so
  // focus does not drop to <body> as the last QuizCard unmounts.
  useEffect(() => {
    if (stage !== "result") return;
    resultHeadingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  // Shuffling happens in event handlers (never during render) so the
  // server-rendered markup always matches the first client render.
  const startQuiz = () => {
    setOrder(shuffle(quizQuestions));
    setAnswers({});
    setCurrent(0);
    setStage("quiz");
  };

  const handleSelect = (choiceId: string) => {
    const question = order[current];
    if (!question) return;
    setAnswers((prev) =>
      prev[question.id] ? prev : { ...prev, [question.id]: choiceId },
    );
  };

  const handleNext = () => {
    if (current + 1 >= order.length) {
      setStage("result");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const total = order.length;
  const currentQuestion = order[current];
  const score = order.reduce(
    (n, q) => (answers[q.id] === q.correctChoiceId ? n + 1 : n),
    0,
  );
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const tier = getScoreTier(pct);

  return (
    <>
      {/* 1 — Hero */}
      <PageHero
        eyebrow={
          <Badge tone="accent">
            {t({ th: "เช็กความเข้าใจ", en: "Check your understanding" })}
          </Badge>
        }
        title={t({
          th: "แบบทดสอบความเข้าใจ (Quiz)",
          en: "Knowledge check quiz",
        })}
        subtitle={t({
          th: "ทดสอบสิ่งที่เรียนมาทั้งหมด ตั้งแต่ Fixed Time, Vehicle Actuated (VA), Adaptive ไปจนถึงคำศัพท์สำคัญ ตอบแล้วเห็นเฉลยพร้อมเหตุผลทันทีทุกข้อ",
          en: "Test everything you have learned — Fixed Time, Vehicle Actuated (VA), Adaptive, and the key vocabulary — with instant feedback and an explanation for every question.",
        })}
      >
        {stage === "intro" && (
          <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-5 sm:p-6">
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {quizQuestions.length}
              </span>
              <span className="text-navy-200">
                {t({
                  th: "ข้อ ปรนัย 4 ตัวเลือก",
                  en: "multiple-choice questions",
                })}
              </span>
            </p>
            <ul className="mt-4 space-y-2.5">
              {(
                [
                  {
                    th: "เห็นเฉลยพร้อมเหตุผลทันทีหลังตอบทุกข้อ",
                    en: "Instant feedback with the reasoning after every answer",
                  },
                  {
                    th: "ไม่จับเวลา ทำซ้ำได้ไม่จำกัด",
                    en: "No time limit — retake as many times as you like",
                  },
                  {
                    th: "ครอบคลุมทั้ง 3 ระบบ และคำศัพท์จากอภิธานศัพท์ (Glossary)",
                    en: "Covers all three systems plus terms from the glossary",
                  },
                ] as Bi[]
              ).map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-navy-200">
                  <span aria-hidden="true" className="mt-1 shrink-0 text-accent-400">
                    <CheckIcon />
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHero>

      {/* Scroll anchor for stage changes (offset for the sticky navbar) */}
      <div ref={topRef} aria-hidden="true" className="scroll-mt-20" />

      {/* 2 — Intro screen */}
      {stage === "intro" && (
        <Section>
          <SectionHeading
            eyebrow={t({ th: "ครอบคลุมเนื้อหา", en: "What it covers" })}
            title={t({
              th: "แบบทดสอบนี้ครอบคลุมอะไรบ้าง",
              en: "What this quiz covers",
            })}
            description={t({
              th: "คำถามคละกันทั้งหลักการของแต่ละระบบ การคำนวณง่าย ๆ และคำศัพท์ที่ใช้บ่อย ถ้ายังไม่มั่นใจ กลับไปทบทวนบทเรียนก่อนได้เสมอ",
              en: "Questions mix the principles of each system, simple calculations, and the most common vocabulary. Not confident yet? You can always review the modules first.",
            })}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {systems.map((system) => {
              const accent = ACCENT_STYLES[system.accent];
              return (
                <div
                  key={system.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${accent.border}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.bg}`}
                    />
                    <h3 className="font-semibold text-navy-900">
                      {t(system.shortName)}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-navy-600">{t(system.tagline)}</p>
                  <Link
                    href={system.href}
                    className={`mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold ${accent.text} hover:underline`}
                  >
                    {t({ th: "เปิดบทเรียน", en: "Open module" })}
                    <ArrowRightIcon />
                  </Link>
                </div>
              );
            })}

            <div className="rounded-2xl border border-navy-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-navy-500"
                />
                <h3 className="font-semibold text-navy-900">
                  {t({ th: "คำศัพท์สำคัญ (Key Terms)", en: "Key terms" })}
                </h3>
              </div>
              <p className="mt-2 text-sm text-navy-600">
                {t({
                  th: "เช่น รอบสัญญาณไฟ (Cycle Time), Gap Time, Offset และ Degree of Saturation",
                  en: "Such as Cycle Time, Gap Time, Offset, and Degree of Saturation",
                })}
              </p>
              <Link
                href="/glossary"
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent-700 hover:underline"
              >
                {t({ th: "เปิดอภิธานศัพท์", en: "Open glossary" })}
                <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <Callout
            variant="info"
            className="mt-10"
            title={t({
              th: "ตอบผิดไม่เป็นไร",
              en: "Wrong answers are part of learning",
            })}
          >
            <p>
              {t({
                th: "แบบทดสอบนี้มีไว้ช่วยเรียนรู้ ไม่ใช่ข้อสอบ ทุกข้อมีเฉลยพร้อมเหตุผลให้อ่านทันที และตอนจบยังมีลิงก์กลับไปทบทวนบทเรียนที่เกี่ยวข้องของแต่ละข้อ",
                en: "This quiz is a learning tool, not an exam. Every question shows the answer and the reasoning right away, and the result screen links each question back to the related module.",
              })}
            </p>
          </Callout>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Button variant="primary" size="md" onClick={startQuiz}>
              {t({ th: "เริ่มทำแบบทดสอบ", en: "Start quiz" })}
              <ArrowRightIcon />
            </Button>
            <p className="text-sm text-navy-500">
              {t({
                th: `${quizQuestions.length} ข้อ · ใช้เวลาประมาณ 5–10 นาที`,
                en: `${quizQuestions.length} questions · takes about 5–10 minutes`,
              })}
            </p>
          </div>
        </Section>
      )}

      {/* 3 — Quiz screen: one question at a time */}
      {stage === "quiz" && currentQuestion && (
        <Section className="bg-navy-50">
          <div className="mx-auto max-w-3xl">
            <QuizCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={current}
              total={total}
              selectedChoiceId={answers[currentQuestion.id] ?? null}
              onSelect={handleSelect}
              onNext={handleNext}
              isLast={current + 1 >= total}
            />
          </div>
        </Section>
      )}

      {/* 4 — Result screen */}
      {stage === "result" && (
        <Section className="bg-navy-50">
          <div ref={resultHeadingRef} tabIndex={-1}>
            <SectionHeading
              eyebrow={t({ th: "ผลคะแนน", en: "Your result" })}
              title={t({ th: "ทำได้เท่าไรมาดูกัน", en: "Here is how you did" })}
            />
          </div>

          {/* Score panel */}
          <div className="mt-10 flex flex-col items-center gap-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
            <ScoreRing
              pct={pct}
              score={score}
              total={total}
              color={tier.ring}
              ariaLabel={t({
                th: `ได้คะแนน ${score} จาก ${total} ข้อ คิดเป็น ${pct}%`,
                en: `Scored ${score} out of ${total} (${pct}%)`,
              })}
            />
            <div className="text-center md:text-left">
              <Badge tone={tier.badgeTone}>{t(tier.badge)}</Badge>
              <p className="mt-3 text-xl font-bold text-navy-900 sm:text-2xl">
                {t(tier.verdict)}
              </p>
              <p className="mt-2 text-navy-600">
                {t({
                  th: `ตอบถูก ${score} จาก ${total} ข้อ`,
                  en: `You answered ${score} of ${total} questions correctly.`,
                })}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                <Button variant="primary" size="md" onClick={startQuiz}>
                  {t({ th: "ทำอีกครั้ง", en: "Try again" })}
                </Button>
                <ButtonLink href="/glossary" variant="outline">
                  {t({ th: "ทบทวนอภิธานศัพท์ (Glossary)", en: "Review the glossary" })}
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* Per-question review */}
          <h3 className="mt-12 text-xl font-bold text-navy-900 sm:text-2xl">
            {t({ th: "ทบทวนรายข้อ", en: "Question review" })}
          </h3>
          <ul className="mt-6 space-y-4">
            {order.map((question, i) => {
              const isCorrect = answers[question.id] === question.correctChoiceId;
              const correctChoice = question.choices.find(
                (choice) => choice.id === question.correctChoiceId,
              );
              const relatedSystem = question.relatedSystem
                ? systemsById[question.relatedSystem]
                : null;
              return (
                <li
                  key={question.id}
                  className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isCorrect
                        ? "bg-green-100 text-signal-green-deep"
                        : "bg-red-100 text-signal-red-deep"
                    }`}
                  >
                    {isCorrect ? <CheckIcon /> : <CrossIcon />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-navy-500">
                        {t({ th: `ข้อ ${i + 1}`, en: `Question ${i + 1}` })}
                      </span>
                      <Badge tone={isCorrect ? "green" : "red"}>
                        {isCorrect
                          ? t({ th: "ตอบถูก (Correct)", en: "Correct" })
                          : t({ th: "ตอบผิด (Incorrect)", en: "Incorrect" })}
                      </Badge>
                    </div>
                    <p className="mt-1.5 font-medium text-navy-900">
                      {t(question.question)}
                    </p>
                    {!isCorrect && correctChoice && (
                      <p className="mt-1.5 text-sm text-navy-600">
                        <span className="font-semibold">
                          {t({ th: "คำตอบที่ถูกต้อง:", en: "Correct answer:" })}
                        </span>{" "}
                        {t(correctChoice.text)}
                      </p>
                    )}
                    {relatedSystem && (
                      <Link
                        href={relatedSystem.href}
                        className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-600 hover:underline"
                      >
                        {t({ th: "ทบทวนบทเรียน", en: "Review module" })}{" "}
                        {t(relatedSystem.shortName)}
                        <ArrowRightIcon />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Keep learning */}
          <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-navy-900">
              {t({ th: "เรียนต่อจากตรงนี้", en: "Keep learning" })}
            </h3>
            <p className="mt-1 text-navy-600">
              {t({
                th: "กลับไปอ่านบทเรียนของแต่ละระบบ หรือทบทวนคำศัพท์ในอภิธานศัพท์",
                en: "Revisit each system's module, or brush up on the vocabulary in the glossary.",
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {systems.map((system) => (
                <ButtonLink key={system.id} href={system.href} variant="outline">
                  {t(system.shortName)}
                </ButtonLink>
              ))}
              <ButtonLink href="/glossary" variant="outline">
                {t({ th: "อภิธานศัพท์ (Glossary)", en: "Glossary" })}
              </ButtonLink>
            </div>
          </div>
        </Section>
      )}

      {/* 5 — Next module cross-link band (hidden while answering questions) */}
      {stage !== "quiz" && (
        <Section dark>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-accent-400">
                {t({ th: "บทเรียนถัดไป", en: "Next module" })}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {t({
                  th: "เห็นผลของค่าต่าง ๆ ด้วยตาตัวเอง",
                  en: "See the effect of every setting yourself",
                })}
              </h2>
              <p className="mt-3 max-w-2xl text-navy-200">
                {t({
                  th: "ลองปรับรอบสัญญาณไฟ (Cycle Time) และ Gap Time ในซิมูเลเตอร์ หรือเปิดตารางเปรียบเทียบทั้งสามระบบแบบเคียงข้างกัน",
                  en: "Adjust the cycle time and gap time in the simulator, or open the side-by-side comparison of all three systems.",
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/simulator" variant="secondary">
                {t({ th: "เปิดซิมูเลเตอร์ (Simulator)", en: "Open the simulator" })}
                <ArrowRightIcon />
              </ButtonLink>
              <ButtonLink href="/compare" variant="onDark">
                {t({ th: "เปรียบเทียบระบบ (Compare)", en: "Compare the systems" })}
              </ButtonLink>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
