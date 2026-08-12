import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Map, CheckCircle2, Circle, AlertTriangle, BookOpen, FileText, CheckCircle, Video, ArrowLeft } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentRoadmap, SubjectRoadmap, RoadmapNode } from "@/actions/roadmap";
import Link from "next/link";

function getNodeIcon(type: RoadmapNode["type"]) {
  switch (type) {
    case "LESSON": return <BookOpen className="w-5 h-5" />;
    case "EXAM": return <FileText className="w-5 h-5" />;
    case "DAILY_EXERCISE": return <CheckCircle className="w-5 h-5" />;
    case "LIVE_CLASS": return <Video className="w-5 h-5" />;
  }
}

function getNodeColor(status: RoadmapNode["status"]) {
  switch (status) {
    case "COMPLETED": return "bg-purple-100 text-purple-800 border-purple-200";
    case "NEEDS_REVIEW": return "bg-purple-100 text-purple-800 border-purple-200";
    case "PENDING": return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function getNodeStatusIcon(status: RoadmapNode["status"]) {
  switch (status) {
    case "COMPLETED": return <CheckCircle2 className="w-5 h-5 text-purple-700" />;
    case "NEEDS_REVIEW": return <AlertTriangle className="w-5 h-5 text-purple-700" />;
    case "PENDING": return <Circle className="w-5 h-5 text-purple-800" />;
  }
}

export default async function StudentRoadmapPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const roadmaps = await getStudentRoadmap(sessionId);

  return (
    <div className="space-y-8 pb-12">
      <HeroBanner 
        title="خريطتي الذكية"
        description="تتبع مسارك الدراسي و دروسك إختباراتك و ومستواك في كل مادة بخط زمني تفاعلي"
        icon={Map}
        gradientClass="bg-gradient-to-r from-purple-700 to-purple-700"
      />

      {roadmaps.length === 0 ? (
        <div className="p-6 md:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Map className="w-16 h-16 text-purple-800 mx-auto mb-4" />
          <h3 className="font-black text-xl text-purple-900">لا توجد مواد مسجلة</h3>
          <p className="text-slate-500 font-medium mt-2">اشترك في مواد دراسية لتبدأ بتتبع مسارك الدراسي هنا</p>
        </div>
      ) : (
        <div className="space-y-12">
          {roadmaps.map(roadmap => (
            <div key={roadmap.subjectId} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
              
              {/* Subject Header */}
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-purple-950">{roadmap.subjectTitle}</h2>
                  <p className="text-sm font-bold text-slate-400 mt-1">خارطة الطريق التعليمية</p>
                </div>
              </div>

              {/* Timeline */}
              {roadmap.months.length === 0 ? (
                <div className="text-center text-slate-400 font-medium py-8">
                  لا يوجد محتوى في هذه المادة بعد
                </div>
              ) : (
                <div className="relative border-r-2 border-slate-100 pr-8 space-y-12 ml-4">
                  {roadmap.months.map(monthData => (
                    <div key={monthData.month} className="relative">
                      {/* Month Indicator */}
                      <div className="absolute -right-[43px] top-0 w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center shadow-sm">
                        <span className="font-black text-xs text-slate-500">{monthData.month}</span>
                      </div>
                      
                      <h3 className="text-lg font-black text-purple-900 mb-6 bg-white inline-block px-4 py-1.5 rounded-lg">
                        الشهر {monthData.month}
                      </h3>
                      
                      {/* Nodes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monthData.nodes.map(node => (
                          <Link href={node.href} key={node.id} className="block group">
                            <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${getNodeColor(node.status)}`}>
                              
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-white/60 rounded-lg">
                                    {getNodeIcon(node.type)}
                                  </div>
                                  <span className="text-xs font-black opacity-70">
                                    {node.type === "LESSON" ? "درس" : node.type === "EXAM" ? "اختبار" : node.type === "DAILY_EXERCISE" ? "تمرين" : "مباشر"}
                                  </span>
                                </div>
                                {getNodeStatusIcon(node.status)}
                              </div>

                              <h4 className="font-black text-sm mb-2 line-clamp-2">{node.title}</h4>
                              
                              <div className="flex items-center justify-between mt-4">
                                {node.status === "NEEDS_REVIEW" ? (
                                  <span className="text-[10px] font-bold bg-white/60 px-2 py-1 rounded-md">
                                    يحتاج معالجة للأخطاء
                                  </span>
                                ) : node.status === "COMPLETED" && node.score !== undefined ? (
                                  <span className="text-[10px] font-black bg-white/60 px-2 py-1 rounded-md">
                                    العلامة: {node.score}/20
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-white/60 px-2 py-1 rounded-md opacity-70">
                                    انقر للعرض
                                  </span>
                                )}
                                
                                <ArrowLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                              </div>

                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
