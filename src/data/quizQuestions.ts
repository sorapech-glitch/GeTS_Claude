import type { QuizQuestion } from "@/lib/types";

/**
 * Quiz questions — Thai primary, English secondary.
 * 10 multiple-choice questions, 4 choices each ("a"–"d"), exactly one correct.
 * Explanations state why the correct answer is right so learners also see
 * why the distractors fail. Terminology matches the glossary
 * (src/data/glossary.ts) so the quiz reinforces the same vocabulary.
 */
export const quizQuestions: QuizQuestion[] = [
  {
    id: "fixed-time-best-fit",
    question: {
      th: "ระบบ Fixed Time เหมาะกับแยกแบบไหนมากที่สุด?",
      en: "Which kind of intersection suits Fixed Time control best?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "แยกที่ปริมาณรถผันผวนตลอดวันจนคาดเดาไม่ได้",
          en: "An intersection where traffic fluctuates unpredictably all day",
        },
      },
      {
        id: "b",
        text: {
          th: "แยกที่ปริมาณรถค่อนข้างคงที่และมีรูปแบบซ้ำเดิมทุกวัน",
          en: "An intersection with fairly steady traffic that repeats the same pattern every day",
        },
      },
      {
        id: "c",
        text: {
          th: "แยกที่ต้องปรับสัญญาณตามข้อมูลจราจรแบบเรียลไทม์",
          en: "An intersection that must adjust its signals from real-time traffic data",
        },
      },
      {
        id: "d",
        text: {
          th: "แยกที่มีรถเฉพาะบางช่วงเวลา เช่น กลางดึกแทบไม่มีรถเลย",
          en: "An intersection with traffic only at certain times, e.g. almost empty late at night",
        },
      },
    ],
    correctChoiceId: "b",
    explanation: {
      th: "Fixed Time ทำงานตามแผนเวลาที่ตั้งไว้ล่วงหน้า ไม่มีอุปกรณ์ตรวจจับรถ จึงได้ผลดีเมื่อปริมาณรถค่อนข้างคงที่และคาดเดาได้ ตั้งรอบสัญญาณไฟ (Cycle Time) ครั้งเดียวก็ใช้ได้ทุกวัน ส่วนแยกที่รถผันผวน หรือมีรถเฉพาะบางช่วง ระบบตายตัวจะเสียเวลาเปล่า ต้องใช้ VA หรือ Adaptive ที่ตอบสนองต่อรถจริงได้ดีกว่า",
      en: "Fixed Time follows a pre-set timing plan with no vehicle detection, so it works best where traffic is steady and predictable — set the cycle time once and it fits every day. Where traffic fluctuates, or vehicles appear only at certain times, a fixed plan wastes green time; VA or Adaptive control responds to actual demand far better.",
    },
    relatedSystem: "fixed-time",
  },
  {
    id: "va-key-equipment",
    question: {
      th: "ระบบ Vehicle Actuated (VA) ต้องใช้อุปกรณ์อะไรเป็นหลักจึงจะทำงานได้?",
      en: "What key equipment does Vehicle Actuated (VA) control need in order to work?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "อุปกรณ์ตรวจจับรถ (Detector) เช่น Inductive Loop เรดาร์ หรือกล้องวิเคราะห์ภาพ",
          en: "Vehicle detectors — e.g. inductive loops, radar, or video analytics cameras",
        },
      },
      {
        id: "b",
        text: {
          th: "ป้ายแสดงข้อความอัจฉริยะ (VMS) เพื่อบอกสภาพจราจรให้ผู้ขับขี่",
          en: "Variable message signs (VMS) to inform drivers of traffic conditions",
        },
      },
      {
        id: "c",
        text: {
          th: "อุปกรณ์ GPS ติดตั้งในรถทุกคันที่ผ่านแยก",
          en: "GPS units installed in every vehicle passing the intersection",
        },
      },
      {
        id: "d",
        text: {
          th: "ศูนย์ควบคุมกลางที่เชื่อมต่อแยกทุกแห่งในเมือง",
          en: "A central control room connected to every intersection in the city",
        },
      },
    ],
    correctChoiceId: "a",
    explanation: {
      th: "หัวใจของ VA คืออุปกรณ์ตรวจจับรถ (Detector) เพราะระบบต้องรู้ว่ามีรถมาถึงหรือจอดรออยู่จริง จึงจะตัดสินใจต่อไฟเขียว ตัดจบ หรือข้ามเฟสได้ ป้าย VMS เป็นเพียงการแสดงข้อมูล ไม่ได้ควบคุมสัญญาณ ส่วน GPS ในรถทุกคันไม่ใช่เงื่อนไขที่ทำได้จริง และศูนย์ควบคุมกลางเป็นลักษณะของระบบ Adaptive ระดับโครงข่าย ไม่ใช่สิ่งที่ VA ระดับแยกเดี่ยวต้องมี",
      en: "The heart of VA is the vehicle detector: the controller must know a vehicle has actually arrived or is waiting before it can extend, end, or skip a phase. VMS signs only display information — they do not control the signal; GPS in every car is not a realistic requirement; and a central control room is a feature of network-level Adaptive systems, not something a single VA intersection needs.",
    },
    relatedSystem: "vehicle-actuated",
  },
  {
    id: "adaptive-vs-va",
    question: {
      th: "ระบบ Adaptive ต่างจากระบบ VA อย่างไร?",
      en: "How does Adaptive control differ from VA control?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "Adaptive ไม่ต้องใช้อุปกรณ์ตรวจจับรถ (Detector) เลย",
          en: "Adaptive needs no vehicle detectors at all",
        },
      },
      {
        id: "b",
        text: {
          th: "Adaptive ใช้แผนเวลาตายตัวที่แม่นยำกว่า VA",
          en: "Adaptive uses a more precise fixed timing plan than VA",
        },
      },
      {
        id: "c",
        text: {
          th: "Adaptive ปรับแผนสัญญาณตามข้อมูลจราจรแบบเรียลไทม์ และประสานหลายแยกร่วมกันได้ ไม่ใช่แค่ตอบสนองรายเฟส (Phase) ที่แยกเดียว",
          en: "Adaptive re-optimises the signal plan from real-time traffic data and can coordinate multiple intersections — not just react phase-by-phase at a single junction",
        },
      },
      {
        id: "d",
        text: {
          th: "Adaptive คือ VA ที่เปลี่ยนจาก Inductive Loop มาใช้กล้องเท่านั้น",
          en: "Adaptive is simply VA with cameras instead of inductive loops",
        },
      },
    ],
    correctChoiceId: "c",
    explanation: {
      th: "VA ตอบสนองรายเฟสที่แยกเดียว คือต่อหรือตัดไฟเขียวตามรถที่ผ่าน Detector ส่วน Adaptive ยกระดับขึ้นไปอีกขั้น โดยนำข้อมูลจราจรแบบเรียลไทม์มาปรับทั้งแผน ทั้งรอบสัญญาณไฟ (Cycle Time) สัดส่วนเวลาเขียว (Split) และค่าเหลื่อมเวลา (Offset) และประสานการทำงานหลายแยกเป็นโครงข่ายได้ Adaptive ยังต้องพึ่ง Detector คุณภาพดีเช่นกัน จึงไม่ใช่แค่การเปลี่ยนชนิดอุปกรณ์ตรวจจับ และยิ่งไม่ใช่แผนตายตัว",
      en: "VA reacts phase-by-phase at one junction — extending or ending green based on detector hits. Adaptive goes further: it uses real-time traffic data to re-optimise the whole plan (cycle time, splits, offsets) and can coordinate many intersections as a network. Adaptive still depends on good detectors, so it is not merely a different sensor type — and it is certainly not a fixed plan.",
    },
    relatedSystem: "adaptive",
  },
  {
    id: "gap-time-meaning",
    question: {
      th: "ในระบบ VA ค่า Gap Time คืออะไร?",
      en: "In VA control, what is the gap time?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "เวลาไฟเหลืองก่อนเปลี่ยนเป็นไฟแดง",
          en: "The yellow interval before the light turns red",
        },
      },
      {
        id: "b",
        text: {
          th: "ช่วงที่ทุกทิศทางเห็นไฟแดงพร้อมกัน",
          en: "The interval when every approach shows red at the same time",
        },
      },
      {
        id: "c",
        text: {
          th: "เวลารวมทั้งหมดของหนึ่งรอบสัญญาณไฟ",
          en: "The total length of one signal cycle",
        },
      },
      {
        id: "d",
        text: {
          th: "ช่วงห่างระหว่างรถที่ระบบใช้ตัดสินใจว่าจะต่อหรือจบไฟเขียว",
          en: "The time gap between vehicles that the controller uses to decide whether to extend or end the green",
        },
      },
    ],
    correctChoiceId: "d",
    explanation: {
      th: "Gap Time คือช่วงห่างระหว่างรถ ตราบใดที่รถคันถัดไปมาถึง Detector ทันภายในค่านี้ ไฟเขียวจะต่อเวลาให้เรื่อย ๆ แต่ถ้ารถขาดตอนนานเกิน Gap Time ระบบถือว่ารถหมดแล้วจึงตัดจบไฟเขียว ตัวเลือกอื่นเป็นคนละเรื่อง คือเวลาไฟเหลือง (Yellow Time) ช่วง All-Red และรอบสัญญาณไฟ (Cycle Time) ตามลำดับ",
      en: "Gap time is the headway between vehicles: as long as the next vehicle reaches the detector within this value, the green keeps extending; once the gap exceeds it, traffic has thinned out and the controller ends the green. The other choices describe different terms — yellow time, all-red time, and cycle time respectively.",
    },
    relatedSystem: "vehicle-actuated",
  },
  {
    id: "va-empty-side-road",
    question: {
      th: "ถ้าถนนรองไม่มีรถเลย ระบบ VA ควรทำอย่างไร?",
      en: "If the side road has no vehicles at all, what should a VA system do?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "เปิดไฟเขียวให้ถนนรองตามเวลาเดิมทุกครั้ง เพื่อความยุติธรรม",
          en: "Give the side road its usual green every time, to be fair",
        },
      },
      {
        id: "b",
        text: {
          th: "ข้ามเฟส (Skip Phase) หรือลดไฟเขียวที่ไม่จำเป็นของถนนรอง แล้วให้เวลากับถนนหลักแทน",
          en: "Skip the phase or cut the side road's unneeded green, giving that time to the main road instead",
        },
      },
      {
        id: "c",
        text: {
          th: "เปลี่ยนเป็นไฟกะพริบสีเหลืองทุกทิศทางทันที",
          en: "Immediately switch every approach to flashing yellow",
        },
      },
      {
        id: "d",
        text: {
          th: "เพิ่มรอบสัญญาณไฟ (Cycle Time) ให้ยาวขึ้นเพื่อรอรถมา",
          en: "Lengthen the cycle time to wait for vehicles to arrive",
        },
      },
    ],
    correctChoiceId: "b",
    explanation: {
      th: "จุดแข็งของ VA คือให้ไฟเขียวเฉพาะทิศทางที่มีรถจริง เมื่อ Detector ไม่พบรถบนถนนรอง จึงไม่มีการเรียกเฟส (Vehicle Call) ระบบสามารถข้ามเฟสนั้นหรือให้ไฟเขียวสั้นที่สุดตาม Minimum Green แล้วคืนเวลาให้ถนนหลัก การเปิดไฟเขียวให้ถนนว่างตามเวลาเดิมคือจุดอ่อนของ Fixed Time ส่วนไฟกะพริบเป็นโหมดพิเศษที่ไม่ได้ใช้ในการทำงานปกติ และการยืด Cycle Time เพื่อรอรถยิ่งทำให้ทุกทิศเสียเวลามากขึ้น",
      en: "VA's strength is serving green only where vehicles actually are. With no detector hits on the side road there is no vehicle call, so the controller can skip that phase or hold it to minimum green and return the time to the main road. Serving an empty road on schedule is exactly Fixed Time's weakness; flashing yellow is a special mode, not normal operation; and stretching the cycle to wait for cars only adds delay for everyone.",
    },
    relatedSystem: "vehicle-actuated",
  },
  {
    id: "cycle-split-calc",
    question: {
      th: "แยกแห่งหนึ่งใช้รอบสัญญาณไฟ (Cycle Time) 100 วินาที และตั้งสัดส่วนเวลาเขียว (Split) ให้ถนนหลัก 60% ถนนหลักได้เวลาประมาณกี่วินาทีในแต่ละรอบ?",
      en: "An intersection runs a 100-second cycle time with a 60% split for the main road. About how many seconds does the main road get per cycle?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "40 วินาที",
          en: "40 seconds",
        },
      },
      {
        id: "b",
        text: {
          th: "100 วินาที",
          en: "100 seconds",
        },
      },
      {
        id: "c",
        text: {
          th: "60 วินาที",
          en: "60 seconds",
        },
      },
      {
        id: "d",
        text: {
          th: "6 วินาที",
          en: "6 seconds",
        },
      },
    ],
    correctChoiceId: "c",
    explanation: {
      th: "Split คือการแบ่งเวลาในหนึ่งรอบให้แต่ละเฟส (Phase) คิดง่าย ๆ คือ 60% ของ 100 วินาที = 60 วินาที ส่วน 40 วินาทีที่เหลือเป็นของถนนรอง 100 วินาทีคือทั้งรอบ ไม่ใช่ของทิศเดียว และ 6 วินาทีเกิดจากการคำนวณเปอร์เซ็นต์ผิด หลักการคือทิศทางที่มีรถมากกว่าควรได้ Split มากกว่า",
      en: "The split divides the cycle among the phases: 60% of 100 seconds = 60 seconds, leaving 40 seconds for the side road. 100 seconds is the whole cycle, not one approach's share, and 6 seconds comes from a percentage slip. The principle: the approach with more traffic should get the larger split.",
    },
    relatedSystem: "fixed-time",
  },
  {
    id: "all-red-purpose",
    question: {
      th: "ช่วง All-Red ที่ทุกทิศทางเห็นไฟแดงพร้อมกัน มีไว้เพื่ออะไร?",
      en: "What is the purpose of the all-red interval, when every approach shows red at the same time?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "ให้รถที่ยังค้างอยู่กลางแยกออกไปได้หมด ก่อนทิศถัดไปได้ไฟเขียว เพื่อลดอุบัติเหตุ",
          en: "To let vehicles still inside the intersection clear out before the next approach gets green, reducing crashes",
        },
      },
      {
        id: "b",
        text: {
          th: "ประหยัดพลังงานของดวงโคมสัญญาณไฟ",
          en: "To save energy in the signal lamps",
        },
      },
      {
        id: "c",
        text: {
          th: "ลงโทษผู้ขับขี่ที่ชอบเร่งผ่านช่วงไฟเหลือง",
          en: "To punish drivers who rush through the yellow",
        },
      },
      {
        id: "d",
        text: {
          th: "เพิ่มเวลาไฟเขียวให้ถนนหลักทางอ้อม",
          en: "To indirectly add green time to the main road",
        },
      },
    ],
    correctChoiceId: "a",
    explanation: {
      th: "All-Red เป็นช่วงสั้น ๆ ประมาณ 1–3 วินาที เพื่อเคลียร์แยก ให้รถคันสุดท้ายที่เข้ามาช่วงท้ายไฟเหลืองออกไปพ้นก่อนที่ทิศตัดกันจะได้ไฟเขียว จึงเป็นเรื่องความปลอดภัยโดยตรง ไม่เกี่ยวกับการประหยัดพลังงาน ไม่ใช่บทลงโทษ และไม่ได้เพิ่มไฟเขียวให้ทิศใด เพราะช่วงนี้ไม่มีทิศไหนเคลื่อนที่ได้เลย",
      en: "All-red is a short 1–3 second interval that clears the intersection: vehicles that entered late in the yellow can exit before the conflicting approach gets green. It is purely a safety measure — it saves no energy, punishes no one, and gives no approach extra green, since nobody moves during it.",
    },
  },
  {
    id: "detector-types",
    question: {
      th: "ข้อใดเป็นอุปกรณ์ตรวจจับรถ (Detector) ที่ใช้ส่งข้อมูลให้ตู้ควบคุมสัญญาณไฟ?",
      en: "Which of these is a vehicle detector that feeds data to the signal controller?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "แอปนำทางในโทรศัพท์ของผู้ขับขี่",
          en: "The navigation app on a driver's phone",
        },
      },
      {
        id: "b",
        text: {
          th: "กล้องวงจรปิด (CCTV) ที่ใช้บันทึกภาพไว้ดูย้อนหลังเท่านั้น",
          en: "A CCTV camera used only to record footage for later review",
        },
      },
      {
        id: "c",
        text: {
          th: "ป้ายแสดงข้อความอัจฉริยะ (VMS) เหนือช่องจราจร",
          en: "A variable message sign (VMS) above the traffic lanes",
        },
      },
      {
        id: "d",
        text: {
          th: "ขดลวดเหนี่ยวนำ (Inductive Loop) ที่ฝังใต้ผิวถนนก่อนถึงเส้นหยุด",
          en: "An inductive loop buried in the pavement before the stop line",
        },
      },
    ],
    correctChoiceId: "d",
    explanation: {
      th: "Inductive Loop คือ Detector แบบคลาสสิกที่สุด เมื่อรถวิ่งทับขดลวด สนามแม่เหล็กจะเปลี่ยน ตู้ควบคุมจึงรู้ทันทีว่ามีรถ นอกจากนี้ยังมีเรดาร์และกล้องวิเคราะห์ภาพ (Video Analytics) ที่นับเป็น Detector เช่นกัน จุดสำคัญคือต้องส่งข้อมูลให้ตู้ควบคุมแบบอัตโนมัติ กล้อง CCTV ที่แค่บันทึกภาพไม่ได้ส่งสัญญาณตรวจจับ ป้าย VMS มีไว้แสดงข้อมูลให้คนขับ และแอปนำทางไม่ได้เชื่อมต่อกับตู้ควบคุมของแยก",
      en: "The inductive loop is the classic detector: a vehicle over the loop changes its magnetic field, so the controller instantly knows a car is there. Radar and video-analytics cameras also count as detectors. The key is feeding the controller automatically — a CCTV camera that only records sends no detection signal, a VMS displays information to drivers, and a phone navigation app is not connected to the intersection controller.",
    },
    relatedSystem: "vehicle-actuated",
  },
  {
    id: "degree-of-saturation",
    question: {
      th: "ทิศทางหนึ่งระบายรถได้สูงสุด 1,000 คัน/ชั่วโมง แต่มีรถมาถึง 900 คัน/ชั่วโมง ระดับการอิ่มตัว (Degree of Saturation) เป็นเท่าไร และหมายความว่าอย่างไร?",
      en: "An approach can discharge at most 1,000 vehicles/hour but receives 900 vehicles/hour. What is its degree of saturation, and what does it mean?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "1.11 — เกินความจุแล้ว แถวรถจะยาวขึ้นทุกรอบ",
          en: "1.11 — over capacity; queues grow every cycle",
        },
      },
      {
        id: "b",
        text: {
          th: "0.90 — ใกล้เต็มความจุ ควรเฝ้าระวัง",
          en: "0.90 — close to capacity and worth monitoring",
        },
      },
      {
        id: "c",
        text: {
          th: "0.10 — ยังว่างมาก ไม่ต้องสนใจ",
          en: "0.10 — mostly empty, nothing to watch",
        },
      },
      {
        id: "d",
        text: {
          th: "90 — ตัวเลขนี้ไม่มีความหมายในการวิเคราะห์จราจร",
          en: "90 — a number with no meaning in traffic analysis",
        },
      },
    ],
    correctChoiceId: "b",
    explanation: {
      th: "Degree of Saturation คืออัตราส่วนรถที่มาถึงต่อความจุที่ระบายได้ (v/c) = 900 ÷ 1,000 = 0.90 ค่าใกล้ 1.0 แปลว่าใช้ความจุเกือบเต็ม ควรเฝ้าระวัง ถ้าเกิน 1.0 เมื่อไร รถจะมาเร็วกว่าที่ระบายได้และแถวรถ (Queue Length) จะสะสมยาวขึ้นทุกรอบ ค่า 1.11 เกิดจากการกลับเศษส่วน (1,000 ÷ 900) ส่วน 0.10 และ 90 เป็นการคำนวณที่ผิด ระบบ Adaptive หลายระบบใช้ค่านี้เป็นตัวชี้วัดหลักในการปรับสัญญาณ",
      en: "Degree of saturation is arrivals divided by capacity (v/c) = 900 ÷ 1,000 = 0.90. A value near 1.0 means the approach is nearly at capacity and worth monitoring; above 1.0, vehicles arrive faster than they can be served and the queue grows every cycle. 1.11 comes from inverting the ratio (1,000 ÷ 900), while 0.10 and 90 are simply miscalculations. Many Adaptive systems use this value as a key input when adjusting signals.",
    },
    relatedSystem: "adaptive",
  },
  {
    id: "offset-green-wave",
    question: {
      th: "ในการประสานสัญญาณ (Coordination) ให้เกิดคลื่นไฟเขียว (Green Wave) ค่าเหลื่อมเวลา (Offset) ที่ดีควรเท่ากับอะไร?",
      en: "In signal coordination, to create a green wave, what should a good offset equal?",
    },
    choices: [
      {
        id: "a",
        text: {
          th: "เวลาไฟเหลืองของแยกก่อนหน้า",
          en: "The yellow time of the previous intersection",
        },
      },
      {
        id: "b",
        text: {
          th: "ครึ่งหนึ่งของรอบสัญญาณไฟ (Cycle Time) เสมอ",
          en: "Always half of the cycle time",
        },
      },
      {
        id: "c",
        text: {
          th: "เวลาที่รถใช้เดินทางจากแยกก่อนหน้ามาถึงแยกนี้",
          en: "The travel time from the previous intersection to this one",
        },
      },
      {
        id: "d",
        text: {
          th: "ศูนย์ — ทุกแยกต้องเริ่มไฟเขียวพร้อมกันเป๊ะ",
          en: "Zero — every intersection must start green at exactly the same moment",
        },
      },
    ],
    correctChoiceId: "c",
    explanation: {
      th: "เป้าหมายของคลื่นไฟเขียวคือให้รถที่ออกจากแยกแรกไปถึงแยกถัดไปตอนไฟเขียวเปิดพอดี ค่า Offset ที่ดีจึงต้องเท่ากับเวลาเดินทางระหว่างแยกทั้งสอง เช่น ห่างกัน 500 เมตร วิ่ง 50 กม./ชม. ใช้เวลาราว 36 วินาที ก็ตั้ง Offset 36 วินาที ถ้าตั้ง Offset เป็นศูนย์ รถที่เพิ่งออกตัวจะไปเจอไฟเขียวที่เปิดมาก่อนแล้วและอาจปิดก่อนไปถึง ส่วนเวลาไฟเหลืองหรือครึ่งรอบสัญญาณไฟไม่ได้สัมพันธ์กับระยะทางและความเร็วจริงเลย",
      en: "A green wave aims for vehicles leaving one junction to arrive at the next just as its green begins, so a good offset equals the travel time between the two — e.g. 500 metres at 50 km/h takes about 36 seconds, so the offset is 36 s. A zero offset means the downstream green starts (and may end) before the platoon arrives, and neither the yellow time nor half the cycle has any relation to the actual distance and speed.",
    },
  },
];
