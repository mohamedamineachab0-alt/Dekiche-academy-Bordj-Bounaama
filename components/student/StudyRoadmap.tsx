import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle, FileText, Lock, Map, Video } from "lucide-react";
import type { RoadmapNode, SubjectRoadmap } from "@/actions/roadmap";

function typeMeta(type: RoadmapNode["type"]) {
  switch (type) {
    case "LESSON":
      return { label: "درس", Icon: BookOpen };
    case "EXAM":
      return { label: "اختبار", Icon: FileText };
    case "DAILY_EXERCISE":
      return { label: "تمرين", Icon: CheckCircle };
    case "LIVE_CLASS":
      return { label: "حصة مباشرة", Icon: Video };
  }
}

function cleanTitle(node: RoadmapNode) {
  return node.title.replace(/^(درس|اختبار|تمرين|مباشر):\s*/, "");
}

function statusLabel(node: RoadmapNode) {
  if (node.status === "COMPLETED" && node.score !== undefined) return `${node.score}/20`;
  if (node.status === "COMPLETED") return "أُنجز";
  if (node.status === "NEEDS_REVIEW") return "راجع";
  return "بانتظارك";
}

function isMonthUnlocked(roadmap: SubjectRoadmap, month: number) {
  return roadmap.enrolledMonths.includes(month);
}

