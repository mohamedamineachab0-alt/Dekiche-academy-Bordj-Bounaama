import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { Level, Stream } from "../../generated/prisma";

const SUBJECT_ID = "7b09f76c-1998-4705-b766-1feebf41691b"; // 1AM Math (الأستاذ صافر قدور)
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
  // أنشطة عددية: الأعداد الطبيعية والأعداد العشرية
  // ==========================================
  {
    title: "قراءة و كتابة الاعداد الطبيعية",
    description: "أنشطة عددية — قواعد كتابة وقراءة الأعداد الطبيعية الكبيرة بالكلمات والأرقام وتحديد مراتب الأرقام.",
    youtubeVideoId: "3TrgwwhihQw",
    order: 1,
    mindmap: `mindmap
  root((الأعداد الطبيعية))
    مراتب الأرقام
      منزلة الآحاد
      منزلة الآلاف
      منزلة الملايين
    القراءة والكتابة
      ترك فراغ بين المنازل
      الكتابة بالأرقام والحروف`,
    quizQuestions: [
      {
        question: "في العدد 45892، ما هي منزلة ومرتبة الرقم 5؟",
        options: ["الآلاف", "عشرات الآلاف", "المئات", "العشرات"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "كتابة العدد 'ثلاثة ملايين وخمسة آلاف وأربعون' بالأرقام هي:",
        options: ["3005040", "3050040", "3500040", "3005400"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو عدد المئات في العدد الطبيعي 7425؟",
        options: ["74", "4", "742", "700"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "العدد الطبيعي الذي يلي مباشرة العدد 9999 هو:",
        options: ["10000", "9998", "100000", "99000"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "جمع و طرح و ضرب اعداد طبيعية",
    description: "أنشطة عددية — تقنيات إجراء العمليات الحسابية الأساسية على الأعداد الطبيعية والتحقق من صحة النتائج.",
    youtubeVideoId: "X7RX9nXFUKQ",
    order: 2,
    quizQuestions: [
      {
        question: "في عملية الجمع، تسمى النتيجة الناتجة بـ:",
        options: ["المجموع", "الفرق", "الجداء", "حاصل القسمة"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ذهنياً ناتج العملية: $145 + 55$:",
        options: ["200", "190", "210", "195"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب فرق العددين: $1000 - 345$:",
        options: ["655", "755", "645", "665"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "عند ضرب أي عدد طبيعي في الصفر (0)، تكون النتيجة دائماً:",
        options: ["0", "1", "العدد نفسه", "غير معرفة"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "دلالة الأرقام في العدد العشري",
    description: "أنشطة عددية — مفهوم العدد العشري، التفريق بين الجزء الصحيح والجزء العشري، وتحديد مرتبة كل رقم.",
    youtubeVideoId: "cDZpm8vABis",
    order: 3,
    mindmap: `mindmap
  root((العدد العشري))
    الجزء الصحيح
      الآحاد
      العشرات
      المئات
    الفاصلة
    الجزء العشري
      الأعشار 0.1
      الأجزاء من مئة 0.01
      الأجزاء من ألف 0.001`,
    quizQuestions: [
      {
        question: "يتكون العدد العشري من جزأين هما:",
        options: [
          "جزء صحيح وجزء عشري تفصل بينهما الفاصلة",
          "جزء موجب وجزء سالب",
          "بسط ومقام",
          "أرقام زوجية وأرقام فردية"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في العدد العشري $27.354$، ما هو رقم الأجزاء من مئة؟",
        options: ["5", "3", "4", "7"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "في العدد العشري $14.896$، الرقم 8 يمثل مرتبة:",
        options: ["الأعشار (جزء من عشرة)", "الأجزاء من مئة", "العشرات", "الآحاد"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو الجزء الصحيح في العدد العشري $0.75$؟",
        options: ["0", "75", "7", "5"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "الكسور العشرية والانتقال من الكتابة الكسرية إلى العشرية والعكس",
    description: "أنشطة عددية — تعريف الكسر العشري والانتقال السلس بين الكتابة على شكل كسر عشري والكتابة بالفاصلة.",
    youtubeVideoId: "qrFv70_vYK7",
    order: 4,
    mindmap: `mindmap
  root((الكسور العشرية))
    التعريف
      مقامها 10 أو 100 أو 1000
    الانتقال للكتابة العشرية
      إزاحة الفاصلة حسب عدد أصفار المقام
    الانتقال للكسر العشري
      كتابة العدد دون فاصلة في البسط
      المقام قوى 10 حسب عدد الأرقام العشرية`,
    quizQuestions: [
      {
        question: "الكسر العشري هو كل كسر يكون مقامه مساوياً لـ:",
        options: ["10 أو 100 أو 1000 ...", "أي عدد فردي", "العدد 2 فقط", "العدد 0"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الكتابة العشرية بالفاصلة للكسر $\\frac{457}{100}$ هي:",
        options: ["4.57", "45.7", "0.457", "457.0"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "اكتب العدد العشري $0.23$ على شكل كسر عشري:",
        options: ["$\\frac{23}{100}$", "$\\frac{23}{10}$", "$\\frac{2.3}{100}$", "$\\frac{23}{1000}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي الكتابة العشرية للكسر $\\frac{8}{1000}$؟",
        options: ["0.008", "0.08", "0.8", "8.000"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "التفكيك على شكل كسور",
    description: "أنشطة عددية — تفكيك الأعداد العشرية إلى مجموع جزء صحيح وأجزاء عشرية على شكل كسور عشرية نموذجية.",
    youtubeVideoId: "eJhGuB6PgMI",
    order: 5,
    quizQuestions: [
      {
        question: "التفكيك النموذجي بالكسور للعدد $43.25$ هو:",
        options: [
          "$(4 \\times 10) + 3 + \\frac{2}{10} + \\frac{5}{100}$",
          "$(4 \\times 100) + 3 + \\frac{25}{10}$",
          "$43 + \\frac{25}{10}$",
          "$(4 \\times 10) + 3 + \\frac{2}{100} + \\frac{5}{10}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "العدد الذي يقبل التفكيك $7 + \\frac{3}{10} + \\frac{9}{1000}$ هو:",
        options: ["7.309", "7.39", "7.039", "73.9"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي قيمة الكسر المتبقي في التفكيك: $15.4 = 15 + \\dots$؟",
        options: ["$\\frac{4}{10}$", "$\\frac{4}{100}$", "$\\frac{4}{1}$", "0.04"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "أي تفكيك مما يلي يمثل العدد العشري $1.06$؟",
        options: [
          "$1 + \\frac{6}{100}$",
          "$1 + \\frac{6}{10}$",
          "$1 + \\frac{60}{100}$",
          "$10 + \\frac{6}{100}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "مقارنة الكسور العشرية",
    description: "أنشطة عددية — مقارنة الأعداد والكسور العشرية، الترتيب التصاعدي والتنازلي، وحصر عدد عشري بين طبيعيين.",
    youtubeVideoId: "v-ZfQUbfspuU",
    order: 6,
    mindmap: `mindmap
  root((مقارنة الأعداد العشرية))
    الخطوة 1: مقارنة الجزأين الصحيحين
      الذي له جزء صحيح أكبر هو الأكبر
    الخطوة 2: إذا تساوى الجزء الصحيح
      مقارنة رقم الأعشار
      مقارنة رقم الأجزاء من مئة
    الحصر
      حصر بين عددين طبيعيين متتاليين`,
    quizQuestions: [
      {
        question: "لمقارنة عددين عشريين مختلفين، نبدأ أولاً بمقارنة:",
        options: [
          "الجزأين الصحيحين لكل منهما",
          "الجزأين العشريين",
          "عدد الأرقام الكلي",
          "الرقم الأخير من اليمين"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "أي مقارنة من المقارنات التالية صحيحة؟",
        options: ["$5.4 > 5.38$", "$5.4 < 5.38$", "$5.4 = 5.38$", "$5.04 > 5.4$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الترتيب التصاعدي الصحيح للأعداد: $3.25$ ، $3.05$ ، $3.5$ هو:",
        options: [
          "$3.05 < 3.25 < 3.5$",
          "$3.5 < 3.25 < 3.05$",
          "$3.05 < 3.5 < 3.25$",
          "$3.25 < 3.05 < 3.5$"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احصر العدد $6.73$ بين عددين طبيعيين متتاليين:",
        options: ["$6 < 6.73 < 7$", "$5 < 6.73 < 6$", "$6.7 < 6.73 < 6.8$", "$7 < 6.73 < 8$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "الضرب والقسمة على 0.1، 0.01، 0.001",
    description: "أنشطة عددية — قواعد الضرب في الأجزاء من عشرة ومئة وألف وإزاحة الفاصلة نحو اليسار.",
    youtubeVideoId: "jPiXK8TWV0",
    order: 7,
    quizQuestions: [
      {
        question: "لضرب عدد عشري في $0.1$، نقوم بـ:",
        options: [
          "إزاحة الفاصلة إلى اليسار بمرتبة واحدة",
          "إزاحة الفاصلة إلى اليمين بمرتبة واحدة",
          "إضافة صفر إلى يمين العدد",
          "قسمة العدد على 0.1"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العملية: $45.8 \\times 0.01$:",
        options: ["0.458", "4.58", "458", "0.0458"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الضرب في $0.1$ يكافئ رياضياً:",
        options: ["القسمة على 10", "الضرب في 10", "القسمة على 100", "طرح 10"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو ناتج العملية: $7.2 \\times 0.001$؟",
        options: ["0.0072", "0.072", "0.72", "7200"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "الضرب والقسمة على 0.1، 0.01، 0.001 (جزء آخر)",
    description: "أنشطة عددية — قواعد قسمة عدد عشري على 0.1 و 0.01 و 0.001 وإزاحة الفاصلة نحو اليمين.",
    youtubeVideoId: "MjI_1Vk",
    order: 8,
    quizQuestions: [
      {
        question: "لقسمة عدد عشري على $0.1$، نقوم بـ:",
        options: [
          "إزاحة الفاصلة إلى اليمين بمرتبة واحدة (الضرب في 10)",
          "إزاحة الفاصلة إلى اليسار بمرتبة واحدة",
          "قسمة العدد على 10",
          "حذف الفاصلة دون تغيير"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج: $3.5 \\div 0.1$:",
        options: ["35", "0.35", "3.50", "350"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو ناتج قسمة $12.4 \\div 0.01$؟",
        options: ["1240", "124", "1.24", "0.124"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "العملية $x \\div 0.001$ تكافئ تماماً العملية:",
        options: ["$x \\times 1000$", "$x \\div 1000$", "$x \\times 100$", "$x - 1000$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "رتبة مقدار",
    description: "أنشطة عددية — إيجاد رتبة مقدار عدد ورتبة مقدار نتيجة حساب لتقدير النتائج والتحقق من معقوليتها.",
    youtubeVideoId: "s4CgnIgSEO",
    order: 9,
    mindmap: `mindmap
  root((رتبة مقدار))
    المفهوم
      قيمة قريبة وسهلة الحساب
    الهدف
      التأكد من صحة ومعقولية النتيجة
    التطبيق
      في الجمع والطرح
      في الجداء والقسمة`,
    quizQuestions: [
      {
        question: "ما هي الفائدة الأساسية من حساب 'رتبة مقدار' نتيجة حسابية؟",
        options: [
          "إعطاء قيمة تقريبية سريعة للتحقق من معقولية النتيجة",
          "إيجاد القيمة المضبوطة بعد الفاصلة بدقة",
          "حساب القاسم المشترك الأكبر",
          "تحويل وحدات القياس"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "رتبة مقدار العدد $49.7$ هي:",
        options: ["50", "40", "100", "49"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "رتبة مقدار المجموع $98.6 + 201.2$ هي:",
        options: ["$100 + 200 = 300$", "$90 + 200 = 290$", "$100 + 300 = 400$", "250"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي رتبة مقدار الجداء $19.8 \\times 5.1$؟",
        options: ["$20 \\times 5 = 100$", "$10 \\times 5 = 50$", "$20 \\times 10 = 200$", "150"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "جداء عددين عشرين",
    description: "أنشطة عددية — تقنية إجراء عملية ضرب عددين عشريين وتحديد موضع الفاصلة في النتيجة بدقة.",
    youtubeVideoId: "TRrofQmF3YU",
    order: 10,
    quizQuestions: [
      {
        question: "عند حساب جداء عددين عشريين، يكون عدد أرقام الجزء العشري في النتيجة مساوياً لـ:",
        options: [
          "مجموع عدد أرقام الجزأين العشريين للعددين معاً",
          "عدد أرقام العدد الأكبر فقط",
          "رقم واحد بعد الفاصلة دائماً",
          "الفرق بين عدد الأرقام"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "احسب ناتج العملية: $1.2 \\times 0.3$:",
        options: ["0.36", "3.6", "0.036", "36"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هو ناتج العملية: $2.5 \\times 4$؟",
        options: ["10", "1.0", "100", "8.5"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $14 \\times 25 = 350$، فإن ناتج $1.4 \\times 0.25$ هو:",
        options: ["0.350 (أي 0.35)", "3.5", "0.035", "35"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },

  // ==========================================
  // أنشطة هندسية: التوازي والتعامد والأشكال المألوفة
  // ==========================================
  {
    title: "المستقيمان المتعامدان والمستقيمان المتوازيان",
    description: "أنشطة هندسية — التمييز بين التعامد والتوازي، الرموز الهندسية، والإنشاء باستعمال الأدوات الهندسية.",
    youtubeVideoId: "yyIUnU3e-1K",
    order: 11,
    mindmap: `mindmap
  root((المستقيمات في المستوي))
    المستقيمان المتعامدان
      يتقاطعان في نقطة واحدة
      يشكلان زاوية قائمة 90 درجة
      الرمز الرياضي متعامد
    المستقيمان المتوازيان
      لا يشتركان في أي نقطة
      المسافة بينهما ثابتة
      الرمز الرياضي يوازي`,
    quizQuestions: [
      {
        question: "المستقيمان المتعامدان هما مستقيمان متقاطعان يشكلان:",
        options: ["زاوية قائمة (90 درجة)", "زاوية حادة", "زاوية منفرجة", "زاوية مستقيمة"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الرمز الرياضي الصحيح للتعامد بين مستقيمين هو:",
        options: ["$\\perp$", "$\\parallel$", "$\\cap$", "$\\times$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "المستقيمان المتوازيان هما مستقيمان في نفس المستوي:",
        options: [
          "لا يشتركان في أي نقطة (أو متطابقان)",
          "يشكلان زاوية قائمة",
          "يتقاطعان في نقطتين",
          "متعامدان دائماً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "الرمز الرياضي الصحيح للتوازي هو:",
        options: ["$\\parallel$", "$\\perp$", "$=$", "$\\in$"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "خواص المستقيمان المتعامدان والمتوازيان",
    description: "أنشطة هندسية — الخواص الهندسية الأساسية للتوازي والتعامد واستعمالها في التبرير والبرهان.",
    youtubeVideoId: "V-HchMe4DIlE",
    order: 12,
    mindmap: `mindmap
  root((خواص التوازي والتعامد))
    الخاصية 1
      المستقيمان العموديان على نفس المستقيم متوازيان
    الخاصية 2
      إذا كان مستقيم عمودياً على أحد مستقيمين متوازيين فهو عمودي على الآخر
    الخاصية 3
      المستقيمان الموازيان لنفس المستقيم متوازيان`,
    quizQuestions: [
      {
        question: "إذا كان مستقيمان عموديين على نفس المستقيم، فإنهما:",
        options: ["متوازيان", "متعامدان", "متقاطعان بزاوية حادة", "متطابقان دائماً"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان مستقيمان متوازيين، وكان مستقيم ثالث عمودياً على أحدهما، فإنه:",
        options: [
          "عمودي على الآخر أيضاً",
          "يوازي الآخر",
          "لا يقطع الآخر",
          "يمر بمنتصفه دائماً"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "من نقطة معلومة خارج مستقيم معلوم، كم مستقيماً يوازيه يمكن رسمه؟",
        options: ["مستقيم واحد فقط", "مستقيمان", "عدد لا نهائي", "لا يمكن رسم أي مستقيم"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $(D_1) \\parallel (D_2)$ و $(D_2) \\parallel (D_3)$، فإن:",
        options: ["$(D_1) \\parallel (D_3)$", "$(D_1) \\perp (D_3)$", "$(D_1)$ يقطع $(D_3)$", "لا توجد علاقة بينهما"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "محور قطعة مستقيم",
    description: "أنشطة هندسية — تعريف محور قطعة مستقيم، خاصية تساوي البعد، وطريقة الإنشاء بالمدور والمسطرة.",
    youtubeVideoId: "2UsulS4vkek",
    order: 13,
    mindmap: `mindmap
  root((محور قطعة مستقيم))
    التعريف
      مستقيم عمودي على القطعة في منتصفها
    خاصية التساوي
      كل نقطة من المحور متساوية البعد عن طرفي القطعة
    الإنشاء
      باستعمال المدور والمسطرة`,
    quizQuestions: [
      {
        question: "محور قطعة مستقيم هو المستقيم الذي:",
        options: [
          "يعامدها في منتصفها",
          "يوازي القطعة",
          "يمر بأحد طرفيها وعمودي عليها",
          "يقسمها إلى جزأين غير متساويين"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "كل نقطة تنتمي إلى محور قطعة مستقيم تكون:",
        options: [
          "متساوية المسافة عن طرفي هذه القطعة",
          "أقرب إلى الطرف الأول",
          "تنتمي إلى القطعة بالضرورة",
          "تشكل زاوية منفرجة مع الطرفين"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "ما هي الأداة الهندسية الأساسية المستعملة لإنشاء محور قطعة مستقيم بدقة؟",
        options: [
          "المدور والمسطرة غير المدرجة",
          "المنقلة فقط",
          "الممحاة",
          "الكوس فقط دون تعيين المنتصف"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كانت النقطة $M$ متساوية البعد عن طرفي القطعة $[AB]$ (أي $MA = MB$)، فإن $M$:",
        options: [
          "تنتمي إلى محور القطعة $[AB]$",
          "هي منتصف $[AB]$ دائماً",
          "لا علاقة لها بالمحور",
          "عمودية على $[AB]$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "محور قطعة مستقيم (جزء آخر)",
    description: "أنشطة هندسية — تعميق في خواص محور القطعة، المثلثات متساوية الساقين، وتطبيقات عملية.",
    youtubeVideoId: "e1rwRGTfy4U",
    order: 14,
    quizQuestions: [
      {
        question: "كم محورا تمتلكه أي قطعة مستقيم؟",
        options: ["محور واحد وحيد", "محوران", "عدد لا نهائي", "ثلاثة محاور"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $(\\Delta)$ هو محور القطعة $[AB]$، وكانت النقطة $M \\in (\\Delta)$ لا تنتمي إلى $[AB]$، فإن المثلث $MAB$ هو:",
        options: [
          "مثلث متساوي الساقين رأسه الأساسي $M$",
          "مثلث قائم في $M$",
          "مثلث متقايس الأضلاع دائماً",
          "مثلث كيفي"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "النقطة الوحيدة المشتركة بين القطعة $[AB]$ ومحورها هي:",
        options: ["منتصف القطعة $[AB]$", "النقطة $A$", "النقطة $B$", "أي نقطة عشوائية"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لإنشاء محور قطعة مستقيم طولها $6\\text{ cm}$ بالمدور، نفتح المدور بفتحة:",
        options: [
          "أكبر من نصف طول القطعة (أكبر من $3\\text{ cm}$)",
          "أصغر من $3\\text{ cm}$",
          "تساوي $1\\text{ cm}$ فقط",
          "أصغر من $1\\text{ cm}$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "درس حول الهندسة",
    description: "أنشطة هندسية — التسميات والمفاهيم الأساسية: النقطة، المستقيم، نصف المستقيم، والقطعة المستقيمة والاستقامية.",
    youtubeVideoId: "yr6SstJJflk",
    order: 15,
    mindmap: `mindmap
  root((المفاهيم الهندسية))
    المستقيم (AB)
      غير محدود من الطرفين
    نصف المستقيم [AB)
      محدود من جهة A وغير محدود من جهة B
    قطعة المستقيم [AB]
      محدودة بالطرفين ولها طول محدد
    الاستقامية
      نقط تنتمي لنفس المستقيم`,
    quizQuestions: [
      {
        question: "النقط التي تنتمي إلى نفس المستقيم تسمى نقطاً:",
        options: [
          "على استقامة واحدة (استقامية)",
          "متوازية",
          "متعامدة",
          "متقاطعة"
        ],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "كم نقطة نحتاج على الأقل لتعيين مستقيم وحيد؟",
        options: ["نقطتان متمايزتان", "نقطة واحدة", "ثلاث نقط", "أربع نقط"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "نصف المستقيم المحدود من جهة $A$ وغير المحدود من جهة $B$ يرمز له رياضياً بـ:",
        options: ["$[AB)$", "$[AB]$", "$(AB)$", "$(AB]$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "قطعة المستقيم المحدودة بالنقطتين $A$ و $B$ يرمز لها بـ:",
        options: ["$[AB]$", "$(AB)$", "$[AB)$", "$AB$ دون أي أقواس"],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "محيطات ومساحات أشكال مألوفة",
    description: "أنشطة هندسية — حساب محيطات ومساحات المربع، المستطيل، المثلث القائم، والقرص الدائري.",
    youtubeVideoId: "_GR5RCt86M",
    order: 16,
    mindmap: `mindmap
  root((المحيطات والمساحات))
    المربع
      المحيط 4 ضرب الضلع
      المساحة الضلع ضرب الضلع
    المستطيل
      المحيط 2 ضرب الطول زائد العرض
      المساحة الطول ضرب العرض
    المثلث القائم
      المساحة جداء الضلعين القائمين قسمة 2
    القرص
      المحيط 2 في pi في نصف القطر
      المساحة pi في مربع نصف القطر`,
    quizQuestions: [
      {
        question: "محيط مربع طول ضلعه $c$ يحسب بالعلاقة:",
        options: ["$P = 4 \\times c$", "$P = c \\times c$", "$P = 2 \\times c$", "$P = c + 4$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "مساحة مستطيل طوله $L = 8\\text{ cm}$ وعرضه $l = 5\\text{ cm}$ هي:",
        options: ["$40\\text{ cm}^2$", "$26\\text{ cm}^2$", "$13\\text{ cm}^2$", "$80\\text{ cm}^2$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "مساحة المثلث القائم الذي طولا ضلعي قائمته $a$ و $b$ تحسب بـ:",
        options: ["$\\frac{a \\times b}{2}$", "$a \\times b$", "$a + b$", "$\\frac{a + b}{2}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "محيط دائرة نصف قطرها $r$ يحسب بالقانون:",
        options: [
          "$P = 2 \\times \\pi \\times r$",
          "$P = \\pi \\times r^2$",
          "$P = 4 \\times \\pi \\times r$",
          "$P = \\pi + r$"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  },
  {
    title: "تمارين الهندسة الأولى متوسط",
    description: "أنشطة هندسية — مسائل وتمارين شاملة لإدماج المكتسبات في التوازي، التعامد، وحساب المحيطات والمساحات.",
    youtubeVideoId: "otgsKX6MDas",
    order: 17,
    quizQuestions: [
      {
        question: "مستطيل محيطه $36\\text{ cm}$ وطوله $10\\text{ cm}$. ما هو عرضه؟",
        options: ["$8\\text{ cm}$", "$16\\text{ cm}$", "$26\\text{ cm}$", "$5\\text{ cm}$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "إذا كان $(d_1) \\perp (D)$ و $(d_2) \\perp (D)$، فإن المستقيمين $(d_1)$ و $(d_2)$:",
        options: ["متوازيان", "متعامدان", "متقاطعان", "منطبقان"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "مساحة قرص دائري نصف قطره $r = 10\\text{ cm}$ (بأخذ $\\pi \\approx 3.14$) هي:",
        options: ["$314\\text{ cm}^2$", "$62.8\\text{ cm}^2$", "$31.4\\text{ cm}^2$", "$100\\text{ cm}^2$"],
        correctAnswerIndex: 0,
        points: 5
      },
      {
        question: "لإنشاء زاوية قائمة دون استخدام الكوس، يمكننا إنشاء:",
        options: [
          "محور قطعة مستقيم بالمدور والمسطرة",
          "منقلة ورقية",
          "مسطرة مدرجة فقط",
          "تخمين بالعين المجردة"
        ],
        correctAnswerIndex: 0,
        points: 5
      }
    ]
  }
];

async function main() {
  console.log("🚀 Starting insertion of 1AM Math Month 1 curriculum & quizzes...");

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
          levels: [Level.MIDDLE_1],
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
          levels: [Level.MIDDLE_1],
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

  console.log("🎉 Successfully created and organized all 17 lessons and quizzes for 1AM Math!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
