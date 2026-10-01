"use client";

import { useState } from "react";
import { Key, Plus, Copy, CheckCircle2, Printer } from "lucide-react";
import { generateAccessCode } from "@/actions/subjects";
import { SubjectSelector } from "@/components/shared/SubjectSelector";

export function CodeGeneratorClient({ subjects }: { subjects: any[] }) {

  const [pending, setPending] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setGeneratedCodes([]);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await generateAccessCode(formData);

    if (result.success && result.codes) {
      setGeneratedCodes(result.codes);

      const subjectIdStr = formData.get("subjectId") as string;
      const isMultiple = subjectIdStr.includes(',');
      const level = formData.get("level") as string;
      const stream = formData.get("stream") as string;
      const validMonths = formData.getAll("validMonths") as string[];
      const validMonthsStr = validMonths.length > 0 ? validMonths.join("-") : "عام_كامل";
      const generationDate = new Date().toISOString().split("T")[0];

      let csvContent = "المادة,المستوى,الشعبة,الشهور,تاريخ_التوليد,الكود\n";

      result.codes.forEach((c: any) => {
        const s = subjects.find((sub) => sub.id === c.subjectId);
        const title = s?.title || "مادة_غير_معروفة";
        csvContent += `"${title}","${level && level !== "ALL" ? level : "الكل"}","${stream && stream !== "ALL" && stream !== "NONE" ? stream : "الكل"}","${validMonthsStr}","${generationDate}","${c.code}"\n`;
      });

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      
      if (isMultiple) {
        link.download = `كل_الرموز_${generationDate}.csv`;
      } else {
        const subjectTitle = subjects.find((s) => s.id === subjectIdStr)?.title || "مادة";
        let fileDetails = "";
        if (level && level !== "ALL") fileDetails += `_${level}`;
        if (stream && stream !== "ALL" && stream !== "NONE") fileDetails += `_${stream}`;
        if (validMonths.length > 0) fileDetails += `_شهور_${validMonths.join("-")}`;
        
        link.download = `رموز_${subjectTitle.replace(/\s+/g, "_")}${fileDetails}_${generationDate}.csv`;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (result.error) {
      setErrorMsg(result.error);
    }

    setPending(false);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const printPages = generatedCodes.reduce<any[][]>((pages, code, index) => {
    const pageIndex = Math.floor(index / 10);
    if (!pages[pageIndex]) pages[pageIndex] = [];
    pages[pageIndex].push(code);
    return pages;
  }, []);

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 sticky top-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
          <span className="icon-tile">
            <Key className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-ink">توليد رموز جديدة</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold mb-4">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="field-label mb-2">المادة التعليمية</label>
            <SubjectSelector subjects={subjects} allowAll={true} />
          </div>

          <div>
            <label className="field-label">نوع الوصول</label>
            <select name="accessType" required className="input-field">
              <option value="MONTHLY">شهري (اختر الشهور)</option>
              <option value="YEARLY">سنوي (كامل المادة)</option>
            </select>
          </div>

          <div>
            <label className="field-label">الشهور الصالحة (للشهري فقط)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <label
                  key={m}
                  className="flex items-center justify-center gap-1 border border-line rounded-lg py-1.5 cursor-pointer hover:bg-primary-soft"
                >
                  <input type="checkbox" name="validMonths" value={m} className="hidden peer" />
                  <span className="text-xs font-semibold text-muted peer-checked:text-primary">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">عدد الرموز المراد توليدها</label>
            <input
              type="number"
              name="count"
              required
              defaultValue={100}
              min={1}
              max={1000}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="field-label">كلمة المرور لتأكيد التوليد</label>
            <input
              type="password"
              name="actionPassword"
              required
              placeholder="أدخل كلمة المرور"
              className="input-field text-left"
              dir="ltr"
            />
          </div>

          <button disabled={pending} type="submit" className="btn-primary w-full">
            <Plus className={`w-4 h-4 ${pending ? "animate-spin" : ""}`} />
            {pending ? "جاري التوليد" : "توليد الرموز"}
          </button>
        </form>
      </div>

      {generatedCodes.length > 0 && (
        <div className="surface-card p-6 bg-primary-soft">
          <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            تم التوليد بنجاح
          </h3>
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted">{generatedCodes.length} رمز جاهز للطباعة</p>
            <button type="button" onClick={() => window.print()} className="btn-primary">
              <Printer className="w-4 h-4" />
              طباعة البطاقات
            </button>
          </div>
          <div className="space-y-3">
            {generatedCodes.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-surface border border-line p-3 rounded-xl">
                <span className="font-mono font-bold text-ink">{c.code}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(c.code)}
                  className="p-2 text-muted hover:text-primary"
                >
                  {copiedCode === c.code ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {printPages.length > 0 && (
        <div className="access-code-print-area" aria-hidden="true">
          {printPages.map((page, pageIndex) => (
            <div className="access-code-print-page" key={pageIndex}>
              {page.map((code, index) => {
                const subject = subjects.find((item) => item.id === code.subjectId);
                return (
                  <article className="access-code-print-card" key={index}>
                    <p className="access-code-print-label">بطاقة تفعيل</p>
                    <h2>{subject?.title || "رمز الدخول"}</h2>
                    <p className="access-code-print-code" dir="ltr">{code.code}</p>
                    <p className="access-code-print-instructions">استعمل هذا الرمز لتفعيل الوصول إلى المنصة</p>
                    <div className="access-code-print-boxes" aria-label="خانات البطاقة">
                      {[1, 2, 3, 4].map((box) => <span key={box} />)}
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .access-code-print-area { display: none; }

        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body * { visibility: hidden; }
          .access-code-print-area, .access-code-print-area * { visibility: visible; }
          .access-code-print-area {
            display: block;
            position: absolute;
            inset: 0;
            width: 100%;
          }
          .access-code-print-page {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(5, 1fr);
            gap: 4mm;
            height: 273mm;
            break-after: page;
            page-break-after: always;
          }
          .access-code-print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .access-code-print-card {
            box-sizing: border-box;
            border: 1.5px solid #0f766e;
            border-radius: 3mm;
            padding: 4mm 6mm;
            text-align: center;
            direction: rtl;
            display: flex;
            flex-direction: column;
            justify-content: center;
            break-inside: avoid;
          }
          .access-code-print-label {
            color: #0f766e;
            font-size: 8pt;
            font-weight: 700;
            margin: 0 0 2mm;
          }
          .access-code-print-card h2 {
            color: #111827;
            font-size: 11pt;
            margin: 0 0 3mm;
          }
          .access-code-print-code {
            border: 1px dashed #0f766e;
            border-radius: 2mm;
            color: #111827;
            font-family: ui-monospace, monospace;
            font-size: 12pt;
            font-weight: 800;
            letter-spacing: 1px;
            margin: 0 0 3mm;
            padding: 2mm;
          }
          .access-code-print-instructions {
            color: #4b5563;
            font-size: 7pt;
            line-height: 1.3;
            margin: 0;
          }
          .access-code-print-boxes {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2mm;
            margin-top: 3mm;
          }
          .access-code-print-boxes span {
            aspect-ratio: 1;
            border: 0.5px solid #0f766e;
            border-radius: 1mm;
          }
        }
      `}</style>
    </div>
  );
}
