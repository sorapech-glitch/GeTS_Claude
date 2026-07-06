"use client";

import { useLanguage } from "@/lib/i18n";
import type { QuizQuestion } from "@/lib/types";
import { Callout } from "@/components/ui";

/** Choice letters shown in front of each answer. */
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/* ------------------------------------------------------------------ */
/* Small inline icons (decorative — always paired with text labels)    */
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

/* ------------------------------------------------------------------ */
/* QuizCard                                                            */
/* ------------------------------------------------------------------ */

export interface QuizCardProps {
  question: QuizQuestion;
  /** 0-based position of this question in the quiz. */
  index: number;
  /** Total number of questions. */
  total: number;
  /** The choice the learner picked for this question, or null before answering. */
  selectedChoiceId: string | null;
  /** Called when the learner picks a choice (first pick only — answers are final). */
  onSelect: (choiceId: string) => void;
  /** Advance to the next question, or to the result screen on the last one. */
  onNext: () => void;
  /** True on the last question — the next button becomes "See results". */
  isLast: boolean;
}

/**
 * One quiz question: progress header, question text, four full-width choice
 * buttons, and — after answering — an instant-feedback panel with the
 * explanation and a Next button. Answers are final: choices are disabled
 * once one is picked.
 */
export function QuizCard({
  question,
  index,
  total,
  selectedChoiceId,
  onSelect,
  onNext,
  isLast,
}: QuizCardProps) {
  const { t } = useLanguage();

  const answered = selectedChoiceId !== null;
  const isCorrect = selectedChoiceId === question.correctChoiceId;
  const correctIndex = question.choices.findIndex(
    (choice) => choice.id === question.correctChoiceId,
  );
  const correctLetter = correctIndex >= 0 ? LETTERS[correctIndex] : "?";
  const progressPct = Math.round(((index + 1) / total) * 100);

  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-8">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-navy-700">
          {t({
            th: `ข้อ ${index + 1} / ${total}`,
            en: `Question ${index + 1} of ${total}`,
          })}
        </p>
        <p className="text-sm font-medium tabular-nums text-navy-400">
          {progressPct}%
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={t({
          th: `ความคืบหน้า: ข้อ ${index + 1} จาก ${total}`,
          en: `Progress: question ${index + 1} of ${total}`,
        })}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-100"
      >
        <div
          className="h-full rounded-full bg-accent-500 transition-[width] duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="mt-6 text-xl font-bold leading-relaxed text-navy-900 sm:text-2xl">
        {t(question.question)}
      </h2>

      {/* Choices */}
      <div className="mt-6 space-y-3">
        {question.choices.map((choice, i) => {
          const isSelected = choice.id === selectedChoiceId;
          const isCorrectChoice = choice.id === question.correctChoiceId;

          let boxStyles =
            "border-navy-200 bg-white text-navy-800 hover:border-accent-500 hover:bg-accent-50 cursor-pointer";
          let letterStyles = "border-navy-200 bg-navy-50 text-navy-700";
          let status: { label: { th: string; en: string }; correct: boolean } | null =
            null;

          if (answered) {
            if (isCorrectChoice) {
              boxStyles = "border-signal-green bg-green-50 text-navy-900";
              letterStyles = "border-signal-green-deep bg-signal-green-deep text-white";
              status = {
                correct: true,
                label: isSelected
                  ? { th: "ตอบถูก (Correct)", en: "Correct" }
                  : { th: "คำตอบที่ถูกต้อง (Correct answer)", en: "Correct answer" },
              };
            } else if (isSelected) {
              boxStyles = "border-signal-red bg-red-50 text-navy-900";
              letterStyles = "border-signal-red-deep bg-signal-red-deep text-white";
              status = {
                correct: false,
                label: { th: "คำตอบของคุณ (Your answer)", en: "Your answer" },
              };
            } else {
              boxStyles = "border-navy-100 bg-white text-navy-500 opacity-60";
              letterStyles = "border-navy-100 bg-navy-50 text-navy-400";
            }
          }

          return (
            <button
              key={choice.id}
              type="button"
              disabled={answered}
              onClick={() => onSelect(choice.id)}
              className={`flex min-h-12 w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${boxStyles}`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${letterStyles}`}
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">{t(choice.text)}</span>
                {status && (
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold ${
                      status.correct
                        ? "text-signal-green-deep"
                        : "text-signal-red-deep"
                    }`}
                  >
                    {status.correct ? <CheckIcon /> : <CrossIcon />}
                    {t(status.label)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Instant feedback — the region exists before answering so
          aria-live announces the explanation when it appears. */}
      <div aria-live="polite" className="mt-6">
        {answered && (
          <div className="space-y-4">
            <p
              className={`flex items-center gap-2 text-lg font-bold ${
                isCorrect ? "text-signal-green-deep" : "text-signal-red-deep"
              }`}
            >
              {isCorrect ? <CheckIcon /> : <CrossIcon />}
              {isCorrect
                ? t({ th: "ตอบถูก!", en: "Correct!" })
                : t({
                    th: `ยังไม่ถูก — คำตอบที่ถูกต้องคือข้อ ${correctLetter}`,
                    en: `Not quite — the correct answer is ${correctLetter}`,
                  })}
            </p>
            <Callout
              variant="info"
              title={t({
                th: "ทำไมจึงเป็นคำตอบนี้ (Why?)",
                en: "Why this answer?",
              })}
            >
              <p>{t(question.explanation)}</p>
            </Callout>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onNext}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-navy-600"
              >
                {isLast
                  ? t({ th: "ดูผลคะแนน", en: "See results" })
                  : t({ th: "ข้อถัดไป", en: "Next" })}
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
