"use client";

import { Download } from "lucide-react";
import { toPng } from 'html-to-image';

export function ExportTableButton({ targetId }: { targetId: string }) {
  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `revenues_${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed", error);
      alert("حدث خطأ أثناء تصدير الجدول كصورة");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="btn-primary"
    >
      <Download className="w-4 h-4" />
      تصدير كصورة
    </button>
  );
}
