"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, BookOpen, CheckCircle, FileText, Video, AlertTriangle, 
  Trophy, Users, Key, LogOut, Settings, Bot, Wallet, Bell, Activity, Map, 
  Library, MessageSquare, ChevronRight, ChevronLeft, Menu, X, Swords, BellRing,
  Star, UserMinus, Lightbulb
} from "lucide-react";
import { Role } from "@/generated/prisma";
import { getUserSessionProfile } from "@/actions/user";
import { logoutUser } from "@/actions/auth";
import { DailyTip } from "@/components/student/DailyTip";

const STUDENT_LINKS = [
  { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "خريطتي الذكية", href: "/dashboard/student/roadmap", icon: Map, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "دردشة القسم", href: "/dashboard/student/forums", icon: MessageSquare, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "بطاقات المراجعة", href: "/dashboard/student/review-cards", icon: Library, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "تماريني اليومية", href: "/dashboard/student/exercises", icon: CheckCircle, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "إختبارات وفروض", href: "/dashboard/student/exams", icon: FileText, activeBg: "bg-purple-50 dark:bg-purple-900/30", activeText: "text-purple-800 dark:text-purple-400", iconColor: "text-purple-600 dark:text-purple-400" },
  { name: "مساعدي الذكي", href: "/dashboard/student/ai-assistant", icon: Bot, activeBg: "bg-violet-50 dark:bg-violet-900/30", activeText: "text-violet-700 dark:text-violet-400", iconColor: "text-violet-600 dark:text-violet-400" },
  { name: "الإشعارات", href: "/dashboard/student/notifications", icon: Bell, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "أخطائي", href: "/dashboard/student/mistakes", icon: AlertTriangle, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "حصص مباشرة", href: "/dashboard/student/live-classes", icon: Video, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "الترتيب والنقاط", href: "/dashboard/student/leaderboard", icon: Trophy, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "منافسة صديق", href: "/dashboard/student/friend-challenge", icon: Swords, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "100 نصيحة للتفوق", href: "/dashboard/student/tips", icon: Lightbulb, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "الإعدادات", href: "/dashboard/student/settings", icon: Settings, activeBg: "bg-purple-50 dark:bg-white", activeText: "text-purple-900 dark:text-purple-900", iconColor: "text-purple-600 dark:text-purple-600" },
];

const ADMIN_LINKS = [
  { name: "الرئيسية", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "الأساتذة", href: "/dashboard/admin/teachers", icon: Users },
  { name: "مداخيل الأساتذة", href: "/dashboard/admin/teachers/revenues", icon: Wallet },
  { name: "المواد", href: "/dashboard/admin/subjects", icon: BookOpen },
  { name: "الدروس", href: "/dashboard/admin/lessons", icon: FileText },
  { name: "رموز الدخول", href: "/dashboard/admin/codes", icon: Key },
  { name: "دردشة القسم", href: "/dashboard/admin/forums", icon: MessageSquare },
  { name: "تمارين يومية", href: "/dashboard/admin/exercises", icon: CheckCircle },
  { name: "الإختبارات والفروض", href: "/dashboard/admin/exams", icon: FileText },
  { name: "بطاقات المراجعة", href: "/dashboard/admin/review-cards", icon: Library },
  { name: "أخطاء تلاميذي", href: "/dashboard/admin/mistakes", icon: AlertTriangle },
  { name: "مراقبة التلاميذ", href: "/dashboard/admin/students/monitoring", icon: Activity },
  { name: "تنبيهاتي", href: "/dashboard/admin/tenebati", icon: BellRing, activeBg: "bg-purple-50 dark:bg-purple-950/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-800 dark:text-purple-500" },
  { name: "الإشعارات", href: "/dashboard/admin/notifications", icon: Bell },
  { name: "حصص مباشرة", href: "/dashboard/admin/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/admin/leaderboard", icon: Trophy },
];

const TEACHER_LINKS = [
  { name: "الرئيسية", href: "/dashboard/teacher", icon: LayoutDashboard },
  { name: "حصص مباشرة", href: "/dashboard/teacher/live-classes", icon: Video },
];

const PARENT_LINKS = [
  { name: "معلومات أبنائي", href: "/dashboard/parent", icon: Users, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "تقدم أبنائي", href: "/dashboard/parent/progress", icon: Activity, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "النقاط والتقييمات", href: "/dashboard/parent/grades", icon: Star, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
  { name: "غيابات أبنائي", href: "/dashboard/parent/absences", icon: UserMinus, activeBg: "bg-purple-50 dark:bg-white/30", activeText: "text-purple-800 dark:text-purple-500", iconColor: "text-purple-700 dark:text-purple-500" },
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

  const links = role === "ADMIN" ? ADMIN_LINKS : role === "TEACHER" ? TEACHER_LINKS : role === "PARENT" ? PARENT_LINKS : STUDENT_LINKS;
  const roleName = role === "ADMIN" ? "المدير" : role === "TEACHER" ? "أستاذ" : role === "PARENT" ? "الولي" : "تلميذ";

  const getRoleLabel = (r?: Role) => {
    switch (r) {
      case "ADMIN": return "المدير";
      case "TEACHER": return "أستاذ";
      case "PARENT": return "الولي";
      case "STUDENT": return "تلميذ";
      default: return "";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-[99] bg-black/50 md:hidden transition-all duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        className={`fixed inset-y-0 right-0 z-[100] flex flex-col h-screen bg-[#f8f9fa] dark:bg-white border-l border-purple-100 dark:border-purple-200 shadow-2xl transition-all duration-300 ease-in-out w-[80%] max-w-sm
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Header & Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between min-h-[72px]">
          {!isCollapsed && (
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-xl font-black text-purple-950 dark:text-purple-950 leading-tight">منصة أكاديمية دقيش التعليمية برج بونعامة</h2>
            </div>
          )}
          
          <button 
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-purple-800 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={onMobileClose}
            className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.name : ""}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm overflow-hidden ${
                  isActive 
                    ? ((link as any).activeBg || "bg-purple-50 dark:bg-white/30") + " " + ((link as any).activeText || "text-purple-800 dark:text-purple-500") + " shadow-sm shadow-purple-100/50 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white hover:text-purple-950 dark:hover:text-purple-950"
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${(link as any).iconColor || "text-purple-700 dark:text-purple-500"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Profile Section */}
        <div className="p-4 border-t border-slate-100">
          
          {isLoadingProfile ? (
            <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
              <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              )}
            </div>
          ) : userData ? (
            <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
              {userData.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt={userData.fullName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                  title={isCollapsed ? userData.fullName : ""}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-black shrink-0"
                  title={isCollapsed ? userData.fullName : ""}
                >
                  {userData.fullName.charAt(0)}
                </div>
              )}
              {!isCollapsed && (
                <div className="overflow-hidden text-right flex-1">
                  <p className="text-sm font-bold text-purple-950 truncate">{userData.fullName}</p>
                  <p className="text-[11px] font-bold text-slate-400 truncate">{getRoleLabel(userData.role)}</p>
                </div>
              )}
            </div>
          ) : null}
          
          <form action={logoutUser}>
            <button 
              title={isCollapsed ? "تسجيل الخروج" : ""}
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-purple-800 hover:bg-purple-50 transition-all font-bold text-sm overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-3 justify-start'}`}
            >
              <LogOut className="w-5 h-5 text-purple-700 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">تسجيل الخروج</span>}
            </button>
          </form>

        </div>
      </aside>
    </>
  );
}
