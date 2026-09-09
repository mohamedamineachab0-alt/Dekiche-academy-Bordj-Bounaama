import { prisma } from "@/lib/prisma";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { Video, Calendar, Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { createLiveClass, deleteLiveClass } from "@/actions/live";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { MonthSelect } from "@/components/shared/MonthSelect";

export default async function AdminLiveClassesPage() {
  const liveClasses = await prisma.liveClass.findMany({
    orderBy: { date: "asc" },
    include: {
      subject: {
        select: { id: true, title: true, levels: true, streams: true },
      },
    },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, levels: true, streams: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="إدارة الحصص المباشرة"
        description="برمجة الحصص المباشرة وإضافة روابط الزوم ومتابعة الجدول الزمني لجميع المستويات."
        icon={Video}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="surface-card p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
              <span className="icon-tile">
                <Plus className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-ink">برمجة حصة جديدة</h2>
            </div>

            <form
              action={async (formData) => {
                "use server";
                await createLiveClass(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="field-label">عنوان الحصة</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input-field"
                  placeholder="مثال: مراجعة شاملة للوحدة الأولى"
                />
              </div>

              <div>
                <label className="field-label">المادة الدراسية</label>
                <select name="subjectId" required className="input-field">
                  <option value="">اختر المادة</option>
                  {subjects.map((s) => {
                    const levelStr = labelLevel(s.levels?.[0]);
                    const streamStr = labelStream(s.streams?.[0]);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.title} ({levelStr} - {streamStr})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="field-label">رابط الزوم</label>
                <input
                  type="url"
                  name="zoomLink"
                  required
                  dir="ltr"
                  className="input-field text-left"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">التاريخ والوقت</label>
                  <input type="datetime-local" name="date" required className="input-field" />
                </div>
                <div>
                  <label className="field-label">الشهر</label>
                  <MonthSelect name="month" required className="!p-2.5 !text-sm" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-2">
                <Calendar className="w-4 h-4" />
                برمجة الحصة
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liveClasses.map((liveClass) => {
              const levelStr = labelLevel(liveClass.subject.levels?.[0]);
              const formattedDate = new Date(liveClass.date).toLocaleString("ar-DZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <article key={liveClass.id} className="surface-card p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className="icon-tile">
                      <Video className="w-5 h-5" />
                    </span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteLiveClass(liveClass.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <h3 className="font-bold text-ink text-lg mb-2 leading-snug">{liveClass.title}</h3>
                  <span className="badge-outline w-fit mb-4">
                    {liveClass.subject.title} · {levelStr}
                  </span>

                  <p className="flex items-center gap-2 text-sm text-muted flex-1 mb-4">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    {formattedDate}
                  </p>

                  <a
                    href={liveClass.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    <LinkIcon className="w-4 h-4" />
                    عرض رابط الزوم
                  </a>
                </article>
              );
            })}
            {liveClasses.length === 0 && (
              <div className="col-span-full surface-card px-6 py-16 text-center">
                <span className="icon-tile mx-auto mb-4">
                  <Video className="w-5 h-5" />
                </span>
                <p className="text-sm text-muted">لا توجد حصص مبرمجة حالياً.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
