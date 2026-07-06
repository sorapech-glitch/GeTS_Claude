import Link from "next/link";
import type { ReactNode } from "react";
import type { SystemAccent } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Accent mapping — one place that turns a SystemAccent into classes   */
/* ------------------------------------------------------------------ */

export const ACCENT_STYLES: Record<
  SystemAccent,
  { text: string; bg: string; softBg: string; border: string; ring: string }
> = {
  blue: {
    text: "text-system-blue",
    bg: "bg-system-blue",
    softBg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-500/20",
  },
  cyan: {
    text: "text-accent-600",
    bg: "bg-accent-500",
    softBg: "bg-accent-50",
    border: "border-accent-100",
    ring: "ring-cyan-500/20",
  },
  violet: {
    text: "text-system-violet",
    bg: "bg-system-violet",
    softBg: "bg-violet-50",
    border: "border-violet-200",
    ring: "ring-violet-500/20",
  },
};

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function Section({
  children,
  className = "",
  dark = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Dark navy band (use sparingly for emphasis sections). */
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${dark ? "bg-navy-900 text-white" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p
          className={`text-sm font-semibold uppercase tracking-widest ${
            dark ? "text-accent-400" : "text-accent-600"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg ${dark ? "text-navy-200" : "text-navy-600"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Dark navy hero used at the top of each module/tool page. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional visual rendered beside/below the text (e.g., a diagram). */
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy-900 text-white">
      {/* Subtle grid texture */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.07]"
      >
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0v40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div
          className={
            children
              ? "grid items-center gap-10 lg:grid-cols-2"
              : "max-w-3xl"
          }
        >
          <div>
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 text-lg leading-relaxed text-navy-200">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-navy-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export type BadgeTone =
  | "neutral"
  | "green"
  | "yellow"
  | "red"
  | "accent"
  | "blue"
  | "violet";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-navy-100 text-navy-700",
  green: "bg-green-100 text-signal-green-deep",
  yellow: "bg-amber-100 text-signal-yellow-deep",
  red: "bg-red-100 text-signal-red-deep",
  accent: "bg-accent-100 text-accent-700",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Callouts (analogy / example / info / warning)                       */
/* ------------------------------------------------------------------ */

export type CalloutVariant = "analogy" | "example" | "info" | "warning";

const CALLOUT_STYLES: Record<
  CalloutVariant,
  { box: string; icon: ReactNode }
> = {
  analogy: {
    box: "border-accent-100 bg-accent-50",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent-600">
        <path
          d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.87c.7.52 1.1 1.29 1.24 2.13h4.52c.14-.84.54-1.61 1.24-2.13A6 6 0 0 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  example: {
    box: "border-navy-100 bg-navy-50",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-navy-600">
        <path
          d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  info: {
    box: "border-blue-200 bg-blue-50",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-blue-600">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 11v5m0-8.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    box: "border-amber-200 bg-amber-50",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal-yellow-deep">
        <path
          d="M12 4 2.8 20h18.4L12 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 10v4.5m0 2.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function Callout({
  variant,
  title,
  children,
  className = "",
}: {
  variant: CalloutVariant;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const styles = CALLOUT_STYLES[variant];
  return (
    <div className={`rounded-2xl border p-5 ${styles.box} ${className}`}>
      <div className="flex items-center gap-2.5">
        {styles.icon}
        <p className="font-semibold text-navy-900">{title}</p>
      </div>
      <div className="mt-2 text-navy-700">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "secondary" | "outline" | "onDark";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-navy-700 text-white hover:bg-navy-600 focus-visible:outline-navy-700",
  secondary:
    "bg-accent-500 text-navy-950 hover:bg-accent-400 focus-visible:outline-accent-500",
  outline:
    "border border-navy-300 text-navy-800 hover:border-navy-500 hover:bg-navy-50",
  onDark:
    "border border-navy-500 text-white hover:border-navy-300 hover:bg-navy-800",
};

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-colors ${BUTTON_STYLES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Advantages / limitations grid                                       */
/* ------------------------------------------------------------------ */

export function ProsConsGrid({
  prosTitle,
  consTitle,
  pros,
  cons,
}: {
  prosTitle: string;
  consTitle: string;
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-l-4 border-l-signal-green">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal-green-deep">
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {prosTitle}
        </h3>
        <ul className="mt-4 space-y-3">
          {pros.map((item, i) => (
            <li key={i} className="flex gap-3 text-navy-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-green" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="border-l-4 border-l-signal-red">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal-red-deep">
            <path d="M12 8v5m0 3.5v.5m9-4.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {consTitle}
        </h3>
        <ul className="mt-4 space-y-3">
          {cons.map((item, i) => (
            <li key={i} className="flex gap-3 text-navy-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-red" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
