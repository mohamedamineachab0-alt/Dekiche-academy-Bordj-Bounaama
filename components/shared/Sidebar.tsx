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

const STUDENT_LINKS = [
  { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen },
  { name: "خريطتي الذكية", href: "/dashboard/student/roadmap", icon: Map },
  { name: "دردشة القسم", href: "/dashboard/student/forums", icon: MessageSquare },
  { name: "بطاقات المراجعة", href: "/dashboard/student/review-cards", icon: Library },
  { name: "تماريني اليومية", href: "/dashboard/student/exercises", icon: CheckCircle },
  { name: "إختبارات وفروض", href: "/dashboard/student/exams", icon: FileText },
  { name: "مساعدي الذكي", href: "/dashboard/student/ai-assistant", icon: Bot },
  { name: "الإشعارات", href: "/dashboard/student/notifications", icon: Bell },
  { name: "أخطائي", href: "/dashboard/student/mistakes", icon: AlertTriangle },
  { name: "حصص مباشرة", href: "/dashboard/student/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/student/leaderboard", icon: Trophy },
  { name: "منافسة صديق", href: "/dashboard/student/friend-challenge", icon: Swords },
  { name: "100 نصيحة للتفوق", href: "/dashboard/student/tips", icon: Lightbulb },
  { name: "الإعدادات", href: "/dashboard/student/settings", icon: Settings },
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
  { name: "تنبيهاتي", href: "/dashboard/admin/tenebati", icon: BellRing },
  { name: "الإشعارات", href: "/dashboard/admin/notifications", icon: Bell },
  { name: "حصص مباشرة", href: "/dashboard/admin/live-classes", icon: Video },
  { name: "الترتيب والنقاط", href: "/dashboard/admin/leaderboard", icon: Trophy },
];

const TEACHER_LINKS = [
  { name: "الرئيسية", href: "/dashboard/teacher", icon: LayoutDashboard },
  { name: "حصص مباشرة", href: "/dashboard/teacher/live-classes", icon: Video },
];

const PARENT_LINKS = [
  { name: "معلومات أبنائي", href: "/dashboard/parent", icon: Users },
  { name: "تقدم أبنائي", href: "/dashboard/parent/progress", icon: Activity },
  { name: "النقاط والتقييمات", href: "/dashboard/parent/grades", icon: Star },
  { name: "غيابات أبنائي", href: "/dashboard/parent/absences", icon: UserMinus },
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
          className="fixed inset-0 z-[99] bg-black/60 md:hidden transition-all duration-300 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-[100] flex flex-col h-screen bg-[#FFFFFF] border-l-[3px] border-[#000000] shadow-2xl transition-all duration-300 ease-in-out w-[80%] max-w-sm font-sans
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Header & Toggle */}
        <div className="p-4 border-b-[3px] border-[#000000] bg-[#4C1D95] text-white flex items-center justify-between min-h-[80px]">
          {!isCollapsed && (
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-xl font-black leading-tight">أكاديمية دقيش</h2>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border-[2px] border-[#000000] bg-white text-[#000000] hover:bg-[#7E22CE] hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 bg-white text-[#000000] border-[2px] border-[#000000] rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-2 bg-[#F8F9FA] paper-grain">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.name : ""}
                onClick={onMobileClose}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm overflow-hidden border-[2px] ${isActive
                    ? "bg-[#7E22CE] text-white border-[#000000] shadow-3d-soft"
                    : "bg-white text-[#000000] border-transparent hover:border-[#000000] hover:shadow-3d-soft"
                  } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#7E22CE]'}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Profile Section */}
        <div className="p-4 border-t-[3px] border-[#000000] bg-white">

          {isLoadingProfile ? (
            <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0 border-[2px] border-[#000000]" />
              {!isCollapsed && (
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              )}
            </div>
          ) : userData ? (
            <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.fullName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border-[2px] border-[#000000] shadow-sm"
                  title={isCollapsed ? userData.fullName : ""}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full bg-[#7E22CE] flex items-center justify-center text-white border-[2px] border-[#000000] shadow-sm font-black shrink-0"
                  title={isCollapsed ? userData.fullName : ""}
                >
                  {userData.fullName.charAt(0)}
                </div>
              )}
              {!isCollapsed && (
                <div className="overflow-hidden text-right flex-1">
                  <p className="text-sm font-black text-[#000000] truncate">{userData.fullName}</p>
                  <p className="text-[11px] font-bold text-[#7E22CE] truncate">{getRoleLabel(userData.role)}</p>
                </div>
              )}
            </div>
          ) : null}

          <form action={logoutUser}>
            <button
              title={isCollapsed ? "تسجيل الخروج" : ""}
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-red-600 border-[2px] border-transparent hover:border-red-600 hover:bg-red-50 transition-all font-bold text-sm overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-3 justify-start'}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">تسجيل الخروج</span>}
            </button>
          </form>

        </div>
      </aside>
    </>
  );
}
