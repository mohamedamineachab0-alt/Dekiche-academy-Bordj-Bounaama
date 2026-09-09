import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Lock, Unlock } from "lucide-react";
import { labelLevel, labelStream } from "@/lib/education-labels";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ForumCreationClient } from "@/components/admin/ForumCreationClient";
import { createTeacherForum, toggleTeacherForumStatus } from "@/actions/forums";
import { getTeacherSession } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function TeacherForumsPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const forums = await prisma.classForum.findMany({
    where: { subjectId: { in: session.subjectIds } },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      _count: { select: { messages: true } },
    },
  });

  const subjects = session.teacher.subjects.map((subject) => ({
    id: subject.id,
    title: subject.title,
    phase: subject.phase,
    levels: subject.levels,
    streams: subject.streams,
  }));

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="دردشة القسم"
        description="افتح الدردشة ليتحدّث تلاميذك، أو أغلقها لتكتب أنت فقط وهم يقرأون."
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <ForumCreationClient
            subjects={subjects}
            action={async (formData: FormData) => {
              "use server";
              await createTeacherForum(formData);
            }}
          />
        </div>

        <div className="xl:col-span-2">
          <div className="surface-panel overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>المنتدى</th>
                    <th>المادة / القسم</th>
                    <th className="text-center">الرسائل</th>
                    <th className="text-center">الوضع</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {forums.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-muted">
                        لا توجد دردشات بعد. أنشئ واحدة لتلاميذك.
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
                                await toggleTeacherForumStatus(forum.id, !forum.isOpen);
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
                                    مفتوح للجميع
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    الأستاذ فقط
                                  </>
                                )}
                              </button>
                            </form>
                          </td>
                          <td>
                            <Link
                              href={`/dashboard/teacher/forums/${forum.id}`}
                              className="text-sm font-semibold text-primary"
                            >
                              فتح الدردشة
                            </Link>
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
