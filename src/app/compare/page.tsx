import type { Metadata } from "next";
import { ComparePage } from "@/components/pages/ComparePage";

export const metadata: Metadata = {
  title: "เปรียบเทียบ 3 ระบบ — Compare Systems",
  description:
    "ตารางเปรียบเทียบระบบควบคุมสัญญาณไฟจราจร Fixed Time, Vehicle Actuated (VA) และ Adaptive ทีละหัวข้อ พร้อมแนวทางเลือกระบบให้เหมาะกับแยกของคุณ — Side-by-side comparison of Fixed Time, VA, and Adaptive traffic signal control, with a decision guide for choosing the right system.",
};

export default function Page() {
  return <ComparePage />;
}
