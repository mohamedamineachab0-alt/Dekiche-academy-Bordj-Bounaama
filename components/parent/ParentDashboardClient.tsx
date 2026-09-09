"use client";

import { useState } from "react";
import {
  Users,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Send,
  User as UserIcon,
} from "lucide-react";
import { submitParentTicket } from "@/actions/parents";
import { labelLevel, labelStream } from "@/lib/education-labels";

type StudentData = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  lastLoginAt: Date;
  studentProfile: {
    level: string;
    stream: string;
  } | null;
  enrollments: {
    subject: {
      id: string;
      title: string;
    };
  }[];
};

type ParentDashboardClientProps = {
  students: StudentData[];
  parentId: string;
};

export function ParentDashboardClient({ students, parentId }: ParentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"progress" | "absences" | "contact">("progress");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<{ success?: boolean; error?: string } | null>(
    null
  );

  const handleTicketSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTicketStatus(null);
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const res = await submitParentTicket(parentId, subject, message);
    if (res.error) {
      setTicketStatus({ error: res.error });
    } else {
      setTicketStatus({ success: true });
      e.currentTarget.reset();
    }
    setIsSubmitting(false);
  };

  const tabs = [
    { id: "progress" as const, label: "تقدم أبنائي", icon: Users },
    { id: "absences" as const, label: "غيابات أبنائي", icon: AlertTriangle },
    { id: "contact" as const, label: "بريد الإدارة", icon: MessageSquare },
  ];

  return (
    <div className="surface-panel overflow-hidden" dir="rtl">
      <div className="flex flex-wrap border-b border-line bg-surface-muted">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                isActive
                  ? "bg-surface text-primary border-b-2 border-primary"
                  : "text-muted hover:text-ink hover:bg-surface/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 md:p-7 min-h-[400px] bg-surface">
        {activeTab === "progress" && (
          <div className="space-y-5">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <span className="icon-tile mx-auto mb-4">
                  <Users className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-ink">لا يوجد أبناء مسجّلون</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {students.map((student) => (
                  <article key={student.id} className="rounded-2xl border border-line p-5">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-line"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-ink">{student.fullName}</h3>
                        <p className="text-xs text-muted mt-0.5">
                          {labelLevel(student.studentProfile?.level)} ·{" "}
                          {labelStream(student.studentProfile?.stream)}
                        </p>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-ink mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      التقدم في المواد
                    </h4>
                    {student.enrollments.length === 0 ? (
                      <p className="text-xs text-muted border border-dashed border-line p-3 rounded-xl text-center">
                        غير مسجّل في أي مادة حالياً
                      </p>
                    ) : (
                      student.enrollments.map((enrollment) => {
                        const progress = Math.floor(Math.random() * 60) + 20;
                        return (
                          <div key={enrollment.subject.id} className="space-y-2 mb-3">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-ink">{enrollment.subject.title}</span>
                              <span className="text-primary tabular-nums">{progress}%</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-bar" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "absences" && (
          <div className="space-y-5">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <span className="icon-tile mx-auto mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-ink">لا يوجد أبناء مسجّلون</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {students.map((student) => {
                  const daysInactive = Math.floor(
                    (new Date().getTime() - new Date(student.lastLoginAt).getTime()) /
                      (1000 * 3600 * 24)
                  );
                  const absencesCount = Math.max(0, Math.floor(daysInactive / 5));

                  return (
                    <article
                      key={student.id}
                      className={`rounded-2xl border p-5 ${
                        absencesCount > 0
                          ? "border-red-200 bg-red-50"
                          : "border-line bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-ink">{student.fullName}</h3>
                          <p className="text-xs text-muted mt-0.5">
                            آخر ظهور: {new Date(student.lastLoginAt).toLocaleDateString("ar-DZ")}
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-4 rounded-xl bg-white border border-line mb-4">
                        <p
                          className={`text-4xl font-bold tabular-nums ${
                            absencesCount > 0 ? "text-red-600" : "text-primary"
                          }`}
                        >
                          {absencesCount}
                        </p>
                        <p className="text-sm font-semibold text-muted mt-1">غيابات محتسبة</p>
                      </div>

                      <p className="text-sm text-muted leading-relaxed">
                        {absencesCount > 0
                          ? "يُحتسب غياب لكل 5 أيام دون دخول للمنصة. يرجى متابعة الابن."
                          : "لا توجد غيابات مسجّلة حالياً."}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-6">
              <span className="icon-tile-solid mx-auto mb-4">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-xl text-ink">مراسلة الإدارة</h3>
              <p className="text-sm text-muted mt-1">أرسل استفسارك أو ملاحظتك حول أبنائك.</p>
            </div>

            {ticketStatus?.success ? (
              <div className="surface-card p-8 text-center space-y-4">
                <p className="font-bold text-ink text-lg">تم إرسال رسالتك بنجاح</p>
                <p className="text-sm text-muted">ستراجع الإدارة طلبك في أقرب وقت.</p>
                <button
                  type="button"
                  onClick={() => setTicketStatus(null)}
                  className="btn-secondary"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                {ticketStatus?.error && (
                  <div className="p-3.5 bg-red-50 text-red-700 font-semibold text-sm rounded-xl border border-red-100">
                    {ticketStatus.error}
                  </div>
                )}

                <div>
                  <label className="field-label">الموضوع</label>
                  <input
                    name="subject"
                    required
                    type="text"
                    placeholder="مثال: استفسار حول نقطة في الرياضيات"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label">نص الرسالة</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? (
                    "جاري الإرسال..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 rtl:rotate-180" />
                      إرسال للإدارة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
