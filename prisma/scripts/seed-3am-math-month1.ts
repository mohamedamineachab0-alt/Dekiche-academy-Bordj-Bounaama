import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { Level, Stream } from "../../generated/prisma";

const SUBJECT_ID = "34c45d09-208f-4b1a-85a1-6db494009d94"; // 3AM Math (الأستاذ طاليس بن عودة)
const MONTH_NUMBER = 1;

interface LessonItem {
  title: string;
  description: string;
  youtubeVideoId: string;
  order: number;
  mindmap?: string;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
  }>;
}

const LESSONS: LessonItem[] = [
  // ==========================================
  // الوحدة: الأعداد النسبية (السنة الثالثة متوسط)
  // ==========================================
  {
    title: "جمع عددين نسبيين",
    description: "الأعداد النسبية — قواعد جمع عددين نسبيين لهما نفس الإشارة أو مختلفين في الإشارة، ومجموع عددين نسبيين متعاكسين مع أمثلة تطبيقية.",
    youtubeVideoId: "1Iwy12YyzrY",
    order: 1,
    mindmap: `mindmap
  root((جمع عددين نسبيين))
    نفس الإشارة
      نحتفظ بالإشارة المشتركة
      نجمع المسافتين إلى الصفر
    مختلفان في الإشارة
      نأخذ إشارة الأبعد عن الصفر
      نطرح المسافة الأصغر من الأكبر
    عددان متعاكسان
      مجموعهما دائماً 0`,
    quizQuestions: [
      {
        question: "لحساب مجموع عددين نسبيين لهما نفس الإشارة:",
        options: [
          "نجمع مسافتيهما إلى الصفر ونأخذ إشارتهما المشتركة",
          "نطرح مسافتيهما إلى الصفر ونأخذ إشارة الأكبر",
          "الناتج دائماً موجب مهما كانت الإشارة",
          "نضرب العددين في بعضهما"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $A = (-8) + (-5)$:",
        options: ["-13", "+13", "-3", "+3"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $B = (+12) + (-17)$:",
        options: ["-5", "+5", "+29", "-29"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو مجموع عددين نسبيين متعاكسين، مثل: $(+7) + (-7)$؟",
        options: ["0", "+14", "-14", "1"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "طرح عددين نسبيين",
    description: "الأعداد النسبية — قاعدة تحويل عملية الطرح إلى جمع المعاكس (a - b = a + (-b))، وحساب المسافة بين نقطتين على مستقيم مدرج.",
    youtubeVideoId: "ibk5cYarw9g",
    order: 2,
    mindmap: `mindmap
  root((طرح عددين نسبيين))
    قاعدة الطرح
      لطرح عدد نسبي نضيف معاكسه
      a - b = a + (-b)
    المسافة بين نقطتين
      الفاصلة الأكبر ناقص الفاصلة الأصغر
      المسافة دائماً موجبة`,
    quizQuestions: [
      {
        question: "تنص قاعدة طرح عدد نسبي $b$ من عدد نسبي $a$ على:",
        options: [
          "إضافة معاكس $b$ إلى $a$، أي: $a - b = a + (-b)$",
          "طرح المسافتين إلى الصفر مباشرة",
          "ضرب $a$ في مقلوب $b$",
          "تغيير إشارة $a$ فقط"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $A = (+9) - (-4)$:",
        options: ["+13", "+5", "-5", "-13"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $B = (-15) - (+8)$:",
        options: ["-23", "-7", "+7", "+23"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لتكن النقطتان $A(+3)$ و $B(-5)$ على مستقيم مدرج. المسافة $AB$ بينهما هي:",
        options: ["8", "-8", "2", "-2"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "جداء عددين نسبيين",
    description: "الأعداد النسبية — قاعدة إشارات الجداء: جداء عددين لهما نفس الإشارة موجب، ومختلفين في الإشارة سالب، مع تدريبات حسابية.",
    youtubeVideoId: "TnByZUopKcs",
    order: 3,
    mindmap: `mindmap
  root((جداء عددين نسبيين))
    نفس الإشارة
      (+) × (+) = (+)
      (-) × (-) = (+)
      الناتج دائماً موجب
    مختلفان في الإشارة
      (+) × (-) = (-)
      (-) × (+) = (-)
      الناتج دائماً سالب`,
    quizQuestions: [
      {
        question: "جداء عددين نسبيين لهما نفس الإشارة هو دائماً عدد:",
        options: [
          "موجب",
          "سالب",
          "معدوم",
          "يتبع إشارة العدد الأكبر"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج الجداء: $A = (-6) \\times (-7)$:",
        options: ["+42", "-42", "-13", "+13"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج الجداء: $B = (+8) \\times (-5)$:",
        options: ["-40", "+40", "-13", "+3"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $x \\times (-4) = +28$، فإن قيمة $x$ هي:",
        options: ["-7", "+7", "+32", "-24"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "جداء عدة اعداد نسبية",
    description: "الأعداد النسبية — تحديد إشارة جداء عدة أعداد نسبية بحساب عدد العوامل السالبة (زوجي = موجب، فردي = سالب) وتطبيق الأولويات.",
    youtubeVideoId: "xAle-FNzJW4",
    order: 4,
    mindmap: `mindmap
  root((جداء عدة أعداد نسبية))
    قاعدة الإشارة
      عدد العوامل السالبة زوجي => الناتج موجب (+)
      عدد العوامل السالبة فردي => الناتج سالب (-)
    طريقة الحساب
      تحديد الإشارة أولاً
      ضرب المسافات إلى الصفر ثانياً`,
    quizQuestions: [
      {
        question: "تكون إشارة جداء عدة أعداد نسبية غير معدومة سالبة إذا كان:",
        options: [
          "عدد العوامل السالبة فردياً",
          "عدد العوامل السالبة زوجياً",
          "عدد العوامل الموجبة فردياً",
          "أحد العوامل فقط سالباً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "حدد إشارة الجداء: $E = (-2) \\times (+5) \\times (-3) \\times (-4) \\times (+1)$:",
        options: [
          "سالبة، لأن عدد العوامل السالبة هو 3 (عدد فردي)",
          "موجبة، لأن عدد العوامل السالبة هو 3",
          "موجبة دائماً لوجود عوامل موجبة",
          "معدومة"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة الجداء: $A = (-2) \\times (-5) \\times (-3)$:",
        options: ["-30", "+30", "-10", "+10"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة الجداء: $B = (-1) \\times (+4) \\times (-2) \\times (+5)$:",
        options: ["+40", "-40", "+20", "-20"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "قسمة عددين نسبيين",
    description: "الأعداد النسبية — قواعد قسمة عددين نسبيين، إشارة حاصل القسمة، والكتابات الكسرية المتكافئة لإشارة الكسر.",
    youtubeVideoId: "chKgUjhv-R0",
    order: 5,
    mindmap: `mindmap
  root((قسمة عددين نسبيين))
    قواعد الإشارات
      نفس الإشارة => حاصل موجب (+)
      مختلفان في الإشارة => حاصل سالب (-)
    الكتابات المتكافئة
      (-a) / b = a / (-b) = -(a/b)
      (-a) / (-b) = a / b`,
    quizQuestions: [
      {
        question: "حاصل قسمة عددين نسبيين مختلفين في الإشارة هو عدد:",
        options: [
          "سالب دائماً",
          "موجب دائماً",
          "معدوم",
          "يتحدد بإشارة البسط فقط"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $\\frac{-36}{-4}$:",
        options: ["+9", "-9", "-32", "+32"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $\\frac{+45}{-9}$:",
        options: ["-5", "+5", "-\\frac{1}{5}", "+54"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الكتابات الكسرية المتكافئة مع الكسر $-\\frac{7}{3}$ هي:",
        options: [
          "$\\frac{-7}{3}$ و $\\frac{7}{-3}$",
          "$\\frac{-7}{-3}$",
          "$-\\frac{-7}{3}$",
          "$\\frac{3}{-7}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "سلسلة عمليات على الاعداد النسبية",
    description: "الأعداد النسبية — الأولويات الحسابية للأقواس والضرب والقسمة والجمع والطرح، مع تبسيط وحساب المجاميع الجبرية.",
    youtubeVideoId: "_80xcoGwMX0",
    order: 6,
    mindmap: `mindmap
  root((سلسلة عمليات على الأعداد النسبية))
    ترتيب الأولويات
      1. الأقواس الداخلية فالخارجية
      2. الضرب والقسمة
      3. الجمع والطرح
    المجموع الجبري
      تحويل الطرح إلى جمع المعاكس
      تجميع الحدود الموجبة معاً والسالبة معاً`,
    quizQuestions: [
      {
        question: "في سلسلة عمليات تتضمن الأقواس والضرب والجمع، الأولوية القصوى تعطى لـ:",
        options: [
          "العمليات داخل الأقواس ثم الضرب والقسمة ثم الجمع والطرح",
          "العمليات من اليمين إلى اليسار مباشرة",
          "الجمع والطرح أولاً",
          "الضرب والقسمة قبل فك الأقواس"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة العبارة: $A = (-10) + (-3) \\times (+4)$:",
        options: ["-22", "-52", "+2", "+22"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة العبارة: $B = [(-8) + (+2)] \\div (-3)$:",
        options: ["+2", "-2", "+6", "-6"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لحساب المجموع الجبري: $S = (+5) - (-8) + (-12) - (+3)$ بطريقة مبسطة، نبدأ بـ:",
        options: [
          "تحويل كل عمليات الطرح إلى جمع المعاكس",
          "حذف جميع إشارات الجمع والطرح عشوائياً",
          "إجراء العمليات من اليسار دون تغيير الطرح",
          "ضرب الأعداد السالبة أولاً"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "سلسلة تمارين للاعداد النسبية",
    description: "الأعداد النسبية — تمارين وحلول شاملة: حساب عبارات عددية، تعويض المجاهيل بقيم عددية، والمقارنة والترتيب.",
    youtubeVideoId: "ey7eJDwcLRQ",
    order: 7,
    mindmap: `mindmap
  root((تمارين شاملة: الأعداد النسبية))
    حساب المجموع الجبري
      التبسيط والتنظيم
    المقارنة والترتيب
      العدد الأقرب إلى الصفر هو الأكبر سالباً
    التعويض الجبري
      حساب قيم عبارات حرفية`,
    quizQuestions: [
      {
        question: "احسب قيمة المجموع الجبري: $A = (+7) + (-11) - (-5) - (+4)$:",
        options: ["-3", "+3", "-13", "+7"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $a = -3$ و $b = +5$، فإن قيمة العبارة $2a - b$ هي:",
        options: ["-11", "-1", "+1", "+11"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "قارن بين العددين النسبيين التاليين: $-15.4$ و $-15.09$:",
        options: [
          "$-15.09 > -15.4$",
          "$-15.4 > -15.09$",
          "$-15.4 = -15.09$",
          "لا يمكن المقارنة بينهما"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج القوة: $C = (-2)^3 = (-2) \\times (-2) \\times (-2)$:",
        options: ["-8", "+8", "-6", "+6"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  }
];

async function main() {
  console.log("Preparing clean 3AM Math curriculum & interactive quizzes...");

  // 1. Find Month 1
  const monthRecord = await prisma.month.findFirst({
    where: { number: MONTH_NUMBER }
  });

  const monthId = monthRecord?.id || "dac5ce8a-90c4-4f34-a6a2-8e97df837619";

  // 2. Remove all existing 3AM Math lessons to avoid duplicates and ensure a fresh clean state
  const existingLessons = await prisma.lesson.findMany({
    where: {
      levels: { has: Level.MIDDLE_3 },
      subjects: { some: { id: SUBJECT_ID } }
    },
    select: { id: true }
  });

  if (existingLessons.length > 0) {
    const ids = existingLessons.map((l) => l.id);
    console.log(`Deleting ${ids.length} existing/duplicate 3AM math lessons...`);
    await prisma.lesson.deleteMany({
      where: { id: { in: ids } }
    });
    console.log("Deleted old lessons successfully.");
  }

  // 3. Create fresh 7 lessons and attach interactive quizzes
  for (const item of LESSONS) {
    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`;

    console.log(`Creating lesson #${item.order}: ${item.title}`);
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
        levels: [Level.MIDDLE_3],
        streams: [Stream.NONE],
        subjects: { connect: { id: SUBJECT_ID } }
      }
    });

    // Create Quiz (4 questions, 5 points each = maxScore: 20)
    await prisma.quiz.create({
      data: {
        lessonId: created.id,
        questions: item.quizQuestions,
        maxScore: 20,
        aiGenerated: false
      }
    });

    console.log(`  -> Attached quiz for lesson #${item.order}`);
  }

  console.log("Successfully created all 7 lessons and interactive quizzes for 3AM Math!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
