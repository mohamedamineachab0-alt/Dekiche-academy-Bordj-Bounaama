import { prisma } from "@/lib/prisma";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { MessageSquare, Lock, Unlock } from "lucide-react";
import { createForum, toggleForumStatus } from "@/actions/forums";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ForumCreationClient } from "@/components/admin/ForumCreationClient";

export default async function AdminForumsPage() {
  const forums = await prisma.classForum.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      _count: {
        select: { messages: true },
      },
    },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, phase: true, levels: true, streams: true },
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="دردشة القسم"
        description="إدارة منتديات الأقسام، وإنشاء غرف نقاش جديدة، والتحكم في فتح الدردشة أو إغلاقها."
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <ForumCreationClient
            subjects={subjects.map((s) => ({
              id: s.id,
              title: s.title,
              phase: s.phase,
              levels: s.levels,
              streams: s.streams,
            }))}
            action={async (formData: FormData) => {
              "use server";
              await createForum(formData);
            }}
          />
        </div>

        <div className="xl:col-span-2">
          <div className="surface-panel overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>المنتدى</th>
                    <th>المادة / القسم</th>
                    <th className="text-center">الرسائل</th>
                    <th className="text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {forums.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-muted">
                        لا توجد منتديات مسجّلة بعد
                      </td>
                    </tr>
                  ) : (
                    forums.map((forum) => {
                      const levelStr = labelLevel(forum.level);
                      const streamStr = labelStream(forum.stream);

                      return (
                        <tr key={forum.id}>
                          <td>
                            <p className="font-semibold text-ink">{forum.title}</p>
                            <p className="text-xs text-muted mt-1">الشهر {forum.month}</p>
                          </td>
                          <td>
                            <p className="font-semibold text-primary text-sm">{forum.subject.title}</p>
                            <p className="text-xs text-muted mt-1">
                              {levelStr} · {streamStr}
                            </p>
                          </td>
                          <td className="text-center">
                            <span className="badge-outline tabular-nums">{forum._count.messages}</span>
                          </td>
                          <td className="text-center">
                            <form
                              action={async () => {
                                "use server";
                                await toggleForumStatus(forum.id, !forum.isOpen);
                              }}
                            >
                              <button
                                type="submit"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
                                  forum.isOpen
                                    ? "bg-primary-soft text-primary border-line"
                                    : "bg-surface-muted text-muted border-line"
                                }`}
                              >
                                {forum.isOpen ? (
                                  <>
                                    <Unlock className="w-4 h-4" />
                                    مفتوح
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    مغلق
                                  </>
                                )}
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
