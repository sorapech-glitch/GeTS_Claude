import type { Metadata } from "next";
import { SimulatorPage } from "@/components/pages/SimulatorPage";

export const metadata: Metadata = {
  title: "ซิมูเลเตอร์สัญญาณไฟจราจร — Traffic Signal Simulator",
  description:
    "ทดลองควบคุมสี่แยกจำลองด้วยระบบ Fixed Time, Vehicle Actuated (VA) และ Adaptive ปรับปริมาณรถ อุปกรณ์ตรวจจับรถ (Detector), Min/Max Green และ Gap Time แล้วดูผลแบบเรียลไทม์ — An interactive teaching simulator: run one intersection under Fixed Time, VA, and Adaptive control and watch queues, gap-outs, and green allocation live.",
};

export default function Page() {
  return <SimulatorPage />;
}
