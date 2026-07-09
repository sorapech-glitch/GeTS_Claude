import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: {
    absolute: "Traffic Signal Learning Center | Genius Traffic System",
  },
  description:
    "เรียนรู้ระบบสัญญาณไฟจราจร ตั้งแต่ Fixed Time, Vehicle Actuated ไปจนถึง Adaptive Control — Learn traffic signal control, from Fixed Time and Vehicle Actuated to Adaptive Control.",
};

export default function Page() {
  return <HomePage />;
}
