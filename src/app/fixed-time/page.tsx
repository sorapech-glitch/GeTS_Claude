import type { Metadata } from "next";
import { FixedTimePage } from "@/components/pages/FixedTimePage";

export const metadata: Metadata = {
  title: "Fixed Time — ระบบตั้งเวลาคงที่",
  description:
    "เรียนรู้ระบบสัญญาณไฟจราจรแบบตั้งเวลาคงที่ (Fixed Time Control): รอบสัญญาณไฟ (Cycle Time), เวลาไฟเขียว (Green Time), เฟส (Phase) และ Split พร้อมเดโมสี่แยกจำลองแบบอินเทอร์แอกทีฟ — Learn fixed-time traffic signal control with an interactive intersection demo.",
};

export default function Page() {
  return <FixedTimePage />;
}
