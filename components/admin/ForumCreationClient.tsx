"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MonthSelect } from "@/components/shared/MonthSelect";
import { SubjectSelector } from "@/components/shared/SubjectSelector";

export function ForumCreationClient({
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
          <Plus className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-bold text-ink">إنشاء منتدى جديد</h2>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="field-label">اسم المنتدى</label>
          <input
            type="text"
            name="title"
            required
            className="input-field"
            placeholder="مثال: نقاشات الوحدة الأولى"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-line">
          <div>
            <label className="field-label mb-2">المادة الدراسية</label>
            <SubjectSelector subjects={subjects} />
          </div>

          <div>
            <label className="field-label">الشهر</label>
            <MonthSelect name="month" required />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          <Plus className="w-4 h-4" />
          إنشاء المنتدى
        </button>
      </form>
    </div>
  );
}
