import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Unlock, Lock, PlayCircle, BookOpen } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { SubjectActivationForm } from "@/components/student/SubjectActivationForm";
import { translateLevel } from "@/lib/utils/translations";
import { formatTeacherName } from "@/lib/education-labels";

export default async function StudentSubjectsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { studentProfile: true, enrollments: true },
  });

  if (!user || !user.studentProfile) return null;

  const { phase, level, stream } = user.studentProfile;

  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      phase,
      levels: { has: level },
      OR: [{ streams: { has: stream } }, { streams: { has: "NONE" } }],
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  const enrollments = user.enrollments;
  const enrolledSubjectIds = new Set(enrollments.map((e) => e.subjectId));
  const enrolledCount = subjects.filter((s) => enrolledSubjectIds.has(s.id)).length;

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="موادي الدراسية"
        description="ادخل إلى المواد المُفعّلة، أو فعّل مادة جديدة برمز الاشتراك الخاص بها."
        icon={BookOpen}
        action={
          <span className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1.5 text-sm font-semibold text-white">
            <span className="tabular-nums text-accent font-bold">{enrolledCount}</span>
            مادة مُفعّلة
          </span>
        }
      />

      {subjects.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <span className="icon-tile mx-auto mb-5">
            <BookOpen className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-bold text-ink mb-2">لا توجد مواد متاحة</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            لم تُضف بعد مواد تناسب مستواك وشعبتك. يرجى مراجعة الإدارة أو المحاولة لاحقاً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const isEnrolled = enrolledSubjectIds.has(subject.id);

            return (
              <article key={subject.id} className="surface-panel flex flex-col">
                <div className="relative aspect-[16/9] bg-primary-soft overflow-hidden">
                  {subject.image ? (
                    <img
                      src={subject.image}
                      alt={subject.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary/40" />
                    </div>
                  )}

                  <span
                    className={`absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                      isEnrolled
                        ? "bg-white/95 text-emerald-700"
                        : "bg-white/95 text-muted"
                    }`}
                  >
                    {isEnrolled ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    {isEnrolled ? "مُفعّلة" : "مغلقة"}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-ink mb-1 line-clamp-1">
                    {subject.title}
                  </h3>
                  <p className="text-sm text-muted mb-5 line-clamp-1">
                    {formatTeacherName(subject.teacherName)} ·{" "}
                    {translateLevel(subject.levels?.[0] || "")}
                  </p>

                  <div className="mt-auto pt-4 border-t border-line">
                    {isEnrolled ? (
                      <Link
                        href={`/dashboard/student/subjects/${subject.id}`}
                        className="btn-primary w-full"
                      >
                        <PlayCircle className="w-4 h-4" />
                        الدخول للمادة
                      </Link>
                    ) : (
                      <SubjectActivationForm subjectId={subject.id} />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
