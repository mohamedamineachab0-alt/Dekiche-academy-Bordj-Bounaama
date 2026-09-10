"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Download,
  Eye,
  Phone,
  Trophy,
  UserCheck,
  UserMinus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateStudentInsights, type AiInsightPayload } from "@/actions/admin-insights";
import type { InsightItem, Student360Data } from "@/lib/admin-analytics";
import { MathPreview } from "@/components/shared/MathPreview";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-[0_8px_24px_rgba(91,33,182,0.08)]">
      {label ? <p className="text-xs font-bold text-ink mb-1">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="text-xs font-semibold text-muted">
          {item.name}: <span className="tabular-nums text-ink">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 120;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ede9fe" strokeWidth={stroke} />
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
        <span className="text-[10px] font-semibold text-muted mt-1">التقدّم</span>
      </div>
    </div>
  );
}

function WorkList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; title: string; subjectTitle: string }[];
  empty: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-bold text-muted mb-2">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted">{empty}</p>
      ) : (
        <ul className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
          {items.map((item) => (
            <li key={item.id} className="text-sm border border-line rounded-xl px-3 py-1.5">
              <span className="font-semibold text-ink">{item.title}</span>
              <span className="text-xs text-muted block">{item.subjectTitle}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InsightCard({ item }: { item: InsightItem }) {
  return (
    <div className={`rounded-2xl border p-4 ${item.severity === "high" ? "border-red-200 bg-red-50" : "border-line bg-white"}`}>
      <p className="text-sm font-bold text-ink">{item.title}</p>
      <p className="text-sm text-muted mt-1 leading-relaxed">{item.detail}</p>
    </div>
  );
}

export function Student360Profile({
  data,
  initialAi,
  showAi = true,
  backHref = "/dashboard/admin/students/monitoring",
  backLabel = "العودة إلى مراقبة التلاميذ",
}: {
  data: Student360Data;
  initialAi: AiInsightPayload | null;
  showAi?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  const [ai, setAi] = useState<AiInsightPayload | null>(initialAi);
  const [pending, startTransition] = useTransition();

  const insights = ai?.items?.length ? ai.items : [];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <article className="surface-card p-6 lg:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
          <ProgressRing percent={data.progressPercent} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {data.isInactive ? (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                  <UserMinus className="w-3.5 h-3.5" />
                  خامل {data.daysInactive} يوماً
                </span>
              ) : (
                <span className="badge-soft text-xs">نشط</span>
              )}
              <span className="badge-outline text-xs tabular-nums">{data.loginCount} دخولاً</span>
            </div>
            <p className="text-sm text-muted">
              {data.level} · {data.stream} · {data.wilaya}
            </p>
            <p className="text-sm text-muted mt-1 font-mono" dir="ltr">{data.phone}</p>
            <p className="text-sm text-muted mt-3">
              آخر دخول:{" "}
              {data.lastLoginAt
                ? new Date(data.lastLoginAt).toLocaleString("ar-DZ")
                : "لم يُسجَّل"}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="badge-soft inline-flex items-center gap-1.5 tabular-nums">
                <Trophy className="w-4 h-4" />
                {data.totalPoints} نقطة
              </span>
              <span className="badge-outline inline-flex items-center gap-1.5 tabular-nums">
                <AlertTriangle className="w-4 h-4" />
                {data.mistakesCount} خطأ
              </span>
            </div>
          </div>
        </article>

        <article className={`surface-card p-6 ${data.guardian.linked ? "" : "border-red-200"}`}>
          <p className="text-xs font-bold text-muted mb-3">ولي الأمر</p>
          {data.guardian.linked ? (
            <span className="badge-soft inline-flex items-center gap-1 mb-3">
              <UserCheck className="w-4 h-4" />
              مربوط
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-xl text-xs font-semibold mb-3">
              غير مربوط بالحساب
            </span>
          )}
          <p className="font-bold text-ink">{data.guardian.linkedName || data.guardian.listedName}</p>
          <p className="text-sm text-muted font-mono mt-1 inline-flex items-center gap-1.5" dir="ltr">
            <Phone className="w-3.5 h-3.5" />
            {data.guardian.linkedPhone || data.guardian.listedPhone}
          </p>
          <dl className="mt-4 space-y-1.5 text-sm text-muted">
            <div className="flex justify-between gap-3">
              <dt>دخول الولي</dt>
              <dd className="tabular-nums text-ink font-semibold">
                {data.guardian.parentLastLoginAt
                  ? `منذ ${data.guardian.parentDaysSinceLogin} يوماً`
                  : data.guardian.linked
                    ? "غير متوفر"
                    : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>زيارات المتابعة</dt>
              <dd className="tabular-nums text-ink font-semibold">{data.guardian.parentReviewCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>تذاكر الولي</dt>
              <dd className="tabular-nums text-ink font-semibold">{data.guardian.tickets}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article className="surface-card p-5 md:p-6 paper-grid">
          <h2 className="text-lg font-bold text-ink">الأخطاء أسبوعياً</h2>
          <div className="h-56 mt-4 bg-white/80 rounded-xl" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyMistakes} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#6d5b8c", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#6d5b8c", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="أخطاء" fill="#5b21b6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="surface-card p-5 md:p-6 paper-grid">
          <h2 className="text-lg font-bold text-ink">التعثّر حسب المادة</h2>
          <div className="h-56 mt-4 bg-white/80 rounded-xl" dir="ltr">
            {data.mistakesBySubject.length === 0 ? (
              <p className="text-sm text-muted p-6 text-center">لا أخطاء مسجّلة.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mistakesBySubject} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                  <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#6d5b8c", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#6d5b8c", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="أخطاء" radius={[0, 8, 8, 0]}>
                    {data.mistakesBySubject.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#5b21b6" : "#6d28d9"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <article className="surface-card p-5 md:p-6 xl:col-span-3">
          <h2 className="text-lg font-bold text-ink mb-1">سجل الأخطاء والتصحيح</h2>
          <p className="text-sm text-muted mb-4">كل خطأ مع الحل المعتمد.</p>
          {data.mistakes.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">لا أخطاء بعد.</p>
          ) : (
            <div className="space-y-3 max-h-[32rem] overflow-y-auto custom-scrollbar pe-1">
              {data.mistakes.map((m) => (
                <div key={m.id} className="rounded-2xl border border-line p-4 bg-white">
                  <p className="text-xs font-semibold text-muted mb-2">
                    {m.subjectTitle} · {m.lessonTitle} · {new Date(m.createdAt).toLocaleDateString("ar-DZ")}
                  </p>
                  <p className="text-sm font-bold text-ink mb-1">الخطأ</p>
                  <div className="text-sm text-muted leading-relaxed">
                    <MathPreview text={m.mistakeContent} />
                  </div>
                  <p className="text-sm font-bold text-primary mt-3 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    التصحيح
                  </p>
                  <div className="text-sm text-ink leading-relaxed">
                    <MathPreview text={m.correctSolution} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <div className="xl:col-span-2 space-y-5">
          <article className="surface-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                {showAi ? "توصية الإدارة" : "ملاحظات للمتابعة"}
              </h2>
              {showAi ? (
                <button
                  type="button"
                  disabled={pending}
                  className="btn-ghost !py-1.5 !px-3 text-xs"
                  onClick={() => {
                    startTransition(async () => {
                      setAi(await generateStudentInsights(data.id));
                    });
                  }}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  {pending ? "جاري..." : "تحليل"}
                </button>
              ) : null}
            </div>
            {ai?.summary ? (
              <p className="text-sm font-semibold text-primary mb-3 leading-relaxed">{ai.summary}</p>
            ) : showAi ? (
              <p className="text-sm text-muted mb-3">اضغط تحليلاً لاستخراج توصيات من أخطاء التلميذ ونشاطه.</p>
            ) : null}
            <div className="space-y-3">
              {insights.map((item) => (
                <InsightCard key={item.title} item={item} />
              ))}
            </div>
          </article>

          <article className="surface-card p-5 md:p-6">
            <h2 className="text-lg font-bold text-ink mb-3">ملف العمل</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl border border-line px-2 py-3 text-center">
                <p className="text-lg font-bold text-ink tabular-nums">{data.work.unwatchedLessons.length}</p>
                <p className="text-[11px] text-muted mt-0.5">دروس بلا مشاهدة</p>
              </div>
              <div className="rounded-xl border border-line px-2 py-3 text-center">
                <p className="text-lg font-bold text-ink tabular-nums">{data.work.unsolvedExercises.length}</p>
                <p className="text-[11px] text-muted mt-0.5">تمارين معلّقة</p>
              </div>
              <div className="rounded-xl border border-line px-2 py-3 text-center">
                <p className="text-lg font-bold text-ink tabular-nums">{data.work.unsolvedLessonQuizzes.length}</p>
                <p className="text-[11px] text-muted mt-0.5">كويز بلا حل</p>
              </div>
            </div>
            <WorkList title="دروس لم يشاهدها" items={data.work.unwatchedLessons} empty="شاهد كل الدروس المتاحة." />
            <WorkList title="تمارين لم يحلّها" items={data.work.unsolvedExercises} empty="حلّ كل التمارين المتاحة." />
            <WorkList title="اختبارات دروس معلّقة" items={data.work.unsolvedLessonQuizzes} empty="أنجز كل اختبارات الدروس." />
          </article>

          <article className="surface-card p-5 md:p-6">
            <h2 className="text-lg font-bold text-ink mb-3">المواد المفعّلة</h2>
            {data.enrolledSubjects.length === 0 ? (
              <p className="text-sm text-muted">لا اشتراكات.</p>
            ) : (
              <ul className="space-y-2">
                {data.enrolledSubjects.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3 text-sm border border-line rounded-xl px-3 py-2">
                    <span className="font-semibold text-ink">{s.title}</span>
                    <span className="tabular-nums text-muted">{s.months} شهراً</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article id="files" className="surface-card p-5 md:p-6">
            <h2 className="text-lg font-bold text-ink mb-1">ملفات الإجابات</h2>
            <p className="text-sm text-muted mb-4">أوراق الاختبار المرسلة مع العلامة.</p>
            {data.submissions.length === 0 ? (
              <p className="text-sm text-muted">لا ملفات مرسلة.</p>
            ) : (
              <ul className="space-y-3">
                {data.submissions.map((s) => (
                  <li key={s.id} className="border border-line rounded-xl overflow-hidden">
                    <a href={s.imageUrl} target="_blank" rel="noreferrer" className="block bg-primary-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.imageUrl}
                        alt={s.examTitle}
                        className="w-full h-40 object-cover object-top"
                      />
                    </a>
                    <div className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink text-sm truncate">{s.examTitle}</p>
                        <p className="text-xs text-muted tabular-nums mt-0.5">
                          {s.score === null ? "بدون علامة" : `${s.score}/20`} · {new Date(s.createdAt).toLocaleDateString("ar-DZ")}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <a href={`${s.imageUrl}?preview=true`} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-line hover:bg-primary-soft" title="عرض">
                          <Eye className="w-4 h-4 text-primary" />
                        </a>
                        <a href={s.imageUrl} download className="p-2 rounded-lg border border-line hover:bg-primary-soft" title="تنزيل">
                          <Download className="w-4 h-4 text-primary" />
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <p className="text-center">
        <Link href={backHref} className="text-sm font-semibold text-primary">
          {backLabel}
        </Link>
      </p>
    </div>
  );
}