function findNextStep(roadmap: SubjectRoadmap): RoadmapNode | null {
  const nodes = roadmap.months
    .filter((month) => isMonthUnlocked(roadmap, month.month))
    .flatMap((month) => month.nodes);
  return (
    nodes.find((node) => node.status === "NEEDS_REVIEW")
    || nodes.find((node) => node.status === "PENDING")
    || null
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const deg = Math.min(100, Math.max(0, percent)) * 3.6;
  return (
    <div
      className="w-[4.25rem] h-[4.25rem] rounded-full grid place-items-center shrink-0"
      style={{
        background: `conic-gradient(var(--primary) ${deg}deg, var(--primary-soft) 0deg)`,
      }}
      aria-label={`التقدّم ${percent} بالمئة`}
    >
      <div className="w-14 h-14 rounded-full bg-white grid place-items-center">
        <span className="text-sm font-bold text-primary tabular-nums">{percent}٪</span>
      </div>
    </div>
  );
}

function MonthStations({
  roadmap,
  currentMonth,
}: {
  roadmap: SubjectRoadmap;
  currentMonth: number | null;
}) {
  if (roadmap.months.length === 0) return null;

  return (
    <ol className="flex items-center gap-0 overflow-x-auto pb-1">
      {roadmap.months.map((monthData, index) => {
        const unlocked = isMonthUnlocked(roadmap, monthData.month);
        const done = monthData.nodes.length > 0
          && monthData.nodes.every((node) => node.status === "COMPLETED");
        const current = currentMonth === monthData.month;

        return (
          <li key={monthData.month} className="flex items-center min-w-0">
            {index > 0 && (
              <span
                className={`w-8 sm:w-12 h-px ${done || unlocked ? "bg-primary/40" : "bg-line"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold border shrink-0 ${
                done
                  ? "bg-primary text-white border-primary"
                  : current
                    ? "bg-white text-primary border-primary"
                    : unlocked
                      ? "bg-primary-soft text-primary border-transparent"
                      : "bg-surface-muted text-muted border-line"
              }`}
              title={`الشهر ${monthData.month}`}
            >
              {done ? "✓" : monthData.month}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function NodeCard({
  node,
  index,
  isNext,
  locked,
}: {
  node: RoadmapNode;
  index: number;
  isNext: boolean;
  locked: boolean;
}) {
  const { label, Icon } = typeMeta(node.type);
  const done = node.status === "COMPLETED";
  const review = node.status === "NEEDS_REVIEW";

  const body = (
    <>
      <div className="flex flex-col items-center shrink-0">
        <span
          className={`w-10 h-10 rounded-full grid place-items-center text-sm font-bold border ${
            locked
              ? "bg-surface-muted text-muted border-line"
              : done
                ? "bg-primary text-white border-primary"
                : review || isNext
                  ? "bg-white text-primary border-primary"
                  : "bg-surface-muted text-muted border-line"
          }`}
        >
          {locked ? <Lock className="w-4 h-4" /> : done ? "✓" : index}
        </span>
      </div>

      <article
        className={`flex-1 surface-card-interactive p-4 ${
          isNext ? "border-primary shadow-[0_12px_32px_rgba(91,33,182,0.14)]" : ""
        } ${locked ? "opacity-70" : ""}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
          <span
            className={`text-xs font-bold rounded-full px-2.5 py-1 ${
              locked
                ? "bg-surface-muted text-muted"
                : done
                  ? "bg-primary text-white"
                  : review || isNext
                    ? "bg-primary-soft text-primary"
                    : "bg-surface-muted text-muted"
            }`}
          >
            {locked ? "مغلق" : isNext && !done ? "الخطوة التالية" : statusLabel(node)}
          </span>
        </div>
        <h4 className="text-sm font-bold text-ink leading-relaxed line-clamp-2 mb-3">
          {cleanTitle(node)}
        </h4>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted group-hover:text-primary">
          {locked ? "فعّل الشهر لفتح هذه الخطوة" : "افتح الخطوة"}
          {!locked && (
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          )}
        </p>
      </article>
    </>
  );

  const className = `relative flex gap-4 group ${isNext ? "z-[1]" : ""}`;

  if (locked) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link href={node.href} className={className}>
      {body}
    </Link>
  );
}

export function StudyRoadmap({ roadmaps }: { roadmaps: SubjectRoadmap[] }) {
  if (roadmaps.length === 0) {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <span className="icon-tile mx-auto mb-5">
          <Map className="w-5 h-5" />
        </span>
        <h3 className="text-lg font-bold text-ink mb-2">مسارك لم يبدأ بعد</h3>
        <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed mb-6">
          فعّل مادة برمز الاشتراك، فيظهر هنا طريق دراستك شهراً بشهر.
        </p>
        <Link href="/dashboard/student/subjects" className="btn-primary">
          اذهب إلى المواد
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {roadmaps.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="المواد">
          {roadmaps.map((roadmap) => (
            <a
              key={roadmap.subjectId}
              href={`#subject-${roadmap.subjectId}`}
              className="badge-soft hover:bg-primary hover:text-white transition-colors"
            >
              {roadmap.subjectTitle}
            </a>
          ))}
        </nav>
      )}

      {roadmaps.map((roadmap) => {
        const unlockedNodes = roadmap.months
          .filter((month) => isMonthUnlocked(roadmap, month.month))
          .flatMap((month) => month.nodes);
        const completed = unlockedNodes.filter((node) => node.status === "COMPLETED").length;
        const percent = unlockedNodes.length > 0
          ? Math.round((completed / unlockedNodes.length) * 100)
          : 0;
        const next = findNextStep(roadmap);
        const lockedMonthCount = roadmap.months.filter(
          (month) => !isMonthUnlocked(roadmap, month.month)
        ).length;
        const currentMonth = next
          ? roadmap.months.find((month) => month.nodes.some((node) => node.id === next.id))?.month
            ?? null
          : null;
        let step = 0;

        return (
          <section
            id={`subject-${roadmap.subjectId}`}
            key={roadmap.subjectId}
            className="surface-panel overflow-hidden scroll-mt-24"
          >
            <div className="p-6 md:p-7 border-b border-line bg-primary-soft/40">
              <div className="flex items-center gap-4 mb-5">
                <ProgressRing percent={percent} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary mb-1">مسار المادة</p>
                  <h2 className="text-xl font-bold text-ink truncate">{roadmap.subjectTitle}</h2>
                  <p className="text-sm text-muted mt-1">
                    أتممت {completed} من {unlockedNodes.length} خطوة مفتوحة
                    {lockedMonthCount > 0 ? ` · ${lockedMonthCount} شهر غير مفعّل` : ""}
                  </p>
                </div>
              </div>
              <MonthStations roadmap={roadmap} currentMonth={currentMonth} />
            </div>

            {next && (
              <div className="px-6 md:px-7 pt-6">
                <Link
                  href={next.href}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-hero text-white px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white/80 mb-1">خطوتك التالية</p>
                    <p className="font-bold truncate">{cleanTitle(next)}</p>
                  </div>
                  <span className="btn-primary shrink-0 !py-2 !px-4 !text-xs">ابدأ</span>
                </Link>
              </div>
            )}

            <div className="p-6 md:p-7 space-y-10">
              {roadmap.months.length === 0 ? (
                <p className="text-center text-sm text-muted py-8">لا يوجد محتوى في هذه المادة بعد.</p>
              ) : (
                roadmap.months.map((monthData) => {
                  const unlocked = isMonthUnlocked(roadmap, monthData.month);

                  return (
                    <div key={monthData.month}>
                      <div className="flex items-center gap-3 mb-5">
                        <span className={unlocked ? "badge-soft" : "badge-outline"}>
                          الشهر {monthData.month}
                        </span>
                        <span className="h-px flex-1 bg-line" />
                        <span className="text-xs font-semibold text-muted">
                          {unlocked
                            ? `${monthData.nodes.filter((node) => node.status === "COMPLETED").length}/${monthData.nodes.length}`
                            : "مغلق"}
                        </span>
                      </div>

                      <div className="relative space-y-4 pr-1">
                        <span
                          className="absolute top-5 bottom-5 right-[19px] w-px bg-line"
                          aria-hidden="true"
                        />
                        {monthData.nodes.map((node) => {
                          step += 1;
                          return (
                            <NodeCard
                              key={node.id}
                              node={node}
                              index={step}
                              isNext={next?.id === node.id}
                              locked={!unlocked}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
