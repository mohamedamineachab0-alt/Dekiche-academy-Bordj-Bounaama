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
    <div className="bg-[#FFFFFF] rounded-2xl border-[4px] border-[#000000] shadow-3d-soft overflow-hidden mt-8 font-arabic paper-cut" dir="rtl">
      
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center border-b-[4px] border-[#000000] bg-[#F8F9FA]">
        <button
          onClick={() => setActiveTab("progress")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "progress" 
            ? "text-[#000000] bg-[#FFFFFF] border-b-4 border-b-[#000000] translate-y-[4px]" 
            : "text-[#000000]/60 hover:text-[#000000] hover:bg-[#FACC15]/20"
          }`}
        >
          <Users className="w-5 h-5" />
          تقدم أبنائي
        </button>
        <button
          onClick={() => setActiveTab("absences")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "absences" 
            ? "text-[#000000] bg-[#FFFFFF] border-b-4 border-b-[#000000] translate-y-[4px]" 
            : "text-[#000000]/60 hover:text-[#000000] hover:bg-[#FACC15]/20"
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          غيابات أبنائي
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-1 py-4 px-6 text-sm font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === "contact" 
            ? "text-[#000000] bg-[#FFFFFF] border-b-4 border-b-[#000000] translate-y-[4px]" 
            : "text-[#000000]/60 hover:text-[#000000] hover:bg-[#FACC15]/20"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          بريد الإدارة
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6 md:p-8 min-h-[400px] bg-[#FFFFFF]">
        
        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#000000] mx-auto mb-4 opacity-50" />
                <h3 className="font-black text-xl text-[#000000]">لا يوجد أبناء مسجلين</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {students.map((student) => (
                  <div key={student.id} className="bg-[#FFFFFF] border-[3px] border-[#000000] rounded-2xl p-6 shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 transition-transform paper-cut">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b-[3px] border-[#000000] border-dashed">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="w-14 h-14 rounded-full object-cover border-[3px] border-[#000000] shadow-sm transform -rotate-3" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#7E22CE] flex items-center justify-center text-[#FFFFFF] border-[3px] border-[#000000] shadow-sm transform rotate-3">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-xl text-[#000000]">{student.fullName}</h3>
                        <p className="text-xs font-bold text-[#000000]/60 mt-1">
                          {student.studentProfile?.level || "غير محدد"} • {student.studentProfile?.stream || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <h4 className="font-black text-sm text-[#000000] mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#F97316]" />
                        التقدم في المواد
                      </h4>
                      {student.enrollments.length === 0 ? (
                        <p className="text-xs text-[#000000]/60 font-bold border-[2px] border-[#000000] border-dashed p-3 rounded-xl text-center">غير مسجل في أي مادة حالياً</p>
                      ) : (
                        student.enrollments.map((enrollment) => {
                          const progress = Math.floor(Math.random() * 60) + 20; // Placeholder progress 20-80%
                          return (
                            <div key={enrollment.subject.id} className="space-y-2">
                              <div className="flex justify-between text-xs font-black">
                                <span className="text-[#000000]">{enrollment.subject.title}</span>
                                <span className="text-[#7E22CE]">{progress}%</span>
                              </div>
                              <div className="w-full bg-[#EAE4D9] rounded-full h-3 border-[2px] border-[#000000] overflow-hidden">
                                <div className="bg-[#7E22CE] h-full border-l-[2px] border-[#000000]" style={{ width: `${progress}%` }}></div>
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
                <AlertTriangle className="w-16 h-16 text-[#000000] mx-auto mb-4 opacity-50" />
                <h3 className="font-black text-xl text-[#000000]">لا يوجد أبناء مسجلين</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {students.map((student) => {
                  const daysInactive = Math.floor((new Date().getTime() - new Date(student.lastLoginAt).getTime()) / (1000 * 3600 * 24));
                  const absencesCount = Math.max(0, Math.floor(daysInactive / 5));

                  return (
                    <div key={student.id} className={`border-[3px] border-[#000000] rounded-2xl p-6 relative overflow-hidden shadow-3d-soft paper-cut transform transition-transform hover:-translate-y-1 ${
                      absencesCount > 0 ? "bg-[#EF4444]" : "bg-[#22C55E]"
                    }`}>
                      <div className="flex items-center gap-4 mb-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-[#000000] border-[3px] border-[#000000] transform -rotate-3 shadow-sm bg-[#FFFFFF]`}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`font-black text-xl ${absencesCount > 0 ? "text-[#FFFFFF]" : "text-[#000000]"}`}>{student.fullName}</h3>
                          <p className={`text-xs font-bold ${absencesCount > 0 ? "text-[#FFFFFF]/80" : "text-[#000000]/70"} mt-1`}>آخر ظهور: {new Date(student.lastLoginAt).toLocaleDateString("ar-DZ")}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center py-5 bg-[#FFFFFF] rounded-xl border-[3px] border-[#000000] shadow-sm transform rotate-1 hover:rotate-0 transition-transform">
                        <span className={`text-5xl font-black ${absencesCount > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                          {absencesCount}
                        </span>
                        <span className="text-sm font-black text-[#000000] mt-2">عدد الغيابات المحتسبة</span>
                      </div>

                      {absencesCount > 0 ? (
                        <div className="mt-5 flex items-start gap-3 text-[#000000] bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-[#000000] shadow-sm">
                          <AlertTriangle className="w-6 h-6 shrink-0 text-[#EF4444]" />
                          <p className="text-sm font-black leading-relaxed">
                            تم تسجيل غيابات. الغياب الواحد يُحتسب لكل 5 أيام كاملة من عدم الدخول للمنصة. يرجى متابعة الابن.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 flex items-start gap-3 text-[#000000] bg-[#FFFFFF] p-4 rounded-xl border-[3px] border-[#000000] shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-[#22C55E] border-[2px] border-[#000000] text-[#000000] flex items-center justify-center shrink-0 text-sm font-black">✓</div>
                          <p className="text-sm font-black leading-relaxed">
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
              <div className="w-16 h-16 rounded-xl bg-[#06B6D4] border-[3px] border-[#000000] flex items-center justify-center mx-auto mb-6 transform rotate-6 shadow-sm">
                <MessageSquare className="w-8 h-8 text-[#000000]" />
              </div>
              <h3 className="font-black text-3xl text-[#000000]">مراسلة الإدارة</h3>
              <p className="text-[#000000]/70 text-sm font-bold mt-2">
                نحن هنا للإجابة على استفساراتك ومتابعة أي ملاحظات تخص أبنائك
              </p>
            </div>

            {ticketStatus?.success ? (
              <div className="bg-[#22C55E] border-[4px] border-[#000000] p-8 rounded-2xl text-center space-y-5 shadow-3d-soft paper-cut transform -rotate-1">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border-[3px] border-[#000000] text-[#000000] flex items-center justify-center mx-auto text-3xl font-black shadow-sm transform rotate-6">✓</div>
                <h4 className="font-black text-[#000000] text-2xl">تم إرسال رسالتك بنجاح!</h4>
                <p className="text-sm font-bold text-[#000000]/90">سيقوم فريق الإدارة بمراجعة طلبك والرد عليك في أقرب وقت.</p>
                <button 
                  onClick={() => setTicketStatus(null)}
                  className="bg-[#FFFFFF] border-[3px] border-[#000000] text-[#000000] font-black px-6 py-3 rounded-xl hover:bg-[#F8F9FA] transition-transform shadow-sm hover:-translate-y-1 mt-4"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-6 bg-[#FFFFFF] p-8 rounded-2xl border-[4px] border-[#000000] shadow-3d-soft paper-cut">
                {ticketStatus?.error && (
                  <div className="p-4 bg-[#EF4444] text-[#FFFFFF] font-black text-sm rounded-xl border-[3px] border-[#000000] text-center shadow-sm">
                    {ticketStatus.error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#000000]">الموضوع</label>
                  <input 
                    name="subject"
                    required
                    type="text" 
                    placeholder="مثال: استفسار حول نقطة في الرياضيات"
                    className="w-full p-4 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-[#000000]">نص الرسالة</label>
                  <textarea 
                    name="message"
                    required
                    rows={5}
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                    className="w-full p-4 rounded-xl border-[3px] border-[#000000] bg-[#F8F9FA] text-[#000000] font-bold focus:outline-none focus:bg-[#FFFFFF] transition-all resize-none shadow-sm"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-[#000000] border-[3px] border-[#000000] font-black py-4 rounded-xl transition-transform shadow-3d-soft hover:shadow-3d-hover hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
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
