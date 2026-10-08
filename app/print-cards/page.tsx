"use client";

import { useState } from "react";
import { Printer } from "lucide-react";

export default function PrintCardsPage() {
  const [codesInput, setCodesInput] = useState("");
  
  // Parse codes from text (assuming one code per line or comma separated)
  const rawCodes = codesInput
    .split(/[\n,]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  
  // If no codes, show 10 dummy cards so the layout is visible
  const codesToPrint = rawCodes.length > 0 ? rawCodes : Array(10).fill("XXXX-XXXX");

  // Group into pages of 10
  const pages = [];
  for (let i = 0; i < codesToPrint.length; i += 10) {
    pages.push(codesToPrint.slice(i, i + 10));
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
      {/* Control Panel (Hidden in Print) */}
      <div className="print:hidden p-6 bg-white border-b shadow-sm mb-8 max-w-4xl mx-auto mt-8 rounded-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">طباعة بطاقات الاشتراك</h1>
        <p className="text-gray-600 mb-4">قم بلصق كودات الاشتراك هنا (كود في كل سطر أو مفصولة بفاصلة):</p>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-xl mb-4 text-left"
          dir="ltr"
          placeholder="1234-5678&#10;8765-4321"
          value={codesInput}
          onChange={(e) => setCodesInput(e.target.value)}
        />
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition"
          >
            <Printer className="w-5 h-5" />
            طباعة البطاقات ({codesToPrint.length} بطاقة)
          </button>
        </div>
      </div>

      {/* Print Pages */}
      <div className="print-container flex flex-col items-center gap-8 pb-12">
        {pages.map((pageCodes, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-page bg-white shadow-xl print:shadow-none print:m-0"
            style={{
              width: "210mm",
              height: "297mm",
              padding: "10mm",
              pageBreakAfter: "always",
              boxSizing: "border-box",
            }}
          >
            <div className="grid grid-cols-2 grid-rows-5 gap-x-4 gap-y-3 h-full">
              {pageCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="border-[1.5px] border-dashed border-gray-400 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden"
                  style={{ boxSizing: "border-box" }}
                >
                  {/* Header */}
                  <div className="text-center border-b border-gray-200 pb-2 mb-2">
                    <h2 className="font-bold text-lg text-gray-900 leading-tight">أكاديمية دقيش</h2>
                    <p className="text-[10px] text-gray-600 font-semibold">منصة دقيش التعليمية - برج بونعامة</p>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex text-sm">
                      <span className="font-bold w-16 text-gray-800">التلميذ(ة):</span>
                      <span className="flex-1 border-b border-dotted border-gray-400"></span>
                    </div>
                    <div className="flex text-sm gap-2">
                      <div className="flex flex-1">
                        <span className="font-bold w-14 text-gray-800">المستوى:</span>
                        <span className="flex-1 border-b border-dotted border-gray-400"></span>
                      </div>
                      <div className="flex flex-1">
                        <span className="font-bold w-12 text-gray-800">الشعبة:</span>
                        <span className="flex-1 border-b border-dotted border-gray-400"></span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  <div className="mb-2">
                    <table className="w-full text-center border-collapse border border-gray-800 text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-800 py-1 font-bold">الحصة 1</th>
                          <th className="border border-gray-800 py-1 font-bold">الحصة 2</th>
                          <th className="border border-gray-800 py-1 font-bold">الحصة 3</th>
                          <th className="border border-gray-800 py-1 font-bold">الحصة 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-800 h-8"></td>
                          <td className="border border-gray-800 h-8"></td>
                          <td className="border border-gray-800 h-8"></td>
                          <td className="border border-gray-800 h-8"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer / Code */}
                  <div className="mt-auto bg-gray-50 rounded p-2 text-center border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-600 mb-0.5 uppercase tracking-wider">كود الاشتراك الدخول</p>
                    <p className="text-lg font-black font-mono tracking-widest text-gray-900 leading-none" dir="ltr">{code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
          }
          /* Ensure backgrounds print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
