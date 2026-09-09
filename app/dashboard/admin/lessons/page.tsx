import { prisma } from "@/lib/prisma";
import { Plus, Video, Download, PlayCircle } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { SubjectFilterForm } from "@/components/admin/SubjectFilterForm";

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const params = await searchParams;
  const subjects = await prisma.subject.findMany({
    orderBy: { title: "asc" },
  });

  const selectedSubjectId = params.subjectId || (subjects.length > 0 ? subjects[0].id : null);

  const selectedSubject = selectedSubjectId
    ? await prisma.subject.findUnique({
        where: { id: selectedSubjectId },
        include: {
          lessons: {
            include: { materials: true },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : null;

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة الدروس"
        description="ارفع الدروس والفيديوهات ونظّمها حسب الأشهر لكل مادة."
        icon={Video}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-ink whitespace-nowrap">اختر المادة:</label>
          <SubjectFilterForm
            subjects={subjects.map((s) => ({ id: s.id, title: s.title }))}
            selectedSubjectId={selectedSubjectId || undefined}
          />
        </div>
      </div>

      {!selectedSubject && (
        <div className="surface-card px-6 py-16 text-center">
          <p className="text-sm text-muted">الرجاء اختيار مادة من القائمة أعلاه أو إضافة مادة جديدة أولاً.</p>
        </div>
      )}

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="surface-card p-6 flex flex-col items-center text-center space-y-4">
              <span className="icon-tile">
                <Video className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-ink">إضافة درس جديد</h2>
              <p className="text-muted text-sm leading-relaxed">
                أضف درساً جديداً مع كويز وملحقات عبر واجهة النشر.
              </p>

              <Link href="/dashboard/admin/lessons/new" className="btn-primary w-full">
                <Plus className="w-4 h-4" />
                واجهة نشر الدروس
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
              const monthLessons = selectedSubject.lessons.filter((l) => l.month === month);
              if (monthLessons.length === 0) return null;

              return (
                <div key={month} className="surface-panel overflow-hidden">
                  <div className="border-b border-line p-4 bg-surface-muted">
                    <h3 className="text-base font-bold text-ink flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      الشهر {month}
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {monthLessons.map((lesson) => (
                      <article key={lesson.id} className="rounded-2xl border border-line p-4 flex flex-col bg-surface">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-soft overflow-hidden shrink-0 border border-line flex items-center justify-center relative">
                            {lesson.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={lesson.image}
                                alt={lesson.title}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                              />
                            ) : null}
                            <PlayCircle className="w-6 h-6 text-primary relative z-10" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-ink truncate">{lesson.title}</h4>
                              <Link
                                href={`/dashboard/admin/lessons/${lesson.id}/edit`}
                                className="text-xs badge-soft shrink-0"
                              >
                                تعديل
                              </Link>
                            </div>
                            <p className="text-xs text-muted font-mono mt-1">Vimeo: {lesson.vimeoVideoId}</p>
                          </div>
                        </div>

                        {lesson.materials.length > 0 ? (
                          <div className="mt-auto space-y-1.5 pt-3 border-t border-line">
                            {lesson.materials.map((mat) => (
                              <div
                                key={mat.id}
                                className="flex items-center justify-between bg-surface-muted p-2 rounded-lg text-xs font-semibold text-primary"
                              >
                                <span className="truncate flex-1 ml-2">{mat.title}</span>
                                <a
                                  href={mat.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:bg-primary-soft p-1.5 rounded-md"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-auto pt-3 border-t border-line text-xs text-muted">لا توجد ملحقات</div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
