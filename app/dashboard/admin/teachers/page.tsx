import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { Users, Plus, Phone, BookOpen } from "lucide-react";
import { createTeacher } from "@/actions/admin";
import { HeroBanner } from "@/components/shared/HeroBanner";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      subjects: true,
    },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة الأساتذة"
        description="تسجيل أساتذة جدد وتعيين مستويات وشعب التدريس الخاصة بهم."
        icon={Users}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="surface-card p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
              <span className="icon-tile">
                <Plus className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-ink">إضافة أستاذ جديد</h2>
            </div>

            <form
              action={async (formData) => {
                "use server";
                await createTeacher(formData);
              }}
              className="space-y-4"
            >
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
                <label className="field-label">رقم الهاتف (للدخول)</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  dir="ltr"
                  className="input-field text-left"
                  placeholder="05XXXXXXXX"
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

              <button type="submit" className="btn-primary w-full mt-2">
                <Users className="w-4 h-4" />
                إنشاء حساب الأستاذ
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {teachers.map((teacher) => (
              <article key={teacher.id} className="surface-card p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-lg">{teacher.name}</h3>
                    <p className="text-sm text-muted font-mono flex items-center gap-1 mt-1" dir="ltr">
                      <Phone className="w-3.5 h-3.5" />
                      {teacher.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-2 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-muted mb-2">الأطوار:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.phases.map((p) => {
                        const phaseMap: Record<string, string> = {
                          PRIMARY: "ابتدائي",
                          MIDDLE: "متوسط",
                          SECONDARY: "ثانوي",
                        };
                        return (
                          <span key={p} className="badge-soft">
                            {phaseMap[p] || p}
                          </span>
                        );
                      })}
                      {teacher.phases.length === 0 && <span className="text-xs text-muted">—</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted mb-2">المستويات:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.levels.map((l) => (
                        <span key={l} className="badge-outline">
                          {labelLevel(l)}
                        </span>
                      ))}
                      {teacher.levels.length === 0 && <span className="text-xs text-muted">—</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted mb-2">الشعب:</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.streams.map((s) => (
                        <span key={s} className="badge-outline">
                          {labelStream(s)}
                        </span>
                      ))}
                      {teacher.streams.length === 0 && <span className="text-xs text-muted">—</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-sm font-semibold text-ink">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {teacher.subjects.length} مواد مسندة
                </div>
              </article>
            ))}
            {teachers.length === 0 && (
              <div className="col-span-full surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <Users className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا يوجد أساتذة مضافون بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
