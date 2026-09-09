"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Role } from "@/generated/prisma";
import { Menu, ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

const NOTIFICATIONS_HREF: Partial<Record<Role, string>> = {
  STUDENT: "/dashboard/student/notifications",
  ADMIN: "/dashboard/admin/notifications",
};

export function DashboardLayoutWrapper({
  children,
  role
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    `sidebar-collapsed:${role}`,
    false
  );
  const router = useRouter();
  const pathname = usePathname();

  const isRootDashboard = pathname === `/dashboard/${role.toLowerCase()}`;
  const notificationsHref = NOTIFICATIONS_HREF[role];

  return (
    <div className="flex min-h-[100dvh] font-sans w-full max-w-full overflow-x-hidden overscroll-x-none touch-pan-y bg-background safe-area-px" dir="rtl">
      <Sidebar
        role={role}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <div className={`flex-1 flex flex-col min-h-[100dvh] min-w-0 transition-all duration-300 ${isCollapsed ? "md:mr-[76px]" : "md:mr-[264px]"}`}>
        <header className="sticky top-0 z-40 min-h-16 shrink-0 bg-surface/90 backdrop-blur-md border-b border-line flex items-center gap-3 px-3 sm:px-4 md:px-6 safe-area-pt">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-11 h-11 -mr-1 flex items-center justify-center rounded-xl text-ink hover:bg-surface-muted"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isRootDashboard && (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 h-11 px-3 sm:px-4 rounded-xl text-sm font-semibold text-ink hover:bg-surface-muted transition-colors"
              >
                رجوع
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            )}
            {notificationsHref && (
              <Link
                href={notificationsHref}
                className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-ink hover:bg-surface-muted transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-[18px] h-[18px]" />
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-full overflow-x-hidden px-3 py-5 sm:px-4 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav role={role} />
    </div>
  );
}
