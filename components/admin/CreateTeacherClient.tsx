"use client";

import { useState } from "react";
import { Users, Copy, CheckCircle } from "lucide-react";
import { createTeacher } from "@/actions/admin";
import { STREAMS, LEVELS } from "@/lib/constants";

type CreateTeacherClientProps = {
  subjects: { id: string; title: string }[];
};

export function CreateTeacherClient({ subjects }: CreateTeacherClientProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ phone: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setCredentials(null);

    const formData = new FormData(e.currentTarget);
    const res = await createTeacher(formData);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.credentials) {
      setCredentials(res.credentials);
      // Reset form
      (e.target as HTMLFormElement).reset();
    }
    setPending(false);
  };

  const handleCopy = () => {
    if (credentials) {
      navigator.clipboard.writeText(`رقم الهاتف: ${credentials.phone}\nكلمة المرور: 1809010900`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (credentials) {
    return (
      <div className="surface-card p-6 border-2 border-emerald-500/20 bg-emerald-50/50">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-800">تم إنشاء الحساب بنجاح!</h3>
            <p className="text-sm text-emerald-600/80 mt-1">الرجاء تزويد الأستاذ بمعلومات الدخول التالية:</p>
          </div>
          
          <div className="w-full bg-white border border-emerald-100 rounded-xl p-4 text-left font-mono space-y-3 shadow-sm">
            <div>
              <p className="text-xs text-muted mb-1 text-right font-sans">رقم الهاتف (معرف الدخول)</p>
              <p className="text-lg font-bold text-ink">{credentials.phone}</p>
            </div>
            <div className="h-px bg-line/50" />
            <div>
              <p className="text-xs text-muted mb-1 text-right font-sans">كلمة المرور</p>
              <p className="text-lg font-bold text-ink">1809010900</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" /> تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> نسخ المعلومات
              </>
            )}
          </button>
          
          <button
            onClick={() => setCredentials(null)}
            className="btn-ghost w-full mt-2"
          >
            إضافة أستاذ آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-xl text-center">
          {error}
        </div>
      )}
      
      <div>
        <label className="field-label">الاسم الكامل</label>
        <input
          type="text"
          name="fullName"
          required
          className="input-field"
          placeholder="مثال: الأستاذ كمال"
        />
      </div>

      <div>
        <label className="field-label">الأطوار الدراسية الموكلة</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "PRIMARY", label: "ابتدائي" },
            { value: "MIDDLE", label: "متوسط" },
            { value: "SECONDARY", label: "ثانوي" },
          ].map((p) => (
            <label
              key={p.value}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 cursor-pointer hover:bg-primary-soft"
            >
              <input type="checkbox" name="phases" value={p.value} className="accent-primary w-4 h-4" />
              <span className="text-xs font-semibold text-ink">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">المستويات الدراسية الموكلة</label>
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <label
              key={l.value}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 cursor-pointer hover:bg-primary-soft"
            >
              <input type="checkbox" name="levels" value={l.value} className="accent-primary w-4 h-4" />
              <span className="text-xs font-semibold text-ink">{l.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">الشعب الموكلة</label>
        <div className="grid grid-cols-2 gap-2">
          {STREAMS.map((s) => (
            <label
              key={s.value}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 cursor-pointer hover:bg-primary-soft"
            >
              <input type="checkbox" name="streams" value={s.value} className="accent-primary w-4 h-4" />
              <span className="text-xs font-semibold text-ink">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">المواد المسندة</label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {subjects.length === 0 && <span className="text-xs text-muted">لا توجد مواد بعد</span>}
          {subjects.map((subj) => (
            <label
              key={subj.id}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5 cursor-pointer hover:bg-primary-soft"
            >
              <input type="checkbox" name="subjectIds" value={subj.id} className="accent-primary w-4 h-4" />
              <span className="text-sm font-semibold text-ink">{subj.title}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full mt-2">
        <Users className="w-4 h-4" />
        {pending ? "جاري إنشاء الحساب..." : "إنشاء حساب الأستاذ"}
      </button>
    </form>
  );
}
