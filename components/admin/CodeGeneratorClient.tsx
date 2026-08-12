"use client";

import { useState } from "react";
import { Key, Plus, Copy, CheckCircle2 } from "lucide-react";
import { generateAccessCode } from "@/actions/subjects";

export function CodeGeneratorClient({ subjects }: { subjects: { id: string, title: string }[] }) {
  const [pending, setPending] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setGeneratedCodes([]);
    
    const formData = new FormData(e.currentTarget);
    const result = await generateAccessCode(formData);
    
    if (result.success && result.codes) {
      setGeneratedCodes(result.codes);
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
      <div className="bg-white dark:bg-white rounded-3xl shadow-sm border border-slate-100 dark:border-purple-200 p-6">
        <h2 className="text-lg font-black text-purple-950 dark:text-purple-950 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-700" />
          توليد رموز جديدة
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-purple-800 dark:text-purple-800">المادة التعليمية</label>
            <select name="subjectId" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-950 dark:text-purple-950 text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option value="">اختر المادة</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-purple-800 dark:text-purple-800">نوع الوصول</label>
            <select name="accessType" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-950 dark:text-purple-950 text-base focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option value="MONTHLY">شهري (اختر الشهور)</option>
              <option value="YEARLY">سنوي (كامل المادة)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-purple-800 dark:text-purple-800">الشهور الصالحة (للشهري فقط)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <label key={m} className="flex items-center justify-center gap-1 bg-white dark:bg-white border border-slate-200 dark:border-purple-200 rounded-lg py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <input type="checkbox" name="validMonths" value={m} className="hidden peer" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 peer-checked:text-purple-800 dark:peer-checked:text-purple-500">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-purple-800 dark:text-purple-800">عدد الرموز المراد توليدها</label>
            <input type="number" name="count" required defaultValue={1} min={1} max={100} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-950 dark:text-purple-950 text-base focus:outline-none focus:ring-2 focus:ring-purple-600" />
          </div>

          <button disabled={pending} type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
            <Plus className={`w-4 h-4 ${pending ? "animate-spin" : ""}`} />
            {pending ? "جاري التوليد" : "توليد الرموز"}
          </button>
        </form>
      </div>

      {generatedCodes.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-black text-purple-900 dark:text-purple-500 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            تم التوليد بنجاح
          </h3>
          <div className="space-y-3">
            {generatedCodes.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-white border border-purple-100 dark:border-purple-950 p-3 rounded-xl">
                <span className="font-mono font-bold text-purple-950 dark:text-purple-950">{c.code}</span>
                <button 
                  onClick={() => handleCopy(c.code)}
                  className="p-2 text-slate-400 hover:text-purple-700 dark:hover:text-purple-500 transition-colors"
                >
                  {copiedCode === c.code ? <CheckCircle2 className="w-5 h-5 text-purple-700" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
