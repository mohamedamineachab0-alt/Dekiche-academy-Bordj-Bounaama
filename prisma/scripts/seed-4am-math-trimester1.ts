import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { Level, Stream } from "../../generated/prisma";

const SUBJECT_ID = "cf38eb18-568e-41ea-8a7e-8417b7b2e6c2"; // 4AM Math (الأستاذ دقيش علي)
const MONTH_NUMBER = 1;

interface LessonDefinition {
  title: string;
  description: string;
  youtubeVideoId: string;
  order: number;
  mindmap?: string;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
  }>;
}

const LESSONS: LessonDefinition[] = [
  // ==========================================
  // وحدة 1: الأعداد الطبيعية والأعداد الناطقة (PGCD)
  // ==========================================
  {
    title: "القاسم المشترك الأكبر (PGCD)",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — مفهوم القاسم المشترك الأكبر وخواصه وكيفية إيجاده لطلبة السنة الرابعة متوسط.",
    youtubeVideoId: "0uzegfJdc8",
    order: 1,
    mindmap: `mindmap
  root((الأعداد الطبيعية والناطقة))
    القاسم المشترك الأكبر PGCD
      تعريف القاسم المشترك
      قواسم عدد طبيعي
      أكبر قاسم مشترك
    طرق الحساب
      الفروق المتتالية
      القسمات المتتالية`,
    quizQuestions: [
      {
        question: "ما هو القاسم المشترك الأكبر للعددين 18 و 24؟",
        options: ["6", "3", "2", "12"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "إذا كان a يقسم b، فإن PGCD(a, b) يساوي:",
        options: ["a", "b", "1", "0"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو PGCD(15, 0) للعدد الطبيعي 15؟",
        options: ["15", "0", "1", "غير معرّف"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "النوع الأول من مسائل PGCD",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — منهجية حل النوع الأول من المسائل والوضعيات التي توظف القاسم المشترك الأكبر.",
    youtubeVideoId: "67JOvbiC-E",
    order: 2,
    mindmap: `mindmap
  root((مسائل PGCD))
    النوع الأول
      تقسيم إلى قطع متساوية
      توزيع حصص متساوية بأكبر عدد ممكن
    منهجية الحل
      استخراج الكلمات المفتاحية
      حساب PGCD للبعدين
      استنتاج عدد القطع أو الحصص`,
    quizQuestions: [
      {
        question: "عند الرغبة في تقسيم صفيحة مستطيلة أبعادها 60cm و 45cm إلى مربعات متماثلة بأكبر طول ضلع ممكن، نحسب:",
        options: ["PGCD(60, 45)", "المضاعف المشترك الأصغر", "مجموع البعدين", "المساحة الكلية"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو طول ضلع أكبر مربع يمكن تقطيع الصفيحة إليه (أبعادها 60cm و 45cm)؟",
        options: ["15 cm", "5 cm", "30 cm", "10 cm"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "كم عدد المربعات الناتجة من تقطيع الصفيحة (60÷15 × 45÷15)؟",
        options: ["12 مربعاً", "7 مربعات", "15 مربعاً", "20 مربعاً"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "خوارزمية أقليدس أو القسمات المتتالية",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — تطبيق عملي سريع لخوارزمية إقليدس لحساب PGCD لأعداد كبيرة بخطوات منظمة.",
    youtubeVideoId: "HVFdK4An8Eg",
    order: 3,
    mindmap: `mindmap
  root((خوارزمية إقليدس))
    القسمات المتتالية
      قسمة العدد الأكبر على الأصغر
      أخذ باقي القسمة الإقليدية
      تكرار العملية حتى نصل إلى باقي معدوم
    النتيجة
      PGCD هو آخر باقي غير معدوم`,
    quizQuestions: [
      {
        question: "في خوارزمية إقليدس، ما هو PGCD للعددين؟",
        options: ["آخر باقي غير معدوم", "أول باقي قسمة", "حاصل القسمة الأخير", "الباقي المعدوم"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "عند قسمة 105 على 45 إقليدياً، الباقي هو:",
        options: ["15", "2", "10", "5"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو PGCD(105, 45) باستخدام القسمات المتتالية؟",
        options: ["15", "5", "45", "3"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "العددان الأوليان فيما بينهما",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — تعريف العددان الأوليان فيما بينهما وتطبيقهما المباشر في كتابة كسر على شكل غير قابل للاختزال.",
    youtubeVideoId: "F93yXkjT3s",
    order: 4,
    mindmap: `mindmap
  root((العددان الأوليان فيما بينهما))
    التعريف
      PGCD للعددين يساوي 1
    التطبيقات
      اختزال الكسور دفعة واحدة
      قسمة البسط والمقام على PGCD
      الحصول على كسر غير قابل للاختزال`,
    quizQuestions: [
      {
        question: "يكون العددان a و b أوليين فيما بينهما إذا كان:",
        options: ["PGCD(a, b) = 1", "PGCD(a, b) = 2", "كلاهما عدد فردي", "مجموعهما عدد أولي"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "هل العددان 14 و 15 أوليان فيما بينهما؟",
        options: ["نعم لأن PGCD لهما 1", "لا لأن 15 يقبل القسمة على 3", "لا لأن 14 زوجي", "كلاهما غير أولي"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "إذا قسمنا كلاً من بسط ومقام كسر على PGCD لهما، ينتج:",
        options: ["كسر غير قابل للاختزال", "عدد سالب", "كسر عشري دوري", "العدد 1 دائماً"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "سلسلة تمارين رقم 1 (القاسم المشترك الأكبر)",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — تمارين تدريبية مكثفة وتطبيقية لترسيخ المفاهيم وحساب PGCD بكل سهولة.",
    youtubeVideoId: "HSDiMj9AT8Q",
    order: 5,
    quizQuestions: [
      {
        question: "احسب PGCD(315, 126):",
        options: ["63", "21", "9", "7"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو اختزال الكسر 126 / 315؟",
        options: ["2 / 5", "3 / 5", "4 / 7", "6 / 15"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "هل العددان 126 و 315 أوليان فيما بينهما؟",
        options: ["لا لأن PGCD يساوي 63", "نعم", "لا لأن كلاهما فردي", "نعم لأن لهما قواسم"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "سلسلة تمارين حول PGCD (رقم 2)",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — الجزء الثاني من التمارين التدريبية مع نماذج امتحانات رسمية سابقة.",
    youtubeVideoId: "kBrGZgkdoGY",
    order: 6,
    quizQuestions: [
      {
        question: "حقل مستطيل طوله 136m وعرضه 88m، نغرس على محيطه أشجاراً متساوية البعد بأكبر مسافة ممكنة. ما هي المسافة بين شجرتين متجاورتين؟",
        options: ["8 m", "4 m", "16 m", "2 m"],
        correctAnswerIndex: 0,
        points: 10
      },
      {
        question: "ما هو عدد الأشجار الكلي المغروسة حول محيط الحقل (محيط الحقل = 448m)؟",
        options: ["56 شجرة", "28 شجرة", "48 شجرة", "64 شجرة"],
        correctAnswerIndex: 0,
        points: 10
      }
    ]
  },
  {
    title: "تمارين إضافية حول PGCD",
    description: "وحدة الأعداد الطبيعية والأعداد الناطقة — مراجعة وتدريبات شاملة حول مختلف الحالات الخاصة والأفكار المتقدمة.",
    youtubeVideoId: "vbMKpMVpHik",
    order: 7,
    quizQuestions: [
      {
        question: "أوجد العدد الطبيعي x حيث الكسر x / 84 يساوي 3 / 7:",
        options: ["36", "28", "42", "12"],
        correctAnswerIndex: 0,
        points: 10
      },
      {
        question: "إذا كان PGCD(a, b) = 12 و a / b = 3 / 5، فما قيمة a و b؟",
        options: ["a = 36 و b = 60", "a = 15 و b = 25", "a = 24 و b = 40", "a = 48 و b = 80"],
        correctAnswerIndex: 0,
        points: 10
      }
    ]
  },

  // ==========================================
  // وحدة 2: الحساب على الجذور
  // ==========================================
  {
    title: "القيم التقريبية والقوى",
    description: "وحدة الحساب على الجذور — مراجعة القوى وحساب القيم التقريبية كمدخل أساسي لفهم الجذور التربيعية والعمليات عليها.",
    youtubeVideoId: "V1JdIPBZYS4",
    order: 8,
    mindmap: `mindmap
  root((القيم التقريبية والقوى))
    قواعد القوى
      قوى العدد 10
      جداء وقسمة قوتين
    التقريب
      القيمة المضبوطة
      القيمة المقربة بالزيادة والنقصان
      مدور عدد إلى رتبة معينة`,
    quizQuestions: [
      {
        question: "ما هي قيمة 10³ × 10⁻⁵؟",
        options: ["10⁻²", "10⁸", "10⁻⁸", "10²"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "مدور العدد 3.146 إلى 0.01 هو:",
        options: ["3.15", "3.14", "3.1", "3.2"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هي الكتابة العلمية للعدد 0.0058؟",
        options: ["5.8 × 10⁻³", "58 × 10⁻⁴", "0.58 × 10⁻²", "5.8 × 10³"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "مخزن الرياضيات (الجزء الأول)",
    description: "وحدة الحساب على الجذور — حصة شاملة تجمع أهم المكتسبات القبلية والأساسيات الذهبية لانطلاقة قوية في الجذور.",
    youtubeVideoId: "OSGboayntNY",
    order: 9,
    quizQuestions: [
      {
        question: "ما هو مربع العدد 7؟",
        options: ["49", "14", "21", "28"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "إذا كان x² = 64، فإن قيم x الممكنة هي:",
        options: ["8 و -8", "8 فقط", "32 و -32", "16 و -16"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو الجذر التربيعي للعدد 121؟",
        options: ["11", "12", "13", "10"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "الحساب على الجذور - تطبيقات وتدريبات (جزء 1)",
    description: "وحدة الحساب على الجذور — قواعد الحساب على الجذور التربيعية (الجداء والقسمة) وتطبيقات مباشرة على التبسيط.",
    youtubeVideoId: "uyfHEoL-r0g",
    order: 10,
    mindmap: `mindmap
  root((الحساب على الجذور))
    القواعد الأساسية
      جذر a مربع يساوي a
      جذر a ضرب جذر b يساوي جذر a في b
      جذر a قسمة جذر b يساوي جذر a قسمة b
    التبسيط
      كتابة العبارة على شكل a جذر b
      حذف الجذر من المقام`,
    quizQuestions: [
      {
        question: "ما هي قيمة √(49 × 4)؟",
        options: ["14", "28", "7", "53"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "بسّط العبارة √50 على الشكل a√b بأصغر b ممكن:",
        options: ["5√2", "2√5", "25√2", "10√5"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو ناتج √3 × √12؟",
        options: ["6", "36", "√15", "3√4"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "الحساب على الجذور - تطبيقات وتدريبات (جزء 2)",
    description: "وحدة الحساب على الجذور — مهارات متقدمة في نشر وتبسيط عبارات تتضمن جذوراً تربيعية والتحقق من النتائج.",
    youtubeVideoId: "ZsWchT1EUkw1tkG",
    order: 11,
    quizQuestions: [
      {
        question: "بسّط العبارة 3√8 - 2√18:",
        options: ["0", "√2", "-√2", "5√2"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "اكتب النسبة 6 / √3 بمقام ناطق:",
        options: ["2√3", "3√2", "6√3", "√3"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو منشور (√5 + 2)(√5 - 2)؟",
        options: ["1", "9", "5 - 2√5", "7"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  },
  {
    title: "الحساب على الجذور - تطبيقات وتدريبات (جزء 3)",
    description: "وحدة الحساب على الجذور — حل مسائل وتمارين امتحانات سابقة حول العمليات على الجذور التربيعية والمعادلات x² = a.",
    youtubeVideoId: "US29_etBfMM",
    order: 12,
    quizQuestions: [
      {
        question: "حلول المعادلة x² = 20 هي:",
        options: ["x = 2√5 أو x = -2√5", "x = 10 أو x = -10", "x = 5 أو x = -5", "ليس لها حل في ℝ"],
        correctAnswerIndex: 0,
        points: 10
      },
      {
        question: "حل المعادلة x² = -9 في الأعداد الحقيقية:",
        options: ["لا يوجد حل في ℝ", "3", "-3", "3 و -3"],
        correctAnswerIndex: 0,
        points: 10
      }
    ]
  },

  // ==========================================
  // وحدة 3: الوضعيات والإدماج
  // ==========================================
  {
    title: "الوضعيات الإدماجية المركبة (النوع 3)",
    description: "وحدة الوضعيات والإدماج — منهجية احترافية لحل المسائل الإدماجية المركبة في الفصل الأول التي تدمج بين PGCD والمسافات والتكاليف.",
    youtubeVideoId: "uyfHEoL-r0g",
    order: 13,
    mindmap: `mindmap
  root((الوضعيات الإدماجية))
    النوع 3
      مسألة مركبة من عدة أجزاء
      توظيف PGCD في الجزء الأول
      توظيف المساحة أو التكلفة في الجزء الثاني
    خطوات الحل
      قراءة متأنية وتحديد المعطيات
      ترييض مشكل خطوة بخطوة
      التحقق من معقولية النتيجة وكتابة وحدة القياس`,
    quizQuestions: [
      {
        question: "ما هي أول خطوة منهجية في حل وضعية إدماجية مركبة؟",
        options: ["قراءة النص وتحديد المعطيات والأسئلة الخفية", "إجراء العمليات الحسابية مباشرة", "رسم شكل عشوائي", "تخمين النتيجة"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "في مسألة إحاطة قطعة أرض مستطيلة أبعادها 84m و 60m بأعمدة، ما هي أكبر مسافة بين عمودين (PGCD(84, 60))؟",
        options: ["12 m", "6 m", "4 m", "24 m"],
        correctAnswerIndex: 0,
        points: 7
      },
      {
        question: "ما هو عدد الأعمدة اللازمة لإحاطة الأرض كاملة (محيط الأرض = 288m)؟",
        options: ["24 عموداً", "12 عموداً", "48 عموداً", "30 عموداً"],
        correctAnswerIndex: 0,
        points: 6
      }
    ]
  }
];

async function main() {
  console.log("🚀 Starting insertion of 4AM Math Trimester 1 curriculum...");

  // 1. Find Month 1
  const monthRecord = await prisma.month.findFirst({
    where: { number: MONTH_NUMBER }
  });

  const monthId = monthRecord?.id;

  // 2. Adjust orders of previous diagnostic lessons so they appear after the core lessons
  const existingLessons = await prisma.lesson.findMany({
    where: {
      month: MONTH_NUMBER,
      subjects: { some: { id: SUBJECT_ID } }
    },
    orderBy: { order: "asc" }
  });

  console.log(`Found ${existingLessons.length} existing lessons in Month 1.`);

  // Shift existing lessons if they collide with 1..13
  for (const ex of existingLessons) {
    if (ex.order < 30) {
      await prisma.lesson.update({
        where: { id: ex.id },
        data: { order: ex.order + 30 }
      });
    }
  }

  // 3. Create or update the 13 new curriculum lessons
  for (const item of LESSONS) {
    // Check if lesson with same title already exists
    const existing = await prisma.lesson.findFirst({
      where: {
        title: item.title,
        subjects: { some: { id: SUBJECT_ID } }
      }
    });

    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`;

    let lessonId: string;

    if (existing) {
      console.log(`Updating existing lesson: ${item.title}`);
      const updated = await prisma.lesson.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          month: MONTH_NUMBER,
          monthId,
          order: item.order,
          youtubeVideoId: item.youtubeVideoId,
          image: thumbnailUrl,
          mindmap: item.mindmap || null,
          levels: [Level.MIDDLE_4],
          streams: [Stream.NONE],
        }
      });
      lessonId = updated.id;
    } else {
      console.log(`Creating new lesson: ${item.title}`);
      const created = await prisma.lesson.create({
        data: {
          title: item.title,
          description: item.description,
          month: MONTH_NUMBER,
          monthId,
          order: item.order,
          youtubeVideoId: item.youtubeVideoId,
          vimeoVideoId: "",
          image: thumbnailUrl,
          mindmap: item.mindmap || null,
          levels: [Level.MIDDLE_4],
          streams: [Stream.NONE],
          subjects: { connect: { id: SUBJECT_ID } }
        }
      });
      lessonId = created.id;
    }

    // Attach Interactive Quiz if provided
    if (item.quizQuestions && item.quizQuestions.length > 0) {
      await prisma.quiz.upsert({
        where: { lessonId },
        update: {
          questions: item.quizQuestions,
          maxScore: 20,
          aiGenerated: false
        },
        create: {
          lessonId,
          questions: item.quizQuestions,
          maxScore: 20,
          aiGenerated: false
        }
      });
    }
  }

  console.log("🎉 Successfully created and organized 4AM Math Trimester 1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
