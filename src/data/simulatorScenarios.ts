import type { SimulatorScenario } from "@/lib/types";

/**
 * Preset scenarios for the educational traffic-signal simulator.
 *
 * The simulator models a single 4-way intersection:
 * - Main road = East–West (ถนนหลัก แนวตะวันออก–ตะวันตก)
 * - Side road = North–South (ถนนรอง แนวเหนือ–ใต้)
 *
 * Each scenario pairs a settings preset with one clear teaching point
 * (`lesson`). Values are simplified for learning — they are not
 * real-world signal design values.
 */
export const simulatorScenarios: SimulatorScenario[] = [
  {
    id: "steady-downtown",
    name: {
      th: "เมืองช่วงกลางวัน",
      en: "Steady downtown",
    },
    description: {
      th: "ย่านกลางเมืองช่วงกลางวัน รถบนถนนหลักและถนนรองมาสม่ำเสมอพอ ๆ กัน ระบบใช้รอบสัญญาณไฟ (Cycle Time) คงที่ 80 วินาที โดยไม่ต้องใช้อุปกรณ์ตรวจจับรถ (Detector)",
      en: "A downtown intersection at midday. Traffic on the main and side roads arrives steadily and evenly. The signal runs a fixed 80-second cycle with no detectors.",
    },
    settings: {
      mode: "fixed",
      mainDemand: "medium",
      sideDemand: "medium",
      detectorEnabled: false,
      cycleLength: 80,
      minGreen: 10,
      maxGreen: 40,
      gapTime: 3,
    },
    lesson: {
      th: "เมื่อปริมาณรถสม่ำเสมอและคาดการณ์ได้ ระบบ Fixed Time ทำงานได้ดี เพราะเวลาเขียว (Green Time) ที่ตั้งไว้ล่วงหน้าตรงกับความต้องการจริงเกือบตลอดเวลา",
      en: "When demand is steady and predictable, Fixed Time works well — the pre-set green time matches real demand most of the time.",
    },
  },
  {
    id: "quiet-side-road-night",
    name: {
      th: "ถนนรองเงียบตอนกลางคืน",
      en: "Quiet side road at night",
    },
    description: {
      th: "ช่วงดึกที่รถน้อยทั้งสองทิศทาง ระบบ Vehicle Actuated (VA) ใช้อุปกรณ์ตรวจจับรถ (Detector) เพื่อให้ไฟเขียวเฉพาะเมื่อมีรถมาจริง",
      en: "Late at night with light traffic in both directions. Vehicle Actuated (VA) control uses detectors so green is served only when a vehicle actually arrives.",
    },
    settings: {
      mode: "va",
      mainDemand: "low",
      sideDemand: "low",
      detectorEnabled: true,
      cycleLength: 60,
      minGreen: 8,
      maxGreen: 35,
      gapTime: 3,
    },
    lesson: {
      th: "สังเกตว่าเมื่ออุปกรณ์ตรวจจับไม่พบรถบนถนนรอง ระบบ VA จะข้ามหรือย่นเวลาเขียวของถนนรองให้สั้นลง ถนนหลักจึงได้ไฟเขียวต่อเนื่อง ลดการรอไฟแดงโดยไม่จำเป็น",
      en: "Watch how VA skips or shortens the side-road green when no vehicles are detected, letting the main road stay green and cutting unnecessary red-light waiting.",
    },
  },
  {
    id: "main-road-rush-hour",
    name: {
      th: "ชั่วโมงเร่งด่วนฝั่งถนนหลัก",
      en: "Main-road rush hour",
    },
    description: {
      th: "ชั่วโมงเร่งด่วนที่รถบนถนนหลักมาหนาแน่นต่อเนื่อง ส่วนถนนรองมีรถประปราย ระบบ VA ต่อเวลาเขียวครั้งละช่วงสั้น ๆ ตามช่วงห่างระหว่างรถ (Gap Time) 4 วินาที",
      en: "Rush hour with heavy, continuous traffic on the main road and only occasional side-road vehicles. VA extends the green in small steps using a 4-second gap time.",
    },
    settings: {
      mode: "va",
      mainDemand: "high",
      sideDemand: "low",
      detectorEnabled: true,
      cycleLength: 90,
      minGreen: 10,
      maxGreen: 50,
      gapTime: 4,
    },
    lesson: {
      th: "ตราบใดที่ยังมีรถวิ่งผ่านอุปกรณ์ตรวจจับ (Detector) ก่อนหมดช่วงห่างที่กำหนด ไฟเขียวของถนนหลักจะถูกต่อออกไปเรื่อย ๆ จนถึงเพดานเวลาเขียวสูงสุด (Max Green) เพื่อไม่ให้ถนนรองต้องรอนานเกินไป",
      en: "As long as vehicles keep arriving within the gap time, the main-road green keeps extending — up to the Max Green ceiling, which protects the side road from waiting forever.",
    },
  },
  {
    id: "fluctuating-demand",
    name: {
      th: "ความต้องการแกว่งตลอดวัน",
      en: "Fluctuating demand",
    },
    description: {
      th: "แยกที่ปริมาณรถขึ้น ๆ ลง ๆ ตลอดวัน ถนนหลักหนาแน่นและถนนรองมีรถปานกลาง ระบบ Adaptive ใช้ข้อมูลจากอุปกรณ์ตรวจจับรถ (Detector) มาปรับแผนสัญญาณไฟอย่างต่อเนื่อง",
      en: "An intersection where demand swings through the day — heavy on the main road, moderate on the side road. Adaptive control keeps adjusting the signal plan from detector data.",
    },
    settings: {
      mode: "adaptive",
      mainDemand: "high",
      sideDemand: "medium",
      detectorEnabled: true,
      cycleLength: 90,
      minGreen: 10,
      maxGreen: 55,
      gapTime: 3,
    },
    lesson: {
      th: "ระบบ Adaptive จะแบ่งเวลาเขียว (Green Time) ใหม่ตามสัดส่วนของแถวรถ (Queue) ที่วัดได้จริง ทิศทางที่รถสะสมมากกว่าจะได้เวลาเขียวมากกว่า และปรับใหม่ทุกครั้งที่สถานการณ์เปลี่ยน",
      en: "Adaptive redistributes green time in proportion to the queues it actually measures — the direction with the longer queue gets more green, re-balanced as conditions change.",
    },
  },
  {
    id: "fixed-time-uneven-demand",
    name: {
      th: "Fixed Time เจอรถไม่สม่ำเสมอ",
      en: "Fixed Time under uneven demand",
    },
    description: {
      th: "ถนนหลักรถหนาแน่น แต่ถนนรองแทบไม่มีรถ ระบบยังคงใช้ Fixed Time รอบละ 80 วินาที และให้ไฟเขียวถนนรองตามตารางเดิมทุกครั้ง ไม่ว่าจะมีรถหรือไม่",
      en: "The main road is congested while the side road is nearly empty, yet Fixed Time keeps its 80-second schedule and serves the side road every cycle whether vehicles are there or not.",
    },
    settings: {
      mode: "fixed",
      mainDemand: "high",
      sideDemand: "low",
      detectorEnabled: false,
      cycleLength: 80,
      minGreen: 10,
      maxGreen: 40,
      gapTime: 3,
    },
    lesson: {
      th: "สังเกตว่าไฟเขียวถูกใช้ไปกับถนนรองที่ว่างเปล่า ขณะที่แถวรถ (Queue) บนถนนหลักยาวขึ้นเรื่อย ๆ นี่คือข้อจำกัดของ Fixed Time และเป็นเหตุผลที่ระบบ VA และ Adaptive ถูกพัฒนาขึ้น",
      en: "Notice how green time is wasted on the empty side road while the main-road queue keeps growing — the key limitation of Fixed Time, and the motivation for VA and Adaptive control.",
    },
  },
];
