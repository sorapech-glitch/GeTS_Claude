import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Traffic Signal Learning Center | Genius Traffic System",
    template: "%s | Traffic Signal Learning Center",
  },
  description:
    "เรียนรู้ระบบสัญญาณไฟจราจร ตั้งแต่ Fixed Time, Vehicle Actuated ไปจนถึง Adaptive Control — Learn how traffic signal control systems work, from Fixed Time to Adaptive Control.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={plexThai.variable}>
      <body className="font-sans">
        <LanguageProvider>
          <Navbar />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
