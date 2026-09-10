"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { SocialLinks, PhoneLink } from "@/components/landing/art/FacebookIcon";

const NAV_LINKS = [
  { href: "#why-us", label: "لماذا نحن" },
  { href: "#how", label: "طريقة العمل" },
  { href: "#prayer", label: "مواقيت الصلاة" },
  { href: "#faq", label: "الأسئلة" },
];

export function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 safe-area-pt transition-all duration-300 ${
          isScrolled
            ? "bg-surface/95 backdrop-blur-xl border-b border-line shadow-sm py-3"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-10 safe-area-px">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isScrolled ? "bg-primary text-white" : "bg-white text-primary-mid shadow-md"
                }`}
              >
                <GraduationCap className="w-5 h-5" />
              </span>
              <span
                className={`wordmark text-base sm:text-[1.25rem] truncate transition-colors ${
                  isScrolled ? "text-ink" : "text-white"
                }`}
              >
                أكاديمية دقيش
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-[0.9rem] font-semibold transition-colors ${
                    isScrolled
                      ? "text-muted hover:text-primary"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <SocialLinks
                className={`hidden min-[420px]:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full items-center justify-center transition-colors ${
                  isScrolled
                    ? "bg-primary-soft text-primary hover:bg-primary hover:text-white"
                    : "bg-white text-primary hover:bg-primary-soft"
                }`}
              />
              {isAuthenticated ? (
                <Link
                  href="/dashboard/student"
                  className={
                    isScrolled
                      ? "hidden sm:inline-flex btn-primary py-2.5 px-5 text-sm"
                      : "hidden sm:inline-flex btn-nav-light"
                  }
                >
                  مساحتي
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      isScrolled ? "text-primary-mid hover:bg-primary-soft" : "text-white hover:bg-white/10"
                    }`}
                  >
                    دخول
                  </Link>
                  <Link
                    href="/register"
                    className={
                      isScrolled
                        ? "btn-primary py-2 px-3 sm:py-2.5 sm:px-5 text-xs sm:text-sm"
                        : "btn-nav-light !px-3 sm:!px-5 text-xs sm:text-sm"
                    }
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsMobileOpen(true)}
                className={`lg:hidden w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isScrolled ? "bg-surface-muted text-primary" : "bg-white text-primary-mid shadow-md"
                }`}
                aria-label="فتح القائمة"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed bottom-0 right-0 left-0 max-h-[85vh] rounded-t-[2rem] bg-white z-[60] lg:hidden flex flex-col p-6 shadow-2xl safe-area-pb">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-ink"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-2 mb-6 mt-2">
              <span className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </span>
              <span className="wordmark text-xl text-ink">أكاديمية دقيش</span>
            </div>

            <nav className="flex flex-col gap-2 mb-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg font-semibold text-ink hover:text-primary border-b border-line pb-3 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <PhoneLink
                showNumber
                className="btn-ghost w-full justify-center text-primary"
              />
              <Link
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                className="btn-primary w-full"
              >
                {isAuthenticated ? "مساحتي" : "إنشاء حساب"}
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="btn-secondary w-full">
                  دخول
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
