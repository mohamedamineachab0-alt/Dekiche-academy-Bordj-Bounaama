import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { Level, Stream } from "../../generated/prisma";

const SUBJECT_ID = "9db934bb-b510-4765-ab6e-9eff06403959"; // 2AM Math (الأستاذ طاليس بن عودة)
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
  // الوحدة 1: العمليات على الأعداد الطبيعية والعشرية
  // ==========================================
  {
    title: "حل الواجب المنزلي حول اجراء سلسلة عمليات بدون أقواس",
    description: "العمليات على الأعداد — تطبيقات وأولويات العمليات الحسابية: الضرب والقسمة قبل الجمع والطرح، والترتيب من اليسار إلى اليمين.",
    youtubeVideoId: "XYFRFJoM9VY",
    order: 1,
    mindmap: `mindmap
  root((سلسلة عمليات بدون أقواس))
    الجمع والطرح فقط
      الحساب من اليسار إلى اليمين
    الضرب والقسمة فقط
      الحساب من اليسار إلى اليمين
    العمليات الأربع معاً
      الأولوية للضرب والقسمة
      ثم الجمع والطرح من اليسار إلى اليمين`,
    quizQuestions: [
      {
        question: "في سلسلة عمليات تتضمن الجمع والطرح والضرب والقسمة دون أقواس، تعطى الأولوية في الحساب لـ:",
        options: [
          "الضرب والقسمة قبل الجمع والطرح",
          "الجمع والطرح أولاً",
          "العمليات من اليمين إلى اليسار دائماً",
          "العملية الأسهل أولاً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة العبارة: $A = 15 + 5 \\times 3$:",
        options: ["30", "60", "23", "45"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في سلسلة عمليات تتضمن الجمع والطرح فقط، ننجز العمليات:",
        options: [
          "من اليسار إلى اليمين حسب ترتيبها",
          "الجمع دائماً قبل الطرح",
          "الطرح دائماً قبل الجمع",
          "العدد الأكبر أولاً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $B = 24 \\div 6 \\times 2$:",
        options: ["8", "2", "12", "6"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "إجراء سلسلة عمليات تتضمن أقواس",
    description: "العمليات على الأعداد — قواعد أولوية الحساب بوجود الأقواس، وترتيب إنجاز العمليات داخل وخارج الأقواس.",
    youtubeVideoId: "bJFr0LFcBOS",
    order: 2,
    mindmap: `mindmap
  root((سلسلة عمليات تتضمن أقواس))
    القاعدة الأساسية
      إنجاز الحسابات داخل الأقواس أولاً
    الخطوة التالية
      تطبيق أولويات الضرب والقسمة
      ثم الجمع والطرح`,
    quizQuestions: [
      {
        question: "في سلسلة عمليات تتضمن أقواس، تعطى الأولوية القصوى دائماً لـ:",
        options: [
          "الحساب ما بداخل الأقواس أولاً",
          "عمليات الضرب خارج الأقواس",
          "عمليات الجمع خارج الأقواس",
          "الترتيب من اليسار دون النظر للأقواس"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة العبارة: $C = 4 \\times (7 + 3)$:",
        options: ["40", "31", "28", "25"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب قيمة العبارة: $D = (20 - 8) \\div (2 + 1)$:",
        options: ["4", "6", "12", "8"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي العبارة التي تعبر عن: 'جداء 5 في مجموع 3 و 4'؟",
        options: [
          "$5 \\times (3 + 4)$",
          "$5 \\times 3 + 4$",
          "$(5 + 3) \\times 4$",
          "$5 + 3 \\times 4$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "إجراء سلسلة عمليات تتضمن مستويات مختلفة من أقواس",
    description: "العمليات على الأعداد — التدرج في حساب الأقواس المتداخلة (الأقواس الداخلية فالعارضات الخارجية) خطوة بخطوة.",
    youtubeVideoId: "PeD0NT5pYvs",
    order: 3,
    quizQuestions: [
      {
        question: "عند وجود أقواس متداخلة (أقواس داخل عارضتين $[( )]$)، نبدأ بالحساب من:",
        options: [
          "الأقواس الداخلية الأكثر عمقاً أولاً",
          "العارضات الخارجية أولاً",
          "اليمين إلى اليسار",
          "العمليات خارج الأقواس"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $E = 50 - [4 \\times (8 - 2)]$:",
        options: ["26", "276", "44", "38"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $F = 2 \\times [15 - (3 + 4)]$:",
        options: ["16", "23", "26", "8"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في العبارة $[(a+b) \\times c] - d$، ما هي آخر عملية تنجز في الحساب؟",
        options: [
          "عملية الطرح $- d$",
          "عملية الجمع داخل القوس",
          "عملية الضرب في $c$",
          "لا توجد أولوية محددة"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "التحليل",
    description: "العمليات على الأعداد — توزيع الضرب على الجمع والطرح، التحليل باستخراج العامل المشترك، ونشر وتبسيط العبارات.",
    youtubeVideoId: "r6E_FG_Rl5M",
    order: 4,
    mindmap: `mindmap
  root((النشر والتحليل))
    النشر
      توزيع الضرب على الجمع والطرح
      k*(a+b) = k*a + k*b
    التحليل
      استخراج العامل المشترك
      k*a + k*b = k*(a+b)`,
    quizQuestions: [
      {
        question: "خاصية توزيع الضرب على الجمع تعبر عن العلاقة الرياضية:",
        options: [
          "$k \\times (a + b) = k \\times a + k \\times b$",
          "$k + (a \\times b) = (k + a) \\times b$",
          "$k \\times (a + b) = k + a + b$",
          "$k \\times (a + b) = a \\times b$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "نشر العبارة $5 \\times (x + 3)$ يعطي:",
        options: ["$5x + 15$", "$5x + 3$", "$x + 15$", "$15x$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "تحليل العبارة $7 \\times 12 + 7 \\times 8$ باستخراج العامل المشترك هو:",
        options: [
          "$7 \\times (12 + 8) = 7 \\times 20 = 140$",
          "$14 \\times 20 = 280$",
          "$7 \\times 96$",
          "$12 \\times (7 + 8)$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو العامل المشترك في العبارة الجبرية: $6a - 6b$؟",
        options: ["6", "$a$", "$b$", "$ab$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "القسمة الاقليدية",
    description: "العمليات على الأعداد — مفهوم القسمة الإقليدية (المقسوم، القاسم، الحاصل، الباقي)، حصر حاصل القسمة والقيم المقربة.",
    youtubeVideoId: "ow_YtViMWTE",
    order: 5,
    quizQuestions: [
      {
        question: "في القسمة الإقليدية لعدد طبيعي $a$ على $b$ ($b \\neq 0$)، العلاقة الأساسية هي:",
        options: [
          "$a = b \\times q + r$ مع $r < b$",
          "$a = b \\times r + q$",
          "$a = b + q \\times r$",
          "$a = b \\times q$ دائماً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "عند قسمة 75 على 8 إقليدياً، حاصل القسمة $q$ والباقي $r$ هما:",
        options: [
          "$q = 9$ و $r = 3$",
          "$q = 8$ و $r = 11$",
          "$q = 9$ و $r = 0$",
          "$q = 8$ و $r = 3$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "تكون القسمة الإقليدية تامة إذا وفقط إذا كان:",
        options: [
          "الباقي مساوياً للصفر ($r = 0$)",
          "حاصل القسمة مساوياً للصفر",
          "القاسم يساوي 1",
          "الباقي أكبر من القاسم"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احصر حاصل القسمة العشرية للعدد 47 على 6 بين عددين طبيعيين متتاليين:",
        options: [
          "$7 < \\frac{47}{6} < 8$",
          "$6 < \\frac{47}{6} < 7$",
          "$8 < \\frac{47}{6} < 9$",
          "$40 < \\frac{47}{6} < 50$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },

  // ==========================================
  // الوحدة 2: العمليات على الكسور
  // ==========================================
  {
    title: "مقارنة كسرين جميع الحالات",
    description: "الكسور — مقارنة كسرين لهما نفس المقام أو نفس البسط، وتوحيد المقامات للمقارنة في الحالات العامة.",
    youtubeVideoId: "vlZjYtVwlSA",
    order: 6,
    mindmap: `mindmap
  root((مقارنة كسرين))
    نفس المقام
      الكسر الأكبر له البسط الأكبر
    نفس البسط
      الكسر الأكبر له المقام الأصغر
    مقامات مختلفة
      توحيد المقامات ثم المقارنة`,
    quizQuestions: [
      {
        question: "لمقارنة كسرين لهما نفس المقام، الكسر الأكبر هو الذي له:",
        options: [
          "البسط الأكبر",
          "البسط الأصغر",
          "المقام الأكبر",
          "المقام الأصغر"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لمقارنة كسرين لهما نفس البسط، الكسر الأكبر هو الذي له:",
        options: [
          "المقام الأصغر",
          "المقام الأكبر",
          "البسط الأكبر",
          "كلاهما متساويان"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "أي المقارنات التالية صحيحة؟",
        options: [
          "$\\frac{7}{5} > \\frac{4}{5}$",
          "$\\frac{3}{8} > \\frac{5}{8}$",
          "$\\frac{6}{10} < \\frac{6}{15}$",
          "$\\frac{2}{3} = \\frac{3}{2}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لمقارنة الكسرين $\\frac{3}{4}$ و $\\frac{7}{12}$، نوحد المقامين ليصبح $\\frac{3}{4}$ مساوياً لـ:",
        options: [
          "$\\frac{9}{12}$ وبالتالي $\\frac{3}{4} > \\frac{7}{12}$",
          "$\\frac{6}{12}$ وبالتالي $\\frac{3}{4} < \\frac{7}{12}$",
          "$\\frac{12}{16}$",
          "$\\frac{7}{4}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "جمع و طرح كسرين",
    description: "الكسور — جمع وطرح كسرين لهما نفس المقام، أو كسرين مقام أحدهما مضاعف لمقام الآخر بتوحيد المقامات.",
    youtubeVideoId: "eZ6SKs2xfaY",
    order: 7,
    quizQuestions: [
      {
        question: "لجمع أو طرح كسرين لهما نفس المقام:",
        options: [
          "نجمع أو نطرح البسطين ونحتفظ بنفس المقام المشترك",
          "نجمع البسطين ونجمع المقامين",
          "نضرب البسطين والمقامين",
          "نطرح المقامين دائماً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $\\frac{5}{7} + \\frac{6}{7}$:",
        options: ["$\\frac{11}{7}$", "$\\frac{11}{14}$", "$\\frac{30}{7}$", "$\\frac{1}{7}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لجمع كسرين مقام أحدهما مضاعف لمقام الآخر، يجب أولاً:",
        options: [
          "توحيد مقامي الكسرين",
          "ضرب الكسرين في بعضهما",
          "جمع البسطين مباشرة",
          "اختزال الكسرين"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $\\frac{2}{3} + \\frac{5}{9}$:",
        options: ["$\\frac{11}{9}$", "$\\frac{7}{12}$", "$\\frac{7}{9}$", "$\\frac{10}{27}$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "سلسلة عمليات على الكسور الثانية متوسط",
    description: "الكسور — إجراء عمليات حسابية متتالية على الكسور مع توحيد المقامات واختزال الناتج إلى أبسط شكل ممكن.",
    youtubeVideoId: "K_8-5xC1quA",
    order: 8,
    quizQuestions: [
      {
        question: "احسب ناتج العملية: $A = \\frac{15}{4} - \\frac{3}{4} + \\frac{2}{4}$:",
        options: [
          "$\\frac{14}{4} = \\frac{7}{2}$",
          "$\\frac{10}{4}$",
          "$\\frac{16}{4}$",
          "$\\frac{14}{12}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العبارة: $B = 1 - \\frac{3}{5}$:",
        options: ["$\\frac{2}{5}$", "$\\frac{4}{5}$", "$-\\frac{2}{5}$", "$\\frac{3}{5}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في العبارة $\\frac{1}{2} + \\frac{3}{4} - \\frac{5}{8}$، ما هو المقام المشترك الأصغر للتوحيد؟",
        options: ["8", "16", "4", "64"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "بعد توحيد المقامات في العبارة السابقة ($\\\\frac{4}{8} + \\frac{6}{8} - \\frac{5}{8}$)، النتيجة هي:",
        options: ["$\\frac{5}{8}$", "$\\frac{7}{8}$", "$\\frac{3}{8}$", "$\\frac{9}{8}$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "وضعيات حول الكسور الثانية متوسط",
    description: "الكسور — حل مسائل ووضعيات واقعية توظف جمع وطرح ومقارنة الكسور وحساب الحصص والمبالغ المتبقية.",
    youtubeVideoId: "U5Y7KZCspNC",
    order: 9,
    mindmap: `mindmap
  root((وضعيات الكسور))
    المجموع الكلي
      يمثل بالعدد 1 أو كسر بسطه يساوي مقامه
    المصروف الكلي
      جمع كسور المصاريف بعد التوحيد
    الجزء المتبقي
      طرح مجموع المصاريف من 1
    حساب القيمة
      ضرب الكسر في المبلغ الكلي`,
    quizQuestions: [
      {
        question: "صُرف ثلث ($\\frac{1}{3}$) الراتب في الكراء وخمسان ($\\frac{2}{5}$) في الغذاء. ما هو الكسر الذي يمثل مجموع المصاريف؟",
        options: ["$\\frac{11}{15}$", "$\\frac{3}{8}$", "$\\frac{3}{15}$", "$\\frac{7}{15}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "بالاعتماد على الوضعية السابقة، ما هو الكسر الذي يمثل الجزء المتبقي من الراتب؟",
        options: ["$\\frac{4}{15}$", "$\\frac{11}{15}$", "$\\frac{1}{15}$", "$\\frac{5}{15}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان الراتب الإجمالي هو $60000\\text{ DA}$، ما هو المبلغ المتبقي؟",
        options: ["$16000\\text{ DA}$", "$20000\\text{ DA}$", "$24000\\text{ DA}$", "$12000\\text{ DA}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في سباق تتابع، قطع المتسابق الأول $\\frac{3}{10}$ من المسافة، وقطع الثاني $\\frac{1}{2}$ منها. من قطع المسافة الأكبر؟",
        options: [
          "المتسابق الثاني لأن $\\frac{1}{2} = \\frac{5}{10} > \\frac{3}{10}$",
          "المتسابق الأول",
          "كلاهما قطعا نفس المسافة",
          "لا يمكن المقارنة"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },

  // ==========================================
  // الوحدة 3: التوازي والتعامد والهندسة
  // ==========================================
  {
    title: "التوازي و التعامد للثانية متوسط",
    description: "الهندسة — مراجعة خواص التوازي والتعامد وتوظيفها المنهجي في إثبات استنتاجات هندسية متقدمة.",
    youtubeVideoId: "BE_5ZCiCmDU",
    order: 10,
    quizQuestions: [
      {
        question: "إذا كان $(D_1) \\perp (\\Delta)$ و $(D_2) \\perp (\\Delta)$، فما هي الوضعية النسبية للمستقيمين $(D_1)$ و $(D_2)$؟",
        options: [
          "متوازيان $(D_1) \\parallel (D_2)$",
          "متعامدان",
          "متقاطعان وغير متعامدين",
          "متطابقان دائماً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $(D_1) \\parallel (D_2)$ وكان $(\\Delta) \\perp (D_1)$، فإن:",
        options: [
          "$(\\Delta) \\perp (D_2)$",
          "$(\\Delta) \\parallel (D_2)$",
          "$(\\Delta)$ لا يقطع $(D_2)$",
          "لا يمكن الاستنتاج"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "التوازي بين مستقيمين يحفظ دائماً:",
        options: [
          "المسافة الثابتة بين المستقيمين",
          "التقاطع في نقطة وحيدة",
          "الزاوية القائمة فقط",
          "اتجاه عقارب الساعة"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "كم مستقيماً يشمل نقطة معطاة $A$ ويكون عمودياً على مستقيم معلوم $(D)$؟",
        options: [
          "مستقيم واحد فقط",
          "مستقيمان",
          "عدد لا نهائي من المستقيمات",
          "لا يمكن رسم أي مستقيم"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "محور قطعة مستقيمة",
    description: "الهندسة — خواص محور قطعة مستقيم، خاصية التساوي ومحور التناظر، والمثلثات متساوية الساقين.",
    youtubeVideoId: "TuZMmliopD4",
    order: 11,
    mindmap: `mindmap
  root((محور قطعة مستقيمة))
    التعريف
      عمودي على القطعة في منتصفها
    الخاصية المميزة
      كل نقطة من المحور متساوية البعد عن الطرفين
    الخاصية العكسية
      كل نقطة متساوية البعد تنتمي إلى المحور
    التناظر
      محور القطعة هو محور تناظر لها`,
    quizQuestions: [
      {
        question: "محور قطعة مستقيم $[AB]$ هو المستقيم الذي:",
        options: [
          "يعامد القطعة $[AB]$ في منتصفها",
          "يوازي القطعة $[AB]$",
          "يمر بأحد طرفيها",
          "يشمل منتصفها فقط دون تعامد"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كانت النقطة $M$ تنتمي إلى محور القطعة $[AB]$، فإن:",
        options: [
          "$MA = MB$",
          "$MA > MB$",
          "$MA + MB = AB$",
          "$MA \\perp MB$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "محور القطعة المستقيمة يمثل أيضاً:",
        options: [
          "محور تناظر لهذه القطعة",
          "ضلعاً فيها",
          "قوساً دائرياً",
          "مستقيماً مائلاً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $AB = 8\\text{ cm}$ ومحورها يقطعها في النقطة $I$، فإن طول القطعة $[AI]$ هو:",
        options: ["$4\\text{ cm}$", "$8\\text{ cm}$", "$2\\text{ cm}$", "$16\\text{ cm}$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "منصف زاوية ثانية متوسط",
    description: "الهندسة — تعريف منصف زاوية، طريقة الإنشاء الدقيق بالمدور والمسطرة، وخاصية تساوي البعد عن الضلعين.",
    youtubeVideoId: "kKQRicX6-zo",
    order: 12,
    mindmap: `mindmap
  root((منصف زاوية))
    التعريف
      نصف مستقيم يقسم الزاوية إلى زاويتين متقايستين
    الخاصية المميزة
      كل نقطة من المنصف متساوية المسافة عن ضلعي الزاوية
    الإنشاء
      باستعمال المدور والمسطرة بدقة`,
    quizQuestions: [
      {
        question: "منصف زاوية هو نصف المستقيم الذي مبدؤه رأس الزاوية و:",
        options: [
          "يقسم الزاوية إلى زاويتين متقايستين",
          "يعامد ضلعي الزاوية",
          "يوازي أحد ضلعي الزاوية",
          "يمر خارج الزاوية"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان قيس الزاوية $\\widehat{ABC} = 70^\\circ$ وكان $[BD)$ منصفاً لها، فإن قيس الزاوية $\\widehat{ABD}$ هو:",
        options: ["$35^\\circ$", "$70^\\circ$", "$140^\\circ$", "$45^\\circ$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "كل نقطة تنتمي إلى منصف زاوية تكون:",
        options: [
          "متساوية المسافة عن ضلعي هذه الزاوية",
          "أقرب للضلع الأول",
          "تنتمي لأحد أضلاع الزاوية",
          "تشكل زاوية قائمة"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي الأداة الهندسية الأساسية المستعملة لرسم منصف زاوية بدقة متناهية؟",
        options: [
          "المدور والمسطرة",
          "المسطرة المدرجة فقط",
          "الكوس فقط دون مدور",
          "الممحاة"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  }
];

async function main() {
  console.log("Starting insertion of 2AM Math Month 1 curriculum & quizzes...");

  const monthRecord = await prisma.month.findFirst({
    where: { number: MONTH_NUMBER }
  });
  const monthId = monthRecord?.id;

  for (const item of LESSONS) {
    const existing = await prisma.lesson.findFirst({
      where: {
        title: item.title,
        subjects: { some: { id: SUBJECT_ID } }
      }
    });

    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`;
    let lessonId: string;

    if (existing) {
      console.log(`Updating lesson #${item.order}: ${item.title}`);
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
          levels: [Level.MIDDLE_2],
          streams: [Stream.NONE],
        }
      });
      lessonId = updated.id;
    } else {
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
          levels: [Level.MIDDLE_2],
          streams: [Stream.NONE],
          subjects: { connect: { id: SUBJECT_ID } }
        }
      });
      lessonId = created.id;
    }

    // Attach interactive quiz
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

  console.log("Successfully created and organized all 12 lessons and quizzes for 2AM Math!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
