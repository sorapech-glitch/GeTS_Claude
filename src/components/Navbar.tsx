"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

interface NavItem {
  href: string;
  label: Bi;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: { th: "หน้าแรก", en: "Home" } },
  { href: "/fixed-time", label: { th: "Fixed Time", en: "Fixed Time" } },
  { href: "/vehicle-actuated", label: { th: "Vehicle Actuated", en: "Vehicle Actuated" } },
  { href: "/adaptive", label: { th: "Adaptive", en: "Adaptive" } },
  { href: "/compare", label: { th: "เปรียบเทียบ", en: "Compare" } },
  { href: "/simulator", label: { th: "ซิมูเลเตอร์", en: "Simulator" } },
  { href: "/glossary", label: { th: "อภิธานศัพท์", en: "Glossary" } },
  { href: "/quiz", label: { th: "แบบทดสอบ", en: "Quiz" } },
];

/** Small three-dot traffic light logo mark. */
function LogoMark() {
  return (
    <svg
      width="22"
      height="44"
      viewBox="0 0 22 44"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="1" y="1" width="20" height="42" rx="6" className="fill-navy-800 stroke-navy-600" strokeWidth="1.5" />
      <circle cx="11" cy="10" r="4.5" className="fill-signal-red" />
      <circle cx="11" cy="22" r="4.5" className="fill-signal-yellow" />
      <circle cx="11" cy="34" r="4.5" className="fill-signal-green" />
    </svg>
  );
}

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-800 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900"
      >
        {t({ th: "ข้ามไปยังเนื้อหาหลัก", en: "Skip to main content" })}
      </a>
      <nav
        aria-label={t({ th: "เมนูหลัก", en: "Main navigation" })}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">
              Traffic Signal Learning Center
            </span>
            <span className="block truncate text-xs text-navy-300">
              Genius Traffic System
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-navy-700 text-white"
                    : "text-navy-200 hover:bg-navy-800 hover:text-white"
                }`}
              >
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div
            role="group"
            aria-label={t({ th: "เลือกภาษา", en: "Choose language" })}
            className="flex overflow-hidden rounded-lg border border-navy-600"
          >
            <button
              type="button"
              onClick={() => setLang("th")}
              aria-pressed={lang === "th"}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                lang === "th"
                  ? "bg-white text-navy-900"
                  : "bg-transparent text-navy-200 hover:bg-navy-800"
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                lang === "en"
                  ? "bg-white text-navy-900"
                  : "bg-transparent text-navy-200 hover:bg-navy-800"
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t({ th: "เปิด/ปิดเมนู", en: "Toggle menu" })}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-navy-200 hover:bg-navy-800 hover:text-white lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-navy-800 lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-base font-medium ${
                    isActive(item.href)
                      ? "bg-navy-700 text-white"
                      : "text-navy-200 hover:bg-navy-800 hover:text-white"
                  }`}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
