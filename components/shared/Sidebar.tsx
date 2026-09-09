"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, CheckCircle, FileText, Video, AlertTriangle,
  Trophy, Users, Key, LogOut, Settings, Bot, Wallet, Bell, Activity, Map,
  Library, MessageSquare, ChevronRight, ChevronLeft, X, Swords, BellRing,
  Star, UserMinus, Lightbulb
} from "lucide-react";
import { Role } from "@/generated/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { logoutUser } from "@/actions/auth";
import { isFemaleTeacherName } from "@/lib/education-labels";

type NavLink = { name: string; href: string; icon: React.ElementType };
type NavGroup = { label: string; links: NavLink[] };

const STUDENT_GROUPS: NavGroup[] = [
  {
    label: "التعلّم",
    links: [
      { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard },
      { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen },
      { name: "مسار الدراسة", href: "/dashboard/student/roadmap", icon: Map },
      { name: "بطاقات المراجعة", href: "/dashboard/student/review-cards", icon: Library },
      { name: "حصص مباشرة", href: "/dashboard/student/live-classes", icon: Video },
    ],
  },
  {
    label: "التقييم",
    links: [
      { name: "تماريني اليومية", href: "/dashboard/student/exercises", icon: CheckCircle },
      { name: "إختبارات وفروض", href: "/dashboard/student/exams", icon: FileText },
      { name: "أخطائي", href: "/dashboard/student/mistakes", icon: AlertTriangle },
      { name: "الترتيب والنقاط", href: "/dashboard/student/leaderboard", icon: Trophy },
      { name: "منافسة صديق", href: "/dashboard/student/friend-challenge", icon: Swords },
    ],
  },
  {
    label: "المساحة الشخصية",
    links: [
      { name: "مساعدي الذكي", href: "/dashboard/student/ai-assistant", icon: Bot },
      { name: "دردشة القسم", href: "/dashboard/student/forums", icon: MessageSquare },
      { name: "الإشعارات", href: "/dashboard/student/notifications", icon: Bell },
      { name: "100 نصيحة للتفوق", href: "/dashboard/student/tips", icon: Lightbulb },
      { name: "الإعدادات", href: "/dashboard/student/settings", icon: Settings },
    ],
  },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "نظرة عامة",
    links: [
      { name: "مركز التحليلات", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "مراقبة التلاميذ", href: "/dashboard/admin/students/monitoring", icon: Activity },
      { name: "الترتيب والنقاط", href: "/dashboard/admin/leaderboard", icon: Trophy },
    ],
  },
  {
    label: "المحتوى",
    links: [
      { name: "المواد", href: "/dashboard/admin/subjects", icon: BookOpen },
      { name: "الدروس", href: "/dashboard/admin/lessons", icon: FileText },
      { name: "بطاقات المراجعة", href: "/dashboard/admin/review-cards", icon: Library },
      { name: "تمارين يومية", href: "/dashboard/admin/exercises", icon: CheckCircle },
      { name: "الإختبارات والفروض", href: "/dashboard/admin/exams", icon: FileText },
      { name: "حصص مباشرة", href: "/dashboard/admin/live-classes", icon: Video },
    ],
  },
  {
    label: "الإدارة",
    links: [
      { name: "الأساتذة", href: "/dashboard/admin/teachers", icon: Users },
      { name: "مداخيل الأساتذة", href: "/dashboard/admin/teachers/revenues", icon: Wallet },
      { name: "رموز الدخول", href: "/dashboard/admin/codes", icon: Key },
      { name: "أخطاء تلاميذي", href: "/dashboard/admin/mistakes", icon: AlertTriangle },
      { name: "دردشة القسم", href: "/dashboard/admin/forums", icon: MessageSquare },
      { name: "تنبيهاتي", href: "/dashboard/admin/tenebati", icon: BellRing },
      { name: "الإشعارات", href: "/dashboard/admin/notifications", icon: Bell },
    ],
  },
];

