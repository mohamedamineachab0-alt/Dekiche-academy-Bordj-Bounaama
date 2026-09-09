import { Reveal } from "@/components/shared/Reveal";

type TopStudent = {
  id: string;
  name: string;
  points: number;
};

export function LeaderboardSection({
  totalStudents,
  totalParents,
  topStudents,
}: {
  totalStudents: number;
  totalParents: number;
  topStudents: TopStudent[];
}) {
  const ranked = topStudents.filter((s) => s.points > 0).slice(0, 5);

  return (
    <section className="py-14 md:py-16 border-y border-line bg-surface">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Counts as a divided strip, not boxes */}
          <div className="lg:col-span-5">
            <Reveal delay={60} direction="up">
              <div className="stat-strip grid grid-cols-2">
                <div className="pe-6">
                  <p className="text-sm text-muted mb-2">تلميذ مسجّل</p>
                  <p className="display-title text-[2.75rem] tabular-nums">
                    {totalStudents.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="ps-6">
                  <p className="text-sm text-muted mb-2">وليّ أمر مرتبط</p>
                  <p className="display-title text-[2.75rem] tabular-nums">
                    {totalParents.toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Ranking as a ruled list */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={140} direction="up">
              <p className="rule-label mb-5">
                <span className="shrink-0">أعلى النقاط</span>
              </p>

              {ranked.length === 0 ? (
                <p className="text-sm text-muted leading-relaxed">
                  لم تُسجّل نقاط بعد. تُحتسب النقاط من التمارين اليومية والاختبارات.
                </p>
              ) : (
                <ol className="ledger">
                  {ranked.map((student, index) => (
                    <li key={student.id} className="ledger-row">
                      <span className="numeral text-2xl w-7 shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-[0.95rem] font-medium text-ink truncate">
                        {student.name}
                      </span>
                      <span className="text-sm text-muted tabular-nums shrink-0">
                        {student.points} نقطة
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
