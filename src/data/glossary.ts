import type { GlossaryTerm } from "@/lib/types";

/**
 * Glossary of traffic signal terms — Thai primary, English secondary.
 * Categories: timing | detection | performance | coordination.
 * Explanations are beginner-friendly but technically correct; examples use
 * realistic numbers so readers build intuition for real-world values.
 */
export const glossaryTerms: GlossaryTerm[] = [
  /* ------------------------------------------------------------------ */
  /* Timing                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: "cycle-time",
    en: "Cycle Time",
    th: "รอบสัญญาณไฟ",
    explanation: {
      th: "เวลาทั้งหมดที่สัญญาณไฟใช้จนครบหนึ่งรอบ นับตั้งแต่ไฟเขียวของทิศแรกจนวนกลับมาที่จุดเดิมอีกครั้ง แยกทั่วไปมักใช้รอบสัญญาณไฟ (Cycle Time) ประมาณ 60–150 วินาที",
      en: "The total time for the signal to complete one full sequence, from the first green until the same point in the sequence comes around again. Typical intersections use a cycle time of about 60–150 seconds.",
    },
    example: {
      th: "แยกแห่งหนึ่งใช้รอบสัญญาณไฟ 90 วินาที แบ่งเป็นไฟเขียวถนนหลัก 45 วินาที ไฟเขียวถนนรอง 30 วินาที ที่เหลือ 15 วินาทีเป็นไฟเหลืองและช่วงไฟแดงพร้อมกันทุกทิศทาง (All-Red)",
      en: "An intersection runs a 90-second cycle: 45 s green for the main road, 30 s green for the side road, and the remaining 15 s for yellow and all-red intervals.",
    },
    category: "timing",
  },
  {
    id: "phase",
    en: "Phase",
    th: "เฟสสัญญาณ",
    explanation: {
      th: "ช่วงเวลาที่กลุ่มทิศทางการเดินรถซึ่งไม่ขัดแย้งกันได้รับไฟเขียวพร้อมกัน หนึ่งรอบสัญญาณไฟประกอบด้วยหลายเฟส (Phase) เรียงต่อกันจนครบทุกทิศทาง",
      en: "A part of the cycle in which a group of non-conflicting movements receives green at the same time. One cycle is made up of several phases in sequence, covering every approach.",
    },
    example: {
      th: "สี่แยกแบบง่ายมี 2 เฟส คือ เฟสที่ 1 ให้ไฟเขียวทิศเหนือ–ใต้ และเฟสที่ 2 ให้ไฟเขียวทิศตะวันออก–ตะวันตก สลับกันไปตลอดทั้งวัน",
      en: "A simple four-way junction has 2 phases: Phase 1 gives green to the north–south road, Phase 2 gives green to the east–west road, alternating all day.",
    },
    category: "timing",
  },
  {
    id: "split",
    en: "Split",
    th: "สัดส่วนเวลาเขียว",
    explanation: {
      th: "การแบ่งเวลาในหนึ่งรอบสัญญาณไฟให้แต่ละเฟส (Phase) มักระบุเป็นวินาทีหรือเปอร์เซ็นต์ของรอบ ทิศทางที่มีรถมากควรได้ Split มากกว่าทิศทางที่มีรถน้อย",
      en: "How the cycle time is divided among the phases, usually stated in seconds or as a percentage of the cycle. Approaches with heavier traffic should receive a larger split.",
    },
    example: {
      th: "รอบสัญญาณไฟ 100 วินาที ตั้ง Split ให้ถนนหลัก 60% (60 วินาที) และถนนรอง 40% (40 วินาที) ตามปริมาณรถของแต่ละฝั่ง",
      en: "With a 100-second cycle, the main road gets a 60% split (60 s) and the side road 40% (40 s), matching each road's traffic volume.",
    },
    category: "timing",
  },
  {
    id: "green-time",
    en: "Green Time",
    th: "เวลาไฟเขียว",
    explanation: {
      th: "ระยะเวลาที่ทิศทางหนึ่งได้รับไฟเขียวในแต่ละรอบ เวลาไฟเขียว (Green Time) เป็นตัวกำหนดว่าจะปล่อยรถผ่านแยกได้กี่คันต่อรอบ",
      en: "How long an approach shows green in each cycle. Green time determines how many vehicles can pass through the intersection per cycle.",
    },
    example: {
      th: "ไฟเขียว 35 วินาที ปล่อยรถได้ประมาณ 1 คันทุก 2 วินาทีต่อช่องจราจร คิดเป็นราว 17 คันต่อช่องจราจรต่อรอบ",
      en: "A 35-second green discharges roughly one vehicle every 2 seconds per lane, or about 17 vehicles per lane per cycle.",
    },
    category: "timing",
  },
  {
    id: "yellow-time",
    en: "Yellow Time",
    th: "เวลาไฟเหลือง",
    explanation: {
      th: "ช่วงเตือนระหว่างไฟเขียวกับไฟแดง เพื่อให้ผู้ขับขี่ตัดสินใจหยุดได้อย่างปลอดภัย หรือขับผ่านแยกไปได้ทันก่อนไฟแดง ปกติใช้ประมาณ 3–5 วินาที ขึ้นกับความเร็วของถนน",
      en: "The warning interval between green and red, giving drivers time to stop safely or clear the intersection before the red. Usually 3–5 seconds, depending on the road's speed.",
    },
    example: {
      th: "ถนนที่จำกัดความเร็ว 60 กม./ชม. มักตั้งเวลาไฟเหลือง (Yellow Time) ประมาณ 4 วินาที ถ้าถนนเร็วกว่านี้ต้องเผื่อเวลาไฟเหลืองนานขึ้น",
      en: "A road with a 60 km/h speed limit typically uses about 4 seconds of yellow; faster roads need a longer yellow time.",
    },
    category: "timing",
  },
  {
    id: "all-red-time",
    en: "All-Red Time",
    th: "ช่วงไฟแดงพร้อมกันทุกทิศทาง",
    explanation: {
      th: "ช่วงสั้น ๆ ที่ทุกทิศทางเห็นไฟแดงพร้อมกัน เพื่อให้รถคันสุดท้ายที่ค้างอยู่กลางแยกออกไปได้หมดก่อนที่ทิศถัดไปจะได้ไฟเขียว ช่วยลดโอกาสเกิดอุบัติเหตุตัดหน้ากัน ปกติใช้ 1–3 วินาที",
      en: "A short interval when every approach shows red at the same time, letting vehicles still inside the intersection clear out before the next phase turns green. It reduces conflict crashes and usually lasts 1–3 seconds.",
    },
    example: {
      th: "หลังไฟเหลือง 3 วินาที แยกแห่งนี้ตั้ง All-Red อีก 2 วินาที รวมเป็นช่วงเปลี่ยนเฟส 5 วินาที ก่อนทิศถัดไปได้ไฟเขียว",
      en: "After a 3-second yellow, the junction adds 2 seconds of all-red — a 5-second changeover in total before the next approach gets green.",
    },
    category: "timing",
  },
  {
    id: "minimum-green",
    en: "Minimum Green",
    th: "เวลาเขียวขั้นต่ำ",
    explanation: {
      th: "เวลาไฟเขียวที่สั้นที่สุดที่ระบบยอมให้ในแต่ละเฟส แม้จะมีรถน้อยก็ตาม เพื่อความปลอดภัยและให้รถที่จอดรอมีเวลาออกตัว ใช้มากในระบบ Vehicle Actuated (VA)",
      en: "The shortest green the controller will allow for a phase, even under very light demand — for safety and so waiting vehicles have time to start moving. Widely used in Vehicle Actuated (VA) control.",
    },
    example: {
      th: "ตั้ง Minimum Green ไว้ 7 วินาที แม้ถนนรองมีรถรอเพียงคันเดียว ไฟเขียวจะเปิดอย่างน้อย 7 วินาทีก่อนระบบพิจารณาตัดจบ",
      en: "With a 7-second minimum green, even if only one car is waiting on the side road, the green stays on for at least 7 seconds before the controller may end it.",
    },
    category: "timing",
  },
  {
    id: "maximum-green",
    en: "Maximum Green",
    th: "เวลาเขียวสูงสุด",
    explanation: {
      th: "เวลาไฟเขียวที่ยาวที่สุดที่เฟสหนึ่งจะครองได้ แม้จะยังมีรถมาต่อเนื่อง เพื่อไม่ให้ทิศทางอื่นต้องรอนานเกินไป เมื่อครบ Maximum Green ระบบจะบังคับเปลี่ยนเฟส",
      en: "The longest green one phase may hold, even if vehicles keep arriving, so other approaches never wait indefinitely. When the maximum green is reached, the controller forces the phase to end.",
    },
    example: {
      th: "ตั้ง Maximum Green ของถนนหลักไว้ 60 วินาที ถึงรถจะยังมาไม่ขาดสาย ไฟจะเปลี่ยนเมื่อครบ 60 วินาที เพื่อให้ถนนรองได้ไฟเขียวบ้าง",
      en: "The main road's maximum green is set to 60 seconds; even with a continuous stream of cars, the green ends at 60 s so the side road gets its turn.",
    },
    category: "timing",
  },

  /* ------------------------------------------------------------------ */
  /* Detection                                                           */
  /* ------------------------------------------------------------------ */
  {
    id: "detector",
    en: "Detector",
    th: "อุปกรณ์ตรวจจับรถ",
    explanation: {
      th: "อุปกรณ์ที่ตรวจว่ามีรถวิ่งผ่านหรือจอดรออยู่ เช่น ขดลวดเหนี่ยวนำ (Inductive Loop) ฝังใต้ผิวถนน เรดาร์ หรือกล้องวิเคราะห์ภาพ ข้อมูลจาก Detector คือหัวใจของระบบ VA และ Adaptive",
      en: "A device that senses vehicles passing or waiting — such as an inductive loop buried in the pavement, a radar unit, or a video analytics camera. Detector data is the heart of VA and Adaptive control.",
    },
    example: {
      th: "ฝังขดลวด Inductive Loop ไว้ใต้ผิวถนนห่างจากเส้นหยุดประมาณ 40 เมตร เมื่อรถวิ่งทับขดลวด ตู้ควบคุมจะรับรู้ทันทีว่ามีรถเข้ามา",
      en: "An inductive loop is buried about 40 metres before the stop line; when a car drives over it, the controller instantly knows a vehicle is approaching.",
    },
    category: "detection",
  },
  {
    id: "vehicle-call",
    en: "Vehicle Call",
    th: "การเรียกเฟสจากรถ",
    explanation: {
      th: "เมื่อ Detector ตรวจพบรถในทิศทางที่กำลังเป็นไฟแดง ระบบจะบันทึกการเรียกเฟส (Vehicle Call) เพื่อจัดไฟเขียวให้ทิศทางนั้นในเฟสถัดไป ถ้าไม่มีการเรียก ระบบสามารถข้ามเฟสนั้นไปได้เลย",
      en: "When a detector senses a vehicle on an approach that is currently red, the controller registers a call requesting green for that approach. If no call exists, the controller can skip that phase entirely.",
    },
    example: {
      th: "กลางดึกมีรถคันเดียวมาจอดรอที่ถนนรอง Detector ส่ง Vehicle Call ไปที่ตู้ควบคุม ระบบจึงตัดไฟเขียวถนนหลักแล้วเปิดไฟเขียวให้ถนนรองภายในไม่กี่วินาที",
      en: "Late at night a single car stops on the side road; the detector sends a vehicle call, so the controller ends the main-road green and serves the side road within seconds.",
    },
    category: "detection",
  },
  {
    id: "gap-time",
    en: "Gap Time",
    th: "ช่วงห่างระหว่างรถ",
    explanation: {
      th: "ในระบบ VA ไฟเขียวจะต่อเวลาให้เรื่อย ๆ ตราบใดที่รถคันถัดไปมาถึง Detector ทันภายใน Gap Time ที่ตั้งไว้ ถ้าช่วงห่างระหว่างรถนานเกินค่านี้ แปลว่ารถขาดตอน ระบบจะตัดจบไฟเขียว",
      en: "In VA control, the green keeps extending as long as the next vehicle reaches the detector within the set gap time. If the gap between vehicles exceeds this value, traffic has thinned out and the green is ended.",
    },
    example: {
      th: "ตั้ง Gap Time ไว้ 3 วินาที เมื่อไม่มีรถวิ่งผ่าน Detector นานเกิน 3 วินาที ระบบถือว่ารถหมดแล้ว จึงเปลี่ยนไปให้ไฟเขียวทิศถัดไป",
      en: "With a 3-second gap time, once no vehicle crosses the detector for more than 3 seconds, the controller decides the platoon has ended and moves green to the next approach.",
    },
    category: "detection",
  },

  /* ------------------------------------------------------------------ */
  /* Performance                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: "queue-length",
    en: "Queue Length",
    th: "ความยาวแถวรถ",
    explanation: {
      th: "จำนวนรถ (หรือระยะทางเป็นเมตร) ที่จอดต่อแถวรอไฟแดงในทิศทางหนึ่ง เป็นตัวชี้วัดพื้นฐานว่าแยกรับมือกับปริมาณรถได้ดีแค่ไหน ยิ่งแถวรถยาว ผู้ใช้ทางยิ่งเสียเวลามาก",
      en: "The number of vehicles (or the distance in metres) queued at a red light on one approach. It is a basic measure of how well the intersection is coping — the longer the queue, the more delay drivers experience.",
    },
    example: {
      th: "ชั่วโมงเร่งด่วนเช้า ถนนหลักมีความยาวแถวรถ (Queue Length) ประมาณ 20 คัน หรือราว 120 เมตร ถ้าไฟเขียวหนึ่งรอบระบายไม่หมด แถวจะสะสมยาวขึ้นเรื่อย ๆ",
      en: "In the morning peak the main road queue is about 20 vehicles, roughly 120 metres. If one green cannot clear it, the queue keeps growing cycle after cycle.",
    },
    category: "performance",
  },
  {
    id: "degree-of-saturation",
    en: "Degree of Saturation",
    th: "ระดับการอิ่มตัว",
    explanation: {
      th: "อัตราส่วนระหว่างปริมาณรถที่มาถึงกับความสามารถในการระบายรถของแยก (v/c) ค่าใกล้ 1.0 แปลว่าใช้ความจุเกือบเต็ม ถ้าเกิน 1.0 รถมาเร็วกว่าที่ระบายได้ แถวรถจะยาวขึ้นทุกรอบ",
      en: "The ratio of arriving traffic to the capacity the signal can discharge (v/c). A value near 1.0 means the approach is close to capacity; above 1.0, vehicles arrive faster than they can be served and queues grow every cycle.",
    },
    example: {
      th: "ทิศทางหนึ่งระบายรถได้สูงสุด 1,000 คัน/ชั่วโมง แต่มีรถมา 900 คัน/ชั่วโมง ระดับการอิ่มตัว (Degree of Saturation) = 0.90 ถือว่าใกล้เต็มความจุ ควรเฝ้าระวัง",
      en: "An approach can discharge at most 1,000 vehicles/hour but receives 900 vehicles/hour — a degree of saturation of 0.90, close to capacity and worth monitoring.",
    },
    category: "performance",
  },

  /* ------------------------------------------------------------------ */
  /* Coordination                                                        */
  /* ------------------------------------------------------------------ */
  {
    id: "coordination",
    en: "Coordination",
    th: "การประสานสัญญาณ",
    explanation: {
      th: "การตั้งเวลาสัญญาณไฟของแยกที่อยู่ใกล้กันให้สัมพันธ์กัน เพื่อให้รถที่ออกจากแยกหนึ่งไปเจอไฟเขียวที่แยกถัดไปพอดี เกิดเป็น \"คลื่นไฟเขียว\" (Green Wave) ลดการหยุดซ้ำ ๆ ตลอดเส้นทาง",
      en: "Timing nearby intersections in relation to each other so vehicles leaving one junction arrive at the next on green — creating a green wave that cuts repeated stops along the route.",
    },
    example: {
      th: "ถนนหลักมีแยกต่อเนื่องกัน 4 แยก ทุกแยกใช้รอบสัญญาณไฟ 90 วินาทีเท่ากันและตั้งเวลาต่อเนื่องกัน รถที่วิ่งประมาณ 50 กม./ชม. จะผ่านได้โดยแทบไม่ต้องหยุดเลย",
      en: "Four consecutive junctions on a main road all run the same 90-second cycle with linked timings; cars travelling at about 50 km/h pass through with almost no stops.",
    },
    category: "coordination",
  },
  {
    id: "offset",
    en: "Offset",
    th: "ค่าเหลื่อมเวลา",
    explanation: {
      th: "ระยะเวลาที่จุดเริ่มไฟเขียวของแยกหนึ่งเหลื่อมจากแยกก่อนหน้า ในระบบประสานสัญญาณ ค่า Offset ที่ดีต้องเท่ากับเวลาที่รถใช้เดินทางระหว่างแยกทั้งสอง",
      en: "The time difference between the start of green at one intersection and the start of green at the previous one in a coordinated system. A good offset matches the travel time between the two junctions.",
    },
    example: {
      th: "แยก B อยู่ห่างจากแยก A 500 เมตร รถวิ่ง 50 กม./ชม. ใช้เวลาประมาณ 36 วินาที จึงตั้ง Offset ของแยก B ไว้ 36 วินาที เพื่อให้รถมาถึงตอนไฟเขียวเปิดพอดี",
      en: "Junction B is 500 metres after junction A; at 50 km/h the trip takes about 36 seconds, so B's offset is set to 36 s and cars arrive just as the green begins.",
    },
    category: "coordination",
  },
  {
    id: "corridor-control",
    en: "Corridor Control",
    th: "การควบคุมสัญญาณไฟตลอดแนวเส้นทาง",
    explanation: {
      th: "การบริหารสัญญาณไฟทุกแยกบนถนนสายหนึ่งให้ทำงานร่วมกันเป็นระบบเดียว มักสั่งการจากศูนย์ควบคุมกลาง เป้าหมายคือให้การจราจรไหลลื่นทั้งเส้นทาง ไม่ใช่แค่แยกใดแยกหนึ่ง",
      en: "Managing every signal along one road as a single system, often from a central control room. The goal is smooth flow along the whole route, not just at any single intersection.",
    },
    example: {
      th: "ถนนหลักยาว 5 กิโลเมตร มีแยก 8 แห่ง ศูนย์ควบคุมกลางกำหนดรอบสัญญาณไฟและค่า Offset ให้สอดคล้องกันทั้งแนว และปรับตามสภาพจราจรเช้า–เย็นที่ต่างกัน",
      en: "A 5-kilometre main road has 8 junctions; the control centre sets consistent cycle times and offsets along the corridor and adjusts them for the different morning and evening patterns.",
    },
    category: "coordination",
  },
];
