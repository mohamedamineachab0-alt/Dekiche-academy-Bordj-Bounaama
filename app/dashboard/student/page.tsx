import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { 
  BookOpen, 
  Map, 
  MessageSquare, 
  Library, 
  CheckCircle, 
  FileText, 
  Bot, 
  Bell, 
  AlertTriangle, 
  Video, 
  Trophy,
  ChevronLeft,
  GraduationCap,
  Users,
  Swords
} from "lucide-react";
import Link from "next/link";
import { DailyTip } from "@/components/student/DailyTip";
import { formatSubjectsCount } from "@/lib/utils/translations";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      studentProfile: true,
      enrollments: true,
      mistakes: true,
      studentLinks: true,
    }
  });

  if (!user || !user.studentProfile) return null;

  const enrolledSubjectIds = user.enrollments.map(e => e.subjectId);

  // Future live classes for enrolled subjects
  const upcomingLiveClassesCount = await prisma.liveClass.count({
    where: {
      subjectId: { in: enrolledSubjectIds },
      date: { gte: new Date() },
    },
  });

  const { phase, level, stream } = user.studentProfile;
  const availableSubjectsCount = await prisma.subject.count({
    where: {
      isPublished: true,
      phase,
      level,
      OR: [
        { stream },
        { stream: "NONE" }
      ]
    }
  });

  const enrolledCount = enrolledSubjectIds.length;
  const mistakesCount = user.mistakes.length;
  const isParentLinked = user.studentLinks && user.studentLinks.length > 0;

  // TODO: Fetch actual pending lessons and quizzes from the database
  const pendingLessons: any[] = []; 
  const pendingQuizzes: any[] = [];

  const SECTIONS = [
    {
      id: "subjects",
      title: "موادي",
      description: "تصفح الدروس والملحقات والفيديوهات الخاصة بالمواد التي تم تفعيلها وبدء الدراسة",
      icon: BookOpen,
      cardBg: "bg-[#7E22CE]",
      textClass: "text-white",
      descClass: "text-purple-100",
      iconBg: "bg-[#FACC15]",
      iconColor: "text-[#000000]",
      badge: formatSubjectsCount(availableSubjectsCount),
      actionText: "تصفح المواد",
      route: "/dashboard/student/subjects"
    },
    {
      id: "smart-map",
      title: "خريطتي الذكية",
      description: "تتبع مسارك الدراسي ودروسك وإختباراتك ومستواك في كل مادة بخط زمني تفاعلي",
      icon: Map,
      cardBg: "bg-[#FACC15]",
      textClass: "text-[#000000]",
      descClass: "text-[#000000]",
      iconBg: "bg-[#EC4899]",
      iconColor: "text-white",
      actionText: "عرض الخريطة",
      route: "/dashboard/student/roadmap"
    },
    {
      id: "class-chat",
      title: "دردشة القسم",
      description: "شارك في نقاشات القسم واطرح أسئلتك وتفاعل مع زملائك في مساحة آمنة",
      icon: MessageSquare,
      cardBg: "bg-[#EC4899]",
      textClass: "text-white",
      descClass: "text-pink-100",
      iconBg: "bg-[#06B6D4]",
      iconColor: "text-[#000000]",
      actionText: "دخول الدردشة",
      route: "/dashboard/student/forums"
    },
    {
      id: "review-cards",
      title: "بطاقات المراجعة",
      description: "راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك",
      icon: Library,
      cardBg: "bg-[#4C1D95]",
      textClass: "text-white",
      descClass: "text-purple-200",
      iconBg: "bg-[#22C55E]",
      iconColor: "text-[#000000]",
      actionText: "بدء المراجعة",
      route: "/dashboard/student/review-cards"
    },
    {
      id: "daily-exercises",
      title: "تماريني اليومية",
      description: "حل التمارين الجديدة يومياً لرفع رصيدك من النقاط والتصدر في الترتيب عبر منصتنا",
      icon: CheckCircle,
      cardBg: "bg-[#22C55E]",
      textClass: "text-[#000000]",
      descClass: "text-green-950",
      iconBg: "bg-[#7E22CE]",
      iconColor: "text-white",
      actionText: "بدء التمارين",
      route: "/dashboard/student/exercises"
    },
    {
      id: "exams",
      title: "إختبارات وفروض",
      description: "اختبر مستواك من خلال اختبارات ذكية ومقيمة تلقائياً بدقة واحترافية",
      icon: FileText,
      cardBg: "bg-[#06B6D4]",
      textClass: "text-[#000000]",
      descClass: "text-cyan-950",
      iconBg: "bg-[#EF4444]",
      iconColor: "text-white",
      actionText: "عرض الإختبارات",
      route: "/dashboard/student/exams"
    },
    {
      id: "smart-assistant",
      title: "مساعدي الذكي",
      description: "تحدث مع المساعد الذكي المدعوم بالذكاء الاصطناعي لفهم الدروس وتحليل مستواك",
      icon: Bot,
      cardBg: "bg-[#F8F9FA]",
      textClass: "text-[#000000]",
      descClass: "text-gray-600",
      iconBg: "bg-[#FACC15]",
      iconColor: "text-[#000000]",
      actionText: "تحدث مع المساعد",
      route: "/dashboard/student/ai-assistant"
    },
    {
      id: "notifications",
      title: "الإشعارات",
      description: "تابع أحدث التنبيهات ومواعيد الامتحانات وإعلانات المنصة الهامة لحظة بلحظة",
      icon: Bell,
      cardBg: "bg-[#EAE4D9]",
      textClass: "text-[#000000]",
      descClass: "text-gray-700",
      iconBg: "bg-[#06B6D4]",
      iconColor: "text-white",
      actionText: "عرض الإشعارات",
      route: "/dashboard/student/notifications"
    },
    {
      id: "mistakes",
      title: "أخطائي",
      description: "بنك خاص بالأخطاء التي ارتكبتها في التمارين مع حلولها الصحيحة لتفاديها لاحقاً",
      icon: AlertTriangle,
      cardBg: "bg-[#F97316]",
      textClass: "text-white",
      descClass: "text-orange-100",
      iconBg: "bg-[#FFFFFF]",
      iconColor: "text-[#F97316]",
      badge: `${mistakesCount} أخطاء`,
      actionText: "مراجعة الأخطاء",
      route: "/dashboard/student/mistakes"
    },
    {
      id: "live-classes",
      title: "حصص مباشرة",
      description: "تفاعل مع أساتذتك في حصص البث المباشر عبر تطبيق زووم ومراجعة الدروس التفاعلية",
      icon: Video,
      cardBg: "bg-[#EF4444]",
      textClass: "text-white",
      descClass: "text-red-100",
      iconBg: "bg-[#FACC15]",
      iconColor: "text-[#000000]",
      badge: `${upcomingLiveClassesCount} حصص مجدولة`,
      actionText: "جدول الحصص",
      route: "/dashboard/student/live-classes"
    },
    {
      id: "ranking",
      title: "الترتيب والنقاط",
      description: "شاهد ترتيبك بين زملائك واكتشف عدد النقاط التي جمعتها من حل التمارين",
      icon: Trophy,
      cardBg: "bg-[#FACC15]",
      textClass: "text-[#000000]",
      descClass: "text-yellow-950",
      iconBg: "bg-[#7E22CE]",
      iconColor: "text-white",
      actionText: "عرض الترتيب",
      route: "/dashboard/student/leaderboard"
    },
    {
      id: "friend-challenge",
      title: "منافسة صديق",
      description: "نافس أصدقاءك في حل التمارين والمراجعة وتتبع من الأفضل",
      icon: Swords,
      cardBg: "bg-[#000000]",
      textClass: "text-white",
      descClass: "text-gray-300",
      iconBg: "bg-[#22C55E]",
      iconColor: "text-[#000000]",
      actionText: "دخول المنافسة",
      route: "/dashboard/student/friend-challenge"
    },
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title={`مرحباً بك مجدداً، ${user.fullName}!`}
        description="واصل مسيرتك التعليمية بكل شغف، أنت على بعد خطوات من تحقيق أهدافك"
        icon={GraduationCap}
        showGridPattern={true}
      />

      {/* Wrapping the DailyTip component in a wrapper if it doesn't match yet, but we'll assume it's standalone */}
      <DailyTip variant="card" />

      {/* Pending Status & Warnings Badges */}
      {(!isParentLinked || pendingLessons.length > 0 || pendingQuizzes.length > 0) && (
        <div className="flex flex-wrap items-center gap-4">
          
          {!isParentLinked && (
            <Link 
              href="/dashboard/student/settings" 
              className="flex items-center justify-between w-full p-3 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">لم تربط حسابك بحساب وليّ أمرك، يرجى الربط الآن</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-red-700 opacity-70" />
            </Link>
          )}

          {pendingLessons.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 text-sm font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_#dc2626] transition-all hover:translate-y-[2px] hover:shadow-none cursor-default w-fit">
              <BookOpen className="w-4 h-4" />
              دروس لم تشاهد وما زالت معلقة
            </div>
          )}

          {pendingQuizzes.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 text-sm font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_#dc2626] transition-all hover:translate-y-[2px] hover:shadow-none cursor-default w-fit">
              <FileText className="w-4 h-4" />
              تمارين وكويزز معلقة
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-[#000000] mb-6">أقسام المنصة</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link href={section.route} key={section.id} className={`group block ${section.cardBg} rounded-2xl p-6 lg:p-8 border-[3px] border-[#000000] transition-all duration-300 shadow-3d-soft shadow-3d-hover paper-cut relative overflow-hidden`}>
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl border-[3px] border-[#000000] flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6 ${section.iconBg} ${section.iconColor} shadow-sm`}>
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                  {section.badge && (
                    <span className="bg-[#FFFFFF] text-[#000000] text-xs font-black px-3 py-1.5 rounded-lg border-[3px] border-[#000000] shadow-sm">
                      {section.badge}
                    </span>
                  )}
                </div>
                
                <div className="mb-6 relative z-10">
                  <h3 className={`text-xl font-black ${section.textClass} mb-2`}>{section.title}</h3>
                  <p className={`text-sm font-bold ${section.descClass} line-clamp-2 leading-relaxed`}>
                    {section.description}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 font-black text-sm ${section.textClass} transition-all group-hover:gap-3 relative z-10`}>
                  <span>{section.actionText}</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  );
}
