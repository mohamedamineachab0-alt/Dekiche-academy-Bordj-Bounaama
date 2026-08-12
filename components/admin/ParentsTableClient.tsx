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
          className="w-full pl-4 pr-12 py-3 rounded-xl border-[3px] border-[#000000] bg-[#FFFFFF] text-sm font-bold focus:outline-none focus:ring-0 shadow-3d-soft transition-all"
        />
        <Search className="w-5 h-5 text-[#000000] absolute top-1/2 -translate-y-1/2 right-4" />
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border-[3px] border-[#000000] shadow-3d-soft overflow-x-auto paper-cut">
        <table className="w-full text-sm text-right">
          <thead className="bg-[#F8F9FA] border-b-[3px] border-[#000000] text-[#000000] font-black">
            <tr>
              <th className="px-6 py-4">اسم التلميذ</th>
              <th className="px-6 py-4">المستوى والشعبة</th>
              <th className="px-6 py-4">معلومات الولي</th>
              <th className="px-6 py-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-[#000000] font-bold text-[#000000]">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#000000]/60 font-black">لا توجد نتائج مطابقة للبحث</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-[#FACC15]/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-[3px] border-[#000000] text-[#000000] flex items-center justify-center shadow-sm transform rotate-3">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-black text-lg">{student.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold">{student.level || "غير محدد"}</span>
                      <span className="text-xs text-[#000000]/60">{student.stream || "غير محدد"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.parent ? (
                      <div className="flex flex-col">
                        <span className="text-[#000000] font-black">{student.parent.fullName}</span>
                        <span className="text-xs text-[#000000]/60 font-mono font-bold" dir="ltr">{student.parent.phoneNumber}</span>
                      </div>
                    ) : (
                      <span className="text-[#000000] text-xs font-black border-[2px] border-[#000000] bg-[#F8F9FA] px-3 py-1 rounded-full shadow-sm">غير مربوط بولي</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {student.parent ? (
                      <button
                        onClick={() => setSelectedParent({ id: student.parent!.id, fullName: student.parent!.fullName, studentName: student.fullName })}
                        className="inline-flex items-center gap-2 bg-[#7E22CE] text-[#FFFFFF] hover:bg-[#4C1D95] border-[3px] border-[#000000] px-4 py-2 rounded-xl font-black shadow-3d-soft shadow-3d-hover hover:-translate-y-1 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        مراسلة الولي
                      </button>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 bg-[#EAE4D9] text-[#000000]/40 border-[3px] border-[#000000]/20 px-4 py-2 rounded-xl font-black cursor-not-allowed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border-[4px] border-[#000000] rounded-2xl shadow-3d-deep w-full max-w-lg overflow-hidden flex flex-col paper-cut">
            
            <div className="p-5 border-b-[4px] border-[#000000] flex items-center justify-between bg-[#FACC15]">
              <div>
                <h3 className="font-black text-xl text-[#000000]">رسالة جديدة</h3>
                <p className="text-sm font-bold text-[#000000]/80 mt-1">
                  إلى: <span className="text-[#000000] font-black">{selectedParent.fullName}</span> (ولي التلميذ {selectedParent.studentName})
                </p>
              </div>
              <button 
                onClick={() => setSelectedParent(null)}
                className="w-10 h-10 rounded-full bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center text-[#000000] hover:bg-[#EF4444] hover:text-[#FFFFFF] transition-colors shadow-sm transform hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#FFFFFF]">
              {status?.success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#22C55E] border-[4px] border-[#000000] text-[#000000] flex items-center justify-center mx-auto text-4xl font-black shadow-3d-soft transform -rotate-12">✓</div>
                  <h4 className="font-black text-[#000000] text-2xl">تم إرسال الرسالة بنجاح</h4>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-6">
                  {status?.error && (
                    <div className="p-4 bg-[#EF4444] text-[#FFFFFF] font-black text-sm rounded-xl border-[3px] border-[#000000] text-center shadow-sm">
                      {status.error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#000000]">عنوان الإشعار</label>
                    <input 
                      name="title"
                      required
                      type="text" 
                      placeholder="مثال: تنبيه بخصوص الغياب"
                      className="w-full p-4 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#000000]">نص الرسالة</label>
                    <textarea 
                      name="content"
                      required
                      rows={5}
                      placeholder="اكتب رسالتك لولي الأمر هنا..."
                      className="w-full p-4 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all resize-none shadow-sm"
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setSelectedParent(null)}
                      className="px-6 py-3 rounded-xl font-black text-[#000000] border-[3px] border-[#000000] bg-[#FFFFFF] hover:bg-[#F8F9FA] transition-colors shadow-sm"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-[#06B6D4] hover:bg-[#0891B2] text-[#000000] border-[3px] border-[#000000] font-black rounded-xl transition-transform shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
                    >
                      {isSubmitting ? "جاري الإرسال..." : (
                        <>
                          <Send className="w-5 h-5 rtl:rotate-180" />
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