const TEACHER_GROUPS: NavGroup[] = [
  {
    label: "التدريس",
    links: [
      { name: "الرئيسية", href: "/dashboard/teacher", icon: LayoutDashboard },
      { name: "أخطاء تلاميذي", href: "/dashboard/teacher/mistakes", icon: AlertTriangle },
      { name: "دردشة القسم", href: "/dashboard/teacher/forums", icon: MessageSquare },
      { name: "حصص مباشرة", href: "/dashboard/teacher/live-classes", icon: Video },
    ],
  },
];

const PARENT_GROUPS: NavGroup[] = [
  {
    label: "متابعة الأبناء",
    links: [
      { name: "معلومات أبنائي", href: "/dashboard/parent", icon: Users },
      { name: "تقدم أبنائي", href: "/dashboard/parent/progress", icon: Activity },
      { name: "النقاط والتقييمات", href: "/dashboard/parent/grades", icon: Star },
      { name: "غيابات أبنائي", href: "/dashboard/parent/absences", icon: UserMinus },
    ],
  },
];

export function Sidebar({
  role,
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse
}: {
  role: Role;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<{ fullName: string; role: Role; avatarUrl?: string | null } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoadingProfile(true);
      const data = await getUserSessionProfile();
      if (data) {
        setUserData(data);
      }
      setIsLoadingProfile(false);
    }
    fetchProfile();
  }, []);

  const groups =
    role === "ADMIN" ? ADMIN_GROUPS :
    role === "TEACHER" ? TEACHER_GROUPS :
    role === "PARENT" ? PARENT_GROUPS :
    STUDENT_GROUPS;

  const getRoleLabel = (r?: Role) => {
    switch (r) {
      case "ADMIN": return "المدير";
      case "TEACHER": return isFemaleTeacherName(userData?.fullName) ? "أستاذة" : "أستاذ";
      case "PARENT": return "وليّ أمر";
      case "STUDENT": return "تلميذ";
      default: return "";
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[99] bg-[#0f0f2e]/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-[100] flex flex-col h-[100dvh] bg-primary text-white transition-all duration-300 ease-out w-[min(86vw,20rem)] max-w-xs font-sans safe-area-pt safe-area-pb
 ${isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
 ${isCollapsed ? "md:w-[76px]" : "md:w-[264px]"}
`}
      >
        {/* Brand */}
        <div className={`h-16 shrink-0 flex items-center gap-2 border-b border-white/10 ${isCollapsed ? "md:justify-center md:px-0" : "px-3"}`}>
          {isCollapsed ? (
            <span className="text-xl font-bold text-white shrink-0 leading-none">د</span>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-bold text-white leading-snug">أكاديمية دقيش</p>
              <p className="text-xs font-semibold text-white/85 leading-snug mt-0.5">
                برج بونعامة
              </p>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={onMobileClose}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 custom-scrollbar">
          {groups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={isCollapsed ? link.name : ""}
                      onClick={onMobileClose}
                      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
 isCollapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-10"
 } ${
                        isActive
                          ? "bg-accent text-accent-text font-bold"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
 }`}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      {!isCollapsed && <span className="truncate">{link.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {isLoadingProfile ? (
            <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? "justify-center" : "px-1"}`}>
              <div className="w-9 h-9 rounded-full bg-white/15 animate-pulse shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-white/15 animate-pulse w-3/4" />
                  <div className="h-2.5 rounded bg-white/10 animate-pulse w-1/2" />
                </div>
              )}
            </div>
          ) : userData ? (
            <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? "justify-center" : "px-1"}`}>
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.fullName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white/20"
                  title={isCollapsed ? userData.fullName : ""}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-sm font-bold shrink-0"
                  title={isCollapsed ? userData.fullName : ""}
                >
                  {userData.fullName.charAt(0)}
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-sm font-semibold truncate">{userData.fullName}</p>
                  <p className="text-[11px] text-white/60 truncate">{getRoleLabel(userData.role)}</p>
                </div>
              )}
            </div>
          ) : null}

          <form action={logoutUser}>
            <button
              title={isCollapsed ? "تسجيل الخروج" : ""}
              className={`w-full flex items-center gap-3 h-10 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors ${
 isCollapsed ? "justify-center" : "px-3"
 }`}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
