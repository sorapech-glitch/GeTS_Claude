import type { Metadata } from "next";
import { GlossaryPage } from "@/components/pages/GlossaryPage";

export const metadata: Metadata = {
  title: "อภิธานศัพท์ — Glossary",
  description:
    "รวมคำศัพท์สัญญาณไฟจราจรที่ต้องรู้ ครบทั้งหมวดเวลาสัญญาณ การตรวจจับ ประสิทธิภาพ และการประสานสัญญาณ พร้อมคำอธิบายและตัวอย่างที่เข้าใจง่าย ค้นหาได้ทั้งไทยและอังกฤษ — Essential traffic signal vocabulary across timing, detection, performance, and coordination, with plain-language explanations and examples. Searchable in Thai and English.",
};

export default function Page() {
  return <GlossaryPage />;
}
