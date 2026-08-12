"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { Role } from "@/generated/prisma";
import { Menu, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function DashboardLayoutWrapper({
  children,
  role
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on the root dashboard page of the current role
  const isRootDashboard = pathname === `/dashboard/${role.toLowerCase()}`;

  return (
    <div className="flex min-h-screen font-sans w-full max-w-full overflow-x-hidden overscroll-x-none touch-pan-y transparent" dir="rtl">

      <Sidebar
        role={role}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:mr-20' : 'md:mr-64'}`}>

        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b-[3px] border-[#000000] shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -mr-2 rounded-lg text-[#000000] hover:bg-gray-100 border-[2px] border-transparent hover:border-[#000000] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-black text-lg text-[#000000]">أكاديمية دقيش</h1>
          </div>

          {!isRootDashboard && (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border-[2px] border-[#000000] text-[#000000] hover:bg-[#7E22CE] hover:text-white transition-colors duration-200 shadow-3d-soft"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden px-4 py-4 md:p-8">

          {/* Desktop Global Back Button */}
          {!isRootDashboard && (
            <div className="hidden md:flex justify-end mb-6 max-w-7xl mx-auto">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-white border-[3px] border-[#000000] text-[#000000] hover:bg-[#7E22CE] hover:text-white transition-colors duration-200 shadow-3d-soft shadow-3d-hover"
              >
                رجوع
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      {/* Mobile Bottom Navigation Removed */}
    </div>
  );
}
