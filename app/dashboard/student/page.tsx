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

  const enrolledCount = enrolledSubjectIds.length;
  const mistakesCount = user.mistakes.length;

  const SECTIONS = [
    {
      id: "subjects",
      title: "موادي",
      description: "تصفح الدروس والملحقات والفيديوهات الخاصة بالمواد التي تم تفعيلها وبدء الدراسة",
      icon: BookOpen,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-100",
      hoverBorder: "hover:border-purple-200",
      badge: `${enrolledCount} مادة`,
      actionText: "تصفح المواد",
      route: "/dashboard/student/subjects"
    },
    {
      id: "smart-map",
      title: "خريطتي الذكية",
      description: "تتبع مسارك الدراسي ودروسك وإختباراتك ومستواك في كل مادة بخط زمني تفاعلي",
      icon: Map,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      actionText: "عرض الخريطة",
      route: "/dashboard/student/roadmap"
    },
    {
      id: "class-chat",
      title: "دردشة القسم",
      description: "شارك في نقاشات القسم واطرح أسئلتك وتفاعل مع زملائك في مساحة آمنة",
      icon: MessageSquare,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      actionText: "دخول الدردشة",
      route: "/dashboard/student/forums"
    },
    {
      id: "review-cards",
      title: "بطاقات المراجعة",
      description: "راجع دروسك بسرعة وفعالية باستخدام بطاقات الذاكرة التفاعلية المصممة لمستواك",
      icon: Library,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      actionText: "بدء المراجعة",
      route: "/dashboard/student/review-cards"
    },
    {
      id: "daily-exercises",
      title: "تماريني اليومية",
      description: "حل التمارين الجديدة يومياً لرفع رصيدك من النقاط والتصدر في الترتيب عبر منصتنا",
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      hoverBorder: "hover:border-green-200",
      actionText: "بدء التمارين",
      route: "/dashboard/student/exercises"
    },
    {
      id: "exams",
      title: "إختبارات وفروض",
      description: "اختبر مستواك من خلال اختبارات ذكية ومقيمة تلقائياً بدقة واحترافية",
      icon: FileText,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      hoverBorder: "hover:border-cyan-200",
      actionText: "عرض الإختبارات",
      route: "/dashboard/student/exams"
    },
    {
      id: "smart-assistant",
      title: "مساعدي الذكي",
      description: "تحدث مع المساعد الذكي المدعوم بالذكاء الاصطناعي لفهم الدروس وتحليل مستواك",
      icon: Bot,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
      hoverBorder: "hover:border-violet-200",
      actionText: "تحدث مع المساعد",
      route: "/dashboard/student/ai-assistant"
    },
    {
      id: "notifications",
      title: "الإشعارات",
      description: "تابع أحدث التنبيهات ومواعيد الامتحانات وإعلانات المنصة الهامة لحظة بلحظة",
      icon: Bell,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      actionText: "عرض الإشعارات",
      route: "/dashboard/student/notifications"
    },
    {
      id: "mistakes",
      title: "أخطائي",
      description: "بنك خاص بالأخطاء التي ارتكبتها في التمارين مع حلولها الصحيحة لتفاديها لاحقاً",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      hoverBorder: "hover:border-orange-200",
      badge: `${mistakesCount} أخطاء`,
      actionText: "مراجعة الأخطاء",
      route: "/dashboard/student/mistakes"
    },
    {
      id: "live-classes",
      title: "حصص مباشرة",
      description: "تفاعل مع أساتذتك في حصص البث المباشر عبر تطبيق زووم ومراجعة الدروس التفاعلية",
      icon: Video,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-100",
      hoverBorder: "hover:border-pink-200",
      badge: `${upcomingLiveClassesCount} حصص مجدولة`,
      actionText: "جدول الحصص",
      route: "/dashboard/student/live-classes"
    },
    {
      id: "ranking",
      title: "الترتيب والنقاط",
      description: "شاهد ترتيبك بين زملائك واكتشف عدد النقاط التي جمعتها من حل التمارين",
      icon: Trophy,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-100",
      hoverBorder: "hover:border-purple-200",
      actionText: "عرض الترتيب",
      route: "/dashboard/student/leaderboard"
    },
    {
      id: "friend-challenge",
      title: "منافسة صديق",
      description: "نافس أصدقاءك في حل التمارين والمراجعة وتتبع من الأفضل",
      icon: Swords,
      iconColor: "text-purple-700",
      iconBg: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      actionText: "دخول المنافسة",
      route: "/dashboard/student/friend-challenge"
    },
  ];

  return (
    <div className="space-y-8">
      <HeroBanner 
        title={`مرحباً بك مجدداً، ${user.fullName}!`}
        description="واصل مسيرتك التعليمية بكل شغف، أنت على بعد خطوات من تحقيق أهدافك"
        icon={GraduationCap}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
        showGridPattern={true}
      />

      <DailyTip variant="card" />

      <div>
        <h2 className="text-2xl font-black text-purple-950 mb-6">أقسام المنصة</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link href={section.route} key={section.id} className={`group block bg-white rounded-2xl p-6 border border-purple-200 shadow-sm hover:border-purple-300 hover:shadow-md hover:shadow-purple-600/10 transition-all duration-300 ${section.hoverBorder}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${section.iconBg} ${section.iconColor}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  {section.badge && (
                    <span className="bg-white text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-100">
                      {section.badge}
                    </span>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-black text-purple-950 mb-2">{section.title}</h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 font-bold text-sm ${section.iconColor}`}>
                  <span>{section.actionText}</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  );
}
