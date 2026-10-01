"use client";

import { useState } from "react";
import { Loader2, Edit3, X, Check } from "lucide-react";
import { updateStudentProfile } from "@/actions/student-profile";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";

type StudentData = {
  id: string;
  fullName: string;
  phase: string;
  level: string;
  stream: string;
};

export function EditStudentProfileClient({ student }: { student: StudentData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(student.fullName);
  const [phase, setPhase] = useState(student.phase);
  const [level, setLevel] = useState(student.level);
  const [stream, setStream] = useState(student.stream);

  const currentLevels = phase ? EDUCATION_LEVELS[phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = level ? getStreamsForLevel(phase, level) : [];
  const shouldShowStreams = phase === "SECONDARY" && currentStreams.length > 1;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData();
    formData.set("studentId", student.id);
    formData.set("fullName", fullName);
    formData.set("level", level);
    formData.set("stream", shouldShowStreams ? stream : "NONE");

    const res = await updateStudentProfile(formData);
    setPending(false);

    if (res.success) {
      setIsEditing(false);
    } else {
      setError(res.error || "حدث خطأ غير متوقع");
    }
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-surface-muted text-ink hover:bg-line/50 transition-colors rounded-xl font-bold text-sm mt-4"
      >
        <Edit3 className="w-4 h-4" />
        تعديل المعلومات الشخصية
      </button>
    );
  }

  return (
    <div className="mt-6 p-5 bg-surface-muted rounded-xl border border-line">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-ink">تعديل المعلومات</h4>
        <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-line/50 rounded-lg text-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-ink">الاسم الكامل</label>
          <input 
            type="text" 
            required 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            className="w-full input-field bg-background border border-line p-2.5 rounded-xl text-ink focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-ink">الطور</label>
          <select 
            required 
            value={phase} 
            onChange={e => { setPhase(e.target.value); setLevel(""); setStream(""); }} 
            className="w-full input-field bg-background border border-line p-2.5 rounded-xl text-ink focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">اختر الطور</option>
            {EDUCATION_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-ink">المستوى</label>
          <select 
            required 
            value={level} 
            onChange={e => { setLevel(e.target.value); setStream(""); }} 
            className="w-full input-field bg-background border border-line p-2.5 rounded-xl text-ink focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={!phase}
          >
            <option value="">اختر المستوى</option>
            {currentLevels.map((l: any) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {shouldShowStreams && (
          <div className="space-y-1">
            <label className="text-sm font-bold text-ink">الشعبة</label>
            <select 
              required={shouldShowStreams} 
              value={stream} 
              onChange={e => setStream(e.target.value)} 
              className="w-full input-field bg-background border border-line p-2.5 rounded-xl text-ink focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">اختر الشعبة</option>
              {currentStreams.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={pending} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white transition-colors rounded-xl font-bold text-sm shadow-sm shadow-primary/20"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}
