"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, CheckCircle, MessageSquare, AlertTriangle, Users, Activity } from "lucide-react";
import { Role } from "@/generated/prisma";

const STUDENT_BOTTOM_LINKS = [
  { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen },
  { name: "تمارين", href: "/dashboard/student/exercises", icon: CheckCircle },
  { name: "إختبارات", href: "/dashboard/student/exams", icon: FileText },
  { name: "دردشة", href: "/dashboard/student/forums", icon: MessageSquare },
];

const TEACHER_BOTTOM_LINKS = [
  { name: "الرئيسية", href: "/dashboard/teacher", icon: LayoutDashboard },
  { name: "الأخطاء", href: "/dashboard/teacher/mistakes", icon: AlertTriangle },
  { name: "الدردشة", href: "/dashboard/teacher/forums", icon: MessageSquare },
];

const PARENT_BOTTOM_LINKS = [
  { name: "أبنائي", href: "/dashboard/parent", icon: Users },
  { name: "التقدم", href: "/dashboard/parent/progress", icon: Activity },
  { name: "النقاط", href: "/dashboard/parent/grades", icon: FileText },
];

const ADMIN_BOTTOM_LINKS = [
  { name: "الرئيسية", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "الدروس", href: "/dashboard/admin/lessons", icon: FileText },
  { name: "التمارين", href: "/dashboard/admin/exercises", icon: CheckCircle },
  { name: "الإختبارات", href: "/dashboard/admin/exams", icon: FileText },
  { name: "الدردشة", href: "/dashboard/admin/forums", icon: MessageSquare },
];

export function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links =
    role === "ADMIN" ? ADMIN_BOTTOM_LINKS :
    role === "TEACHER" ? TEACHER_BOTTOM_LINKS :
    role === "PARENT" ? PARENT_BOTTOM_LINKS :
    STUDENT_BOTTOM_LINKS;

  return (
    <nav
      className="md:hidden fixed bottom-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-t border-line safe-area-pb safe-area-px"
      dir="rtl"
    >
      <div className="flex items-center justify-around px-1 sm:px-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-2.5 px-3 min-w-0 flex-1 ${
                isActive ? "text-primary" : "text-muted"
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-8 rounded-lg transition-colors ${
                  isActive ? "bg-primary-soft" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[10px] font-medium truncate ${isActive ? "text-primary" : "text-muted"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
