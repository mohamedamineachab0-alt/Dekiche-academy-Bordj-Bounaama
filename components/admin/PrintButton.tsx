"use client";

import { Printer, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { useState } from "react";

export function PrintButton() {
  const [loading, setLoading] = useState(false);

  const handleDownloadImage = async () => {
    try {
      setLoading(true);
      const element = document.getElementById("credentials-table-container");
      if (!element) return;
      
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => node.id !== "download-btn-wrapper"
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "حسابات_الأساتذة.png";
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="download-btn-wrapper" className="absolute top-6 left-6 print:hidden">
      <button 
        onClick={handleDownloadImage}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors font-bold disabled:opacity-70"
      >
        <ImageIcon className="w-5 h-5" />
        {loading ? "جاري تجهيز الصورة..." : "تحميل كصورة (PNG)"}
      </button>
    </div>
  );
}
