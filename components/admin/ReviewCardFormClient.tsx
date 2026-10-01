"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { SubjectSelector } from "@/components/shared/SubjectSelector";

export function ReviewCardFormClient({
  subjects,
  action,
}: {
  subjects: any[];
  action: (formData: FormData) => void;
}) {
  // Removed manual filtering, handled by SubjectSelector

  return (
    <div className="surface-card p-6 sticky top-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
        <span className="icon-tile">
          <Plus className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-bold text-ink">إضافة بطاقة جديدة</h2>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="field-label">عنوان البطاقة</label>
          <input type="text" name="title" required className="input-field" placeholder="مثال: تعريف الخلية" />
        </div>

        <div>
          <label className="field-label">السؤال (الوجه الأمامي)</label>
          <textarea
            name="question"
            rows={3}
            required
            className="input-field resize-none"
            placeholder="اكتب السؤال هنا.."
          />
        </div>

        <div>
          <label className="field-label">الجواب (الوجه الخلفي)</label>
          <textarea
            name="answer"
            rows={3}
            required
            className="input-field resize-none"
            placeholder="اكتب الجواب هنا.."
          />
        </div>

        <div className="pt-2 border-t border-line space-y-3">
          <div>
            <label className="field-label mb-2">المادة الدراسية</label>
            <SubjectSelector subjects={subjects} />
          </div>

          <div>
            <label className="field-label">الشهر</label>
            <MonthSelect name="month" required />
          </div>

          <div>
            <label className="field-label">مرجع التمرين (اختياري)</label>
            <input
              type="text"
              name="exerciseRef"
              className="input-field"
              placeholder="مثال: الوحدة الأولى - تمرين 4"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          <Plus className="w-4 h-4" />
          إضافة البطاقة
        </button>
      </form>
    </div>
  );
}
