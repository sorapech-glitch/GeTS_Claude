import type { Metadata } from "next";
import { VehicleActuatedPage } from "@/components/pages/VehicleActuatedPage";

export const metadata: Metadata = {
  title: "Vehicle Actuated (VA) — ระบบตรวจจับรถ",
  description:
    "เรียนรู้ระบบสัญญาณไฟจราจรแบบ Vehicle Actuated (VA): อุปกรณ์ตรวจจับรถ, Vehicle Call, Minimum/Maximum Green และ Gap Time พร้อมเดโมโต้ตอบ — Learn how Vehicle Actuated control uses detectors, vehicle calls, and min/max green rules, with an interactive demo.",
};

export default function Page() {
  return <VehicleActuatedPage />;
}
