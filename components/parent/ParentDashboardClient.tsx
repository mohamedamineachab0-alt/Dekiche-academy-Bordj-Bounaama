"use client";

import { useState } from "react";
import { Users, AlertTriangle, MessageSquare, BookOpen, Send, User as UserIcon } from "lucide-react";
import { submitParentTicket } from "@/actions/parents";

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
    }
  }[];
};

type ParentDashboardClientProps = {
  students: StudentData[];
  parentId: string;
};

export function ParentDashboardClient({ students, parentId }: ParentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"progress" | "absences" | "contact">("progress");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<{ success?: boolean; error?: string } | null>(null);

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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8 font-arabic" dir="rtl">
      
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center border-b border-slate-100 bg-white">
        <button
          onClick={() => setActiveTab("progress")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "progress" 
            ? "text-purple-700 bg-white border-b-2 border-purple-700 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]" 
            : "text-slate-500 hover:text-purple-800 hover:bg-slate-100"
          }`}
        >
          <Users className="w-5 h-5" />
          تقدم أبنائي
        </button>
        <button
          onClick={() => setActiveTab("absences")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "absences" 
            ? "text-purple-800 bg-white border-b-2 border-purple-800 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]" 
            : "text-slate-500 hover:text-purple-800 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          غيابات أبنائي
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "contact" 
            ? "text-purple-700 bg-white border-b-2 border-purple-700 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]" 
            : "text-slate-500 hover:text-purple-800 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          بريد الإدارة
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6 md:p-8 min-h-[400px] bg-white">
        
        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-purple-900 mx-auto mb-4" />
                <h3 className="font-black text-xl text-purple-800">لا يوجد أبناء مسجلين</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {students.map((student) => (
                  <div key={student.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="w-14 h-14 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-100">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-lg text-purple-950">{student.fullName}</h3>
                        <p className="text-xs font-bold text-purple-700">
                          {student.studentProfile?.level || "غير محدد"} • {student.studentProfile?.stream || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-purple-800 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-700" />
                        التقدم في المواد
                      </h4>
                      {student.enrollments.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium">غير مسجل في أي مادة حالياً</p>
                      ) : (
                        student.enrollments.map((enrollment) => {
                          const progress = Math.floor(Math.random() * 60) + 20; // Placeholder progress 20-80%
                          return (
                            <div key={enrollment.subject.id} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-purple-800">{enrollment.subject.title}</span>
                                <span className="text-purple-700">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-purple-700 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Absences Tab */}
        {activeTab === "absences" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-purple-900 mx-auto mb-4" />
                <h3 className="font-black text-xl text-purple-800">لا يوجد أبناء مسجلين</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {students.map((student) => {
                  const daysInactive = Math.floor((new Date().getTime() - new Date(student.lastLoginAt).getTime()) / (1000 * 3600 * 24));
                  const absencesCount = Math.max(0, Math.floor(daysInactive / 5));

                  return (
                    <div key={student.id} className={`border rounded-2xl p-6 relative overflow-hidden ${
                      absencesCount > 0 ? "border-purple-200 bg-purple-50/30" : "border-purple-200 bg-purple-50/30"
                    }`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-purple-950 ${
                          absencesCount > 0 ? "bg-purple-700 shadow-purple-200" : "bg-purple-700 shadow-purple-200"
                        } shadow-lg`}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-purple-950">{student.fullName}</h3>
                          <p className="text-xs font-bold text-slate-500">آخر ظهور: {new Date(student.lastLoginAt).toLocaleDateString("ar-DZ")}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span className={`text-4xl font-black ${absencesCount > 0 ? "text-purple-800" : "text-purple-700"}`}>
                          {absencesCount}
                        </span>
                        <span className="text-sm font-bold text-slate-500 mt-1">عدد الغيابات المحتسبة</span>
                      </div>

                      {absencesCount > 0 ? (
                        <div className="mt-4 flex items-start gap-2 text-purple-800 bg-purple-100/50 p-3 rounded-lg border border-purple-200">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <p className="text-xs font-bold leading-relaxed">
                            تم تسجيل غيابات. الغياب الواحد يُحتسب لكل 5 أيام كاملة من عدم الدخول للمنصة. يرجى متابعة الابن.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-start gap-2 text-purple-800 bg-purple-100/50 p-3 rounded-lg border border-purple-200">
                          <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 text-xs">✓</div>
                          <p className="text-xs font-bold leading-relaxed">
                            ممتاز! لا توجد غيابات مسجلة حالياً.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contact Admin Tab */}
        {activeTab === "contact" && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="font-black text-2xl text-purple-950">مراسلة الإدارة</h3>
              <p className="text-slate-500 text-sm font-medium mt-2">
                نحن هنا للإجابة على استفساراتك ومتابعة أي ملاحظات تخص أبنائك
              </p>
            </div>

            {ticketStatus?.success ? (
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-xl">✓</div>
                <h4 className="font-black text-purple-900 text-lg">تم إرسال رسالتك بنجاح!</h4>
                <p className="text-sm font-bold text-purple-700">سيقوم فريق الإدارة بمراجعة طلبك والرد عليك في أقرب وقت.</p>
                <button 
                  onClick={() => setTicketStatus(null)}
                  className="bg-white border border-purple-200 text-purple-800 font-bold px-4 py-2 rounded-lg text-sm hover:bg-purple-100"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-100">
                {ticketStatus?.error && (
                  <div className="p-3 bg-purple-50 text-purple-800 font-bold text-sm rounded-xl border border-purple-100 text-center">
                    {ticketStatus.error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-purple-800">الموضوع</label>
                  <input 
                    name="subject"
                    required
                    type="text" 
                    placeholder="مثال: استفسار حول نقطة في الرياضيات"
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-purple-800">نص الرسالة</label>
                  <textarea 
                    name="message"
                    required
                    rows={5}
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-800 text-white font-black py-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "جاري الإرسال..." : (
                    <>
                      <Send className="w-5 h-5 rtl:rotate-180" />
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
