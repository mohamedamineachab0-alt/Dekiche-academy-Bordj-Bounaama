"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  Key,
  UserMinus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generatePlatformInsights, type AiInsightPayload } from "@/actions/admin-insights";
import type { AdminAnalyticsHubData, InsightItem } from "@/lib/admin-analytics";

const PURPLE = ["#5b21b6", "#6d28d9", "#4c1d95", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

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
      {label ? <p className="text-xs font-bold text-ink mb-1.5">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="text-xs font-semibold text-muted">
          {item.name}: <span className="tabular-nums text-ink">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

function InsightCard({ item }: { item: InsightItem }) {
  const body = (
    <>
      <p className="text-sm font-bold text-ink">{item.title}</p>
      <p className="text-sm text-muted mt-1 leading-relaxed">{item.detail}</p>
    </>
  );
  const cls =
    item.severity === "high"
      ? "border-red-200 bg-red-50"
      : "border-line bg-white";
  if (item.href) {
    return (
      <Link href={item.href} className={`block rounded-2xl border p-4 hover:border-primary-mid transition-colors ${cls}`}>
        {body}
      </Link>
    );
  }
  return <div className={`rounded-2xl border p-4 ${cls}`}>{body}</div>;
}

export function AdminAnalyticsHub({
  data,
  initialAi,
}: {
  data: AdminAnalyticsHubData;
  initialAi: AiInsightPayload | null;
}) {
  const [ai, setAi] = useState<AiInsightPayload | null>(initialAi);
  const [pending, startTransition] = useTransition();

  const refreshAi = () => {
    startTransition(async () => {
      const result = await generatePlatformInsights();
      setAi(result);
    });
  };

  const insights = ai?.items?.length ? ai.items : data.heuristicInsights;

  const kpis = [
    { label: "التلاميذ", value: data.kpis.students, icon: Users, href: "/dashboard/admin/students/monitoring" },
    { label: "خمول 5 أيام", value: data.kpis.inactiveStudents, icon: UserMinus, href: "#inactive" },
    { label: "الأخطاء", value: data.kpis.mistakes, icon: AlertTriangle, href: "/dashboard/admin/mistakes" },
    { label: "المواد المنشورة", value: data.kpis.publishedSubjects, icon: BookOpen, href: "/dashboard/admin/subjects" },
    { label: "أولياء غير مربوطين", value: data.kpis.unlinkedParents, icon: AlertTriangle, href: "/dashboard/admin/parents" },
    { label: "رموز مستعملة", value: data.kpis.usedCodes, icon: Key, href: "/dashboard/admin/codes?status=used" },
    { label: "رموز غير مستخدمة", value: data.kpis.unusedCodes, icon: Key, href: "/dashboard/admin/codes?status=unused" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="surface-card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted">{stat.label}</p>
                <Icon className="w-4 h-4 text-primary-mid shrink-0" />
              </div>
              <p className="text-2xl font-bold text-ink tabular-nums leading-none">{stat.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <article className="surface-card p-5 md:p-6 xl:col-span-2 paper-grid">
          <h2 className="text-lg font-bold text-ink">نشاط 14 يوماً</h2>
          <p className="text-sm text-muted mt-1 mb-4">الأخطاء المرصودة وإجابات الاختبارات.</p>
          <div className="h-64 w-full bg-white/80 rounded-xl" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyActivity} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminMistakesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b21b6" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#5b21b6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="adminSubsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#6d5b8c", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#6d5b8c", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="submissions" name="إجابات" stroke="#6d28d9" strokeWidth={2} fill="url(#adminSubsFill)" />
                <Area type="monotone" dataKey="mistakes" name="أخطاء" stroke="#5b21b6" strokeWidth={2.25} fill="url(#adminMistakesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface-card p-5 md:p-6">
          <h2 className="text-lg font-bold text-ink">ربط الأولياء</h2>
          <p className="text-sm text-muted mt-1 mb-4">نسبة الحسابات المرتبطة بولي أمر.</p>
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.parentLinkSplit} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {data.parentLinkSplit.map((entry, i) => (
                    <Cell key={entry.name} fill={i === 0 ? "#5b21b6" : "#c4b5fd"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted justify-center">
            {data.parentLinkSplit.map((row, i) => (
              <span key={row.name} className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? "#5b21b6" : "#c4b5fd" }} />
                {row.name} ({row.value})
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article className="surface-card p-5 md:p-6 paper-grid">
          <h2 className="text-lg font-bold text-ink">الأخطاء حسب المادة</h2>
          <p className="text-sm text-muted mt-1 mb-4">أين يتعثّر التلاميذ أكثر.</p>
          <div className="h-64 bg-white/80 rounded-xl" dir="ltr">
            {data.mistakesBySubject.length === 0 ? (
              <p className="text-sm text-muted p-6 text-center">لا أخطاء مسجّلة بعد.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mistakesBySubject} margin={{ top: 8, right: 8, left: -12, bottom: 24 }}>
                  <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#6d5b8c", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" }} interval={0} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#6d5b8c", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="أخطاء" radius={[8, 8, 0, 0]}>
                    {data.mistakesBySubject.map((_, i) => (
                      <Cell key={i} fill={PURPLE[i % PURPLE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="surface-card p-5 md:p-6 paper-grid">
          <h2 className="text-lg font-bold text-ink">التلاميذ حسب المستوى</h2>
          <p className="text-sm text-muted mt-1 mb-4">توزيع القاعدة الطلابية.</p>
          <div className="h-64 bg-white/80 rounded-xl" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentsByLevel} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid stroke="#ddd6fe" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#6d5b8c", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#6d5b8c", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="تلاميذ" fill="#5b21b6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <article id="inactive" className="surface-card p-5 md:p-6 xl:col-span-3">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-ink">تنبيه الخمول</h2>
              <p className="text-sm text-muted mt-1">
                يُعلَّم تلقائياً كل تلميذ لم يسجّل دخولاً منذ {data.inactiveDays} أيام متتالية.
              </p>
            </div>
            <span className="icon-tile">
              <Activity className="w-5 h-5" />
            </span>
          </div>

          {data.inactiveStudents.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">لا يوجد تلاميذ خاملون ضمن هذه العتبة.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>التلميذ</th>
                    <th>أيام الانقطاع</th>
                    <th>الولي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.inactiveStudents.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <p className="font-semibold text-ink">{row.fullName}</p>
                        <p className="text-xs text-muted">{row.level} · {row.stream}</p>
                      </td>
                      <td>
                        <span className="inline-flex bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums">
                          {row.daysInactive} يوماً
                        </span>
                      </td>
                      <td>
                        <p className="text-sm font-semibold text-ink">{row.parentName}</p>
                        <p className="text-xs text-muted font-mono" dir="ltr">{row.parentPhone}</p>
                      </td>
                      <td>
                        <Link href={`/dashboard/admin/students/${row.id}`} className="btn-ghost !py-1.5 !px-3 text-xs">
                          الملف
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="surface-card p-5 md:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                رؤى الإدارة
              </h2>
              <p className="text-sm text-muted mt-1">توصيات عملية من مؤشرات المنصة{ai?.source === "ai" ? " والذكاء الاصطناعي" : ""}.</p>
            </div>
            <button type="button" onClick={refreshAi} disabled={pending} className="btn-ghost !py-1.5 !px-3 text-xs shrink-0">
              <BrainCircuit className="w-3.5 h-3.5" />
              {pending ? "جاري التحليل..." : "تحليل"}
            </button>
          </div>
          {ai?.summary ? <p className="text-sm font-semibold text-primary mb-3 leading-relaxed">{ai.summary}</p> : null}
          <div className="space-y-3">
            {insights.map((item) => (
              <InsightCard key={`${item.title}-${item.detail.slice(0, 12)}`} item={item} />
            ))}
          </div>
        </article>
      </section>

      <section>
        <article className="surface-card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-ink">جميع التلاميذ</h2>
              <p className="text-sm text-muted mt-1">
                {data.allStudents.length} تلميذاً مسجّلاً على المنصة.
              </p>
            </div>
            <Link href="/dashboard/admin/students/monitoring" className="btn-ghost !py-1.5 !px-3 text-xs">
              المراقبة التفصيلية
            </Link>
          </div>
          {data.allStudents.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">لا يوجد تلاميذ بعد.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar max-h-[32rem]">
              <table className="w-full data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>التلميذ</th>
                    <th>الهاتف</th>
                    <th>الحالة</th>
                    <th>النقاط</th>
                    <th>الولي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.allStudents.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/dashboard/admin/students/${row.id}`} className="font-semibold text-ink hover:text-primary">
                          {row.fullName}
                        </Link>
                        <p className="text-xs text-muted">{row.level} · {row.stream}</p>
                      </td>
                      <td>
                        <span className="text-xs font-mono text-muted" dir="ltr">{row.phone}</span>
                      </td>
                      <td>
                        {row.isInactive ? (
                          <span className="inline-flex bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums">
                            خامل {row.daysInactive} يوماً
                          </span>
                        ) : (
                          <span className="badge-soft text-xs">نشط</span>
                        )}
                      </td>
                      <td className="tabular-nums font-semibold text-ink">{row.totalPoints}</td>
                      <td>
                        <p className="text-sm font-semibold text-ink">{row.parentName}</p>
                        <p className="text-xs text-muted font-mono" dir="ltr">{row.parentPhone}</p>
                      </td>
                      <td>
                        <Link href={`/dashboard/admin/students/${row.id}`} className="btn-ghost !py-1.5 !px-3 text-xs">
                          الملف
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
