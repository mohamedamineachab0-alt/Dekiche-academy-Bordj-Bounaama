import "dotenv/config";
import { prisma } from "../../lib/prisma";

const SUBJECT_ID = "cf38eb18-568e-41ea-8a7e-8417b7b2e6c2"; // 4AM Math (الأستاذ دقيش علي)

type QuizQ = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
};

const QUIZZES: Record<number, QuizQ[]> = {
  // 1. القاسم المشترك الأكبر (PGCD)
  1: [
    {
      question: "ما هو الشرط حتى يكون العدد الطبيعي $b$ قاسماً للعدد الطبيعي $a$ ($b \\neq 0$)؟",
      options: [
        "باقي القسمة الإقليدية لـ $a$ على $b$ يساوي 0",
        "حاصل قسمة $a$ على $b$ عدد غير طبيعي",
        "باقي القسمة الإقليدية أكبر تماماً من $b$",
        "العدد $a$ أصغر دائماً من العدد $b$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو القاسم المشترك الأكبر للعددين 48 و 36؟",
      options: ["12", "6", "18", "24"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كان $a$ مضاعفاً للعدد $b$ ($b \\neq 0$)، فإن $PGCD(a, b)$ يساوي:",
      options: ["$b$", "$a$", "1", "$a \\times b$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "مجموعة قواسم العدد 18 كاملة هي:",
      options: [
        "1, 2, 3, 6, 9, 18",
        "1, 2, 3, 9, 18",
        "2, 3, 6, 9",
        "1, 3, 6, 18"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو $PGCD(a, 1)$ لأي عدد طبيعي غير معدوم $a$؟",
      options: ["1", "$a$", "0", "غير معرّف"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 2. النوع الأول من مسائل PGCD
  2: [
    {
      question: "متى نستعمل القاسم المشترك الأكبر $PGCD$ في المسائل الحياتية؟",
      options: [
        "عند الرغبة في التقسيم أو التوزيع بالتساوي وبأكبر قياس ممكن",
        "عند حساب المسافات التراكمية الطويلة",
        "عند الرغبة في مضاعفة الكميات بالتكرار",
        "عند تحويل وحدات القياس فقط"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "صفيحة زجاج مستطيلة طولها $110\\text{ cm}$ وعرضها $88\\text{ cm}$. نريد تقطيعها إلى مربعات متماثلة بأكبر ضلع دون ضياع. طول ضلع المربع هو:",
      options: ["$22\\text{ cm}$", "$11\\text{ cm}$", "$44\\text{ cm}$", "$8\\text{ cm}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "في المسألة السابقة، ما هو عدد المربعات الناتجة من تقطيع الصفيحة؟",
      options: ["20 مربعاً", "22 مربعاً", "10 مربعات", "15 مربعاً"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "يملك بائع أزهار 75 وردة حمراء و 45 وردة بيضاء، ويريد تشكيل باقات متماثلة بأكبر عدد ممكن. كم باقة يمكنه تشكيلها؟",
      options: ["15 باقة", "5 باقات", "25 باقة", "9 باقات"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "في كل باقة من الباقات الـ 15 السابقة، كم عدد الورود الحمراء والبيضاء؟",
      options: [
        "5 حمراء و 3 بيضاء",
        "3 حمراء و 5 بيضاء",
        "15 حمراء و 9 بيضاء",
        "4 حمراء و 2 بيضاء"
      ],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 3. خوارزمية أقليدس أو القسمات المتتالية
  3: [
    {
      question: "ما هو المبدأ الرياضي الأساسي في خوارزمية إقليدس لحساب $PGCD(a, b)$؟",
      options: [
        "$PGCD(a, b) = PGCD(b, r)$ حيث $r$ هو باقي قسمة $a$ على $b$",
        "$PGCD(a, b) = a - b$",
        "$PGCD(a, b) = a \\div b$",
        "$PGCD(a, b) = r$ مباشرة دون تكرار"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "متى تتوقف سلسلة القسمات الإقليدية المتتالية؟",
      options: [
        "عندما نصل إلى باقي قسمة معدوم (0)",
        "عندما يصبح حاصل القسمة صفراً",
        "عندما يتساوى القاسم والباقي",
        "بعد 3 خطوات دائماً"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "في خوارزمية إقليدس، القاسم المشترك الأكبر هو:",
      options: [
        "آخر باقي قسمة غير معدوم",
        "أول باقي قسمة نحصل عليه",
        "باقي القسمة المعدوم الأخير",
        "حاصل القسمة الأخير"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "عند قسمة 255 على 105، الباقي الأول هو:",
      options: ["45", "15", "50", "2"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "باستكمال القسمات: $105 = 45 \\times 2 + 15$ ثم $45 = 15 \\times 3 + 0$. ما هو $PGCD(255, 105)$؟",
      options: ["15", "45", "3", "0"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 4. العددان الأوليان فيما بينهما
  4: [
    {
      question: "نقول عن عددين طبيعيين $a$ و $b$ أنهما أوليان فيما بينهما إذا وفقط إذا كان:",
      options: [
        "$PGCD(a, b) = 1$",
        "$a$ و $b$ عددان أوليان فرديان",
        "$PGCD(a, b) = 0$",
        "$a + b$ عدد أولي"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "هل العددان 21 و 26 أوليان فيما بينهما؟",
      options: [
        "نعم، لأن $PGCD(21, 26) = 1$",
        "لا، لأن 21 يقبل القسمة على 3",
        "لا، لأن 26 عدد زوجي",
        "لا، لأن كلاهما غير أولي"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "أي زوج من الأعداد التالية يمثل عددين أوليين فيما بينهما؟",
      options: ["8 و 9", "12 و 18", "15 و 25", "14 و 21"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "لكتابة الكسر $\\frac{a}{b}$ على شكل كسر غير قابل للاختزال:",
      options: [
        "نقسم كلاً من البسط والمقام على $PGCD(a, b)$",
        "نطرح البسط من المقام",
        "نضرب البسط والمقام في 2",
        "نقسم البسط فقط على 2"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كان الكسر $\\frac{x}{y}$ غير قابل للاختزال، فإن العددين $x$ و $y$:",
      options: [
        "أوليان فيما بينهما",
        "فرديان دائماً",
        "زوجيان دائماً",
        "أحدهما يساوي 1 دائماً"
      ],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 5. سلسلة تمارين رقم 1 (القاسم المشترك الأكبر)
  5: [
    {
      question: "احسب القاسم المشترك الأكبر $PGCD(693, 441)$:",
      options: ["63", "21", "9", "7"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "اكتب الكسر $\\frac{441}{693}$ على شكل كسر غير قابل للاختزال:",
      options: ["$\\frac{7}{11}$", "$\\frac{9}{11}$", "$\\frac{3}{7}$", "$\\frac{21}{33}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هي قيمة العبارة $A$ حيث: $A = \\frac{441}{693} - \\frac{2}{11}$؟",
      options: ["$\\frac{5}{11}$", "$\\frac{7}{11}$", "$\\frac{3}{11}$", "$\\frac{9}{11}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو $PGCD(143, 78)$؟",
      options: ["13", "11", "26", "1"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "اختزال الكسر $\\frac{78}{143}$ هو:",
      options: ["$\\frac{6}{11}$", "$\\frac{7}{13}$", "$\\frac{6}{13}$", "$\\frac{1}{2}$"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 6. سلسلة تمارين حول PGCD (رقم 2)
  6: [
    {
      question: "يملك مكتبي 418 كراس مخطط و 266 كراس رسم، يريد وضعها في رزم متماثلة بأكبر عدد ممكن. ما هو عدد الرزم؟",
      options: ["38 رزمة", "19 رزمة", "14 رزمة", "76 رزمة"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "في كل رزمة من الرزم الـ 38، كم كراس مخطط وكم كراس رسم يوجد؟",
      options: [
        "11 كراس مخطط و 7 كراريس رسم",
        "7 مخطط و 11 رسم",
        "19 مخطط و 14 رسم",
        "22 مخطط و 14 رسم"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "قطعة أرض مستطيلة محيطها $280\\text{ m}$ ونسبة طولها إلى عرضها هي $\\frac{4}{3}$. بعدا الحقل هما:",
      options: [
        "الطول $80\\text{ m}$ والعرض $60\\text{ m}$",
        "الطول $100\\text{ m}$ والعرض $40\\text{ m}$",
        "الطول $90\\text{ m}$ والعرض $50\\text{ m}$",
        "الطول $70\\text{ m}$ والعرض $70\\text{ m}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "نريد غرس أشجار حول محيط الحقل بأكبر مسافة متساوية بين كل شجرتين مع غرس شجرة في كل ركن. المسافة هي:",
      options: ["$20\\text{ m}$", "$10\\text{ m}$", "$5\\text{ m}$", "$40\\text{ m}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو العدد الكلي للأشجار اللازمة لتشجير محيط الحقل كاملاً؟",
      options: ["14 شجرة", "28 شجرة", "20 شجرة", "12 شجرة"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 7. تمارين إضافية حول PGCD
  7: [
    {
      question: "إذا كان $PGCD(a, b) = 18$ وكان $\\frac{a}{b} = \\frac{5}{3}$، فإن العددان هما:",
      options: [
        "$a = 90$ و $b = 54$",
        "$a = 45$ و $b = 27$",
        "$a = 180$ و $b = 108$",
        "$a = 50$ و $b = 30$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو باقي قسمة العدد $(315 \\times 126)$ على 63؟",
      options: ["0", "1", "63", "21"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "عيّن الأعداد الطبيعية $n$ التي تجعل الكسر $\\frac{12}{n+1}$ عدداً طبيعياً:",
      options: [
        "$n \\in \\{0, 1, 2, 3, 5, 11\\}$",
        "$n \\in \\{1, 2, 3, 4, 6, 12\\}$",
        "$n \\in \\{1, 2, 3\\}$",
        "$n \\in \\{0, 2, 4, 6\\}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "قيمة $PGCD(2n+1, 2n)$ لأي عدد طبيعي $n$ هي:",
      options: [
        "1 دائماً لأن العددين المتتاليين أوليان فيما بينهما",
        "$2n$",
        "2",
        "تعتمد على قيمة $n$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كان $PGCD(a, b) = d$، فإن $PGCD(\\frac{a}{d}, \\frac{b}{d})$ يساوي:",
      options: ["1", "$d$", "$d^2$", "0"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 8. القيم التقريبية والقوى
  8: [
    {
      question: "ما هو ناتج العملية $10^4 \\times 10^{-7} \\times 10^5$؟",
      options: ["$10^2$", "$10^{-2}$", "$10^{16}$", "$10^{-35}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هي قيمة $\\frac{10^8}{10^{-3}}$؟",
      options: ["$10^{11}$", "$10^5$", "$10^{-11}$", "$10^{-24}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "الكتابة العلمية للعدد $A = 0.00034 \\times 10^6$ هي:",
      options: [
        "$3.4 \\times 10^2$",
        "$34 \\times 10^1$",
        "$0.34 \\times 10^3$",
        "$3.4 \\times 10^{-2}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "رتبة مقدار العدد $7.85 \\times 10^{-4}$ هي:",
      options: [
        "$8 \\times 10^{-4}$",
        "$7 \\times 10^{-4}$",
        "$8 \\times 10^{-3}$",
        "$10^{-3}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "مدور العدد $14.673$ إلى الجزء من مئة ($10^{-2}$) هو:",
      options: ["14.67", "14.68", "14.7", "14.6"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 9. مخزن الرياضيات (الجزء الأول)
  9: [
    {
      question: "ما هو مربع العدد الحقيقي $-9$؟",
      options: ["81", "-81", "18", "-18"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "أي من الأعداد التالية يمثل مربعاً تاماً؟",
      options: ["144", "120", "80", "50"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كانت مساحة مربع هي $169\\text{ cm}^2$، فإن طول ضلعه هو:",
      options: ["$13\\text{ cm}$", "$14\\text{ cm}$", "$12\\text{ cm}$", "$16.9\\text{ cm}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هي القيمة المضبوطة لـ $\\sqrt{0.04}$؟",
      options: ["0.2", "0.02", "0.002", "2"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هي حلول المعادلة $x^2 = 0$؟",
      options: [
        "حل وحيد هو $x = 0$",
        "حلان 0 و -0",
        "لا يوجد حل",
        "جميع الأعداد الحقيقية"
      ],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 10. الحساب على الجذور - تطبيقات وتدريبات (جزء 1)
  10: [
    {
      question: "من أجل كل عددين موجبين $a$ و $b$، أي خاصية صحيحة دائماً؟",
      options: [
        "$\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$",
        "$\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$",
        "$\\sqrt{a - b} = \\sqrt{a} - \\sqrt{b}$",
        "$\\sqrt{a^2 + b^2} = a + b$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "بسّط العبارة $\\sqrt{75}$ على شكل $a\\sqrt{b}$ بأصغر عدد طبيعي $b$ ممكن:",
      options: ["$5\\sqrt{3}$", "$3\\sqrt{5}$", "$25\\sqrt{3}$", "$15\\sqrt{5}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "احسب القيمة المضبوطة للعبارة $A = \\sqrt{2} \\times \\sqrt{32}$:",
      options: ["8", "16", "4", "$\\sqrt{34}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "بسّط العبارة $\\sqrt{18} + \\sqrt{50}$:",
      options: ["$8\\sqrt{2}$", "$2\\sqrt{8}$", "$\\sqrt{68}$", "$15\\sqrt{2}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "احسب ناتج $\\sqrt{\\frac{64}{9}}$:",
      options: ["$\\frac{8}{3}$", "$\\frac{32}{3}$", "$\\frac{8}{9}$", "$\\frac{16}{3}$"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 11. الحساب على الجذور - تطبيقات وتدريبات (جزء 2)
  11: [
    {
      question: "اكتب النسبة $\\frac{10}{\\sqrt{5}}$ بمقام ناطق:",
      options: [
        "$2\\sqrt{5}$",
        "$\\frac{2\\sqrt{5}}{5}$",
        "$5\\sqrt{2}$",
        "$\\frac{10\\sqrt{5}}{2}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "انشر وبسّط العبارة $(3 + \\sqrt{2})^2$:",
      options: [
        "$11 + 6\\sqrt{2}$",
        "$9 + 2 = 11$",
        "$11 + 3\\sqrt{2}$",
        "$7 + 6\\sqrt{2}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "بسّط العبارة $B = 2\\sqrt{27} - 3\\sqrt{12} + \\sqrt{3}$:",
      options: ["$\\sqrt{3}$", "$0$", "$2\\sqrt{3}$", "$5\\sqrt{3}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "اكتب النسبة $\\frac{\\sqrt{3} + 1}{\\sqrt{3}}$ على شكل نسبة مقامها عدد ناطق:",
      options: [
        "$\\frac{3 + \\sqrt{3}}{3}$",
        "$\\frac{3 + 1}{3}$",
        "$1 + \\sqrt{3}$",
        "$\\frac{\\sqrt{3} + 3}{9}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو ناتج الجداء $(\\sqrt{7} - \\sqrt{3})(\\sqrt{7} + \\sqrt{3})$؟",
      options: ["4", "10", "$\\sqrt{4}$", "$-4$"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 12. الحساب على الجذور - تطبيقات وتدريبات (جزء 3)
  12: [
    {
      question: "ما هي حلول المعادلة $x^2 = 45$؟",
      options: [
        "$x = 3\\sqrt{5}$ أو $x = -3\\sqrt{5}$",
        "$x = 9\\sqrt{5}$ فقط",
        "$x = 15$ أو $x = -15$",
        "ليس لها حل في $\\mathbb{R}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "حلول المعادلة $3x^2 - 48 = 0$ هي:",
      options: [
        "$x = 4$ أو $x = -4$",
        "$x = 16$",
        "$x = 4$ فقط",
        "$x = 8$ أو $x = -8$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هي حلول المعادلة $x^2 + 25 = 0$ في مجموعة الأعداد الحقيقية؟",
      options: [
        "لا توجد حلول في $\\mathbb{R}$",
        "$x = 5$ أو $x = -5$",
        "$x = -5$ فقط",
        "$x = 25$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "مثلث قائم طولا ضلعي قائمته $\\sqrt{5}\\text{ cm}$ و $\\sqrt{20}\\text{ cm}$. ما هو طول وتره؟",
      options: [
        "$5\\text{ cm}$",
        "$25\\text{ cm}$",
        "$\\sqrt{15}\\text{ cm}$",
        "$3\\sqrt{5}\\text{ cm}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "مساحة مستطيل هي $72\\text{ cm}^2$ وطوله ضعف عرضه. طول عرضه هو:",
      options: ["$6\\text{ cm}$", "$12\\text{ cm}$", "$36\\text{ cm}$", "$8\\text{ cm}$"],
      correctAnswerIndex: 0,
      points: 4
    }
  ],

  // 13. الوضعيات والإدماج المركبة (النوع 3)
  13: [
    {
      question: "ما هي الاستراتيجية المثلى للتعامل مع وضعية إدماجية تتضمن سؤالاً واحداً مركباً؟",
      options: [
        "تفكيك الوضعية إلى مهمات وأسئلة فرعية متسلسلة وصولاً للهدف النهائي",
        "حل السؤال مباشرة بعملية حسابية واحدة عشوائية",
        "كتابة الجواب النهائي دون خطوات التبرير",
        "تطبيق قانون فيثاغورس مباشرة دون تحقق من طبيعة الشكل"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "أرض مستطيلة أبعادها $120\\text{ m}$ و $90\\text{ m}$. أراد صاحبها غرس نخلات على المحيط بأكبر مسافة متساوية. المسافة بين كل نخلتين هي:",
      options: ["$30\\text{ m}$", "$15\\text{ m}$", "$10\\text{ m}$", "$60\\text{ m}$"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "ما هو عدد النخلات اللازمة لغرس المحيط كاملاً (محيط الأرض = $420\\text{ m}$)؟",
      options: ["14 نخلة", "28 نخلة", "7 نخلات", "21 نخلة"],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كان ثمن النخلة الواحدة $4500\\text{ DA}$ ومصاريف النقل $12000\\text{ DA}$، ما هي التكلفة الإجمالية للغرس؟",
      options: [
        "$75000\\text{ DA}$",
        "$63000\\text{ DA}$",
        "$57000\\text{ DA}$",
        "$80000\\text{ DA}$"
      ],
      correctAnswerIndex: 0,
      points: 4
    },
    {
      question: "إذا كانت الميزانية المرصودة للمشروع $80000\\text{ DA}$، فما هي الوضعية المالية لصاحب المشروع؟",
      options: [
        "تكفي الميزانية ويبقى معه فائض قدره $5000\\text{ DA}$",
        "لا تكفي الميزانية وينقصه مبلغ مالي",
        "تكفي بالتمام والكمال دون أي باقي",
        "لا يمكن الحكم لعدم توفر معطيات كافية"
      ],
      correctAnswerIndex: 0,
      points: 4
    }
  ]
};

async function main() {
  console.log("🎯 Updating interactive quizzes for 4AM Math Month 1 lessons...");

  for (const [orderStr, questions] of Object.entries(QUIZZES)) {
    const order = Number(orderStr);
    const lesson = await prisma.lesson.findFirst({
      where: {
        order,
        month: 1,
        subjects: { some: { id: SUBJECT_ID } }
      }
    });

    if (!lesson) {
      console.warn(`Lesson with order ${order} not found!`);
      continue;
    }

    await prisma.quiz.upsert({
      where: { lessonId: lesson.id },
      update: {
        questions,
        maxScore: 20,
        aiGenerated: false
      },
      create: {
        lessonId: lesson.id,
        questions,
        maxScore: 20,
        aiGenerated: false
      }
    });

    console.log(`✅ Quiz updated for Lesson ${order}: "${lesson.title}" (5 questions, 20 pts)`);
  }

  console.log("🎉 All 13 quizzes successfully created and attached!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
