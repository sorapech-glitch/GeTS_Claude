"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  const learnLinks = [
    { href: "/fixed-time", label: "Fixed Time" },
    { href: "/vehicle-actuated", label: "Vehicle Actuated (VA)" },
    { href: "/adaptive", label: "Adaptive Control" },
  ];

  const toolLinks = [
    { href: "/compare", label: t({ th: "เปรียบเทียบระบบ", en: "Compare Systems" }) },
    { href: "/simulator", label: t({ th: "ซิมูเลเตอร์", en: "Simulator" }) },
    { href: "/glossary", label: t({ th: "อภิธานศัพท์", en: "Glossary" }) },
    { href: "/quiz", label: t({ th: "แบบทดสอบ", en: "Quiz" }) },
  ];

  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-navy-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-white">
            Traffic Signal Learning Center
          </p>
          <p className="mt-1 text-sm font-medium text-accent-400">
            Genius Traffic System
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
            {t({
              th: "แหล่งเรียนรู้ระบบควบคุมสัญญาณไฟจราจร สำหรับผู้เริ่มต้น เจ้าหน้าที่ภาครัฐ วิศวกรฝ่ายขาย และทีมงานเทคนิค",
              en: "A learning resource on traffic signal control systems for beginners, government officers, sales engineers, and technical teams.",
            })}
          </p>
        </div>

        <nav aria-label={t({ th: "บทเรียน", en: "Learning modules" })}>
          <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
            {t({ th: "บทเรียน", en: "Learn" })}
          </p>
          <ul className="mt-4 space-y-2">
            {learnLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-navy-200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t({ th: "เครื่องมือ", en: "Tools" })}>
          <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
            {t({ th: "เครื่องมือ", en: "Tools" })}
          </p>
          <ul className="mt-4 space-y-2">
            {toolLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-navy-200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-navy-800">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs leading-relaxed text-navy-400">
            {t({
              th: "เว็บไซต์นี้จัดทำเพื่อการเรียนรู้และสนับสนุนงานขาย ไม่ใช่เอกสารออกแบบทางวิศวกรรมจราจรที่ผ่านการรับรอง",
              en: "This website is for education and sales support. It is not certified traffic engineering design documentation.",
            })}
          </p>
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} Genius Traffic System —{" "}
            {t({ th: "สงวนลิขสิทธิ์", en: "All rights reserved" })}
          </p>
        </div>
      </div>
    </footer>
  );
}
