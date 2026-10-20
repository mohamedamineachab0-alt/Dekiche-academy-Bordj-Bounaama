"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Wrench,
  Clock,
  ShieldCheck,
  Phone,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Server,
  Zap
} from "lucide-react";

interface MaintenanceScreenProps {
  role?: string;
}

export function MaintenanceScreen({ role }: MaintenanceScreenProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-surface-muted flex flex-col justify-between selection:bg-primary selection:text-white relative overflow-hidden font-sans"
    >
      {/* Background radial gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(91,33,182,0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(109,40,217,0.12), transparent 60%)",
        }}
      />
      <div className="landing-line-grid-ink absolute inset-0 pointer-events-none opacity-60" aria-hidden="true" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-line bg-surface/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-ink leading-tight">
                أكاديمية دقيش التعليمية
              </h1>
              <p className="text-[11px] text-muted">برج بونعامة • منصة التعليم الوطني</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>وضع الصيانة المؤقتة</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-xl w-full surface-card rounded-3xl border border-line shadow-xl p-6 sm:p-10 text-center relative overflow-hidden space-y-6">
          {/* Subtle top ambient bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-primary to-primary-bright" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-soft text-primary border border-primary/20 shadow-inner mx-auto relative">
            <Wrench className="w-9 h-9 text-primary animate-pulse" />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              المنصة في وضع الصيانة والتحديث
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-md mx-auto">
              نقوم حالياً بإجراء أعمال صيانة وتحسينات دورية على الخوادم وقواعد البيانات لتوفير أعلى مستويات الاستقرار والسرعة لجميع مستخدمي المنصة.
            </p>
          </div>

          {/* Highlighted Note Requested by User: شكراً لتفهمكم */}
          <div className="p-4 sm:p-5 rounded-2xl bg-primary-soft/60 border border-primary/20 text-ink space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>شكراً لتفهمكم</span>
            </div>
            <p className="text-xs text-muted">
              سنعود للعمل بشكل كامل وبأفضل أداء في أقرب وقت ممكن إن شاء الله.
            </p>
          </div>

          {/* Maintenance Task Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-right pt-1">
            <div className="p-3 rounded-xl bg-surface border border-line space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Server className="w-3.5 h-3.5 text-primary" />
                <span>الخوادم</span>
              </div>
              <p className="text-[11px] text-muted">ترقية السيرفرات</p>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-line space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>سرعة البث</span>
              </div>
              <p className="text-[11px] text-muted">تحسين أداء الفيديو</p>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-line space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>الأمان والبيانات</span>
              </div>
              <p className="text-[11px] text-muted">نسخ احتياطي دوري</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص جاهزية المنصة مجدداً</span>
            </button>

            <a
              href="tel:0555123456"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-surface text-ink border border-line hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>الاتصال بالدعم الفني</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer & Discreet Staff Access */}
      <footer className="relative z-10 w-full border-t border-line bg-surface/60 backdrop-blur-xs py-4 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} أكاديمية دقيش التعليمية</span>
          
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hover:text-primary transition-colors text-[11px] underline underline-offset-4"
            >
              تسجيل دخول الإدارة والأساتذة
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
