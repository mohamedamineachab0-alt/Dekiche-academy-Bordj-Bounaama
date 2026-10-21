"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users,
  Search,
  Phone,
  BookOpen,
  LogIn,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { enterTeacherSpaceAction } from "@/actions/teachers";
import { labelLevel, labelStream } from "@/lib/education-labels";

export type SerializedTeacher = {
  id: string;
  name: string;
  phone: string;
  phases: string[];
  levels: string[];
  streams: string[];
  subjects: Array<{ id: string; title: string }>;
};

export function TeachersDirectoryClient({
  teachers,
}: {
  teachers: SerializedTeacher[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("ALL");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || ""
  );
  const [loadingTeacherId, setLoadingTeacherId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEnterSpace = (teacherId: string) => {
    if (!teacherId || isPending) return;
    setLoadingTeacherId(teacherId);
    startTransition(async () => {
      try {
        await enterTeacherSpaceAction(teacherId);
      } catch (err) {
        console.error("Failed to enter teacher space:", err);
        setLoadingTeacherId(null);
      }
    });
  };

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.subjects.some((s) => s.title.toLowerCase().includes(q));

      const matchesPhase =
        selectedPhase === "ALL" || t.phases.includes(selectedPhase);

      return matchesSearch && matchesPhase;
    });
  }, [teachers, searchQuery, selectedPhase]);

  const phaseMap: Record<string, string> = {
    PRIMARY: "ابتدائي",
    MIDDLE: "متوسط",
    SECONDARY: "ثانوي",
  };

  // Quick teachers with specific subjects
  const featuredTeachers = useMemo(() => {
    return teachers
      .filter((t) => t.subjects.length > 0)
      .slice(0, 4);
  }, [teachers]);

  return (
    <div className="space-y-6">
      {/* 1. Quick Select & Enter Box */}
      <div className="relative overflow-hidden surface-card p-5 sm:p-6 rounded-2xl border-2 border-primary/25 bg-linear-to-br from-primary/5 via-surface to-surface shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                الدخول السريع إلى فضاء الأستاذ (اختيار مباشر)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              اختر أي أستاذ من القائمة واضغط زر <strong className="text-ink">«دخول فضاء الأستاذ»</strong> لتصفح لوحته التعليمية والدروس والكويزات كأنه هو.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="h-11 px-3.5 rounded-xl border border-line bg-surface text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-60 sm:max-w-85"
            >
              {teachers.map((t) => {
                const subs = t.subjects.map((s) => s.title).join("، ") || "بدون مواد";
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({subs})
                  </option>
                );
              })}
            </select>

            <button
              onClick={() => handleEnterSpace(selectedTeacherId)}
              disabled={isPending || !selectedTeacherId}
              className="btn-primary h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-md"
            >
              {loadingTeacherId === selectedTeacherId ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول فضاء الأستاذ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Featured Teachers Quick Access */}
        {featuredTeachers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-line/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              وصول سريع:
            </span>
            {featuredTeachers.map((t) => (
              <button
                key={t.id}
                onClick={() => handleEnterSpace(t.id)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-primary-soft hover:text-primary text-ink border border-line transition-colors disabled:opacity-50"
              >
                <span>{t.name}</span>
                {t.subjects[0] && (
                  <span className="text-[10px] text-muted font-normal">
                    ({t.subjects[0].title})
                  </span>
                )}
                {loadingTeacherId === t.id ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <ExternalLink className="w-3 h-3 opacity-60" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute inset-s-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم، رقم الهاتف، أو اسم المادة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 ps-10 pe-4 rounded-xl border border-line bg-surface text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-muted ps-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            الطور:
          </span>
          {[
            { id: "ALL", label: "الكل" },
            { id: "SECONDARY", label: "ثانوي" },
            { id: "MIDDLE", label: "متوسط" },
            { id: "PRIMARY", label: "ابتدائي" },
          ].map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedPhase === phase.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-muted hover:text-ink border border-line hover:bg-surface-muted"
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats counter */}
      <div className="flex items-center justify-between text-xs text-muted font-mono px-1">
        <span>
          عرض <strong className="text-ink font-sans font-bold">{filteredTeachers.length}</strong> من أصل{" "}
          <strong className="text-ink font-sans font-bold">{teachers.length}</strong> أستاذ
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-primary hover:underline font-sans font-semibold"
          >
            مسح البحث
          </button>
        )}
      </div>

      {/* 3. Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTeachers.map((teacher) => {
          const isEntering = loadingTeacherId === teacher.id;

          return (
            <article
              key={teacher.id}
              className={`surface-card p-5 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-md ${
                isEntering
                  ? "border-primary ring-2 ring-primary/20 bg-primary-soft/10"
                  : "border-line hover:border-line-hover"
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Phone */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink text-base truncate">
                        {teacher.name}
                      </h3>
                      <button
                        onClick={() => copyPhoneNumber(teacher.phone)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-mono mt-0.5 group"
                        title="نسخ رقم الهاتف"
                      >
                        <Phone className="w-3 h-3 text-muted group-hover:text-primary transition-colors" />
                        <span dir="ltr">{teacher.phone}</span>
                        {copiedPhone === teacher.phone ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>
                  </div>

                  <span className="badge-soft text-[11px] shrink-0 font-bold">
                    {teacher.subjects.length} مواد
                  </span>
                </div>

                {/* Assigned Subjects */}
                <div className="space-y-3 pt-2">
                  <div>
                    <p className="text-[11px] font-bold text-muted mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-primary" />
                      المواد المسندة:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                        >
                          {sub.title}
                        </span>
                      ))}
                      {teacher.subjects.length === 0 && (
                        <span className="text-xs text-muted italic">لا توجد مواد مسندة حالياً</span>
                      )}
                    </div>
                  </div>

                  {/* Phases & Levels */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="font-bold text-muted block mb-1">الأطوار:</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.phases.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded bg-surface-muted text-ink font-medium text-[10px]"
                          >
                            {phaseMap[p] || p}
                          </span>
                        ))}
                        {teacher.phases.length === 0 && (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-muted block mb-1">المستويات:</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.levels.slice(0, 2).map((l) => (
                          <span
                            key={l}
                            className="px-1.5 py-0.5 rounded border border-line text-muted font-medium text-[10px]"
                          >
                            {labelLevel(l)}
                          </span>
                        ))}
                        {teacher.levels.length > 2 && (
                          <span className="text-[10px] text-muted self-center">
                            +{teacher.levels.length - 2}
                          </span>
                        )}
                        {teacher.levels.length === 0 && (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Enter Teacher Space Button */}
              <div className="mt-5 pt-4 border-t border-line flex items-center gap-2">
                <button
                  onClick={() => handleEnterSpace(teacher.id)}
                  disabled={isPending}
                  className={`w-full h-10 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isEntering
                      ? "bg-primary text-white"
                      : "bg-primary hover:bg-primary-hover text-white active:scale-[0.98]"
                  } disabled:opacity-50`}
                >
                  {isEntering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارٍ الدخول إلى الفضاء...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>دخول فضاء الأستاذ</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}

        {filteredTeachers.length === 0 && (
          <div className="col-span-full surface-card px-6 py-16 text-center rounded-2xl border border-line">
            <span className="icon-tile mx-auto mb-3">
              <Users className="w-5 h-5 text-muted" />
            </span>
            <p className="text-sm font-bold text-ink">لم يتم العثور على أي أستاذ مطابق</p>
            <p className="text-xs text-muted mt-1">جرب تغيير كلمات البحث أو تصفية الأطوار.</p>
          </div>
        )}
      </div>
    </div>
  );
}
