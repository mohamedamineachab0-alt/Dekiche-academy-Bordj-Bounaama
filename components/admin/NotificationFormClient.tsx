"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";

export function NotificationFormClient({
  subjects,
  action,
}: {
  subjects: { id: string; title: string; phase: string; levels: any[]; streams: any[] }[];
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
    if (level && !s.levels?.includes(level)) return false;
    if (stream && !s.streams?.includes(stream) && stream !== "NONE") return false;
    return true;
  });

  return (
    <div className="surface-card p-6 sticky top-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
        <span className="icon-tile">
          <Send className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-bold text-ink">إرسال إشعار جديد</h2>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="field-label">عنوان الإشعار</label>
          <input type="text" name="title" required className="input-field" placeholder="مثال: إضافة ملخص جديد" />
        </div>

        <div>
          <label className="field-label">نص الإشعار</label>
          <textarea
            name="content"
            rows={3}
            required
            className="input-field resize-none"
            placeholder="اكتب رسالتك هنا.."
          />
        </div>

        <div className="pt-2 border-t border-line">
          <p className="text-xs font-semibold text-muted mb-3">تحديد الفئة المستهدفة (اتركها فارغة للإرسال للجميع)</p>

          <div className="space-y-3">
            <div>
              <label className="field-label">الطور (اختياري)</label>
              <select
                name="phase"
                value={phase}
                onChange={(e) => {
                  setPhase(e.target.value);
                  setLevel("");
                  setStream("");
                }}
                className="input-field"
              >
                <option value="">جميع الأطوار</option>
                {EDUCATION_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">المستوى (اختياري)</label>
              <select
                name="level"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value);
                  setStream("");
                }}
                disabled={!phase}
                className="input-field disabled:opacity-50"
              >
                <option value="">جميع المستويات</option>
                {currentLevels.map((l: any) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">الشعبة (اختياري)</label>
              {shouldShowStreams ? (
                <select
                  name="stream"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  disabled={!level}
                  className="input-field disabled:opacity-50"
                >
                  <option value="">جميع الشعب</option>
                  {currentStreams.map((s: any) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-2.5 rounded-xl border border-line bg-surface-muted text-muted text-sm text-center">
                  غير مطبق
                  <input type="hidden" name="stream" value="NONE" />
                </div>
              )}
            </div>

            <div>
              <label className="field-label">المادة الدراسية (اختياري)</label>
              <select name="subjectId" className="input-field">
                <option value="">جميع المواد</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">الشهر (اختياري)</label>
              <input type="number" min="1" max="12" name="month" className="input-field" placeholder="رقم الشهر" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          <Send className="w-4 h-4" />
          إرسال الإشعار
        </button>
      </form>
    </div>
  );
}
