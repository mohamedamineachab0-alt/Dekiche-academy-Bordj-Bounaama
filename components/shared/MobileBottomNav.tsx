"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, CheckCircle, MessageSquare } from "lucide-react";
import { Role } from "@/generated/prisma";

const STUDENT_BOTTOM_LINKS = [
  { name: "الرئيسية", href: "/dashboard/student", icon: LayoutDashboard, activeColor: "text-purple-700" },
  { name: "موادي", href: "/dashboard/student/subjects", icon: BookOpen, activeColor: "text-purple-700" },
  { name: "تمارين", href: "/dashboard/student/exercises", icon: CheckCircle, activeColor: "text-purple-700" },
  { name: "إختبارات", href: "/dashboard/student/exams", icon: FileText, activeColor: "text-cyan-600" },
  { name: "دردشة", href: "/dashboard/student/forums", icon: MessageSquare, activeColor: "text-purple-700" },
];

const ADMIN_BOTTOM_LINKS = [
  { name: "الرئيسية", href: "/dashboard/admin", icon: LayoutDashboard, activeColor: "text-purple-700" },
  { name: "الدروس", href: "/dashboard/admin/lessons", icon: FileText, activeColor: "text-purple-700" },
  { name: "التمارين", href: "/dashboard/admin/exercises", icon: CheckCircle, activeColor: "text-purple-700" },
  { name: "الإختبارات", href: "/dashboard/admin/exams", icon: FileText, activeColor: "text-cyan-600" },
  { name: "الدردشة", href: "/dashboard/admin/forums", icon: MessageSquare, activeColor: "text-purple-700" },
];

export function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? ADMIN_BOTTOM_LINKS : STUDENT_BOTTOM_LINKS;

  return (
    <nav
      className="md:hidden fixed bottom-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb"
      dir="rtl"
    >
      <div className="flex items-center justify-around px-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 py-3 px-3 min-w-0 flex-1 transition-all duration-200 ${
                isActive ? link.activeColor : "text-slate-400"
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                isActive ? "bg-purple-50 scale-110" : ""
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? link.activeColor : "text-slate-400"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-800" />
                )}
              </div>
              <span className={`text-[9px] font-black truncate transition-all ${
                isActive ? "text-purple-900" : "text-slate-400"
              }`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
