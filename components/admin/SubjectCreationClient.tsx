"use client";

import { useState } from "react";
import { BookOpen, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";

export function SubjectCreationClient({ 
  teachers,
  action
}: {
  teachers: { id: string; name: string }[];
  action: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [manualTeacherName, setManualTeacherName] = useState("");
  const [teacherInputMethod, setTeacherInputMethod] = useState<"LIST" | "MANUAL">("LIST");
  const [phase, setPhase] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [streams, setStreams] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [accessType, setAccessType] = useState("MONTHLY");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);

  const selectedTeacherName = teacherInputMethod === "LIST" 
    ? (teachers.find(t => t.id === teacherId)?.name || "بدون أستاذ") 
    : (manualTeacherName || "بدون أستاذ");

  const currentLevels = phase ? EDUCATION_LEVELS[phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = levels.length > 0 ? getStreamsForLevel(phase, levels[0]) : [];
  const shouldShowStreams = phase === "SECONDARY" && currentStreams.length > 1;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    if (isFree) {
      formData.set("price", "0");
    }
    await action(formData);
    setPending(false);
    // Reset
    setTitle("");
    setDescription("");
    setTeacherId("");
    setManualTeacherName("");
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
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary dark:text-muted shadow-sm">
            {isFree ? "مجانا" : (price ? `${price} دج` : "حدد السعر")}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-ink dark:text-ink line-clamp-1">{title || "عنوان المادة"}</h3>
          <p className="text-xs text-muted dark:text-muted mt-1 line-clamp-2 leading-relaxed">{description || "وصف المادة يظهر هنا"}</p>
          
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-muted dark:text-primary bg-white dark:bg-white px-2 py-1 rounded-md">
              {selectedTeacherName}
            </span>
            <span className="text-xs font-bold text-muted dark:text-primary bg-white dark:bg-white px-2 py-1 rounded-md">
              {accessType === "YEARLY" ? "سنوي" : "شهري"}
            </span>
          </div>
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

          <div className="space-y-1 border border-line dark:border-line p-4 rounded-2xl bg-white/50 dark:bg-white/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-primary dark:text-primary">الأستاذ</label>
              <div className="flex bg-slate-200 dark:bg-white p-1 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("LIST")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "LIST" ? "bg-white dark:bg-white text-primary shadow-sm" : "text-muted hover:text-primary dark:hover:text-primary"}`}
                >
                  من القائمة
                </button>
                <button 
                  type="button" 
                  onClick={() => setTeacherInputMethod("MANUAL")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${teacherInputMethod === "MANUAL" ? "bg-white dark:bg-white text-primary shadow-sm" : "text-muted hover:text-primary dark:hover:text-primary"}`}
                >
                  إدخال يدوي
                </button>
              </div>
            </div>
            
            {teacherInputMethod === "LIST" ? (
              <select name="teacherId" value={teacherId} onChange={e => setTeacherId(e.target.value)} className="input-field">
                <option value="">بدون أستاذ</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                name="manualTeacherName" 
                value={manualTeacherName} 
                onChange={e => setManualTeacherName(e.target.value)} 
                className="input-field" 
                placeholder="أدخل اسم الأستاذ" 
              />
            )}
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

          <div className="space-y-4 pt-4 border-t border-line dark:border-line">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isFree} 
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-line dark:border-line dark:bg-white focus:ring-primary-mid" 
              />
              <span className="text-sm font-bold text-primary dark:text-primary">نشر المادة على أنها مجانا</span>
            </label>

            {!isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-primary dark:text-primary">السعر</label>
                  <input type="number" name="price" required value={price} onChange={e => setPrice(e.target.value)} placeholder="مثال: 2500" className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-primary dark:text-primary">نوع الوصول</label>
                  <select name="accessType" required value={accessType} onChange={e => setAccessType(e.target.value)} className="input-field">
                    <option value="MONTHLY">شهري</option>
                    <option value="YEARLY">سنوي</option>
                  </select>
                </div>
              </div>
            )}
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
