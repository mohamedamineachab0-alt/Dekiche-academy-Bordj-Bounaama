"use client";

import { useState } from "react";
import { Download, Loader2, Archive } from "lucide-react";

export function BulkZipExportButton() {
  const [loadingType, setLoadingType] = useState<"recent" | "all" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async (filter: "recent" | "all") => {
    setLoadingType(filter);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/admin/codes/bulk-export-zip?filter=${filter}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل التحميل");
      }

      // Download the zip file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Les_Codes_${filter === "all" ? "All" : "Recent"}_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="surface-card p-6 border-2 border-emerald-500/20 bg-emerald-500/5 mb-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-ink">تصدير أكواد الـ 3 أشهر</h3>
          <p className="text-sm text-muted mt-1">
            يُنشئ هذا الخيار 200 رمز اشتراك (صالح لمدة 3 أشهر) لكل مادة. سيتم تجميعها في ملف ZIP واحد كبير يحمل اسم (Les_Codes) للطباعة.
            يمكنك اختيار تصدير أكواد للمواد المضافة مؤخراً فقط لتجنب التكرار، أو لجميع المواد في المنصة (مثل المرة الأولى).
          </p>
        </div>
      </div>
      
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 text-rose-600 rounded-lg text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleDownload("recent")}
          disabled={loadingType !== null}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {loadingType === "recent" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري توليد أكواد المواد الحديثة...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              تصدير للمواد المُضافة حديثاً فقط (في آخر 24 ساعة)
            </>
          )}
        </button>

        <button
          onClick={() => handleDownload("all")}
          disabled={loadingType !== null}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-surface hover:bg-surface-muted text-emerald-600 border border-emerald-500/30 font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {loadingType === "all" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التوليد للجميع...
            </>
          ) : (
            <>
              <Archive className="w-5 h-5" />
              تصدير لجميع المواد بدون استثناء (العملية الأصلية)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
