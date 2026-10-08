"use client";

import { useState } from "react";
import { BookOpen, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { EDUCATION_STAGES, EDUCATION_LEVELS, EDUCATION_STREAMS, getStreamsForLevel } from "@/lib/constants/education";

export function SubjectCreationClient({ 
  teachers,
  action
}: {
  teachers: { id: string; name: string }[];
  action: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [streams, setStreams] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);

  const currentLevels = phase ? EDUCATION_LEVELS[phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = levels.length > 0 ? getStreamsForLevel(levels[0] as keyof typeof EDUCATION_STREAMS) : [];
  const shouldShowStreams = phase === "SECONDARY" && currentStreams.length > 1;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    // Reset
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImageUrl("");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="surface-card overflow-hidden flex flex-col">
        <div className="relative aspect-video w-full bg-slate-200 dark:bg-white flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted dark:text-muted" />
          )}
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-ink shadow-sm">
            معاينة حية
          </div>
          <h3 className="font-bold text-ink dark:text-ink line-clamp-1">{title || "عنوان المادة"}</h3>
          <p className="text-xs text-muted dark:text-muted mt-1 line-clamp-2 leading-relaxed">{description || "وصف المادة يظهر هنا"}</p>
        </div>
      </div>

      {/* Form */}
      <div className="surface-card p-6">
        <h2 className="text-lg font-bold text-ink dark:text-ink mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          إضافة مادة جديدة
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-primary dark:text-primary">عنوان المادة</label>
            <input type="text" name="title" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="الرياضيات المتقدمة" />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-primary dark:text-primary">الوصف</label>
            <textarea name="description" required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="وصف المادة"></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-primary dark:text-primary">صورة الغلاف (1920x1080)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*"
              onChange={handleImageChange} 
              className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-primary-soft file:text-primary dark:file:bg-white/30 hover:file:bg-primary-soft transition-all cursor-pointer" 
            />
          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-primary dark:text-primary">الطور</label>
              <select name="phase" required value={phase} onChange={e => { setPhase(e.target.value); setLevels([]); setStreams([]); }} className="input-field">
                <option value="">اختر الطور</option>
                {EDUCATION_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-primary dark:text-primary">المستويات</label>
              <div className="w-full p-2.5 rounded-xl border border-line dark:border-line bg-white dark:bg-white text-sm max-h-32 overflow-y-auto space-y-2">
                {currentLevels.map((l: any) => (
                  <label key={l.value} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="levels" 
                      value={l.value}
                      checked={levels.includes(l.value)}
                      onChange={(e) => {
                        if (e.target.checked) setLevels([...levels, l.value]);
                        else setLevels(levels.filter(x => x !== l.value));
                      }}
                      className="w-4 h-4 text-primary rounded border-line focus:ring-primary-mid"
                    />
                    <span className="text-ink">{l.label}</span>
                  </label>
                ))}
                {currentLevels.length === 0 && <span className="text-muted">اختر الطور أولاً</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-primary dark:text-primary">الشعب</label>
              {shouldShowStreams ? (
                <div className="w-full p-2.5 rounded-xl border border-line dark:border-line bg-white dark:bg-white text-sm max-h-32 overflow-y-auto space-y-2">
                  {currentStreams.map((s: any) => (
                    <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="streams" 
                        value={s.value}
                        checked={streams.includes(s.value)}
                        onChange={(e) => {
                          if (e.target.checked) setStreams([...streams, s.value]);
                          else setStreams(streams.filter(x => x !== s.value));
                        }}
                        className="w-4 h-4 text-primary rounded border-line focus:ring-primary-mid"
                      />
                      <span className="text-ink">{s.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="w-full p-2.5 rounded-xl border border-line bg-surface-muted text-muted text-sm text-center">
                  غير مطبق
                </div>
              )}
            </div>
          </div>



          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {pending ? "جاري النشر" : "نشر المادة"}
          </button>
        </form>
      </div>
    </div>
  );
}
