"use client";

import { useState } from "react";
import { Search, MessageSquare, Send, X, User } from "lucide-react";
import { sendDirectNotification } from "@/actions/admin-parents";

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
  const [selectedParent, setSelectedParent] = useState<{ id: string; fullName: string; studentName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  const filteredStudents = students.filter(student => 
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
    <div className="font-arabic" dir="rtl">
      
      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <input 
          type="text"
          placeholder="ابحث عن تلميذ أو ولي أو رقم هاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
        />
        <Search className="w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-4" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-white border-b border-slate-200 text-slate-600 font-black">
            <tr>
              <th className="px-6 py-4">اسم التلميذ</th>
              <th className="px-6 py-4">المستوى والشعبة</th>
              <th className="px-6 py-4">معلومات الولي</th>
              <th className="px-6 py-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold text-purple-800">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">لا توجد نتائج مطابقة للبحث</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-white transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      {student.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{student.level || "غير محدد"}</span>
                      <span className="text-xs text-slate-400">{student.stream || "غير محدد"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.parent ? (
                      <div className="flex flex-col">
                        <span className="text-purple-700">{student.parent.fullName}</span>
                        <span className="text-xs text-slate-500 font-mono" dir="ltr">{student.parent.phoneNumber}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">غير مربوط بولي</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {student.parent ? (
                      <button
                        onClick={() => setSelectedParent({ id: student.parent!.id, fullName: student.parent!.fullName, studentName: student.fullName })}
                        className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 hover:bg-purple-800 hover:text-white px-4 py-2 rounded-lg font-black transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        مراسلة الولي
                      </button>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 bg-white text-slate-400 px-4 py-2 rounded-lg font-black cursor-not-allowed">
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

      {/* Modal */}
      {selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-black text-lg text-purple-950">رسالة جديدة</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  إلى: <span className="text-purple-700">{selectedParent.fullName}</span> (ولي التلميذ {selectedParent.studentName})
                </p>
              </div>
              <button 
                onClick={() => setSelectedParent(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {status?.success ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-2xl font-black">✓</div>
                  <h4 className="font-black text-purple-900 text-lg">تم إرسال الرسالة بنجاح</h4>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  {status?.error && (
                    <div className="p-3 bg-purple-50 text-purple-800 font-bold text-sm rounded-xl border border-purple-100 text-center">
                      {status.error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-purple-800">عنوان الإشعار</label>
                    <input 
                      name="title"
                      required
                      type="text" 
                      placeholder="مثال: تنبيه بخصوص الغياب"
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-purple-800">نص الرسالة</label>
                    <textarea 
                      name="content"
                      required
                      rows={5}
                      placeholder="اكتب رسالتك لولي الأمر هنا..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedParent(null)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-slate-950 font-black font-black rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? "جاري الإرسال..." : (
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
