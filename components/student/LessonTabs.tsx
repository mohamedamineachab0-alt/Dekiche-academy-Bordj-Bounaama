"use client";

import { useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { LessonInlineFile } from "@/components/student/LessonInlineFile";
import { MermaidDiagram } from "@/components/shared/MermaidDiagram";

type LessonTabsProps = {
  lesson: any;
};

export function LessonTabs({ lesson }: LessonTabsProps) {
  const hasFiles = Array.isArray(lesson.materials) && lesson.materials.length > 0;
  const [activeTab, setActiveTab] = useState<"details" | "attachments" | "quiz" | "mindmap">(
    hasFiles ? "attachments" : "details"
  );

  const tabs = [
    { id: "details" as const, label: "التفاصيل" },
    { id: "attachments" as const, label: "ملف الدرس" },
    { id: "quiz" as const, label: "الاختبار" },
    ...(lesson.mindmap ? [{ id: "mindmap" as const, label: "الخريطة الذهنية" }] : []),
  ];

  return (
    <div className="w-full min-w-0 pt-1 sm:pt-2">
      <div 
        className="grid gap-1.5 sm:gap-2 p-1 rounded-2xl bg-surface-muted border border-line mb-5 sm:mb-8"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-11 px-2 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-transparent text-ink hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[12rem] w-full">
        {activeTab === "details" && (
          <div className="surface-card px-4 py-5 sm:px-6 sm:py-8">
            <h2 className="text-base sm:text-lg font-bold text-ink mb-2">عن هذا الدرس</h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {lesson.description ||
                "شاهد الدرس، حمّل الملحقات، ثم حلّ الاختبار لتقييم فهمك."}
            </p>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="surface-card p-4 sm:p-6 md:p-8">
            <div className="flex items-start gap-3 mb-5">
              <span className="icon-tile shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-ink">ملف الدرس</h3>
                  {lesson.materials.length > 0 && (
                    <span className="badge-outline shrink-0">{lesson.materials.length}</span>
                  )}
                </div>
                <p className="text-sm text-muted mt-1">ملف الدرس يُعرض هنا مباشرة للقراءة.</p>
              </div>
            </div>

            <div className="space-y-5">
              {hasFiles ? (
                lesson.materials.map((mat: { id: string; title: string; fileUrl: string }) => (
                  <LessonInlineFile
                    key={mat.id}
                    url={mat.fileUrl}
                    title={mat.title || lesson.title}
                  />
                ))
              ) : (
                <div className="text-center bg-surface-muted text-muted py-8 rounded-xl text-sm border border-dashed border-line">
                  لا يوجد ملف لهذا الدرس بعد.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="surface-card p-4 sm:p-6 md:p-8">
            <div className="flex items-start gap-3 mb-5">
              <span className="icon-tile shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-ink mb-1">اختبر معلوماتك</h3>
                <p className="text-sm text-muted leading-relaxed">
                  أجرِ الاختبار لتقييم استيعابك لهذا الدرس.
                </p>
              </div>
            </div>

            {lesson.quiz ? (
              <Link
                href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                className="btn-primary w-full"
              >
                بدء الاختبار
              </Link>
            ) : (
              <div className="text-center bg-surface-muted text-muted py-8 rounded-xl text-sm border border-dashed border-line">
                لا يوجد اختبار متاح
              </div>
            )}
          </div>
        )}
        
        {activeTab === "mindmap" && lesson.mindmap && (
          <div className="surface-card p-4 sm:p-6 md:p-8">
            <div className="flex items-start gap-3 mb-5">
              <span className="icon-tile shrink-0 bg-purple-50 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 14 4-4"/><path d="m14 14-4-4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-ink mb-1">الخريطة الذهنية للدرس</h3>
                <p className="text-sm text-muted leading-relaxed">
                  مخطط يوضح أهم النقاط والمفاهيم المتعلقة بهذا الدرس.
                </p>
              </div>
            </div>
            
            <div className="border border-line rounded-2xl bg-white p-4 overflow-hidden">
              <MermaidDiagram chart={lesson.mindmap} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
