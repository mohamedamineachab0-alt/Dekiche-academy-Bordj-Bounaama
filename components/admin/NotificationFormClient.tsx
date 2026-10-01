"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { SubjectSelector } from "@/components/shared/SubjectSelector";

export function NotificationFormClient({
  subjects,
  action,
}: {
  subjects: any[];
  action: (formData: FormData) => void;
}) {
  // Removed manual subject filtering, handled by SubjectSelector

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
              <label className="field-label mb-2">تصفية حسب الطور والمادة (اختياري)</label>
              <SubjectSelector subjects={subjects} required={false} />
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
