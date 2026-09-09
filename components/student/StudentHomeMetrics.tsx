"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Clock3,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { formatWatchDuration, watchSecondsStorageKey } from "@/lib/watch-time";

export type WeeklyPoint = {
  day: string;
  mistakes: number;
  submissions: number;
};

export type SubjectProgress = {
  subjectId: string;
  subjectTitle: string;
  total: number;
  completedCount: number;
  percent: number;
  completedLessons: { lessonId: string; lessonTitle: string }[];
};

export type StudentHomeMetricsProps = {
  userId: string;
  mistakesCount: number;
  weeklyActivity: WeeklyPoint[];
  subjectProgress?: SubjectProgress[];
};

function ProgressRing({ percent, size = 112 }: { percent: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ede9fe"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#5b21b6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-ink tabular-nums leading-none">{clamped}%</span>
        <span className="text-[0.65rem] font-semibold text-muted mt-1">مكتمل</span>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-[0_8px_24px_rgba(91,33,182,0.08)]">
      <p className="text-xs font-bold text-ink mb-1.5">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-xs font-semibold text-muted">
          {item.name}: <span className="tabular-nums text-ink">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

export function StudentHomeMetrics({
  userId,
  mistakesCount,
  weeklyActivity,
  subjectProgress = [],
}: StudentHomeMetricsProps) {
  const [watchSeconds] = useLocalStorage(watchSecondsStorageKey(userId), 0);
  const watch = formatWatchDuration(typeof watchSeconds === "number" ? watchSeconds : Number(watchSeconds) || 0);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink mb-4">نسبة الدروس المكتملة</h2>
        {subjectProgress.length === 0 ? (
          <div className="surface-card px-5 py-10 text-center">
            <p className="text-sm text-muted">فعّل مادة لبدء احتساب تقدّمك في كل مقرّر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subjectProgress.map((subject) => (
              <article key={subject.subjectId} className="surface-card p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <ProgressRing percent={subject.percent} />
                  <div className="min-w-0">
                    <p className="rule-label mb-2">
                      <TrendingUp className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
                      المادة
                    </p>
                    <h3 className="text-base font-bold text-ink leading-snug line-clamp-2">
                      {subject.subjectTitle}
                    </h3>
                    <p className="text-sm text-muted mt-1.5">
                      {subject.total > 0
                        ? `أكملت ${subject.completedCount} من ${subject.total} درساً.`
                        : "لا دروس في هذه المادة بعد."}
                    </p>
                    <div className="progress-track mt-3">
                      <div className="progress-bar" style={{ width: `${subject.percent}%` }} />
                    </div>
                  </div>
                </div>

                {subject.completedLessons.length > 0 ? (
                  <ul className="space-y-1.5 pt-3 border-t border-line">
                    {subject.completedLessons.map((lesson) => (
                      <li key={lesson.lessonId}>
                        <Link
                          href={`/dashboard/student/lessons/${lesson.lessonId}`}
                          className="flex items-start gap-2 rounded-xl px-2 py-1.5 -mx-2 hover:bg-surface-muted min-w-0"
                        >
                          <span className="icon-tile !w-7 !h-7 shrink-0 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-sm font-semibold text-ink leading-snug line-clamp-2">
                            {lesson.lessonTitle}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted pt-3 border-t border-line">
                    لم تُسجّل مشاهدة أي درس في هذه المادة.
                  </p>
                )}

                <Link
                  href={`/dashboard/student/subjects/${subject.subjectId}/lessons`}
                  className="text-sm font-semibold text-primary mt-auto"
                >
                  دروس المادة
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <article className="surface-card p-6 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-6">
            <p className="rule-label">
              <Clock3 className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
              مدة مشاهدة الدروس
            </p>
            <span className="icon-tile !w-11 !h-11">
              <Clock3 className="w-[18px] h-[18px]" />
            </span>
          </div>
          <p className="text-[clamp(1.8rem,3vw,2.35rem)] font-bold text-ink tabular-nums leading-none">
            {watch.label}
          </p>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            تُحتسب أثناء فتح صفحة الدرس ومشاهدة الفيديو.
          </p>
        </article>

        <Link
          href="/dashboard/student/mistakes"
          className="surface-card-interactive p-6 flex flex-col md:col-span-2 xl:col-span-1"
        >
          <div className="flex items-start justify-between gap-3 mb-6">
            <p className="rule-label">
              <AlertTriangle className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
              الأخطاء
            </p>
            <span className="icon-tile !w-11 !h-11">
              <AlertTriangle className="w-[18px] h-[18px]" />
            </span>
          </div>
          <p className="text-[clamp(1.8rem,3vw,2.35rem)] font-bold text-ink tabular-nums leading-none">
            {mistakesCount}
          </p>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            أخطاء مسجّلة في الاختبارات والتمارين.
          </p>
        </Link>
      </div>

      <article className="surface-card p-6 md:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">رسومات بيانية وإحصائيات</h2>
          <p className="text-sm text-muted mt-1">نشاطك خلال الأيام السبعة الأخيرة: الأخطاء والإجابات المرسلة.</p>
        </div>

        <div className="h-64 md:h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyActivity} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="mistakesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b21b6" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#5b21b6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="submissionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6d5b8c", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#6d5b8c", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="submissions"
                name="إجابات"
                stroke="#6d28d9"
                strokeWidth={2}
                fill="url(#submissionsFill)"
              />
              <Area
                type="monotone"
                dataKey="mistakes"
                name="أخطاء"
                stroke="#5b21b6"
                strokeWidth={2.25}
                fill="url(#mistakesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            الأخطاء
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-mid" />
            الإجابات المرسلة
          </span>
        </div>
      </article>
    </section>
  );
}
