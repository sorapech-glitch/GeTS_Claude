import type { ReactNode } from "react";

/**
 * Shared inline SVG icons (18×18, currentColor) used across pages —
 * one definition instead of per-page copies. All icons are decorative
 * (`aria-hidden`); pair them with visible or `aria-label` text on the
 * surrounding control.
 */

function IconSvg({
  className,
  filled = false,
  children,
}: {
  className?: string;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <IconSvg className={className}>
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <IconSvg className={className} filled>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </IconSvg>
  );
}

export function PauseIcon({ className }: { className?: string }) {
  return (
    <IconSvg className={className} filled>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
    </IconSvg>
  );
}
