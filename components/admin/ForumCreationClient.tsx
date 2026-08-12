"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import { MonthSelect } from "@/components/shared/MonthSelect";

export function ForumCreationClient({
  subjects,
  action,
}: {
  subjects: { id: string; title: string; phase: string; level: string; stream: string }[];
  action: (formData: FormData) => void;
}) {
  const [phase, setPhase] = useState("");
  const [level, setLevel] = useState("");
  const [stream, setStream] = useState("");

  const currentLevels = phase ? EDUCATION_LEVELS[phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = getStreamsForLevel(phase, level);
  const shouldShowStreams = phase === "SECONDARY" && currentStreams.length > 1;

  const filteredSubjects = subjects.filter((s) => {
    if (phase && s.phase !== phase) return false;
    if (level && s.level !== level) return false;
    if (stream && s.stream !== stream && stream !== "NONE") return false;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
      <h2 className="text-lg font-black text-purple-950 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-purple-700" />
        إنشاء منتدى جديد
      </h2>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-purple-800">إسم المنتدى</label>
          <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="مثال: نقاشات الوحدة الأولى" />
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-bold text-purple-800">الطور</label>
              <select name="phase" value={phase} onChange={(e) => { setPhase(e.target.value); setLevel(""); setStream(""); }} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option value="">اختر الطور</option>
                {EDUCATION_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-purple-800">المستوى</label>
              <select name="level" value={level} onChange={(e) => { setLevel(e.target.value); setStream(""); }} required disabled={!phase} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50">
                <option value="">اختر المستوى</option>
                {currentLevels.map((l: any) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-purple-800">الشعبة</label>
              {shouldShowStreams ? (
                <select name="stream" value={stream} onChange={(e) => setStream(e.target.value)} required disabled={!level} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50">
                  <option value="">اختر الشعبة</option>
                  {currentStreams.map((s: any) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm text-center">
                  غير مطبق
                  <input type="hidden" name="stream" value="NONE" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-purple-800">المادة الدراسية</label>
            <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option value="">اختر المادة</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-purple-800">الشهر</label>
            <MonthSelect name="month" required className="!p-2.5 !text-sm" />
          </div>
        </div>

        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-bold py-3 rounded-xl transition-colors mt-2">
          <Plus className="w-4 h-4" />
          إنشاء المنتدى
        </button>
      </form>
    </div>
  );
}
