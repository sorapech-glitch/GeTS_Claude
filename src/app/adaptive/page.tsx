import type { Metadata } from "next";
import { AdaptivePage } from "@/components/pages/AdaptivePage";

export const metadata: Metadata = {
  title: "Adaptive — ระบบปรับตัวอัตโนมัติ",
  description:
    "เรียนรู้ระบบสัญญาณไฟจราจรแบบปรับตัวอัตโนมัติ (Adaptive Control): ข้อมูลเรียลไทม์ Queue Length, Traffic Volume, Degree of Saturation, การประสานสัญญาณ (Coordination) และ Green Wave พร้อมเดโมไฟเขียวที่ย้ายตามรถสะสม — Learn adaptive traffic signal control with live-data demos, corridor coordination, and honest expectations.",
};

export default function Page() {
  return <AdaptivePage />;
}
