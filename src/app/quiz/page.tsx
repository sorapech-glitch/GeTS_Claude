import type { Metadata } from "next";
import { QuizPage } from "@/components/pages/QuizPage";

export const metadata: Metadata = {
  title: "แบบทดสอบ — Quiz",
  description:
    "ทดสอบความเข้าใจเรื่องระบบควบคุมสัญญาณไฟจราจร ครอบคลุม Fixed Time, Vehicle Actuated (VA), Adaptive และคำศัพท์สำคัญ พร้อมเฉลยและคำอธิบายทันทีทุกข้อ — Test your understanding of Fixed Time, Vehicle Actuated, and Adaptive signal control, with instant feedback and an explanation for every question.",
};

export default function Page() {
  return <QuizPage />;
}
