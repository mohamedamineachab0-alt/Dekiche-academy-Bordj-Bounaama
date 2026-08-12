"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";

export function NotificationFormClient({
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
        <Send className="w-5 h-5 text-violet-600" />
        إرسال إشعار جديد
      </h2>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-purple-800">عنوان الإشعار</label>
          <input type="text" name="title" required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="مثال: إضافة ملخص جديد" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-purple-800">نص الإشعار</label>
          <textarea name="content" rows={3} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" placeholder="اكتب رسالتك هنا.." />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 mb-3">تحديد الفئة المستهدفة (اتركها فارغة للإرسال للجميع)</p>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">الطور (اختياري)</label>
                <select name="phase" value={phase} onChange={(e) => { setPhase(e.target.value); setLevel(""); setStream(""); }} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">جميع الأطوار</option>
                  {EDUCATION_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">المستوى (اختياري)</label>
                <select name="level" value={level} onChange={(e) => { setLevel(e.target.value); setStream(""); }} disabled={!phase} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                  <option value="">جميع المستويات</option>
                  {currentLevels.map((l: any) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-purple-800">الشعبة (اختياري)</label>
                {shouldShowStreams ? (
                  <select name="stream" value={stream} onChange={(e) => setStream(e.target.value)} disabled={!level} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                    <option value="">جميع الشعب</option>
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
              <label className="text-sm font-bold text-purple-800">المادة الدراسية (اختياري)</label>
              <select name="subjectId" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">جميع المواد</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-purple-800">الشهر (اختياري)</label>
              <input type="number" min="1" max="12" name="month" className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="رقم الشهر" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-purple-950 font-bold py-3 rounded-xl transition-colors mt-2">
          <Send className="w-4 h-4" />
          إرسال الإشعار
        </button>
      </form>
    </div>
  );
}
