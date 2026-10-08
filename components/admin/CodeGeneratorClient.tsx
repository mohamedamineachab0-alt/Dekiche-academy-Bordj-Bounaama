"use client";

import { useState } from "react";
import { Key, Plus, Copy, CheckCircle2 } from "lucide-react";
import { generateAccessCode } from "@/actions/subjects";
import { SubjectSelector } from "@/components/shared/SubjectSelector";
import JSZip from "jszip";

export function CodeGeneratorClient({ subjects }: { subjects: any[] }) {

  const [pending, setPending] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const streamMap: Record<string, string> = {
    NONE: '',
    GENERAL: 'عام',
    COMMON_SCIENCE: 'جذع مشترك علوم',
    COMMON_LETTERS: 'جذع مشترك آداب',
    EXPERIMENTAL_SCIENCES: 'علوم تجريبية',
    MATHEMATICS: 'رياضيات',
    TECHNICAL_MATH: 'تقني رياضي',
    SCIENCES_MATH_TECH: 'شعب علمية',
    MANAGEMENT_ECONOMY: 'تسيير واقتصاد',
    LITERATURE_PHILOSOPHY: 'آداب وفلسفة',
    FOREIGN_LANGUAGES: 'لغات أجنبية',
  };

  const levelMap: Record<string, string> = {
    PRIMARY_1: 'الأولى ابتدائي',
    PRIMARY_2: 'الثانية ابتدائي',
    PRIMARY_3: 'الثالثة ابتدائي',
    PRIMARY_4: 'الرابعة ابتدائي',
    PRIMARY_5: 'الخامسة ابتدائي',
    MIDDLE_1: 'الأولى متوسط',
    MIDDLE_2: 'الثانية متوسط',
    MIDDLE_3: 'الثالثة متوسط',
    MIDDLE_4: 'الرابعة متوسط',
    SECONDARY_1: 'الأولى ثانوي',
    SECONDARY_2: 'الثانية ثانوي',
    SECONDARY_3: 'الثالثة ثانوي',
  };

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

      if (isMultiple) {
        const zip = new JSZip();
        
        // Group codes by subjectId
        const codesBySubject: Record<string, any[]> = {};
        result.codes.forEach((c: any) => {
          if (!codesBySubject[c.subjectId]) codesBySubject[c.subjectId] = [];
          codesBySubject[c.subjectId].push(c);
        });

        // Add each subject's codes to the zip
        for (const [subId, subCodes] of Object.entries(codesBySubject)) {
          const sub = subjects.find(s => s.id === subId);
          if (!sub) continue;

          let csvContent = "\uFEFFالكود\n";
          subCodes.forEach(c => {
            csvContent += `"${c.code}"\n`;
          });

          // Build filename parts
          const phaseStr = sub.phase === 'PRIMARY' ? 'ابتدائي' : sub.phase === 'MIDDLE' ? 'متوسط' : sub.phase === 'SECONDARY' ? 'ثانوي' : '';
          const levelsStr = sub.levels?.length > 0 ? sub.levels.map((l: string) => levelMap[l] || l).join(' و') : 'جميع المستويات';
          
          const streamNames = sub.streams
            ?.map((s: string) => streamMap[s] || s)
            .filter((s: string) => s && s !== '') || [];

          let fileName = `${sub.title} - ${levelsStr} ${phaseStr}`;
          if (streamNames.length > 0) {
            fileName += ` - ${streamNames.join(' و ')}`;
          }
          if (validMonths.length > 0) {
            fileName += ` - شهور ${validMonths.join("-")}`;
          }
          fileName = fileName.replace(/[\/\\?%*:|"<>]/g, '-');
          
          zip.file(`${fileName}.csv`, csvContent);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = `كل_الرموز_${generationDate}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        let csvContent = "الكود\n";
        result.codes.forEach((c: any) => {
          csvContent += `"${c.code}"\n`;
        });
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const subjectTitle = subjects.find((s) => s.id === subjectIdStr)?.title || "مادة";
        let fileDetails = "";
        
        if (level && level !== "ALL") {
          const arabicLevel = levelMap[level] || level;
          fileDetails += `_${arabicLevel}`;
        }
        if (stream && stream !== "ALL" && stream !== "NONE") {
          const arabicStream = streamMap[stream] || stream;
          fileDetails += `_${arabicStream}`;
        }
        if (validMonths.length > 0) fileDetails += `_شهور_${validMonths.join("-")}`;
        
        link.download = `رموز_${subjectTitle.replace(/\s+/g, "_")}${fileDetails.replace(/\s+/g, "_")}_${generationDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
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
    </div>
  );
}
