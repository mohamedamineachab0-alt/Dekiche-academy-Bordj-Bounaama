"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Download } from "lucide-react";
import Link from "next/link";

type LessonTabsProps = {
  lesson: any; 
};

export function LessonTabs({ lesson }: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "attachments" | "quiz">("details");

  return (
    <div className="w-full pt-4">
      {/* Tabs Bar */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab("details")}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
            activeTab === "details"
              ? "bg-[#6b21a8] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black"
              : "bg-transparent text-purple-900 hover:bg-purple-100"
          }`}
        >
          تفاصيل الدرس
        </button>
        <button
          onClick={() => setActiveTab("attachments")}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
            activeTab === "attachments"
              ? "bg-[#6b21a8] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black"
              : "bg-transparent text-purple-900 hover:bg-purple-100"
          }`}
        >
          الملحقات
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
            activeTab === "quiz"
              ? "bg-[#6b21a8] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black"
              : "bg-transparent text-purple-900 hover:bg-purple-100"
          }`}
        >
          الاختبار
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px] w-full max-w-4xl mx-auto transition-all duration-300">
        
        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-center md:text-right px-4 py-8 bg-white rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h1 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">{lesson.title}</h1>
            <p className="text-slate-600 font-bold text-lg leading-relaxed">
              {lesson.description || "استمتع بمشاهدة الدرس ولا تتردد في تحميل الملحقات وحل الكويز لاختبار فهمك، تذكر أن الاستمرارية هي مفتاح التفوق."}
            </p>
          </div>
        )}

        {/* ATTACHMENTS TAB */}
        {activeTab === "attachments" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-8 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-start w-full">
              <div className="w-14 h-14 bg-purple-100 border-[3px] border-black text-purple-700 rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
                <FileText className="w-7 h-7" />
              </div>
              
              <div className="relative z-10 w-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-black">ملحقات الدرس</h3>
                  {lesson.materials.length > 0 && (
                    <span className="bg-white text-black text-xs font-black px-3 py-1 rounded-full border-[3px] border-black">
                      {lesson.materials.length} ملفات
                    </span>
                  )}
                </div>
                
                <p className="text-slate-600 text-sm font-bold mb-6">حمل الملفات والملخصات الخاصة بهذا الدرس للمراجعة لاحقاً</p>
                
                <div className="space-y-4 w-full">
                  {lesson.materials.length > 0 ? (
                    lesson.materials.map((mat: any) => (
                      <div key={mat.id} className="flex items-center justify-between p-4 rounded-xl border-[3px] border-black bg-[#FCFBF9] hover:-translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                        <span className="font-black text-sm text-black line-clamp-1 flex-1">
                          {mat.title}
                        </span>
                        <a 
                          href={`${mat.fileUrl}?download=`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-white border-2 border-black text-black hover:bg-purple-100 px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          تحميل
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center bg-[#F8F9FA] text-slate-500 py-6 rounded-xl font-bold border-2 border-dashed border-slate-300">
                      لا توجد ملحقات إضافية
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quiz" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-8 border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-start w-full">
              <div className="w-14 h-14 bg-[#FACC15] border-[3px] border-black text-black rounded-2xl flex items-center justify-center mb-6 shrink-0 relative z-10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              
              <div className="relative z-10 w-full flex flex-col">
                <h3 className="text-xl font-black text-black mb-2">اختبر معلوماتك</h3>
                <p className="text-slate-600 text-sm font-bold mb-6">قم بإجراء الاختبار لتقييم استيعابك لهذا الدرس ومدى فهمك للمحتوى</p>
                
                <div className="mt-auto w-full">
                  {lesson.quiz ? (
                    <Link 
                      href={`/dashboard/student/lessons/${lesson.id}/quiz`}
                      className="inline-flex w-full items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-[3px] border-black hover:translate-y-1 hover:shadow-none transition-all duration-300"
                    >
                      بدء الاختبار الآن
                    </Link>
                  ) : (
                    <div className="w-full text-center bg-[#F8F9FA] text-slate-500 py-4 rounded-xl font-bold border-2 border-dashed border-slate-300">
                      لا يوجد اختبار متاح
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
