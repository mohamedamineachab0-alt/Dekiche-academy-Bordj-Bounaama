"use client";

import { useState } from "react";
import { addStudent, addEmployee, addTeacher, addSubject, addGroup } from "@/actions/admin-entities";
import { UserPlus, Briefcase, GraduationCap, Users, BookOpen, X, Loader2 } from "lucide-react";
import { translateLevel, translateStream } from "@/lib/utils/translations";

export function AddEntityModals({ options }: { options: any }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { subjects, teachers, groups } = options;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, action: Function) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const res = await action(formData);
    
    setIsPending(false);
    if (res.success) {
      setMessage({ type: "success", text: "تمت الإضافة بنجاح" });
      setTimeout(() => {
        setActiveModal(null);
        setMessage(null);
      }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "حدث خطأ" });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setMessage(null);
  };

  const ModalWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-2xl p-6 relative border border-border">
        <button onClick={closeModal} className="absolute top-4 left-4 p-2 rounded-full hover:bg-surface-muted transition-colors">
          <X className="w-5 h-5 text-ink" />
        </button>
        <h2 className="text-xl font-bold text-ink mb-6">{title}</h2>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            {message.text}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setActiveModal("student")} className="btn-primary py-2 px-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> إضافة تلميذ
        </button>
        <button onClick={() => setActiveModal("teacher")} className="btn-primary py-2 px-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
          <GraduationCap className="w-4 h-4" /> إضافة أستاذ
        </button>
        <button onClick={() => setActiveModal("employee")} className="btn-primary py-2 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Briefcase className="w-4 h-4" /> إضافة عامل
        </button>
        <button onClick={() => setActiveModal("subject")} className="btn-primary py-2 px-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
          <BookOpen className="w-4 h-4" /> إضافة مادة
        </button>
        <button onClick={() => setActiveModal("group")} className="btn-primary py-2 px-4 flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
          <Users className="w-4 h-4" /> إضافة فوج
        </button>
      </div>

      {activeModal === "student" && (
        <ModalWrapper title="إضافة تلميذ جديد">
          <form onSubmit={(e) => handleSubmit(e, addStudent)} className="space-y-4">
            <div><label className="block text-sm mb-1 text-ink">الاسم الكامل</label><input required type="text" name="fullName" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">رقم الهاتف</label><input required type="text" name="phoneNumber" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">اسم الولي</label><input required type="text" name="parentName" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">رقم هاتف الولي</label><input required type="text" name="parentPhone" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            
            <div>
              <label className="block text-sm mb-1 text-ink">الفوج (يحدد المادة والأستاذ)</label>
              <select name="groupId" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink">
                <option value="">-- بدون فوج حالياً --</option>
                {groups.map((g: any) => {
                  const subject = g.subject;
                  const levelsText = subject?.levels?.map(translateLevel).join("، ") || "";
                  const streamsText = subject?.streams?.length > 0 && subject.streams[0] !== "NONE" ? subject.streams.map(translateStream).join("، ") : "";
                  const subLabel = subject ? `${subject.title} ${levelsText ? `(${levelsText}${streamsText ? ` - ${streamsText}` : ""})` : ""}` : "";
                  return (
                    <option key={g.id} value={g.id}>{g.name} - {subLabel} ({g.teacher?.name || "بدون أستاذ"})</option>
                  );
                })}
              </select>
            </div>
            
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-4">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة التلميذ"}
            </button>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "teacher" && (
        <ModalWrapper title="إضافة أستاذ جديد">
          <form onSubmit={(e) => handleSubmit(e, addTeacher)} className="space-y-4">
            <div><label className="block text-sm mb-1 text-ink">الاسم الكامل</label><input required type="text" name="name" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">رقم الهاتف</label><input required type="text" name="phone" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-4 bg-purple-600 hover:bg-purple-700">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة الأستاذ"}
            </button>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "employee" && (
        <ModalWrapper title="إضافة عامل جديد">
          <form onSubmit={(e) => handleSubmit(e, addEmployee)} className="space-y-4">
            <div><label className="block text-sm mb-1 text-ink">الاسم الكامل</label><input required type="text" name="fullName" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">رقم الهاتف</label><input required type="text" name="phoneNumber" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-4 bg-blue-600 hover:bg-blue-700">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة العامل"}
            </button>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "subject" && (
        <ModalWrapper title="إضافة مادة جديدة">
          <form onSubmit={(e) => handleSubmit(e, addSubject)} className="space-y-4">
            <div><label className="block text-sm mb-1 text-ink">اسم المادة</label><input required type="text" name="title" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">الوصف</label><input type="text" name="description" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">السعر (شهريا)</label><input required type="number" name="price" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <div><label className="block text-sm mb-1 text-ink">اسم الأستاذ المبدئي</label><input type="text" name="teacherName" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" /></div>
            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-4 bg-emerald-600 hover:bg-emerald-700">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة المادة"}
            </button>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "group" && (
        <ModalWrapper title="إضافة فوج جديد">
          <form onSubmit={(e) => handleSubmit(e, addGroup)} className="space-y-4">
            <div><label className="block text-sm mb-1 text-ink">اسم الفوج</label><input required type="text" name="name" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink" placeholder="مثال: فوج 1 علوم" /></div>
            
            <div>
              <label className="block text-sm mb-1 text-ink">المادة</label>
              <select required name="subjectId" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink">
                <option value="">-- اختر المادة --</option>
                {subjects.map((s: any) => {
                  const levelsText = s.levels?.map(translateLevel).join("، ") || "";
                  const streamsText = s.streams?.length > 0 && s.streams[0] !== "NONE" ? s.streams.map(translateStream).join("، ") : "";
                  return (
                    <option key={s.id} value={s.id}>{s.title} {levelsText ? `(${levelsText}${streamsText ? ` - ${streamsText}` : ""})` : ""}</option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-ink">الأستاذ</label>
              <select required name="teacherId" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink">
                <option value="">-- اختر الأستاذ --</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-ink">المستوى (الطور)</label>
              <select name="level" className="w-full input-field bg-background border border-border p-2 rounded-lg text-ink">
                <option value="PRIMARY_1">الأولى ابتدائي</option>
                <option value="PRIMARY_2">الثانية ابتدائي</option>
                <option value="PRIMARY_3">الثالثة ابتدائي</option>
                <option value="PRIMARY_4">الرابعة ابتدائي</option>
                <option value="PRIMARY_5">الخامسة ابتدائي</option>
                <option value="MIDDLE_1">الأولى متوسط</option>
                <option value="MIDDLE_2">الثانية متوسط</option>
                <option value="MIDDLE_3">الثالثة متوسط</option>
                <option value="MIDDLE_4">الرابعة متوسط</option>
                <option value="SECONDARY_1">الأولى ثانوي</option>
                <option value="SECONDARY_2">الثانية ثانوي</option>
                <option value="SECONDARY_3">الثالثة ثانوي</option>
              </select>
            </div>


            <button type="submit" disabled={isPending} className="btn-primary w-full justify-center mt-4 bg-orange-600 hover:bg-orange-700">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة الفوج"}
            </button>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
}
