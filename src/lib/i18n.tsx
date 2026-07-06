"use client";

/**
 * Lightweight bilingual (Thai-first) language system.
 *
 * Usage:
 *   const { lang, setLang, t } = useLanguage();
 *   <h1>{t({ th: "สวัสดี", en: "Hello" })}</h1>
 *
 * Thai is the primary language; English is the secondary toggle.
 * The choice persists in localStorage and updates <html lang>.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Bi } from "@/lib/types";

export type Lang = "th" | "en";

const STORAGE_KEY = "gets-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Resolve a bilingual string for the current language. */
  t: (bi: Bi) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "th") {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode) — language still works for the session
    }
  }, []);

  const t = useCallback((bi: Bi) => bi[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
