"use client";

import { useState } from "react";
import { Search, MessageSquare, Send, X, User } from "lucide-react";
import { sendDirectNotification } from "@/actions/admin-parents";
import { labelLevel, labelStream } from "@/lib/education-labels";

type StudentData = {
  id: string;
  fullName: string;
  level: string | undefined;
  stream: string | undefined;
  parent: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
};

type ParentsTableClientProps = {
  students: StudentData[];
};

export function ParentsTableClient({ students }: ParentsTableClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState<{
    id: string;
    fullName: string;
    studentName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.includes(searchTerm) ||
      (student.parent && student.parent.fullName.includes(searchTerm)) ||
      (student.parent && student.parent.phoneNumber.includes(searchTerm))
  );

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedParent) return;

    setIsSubmitting(true);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const res = await sendDirectNotification(selectedParent.id, title, content);
    if (res.error) {
      setStatus({ error: res.error });
    } else {
      setStatus({ success: true });
      setTimeout(() => {
        setSelectedParent(null);
        setStatus(null);
      }, 2000);
    }
    setIsSubmitting(false);
  };

  return (
    <div dir="rtl">
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="ابحث عن تلميذ أو ولي أو رقم هاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pr-12"
        />
        <Search className="w-5 h-5 text-muted absolute top-1/2 -translate-y-1/2 right-4" />
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full data-table min-w-[720px]">
            <thead>
              <tr>
                <th>اسم التلميذ</th>
                <th>المستوى والشعبة</th>
                <th>معلومات الولي</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-muted">
                    لا توجد نتائج مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-ink">{student.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink">{labelLevel(student.level)}</span>
                        <span className="text-xs text-muted">{labelStream(student.stream)}</span>
                      </div>
                    </td>
                    <td>
                      {student.parent ? (
                        <div className="flex flex-col">
                          <span className="text-ink font-semibold">{student.parent.fullName}</span>
                          <span className="text-xs text-muted font-mono" dir="ltr">
                            {student.parent.phoneNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-700 text-xs font-semibold bg-red-50 px-3 py-1 rounded-full">
                          غير مربوط بولي
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {student.parent ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedParent({
                              id: student.parent!.id,
                              fullName: student.parent!.fullName,
                              studentName: student.fullName,
                            })
                          }
                          className="btn-primary"
                        >
                          <MessageSquare className="w-4 h-4" />
                          مراسلة الولي
                        </button>
                      ) : (
                        <button type="button" disabled className="btn-ghost opacity-40 cursor-not-allowed">
                          <MessageSquare className="w-4 h-4" />
                          مراسلة الولي
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-[1.75rem] w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-line flex items-center justify-between bg-surface-muted">
              <div>
                <h3 className="font-bold text-xl text-ink">رسالة جديدة</h3>
                <p className="text-sm text-muted mt-1">
                  إلى: <span className="text-ink font-semibold">{selectedParent.fullName}</span> (ولي التلميذ{" "}
                  {selectedParent.studentName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParent(null)}
                className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink hover:bg-red-50 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-surface">
              {status?.success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-ink text-xl">تم إرسال الرسالة بنجاح</h4>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-5">
                  {status?.error && (
                    <div className="p-4 bg-red-50 text-red-700 font-semibold text-sm rounded-xl text-center">
                      {status.error}
                    </div>
                  )}

                  <div>
                    <label className="field-label">عنوان الإشعار</label>
                    <input
                      name="title"
                      required
                      type="text"
                      placeholder="مثال: تنبيه بخصوص الغياب"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="field-label">نص الرسالة</label>
                    <textarea
                      name="content"
                      required
                      rows={5}
                      placeholder="اكتب رسالتك لولي الأمر هنا..."
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedParent(null)} className="btn-ghost">
                      إلغاء
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                      {isSubmitting ? (
                        "جاري الإرسال..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 rtl:rotate-180" />
                          إرسال الرسالة
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
