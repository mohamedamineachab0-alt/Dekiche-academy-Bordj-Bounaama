import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Trophy, Medal, Award } from "lucide-react";
import { getRankedStudents, rankOf, RANKING_RULES } from "@/lib/ranking";

export default async function StudentLeaderboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: sessionId },
    include: { studentProfile: true },
  });

  if (!currentUser || !currentUser.studentProfile) redirect("/login");

  const ranked = await getRankedStudents({
    level: currentUser.studentProfile.level,
    stream: currentUser.studentProfile.stream,
  });
  const myRank = rankOf(currentUser.id, ranked);
  const me = ranked.find((row) => row.id === currentUser.id);
  const topStudents = ranked.slice(0, 10);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="الترتيب والنقاط"
        description="ترتيبك بين زملاء مستواك وشعبتك، ويُحدَّث حسب نشاطك في الاختبارات والإجابات والدخول."
        icon={Trophy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <aside className="lg:col-span-4 space-y-4">
          <div className="feature-card feature-card-solid h-full flex flex-col items-center text-center justify-center min-h-[16rem]">
            <p className="text-sm font-semibold text-white/75 mb-2">مجموع نقاطك</p>
            <p className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold text-white tabular-nums leading-none">
              {me?.score ?? 0}
            </p>
            <div className="mt-6 pt-5 border-t border-white/15 w-full flex items-center justify-between px-2">
              <span className="text-sm font-medium text-white/70">ترتيبك</span>
              <span className="text-2xl font-bold text-white tabular-nums">
                {myRank ? `#${myRank}` : "غير مصنّف"}
              </span>
            </div>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-bold text-muted mb-2">كيف تُحسب النقاط</p>
            <ul className="space-y-1.5 text-xs text-muted">
              {RANKING_RULES.map((rule) => (
                <li key={rule.key}>{rule.label}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-8 surface-panel overflow-hidden">
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-line bg-surface-muted flex items-center gap-3">
            <span className="icon-tile-solid !w-10 !h-10">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-ink">لوحة الشرف</h2>
          </div>

          <div className="p-4 md:p-5 space-y-3">
            {topStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted">لا يوجد تصنيف بعد</p>
              </div>
            ) : (
              topStudents.map((student, index) => {
                const isCurrentUser = student.id === currentUser.id;
                const rank = index + 1;
                const rankLabel =
                  rank === 1 ? "الأول" : rank === 2 ? "الثاني" : rank === 3 ? "الثالث" : `${rank}`;

                return (
                  <div
                    key={student.id}
                    className={`flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 rounded-2xl border ${
                      isCurrentUser
                        ? "bg-primary border-primary text-white"
                        : "bg-surface border-line text-ink"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        rank === 1
                          ? isCurrentUser
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                          : rank <= 3
                            ? "bg-primary-soft text-primary"
                            : isCurrentUser
                              ? "bg-white/15 text-white"
                              : "bg-surface-muted text-muted"
                      }`}
                    >
                      {rank <= 3 ? (
                        <Medal className="w-5 h-5" />
                      ) : (
                        <span className="font-bold tabular-nums">{rank}</span>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-start min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3 className="font-bold text-base truncate">{student.fullName}</h3>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold bg-white text-primary px-2 py-0.5 rounded-full">
                            أنت
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium mt-1 ${isCurrentUser ? "text-white/70" : "text-muted"}`}>
                        {student.level} · {student.stream}
                      </p>
                    </div>

                    <div
                      className={`text-center px-4 py-2.5 rounded-xl w-full sm:w-auto shrink-0 ${
                        isCurrentUser ? "bg-white/10 border border-white/15" : "bg-surface-muted border border-line"
                      }`}
                    >
                      <p className={`text-[10px] font-semibold mb-0.5 ${isCurrentUser ? "text-white/60" : "text-muted"}`}>
                        المركز {rankLabel}
                      </p>
                      <p className={`font-bold text-lg tabular-nums ${isCurrentUser ? "text-white" : "text-primary"}`}>
                        {student.score}{" "}
                        <span className={`text-xs font-semibold ${isCurrentUser ? "text-white/80" : "text-ink"}`}>
                          نقطة
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
