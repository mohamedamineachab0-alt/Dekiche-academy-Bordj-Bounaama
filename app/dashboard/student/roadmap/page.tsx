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
    case "COMPLETED": return "bg-[#22C55E] text-[#000000] border-[#000000]";
    case "NEEDS_REVIEW": return "bg-[#F97316] text-white border-[#000000]";
    case "PENDING": return "bg-[#FFFFFF] text-[#000000] border-[#000000]";
  }
}

function getNodeStatusIcon(status: RoadmapNode["status"]) {
  switch (status) {
    case "COMPLETED": return <CheckCircle2 className="w-6 h-6 text-[#000000]" />;
    case "NEEDS_REVIEW": return <AlertTriangle className="w-6 h-6 text-[#FFFFFF]" />;
    case "PENDING": return <Circle className="w-6 h-6 text-[#000000] opacity-50" />;
  }
}

export default async function StudentRoadmapPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const roadmaps = await getStudentRoadmap(sessionId);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner 
        title="خريطتي الذكية"
        description="تتبع مسارك الدراسي و دروسك إختباراتك و ومستواك في كل مادة بخط زمني تفاعلي"
        icon={Map}
      />

      {roadmaps.length === 0 ? (
        <div className="p-8 md:p-12 text-center bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
          <div className="w-20 h-20 bg-[#FACC15] border-[3px] border-[#000000] rounded-2xl flex items-center justify-center transform -rotate-3 mx-auto mb-6 shadow-sm">
            <Map className="w-10 h-10 text-[#000000]" />
          </div>
          <h3 className="font-black text-2xl text-[#000000] mb-3">لا توجد مواد مسجلة</h3>
          <p className="text-gray-600 font-bold max-w-sm mx-auto leading-relaxed">اشترك في مواد دراسية لتبدأ بتتبع مسارك الدراسي هنا</p>
        </div>
      ) : (
        <div className="space-y-12">
          {roadmaps.map(roadmap => (
            <div key={roadmap.subjectId} className="bg-[#FFFFFF] rounded-3xl p-8 md:p-10 border-[3px] border-[#000000] shadow-3d-soft paper-cut relative overflow-hidden">
              
              {/* Subject Header */}
              <div className="flex items-center gap-4 mb-10 pb-8 border-b-[3px] border-[#000000] border-dashed relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#7E22CE] border-[3px] border-[#000000] flex items-center justify-center text-white transform -rotate-3 shadow-sm">
                  <Map className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#000000]">{roadmap.subjectTitle}</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">خارطة الطريق التعليمية</p>
                </div>
              </div>

              {/* Timeline */}
              {roadmap.months.length === 0 ? (
                <div className="text-center text-gray-400 font-bold py-10 relative z-10">
                  لا يوجد محتوى في هذه المادة بعد
                </div>
              ) : (
                <div className="relative border-r-[4px] border-[#000000] pr-10 space-y-14 ml-4 rtl:mr-4 rtl:ml-0 rtl:border-l-[4px] rtl:border-r-0 rtl:pl-10 rtl:pr-0 z-10">
                  {roadmap.months.map(monthData => (
                    <div key={monthData.month} className="relative">
                      {/* Month Indicator */}
                      <div className="absolute -right-[63px] rtl:-left-[63px] rtl:right-auto top-0 w-12 h-12 rounded-xl bg-[#000000] border-[3px] border-[#000000] flex items-center justify-center shadow-sm transform rotate-3">
                        <span className="font-black text-sm text-[#FACC15]">{monthData.month}</span>
                      </div>
                      
                      <h3 className="text-xl font-black text-[#000000] mb-8 bg-[#F8F9FA] inline-block px-5 py-2.5 rounded-xl border-[3px] border-[#000000] shadow-sm transform -rotate-1">
                        الشهر {monthData.month}
                      </h3>
                      
                      {/* Nodes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {monthData.nodes.map(node => (
                          <Link href={node.href} key={node.id} className="block group">
                            <div className={`p-5 rounded-2xl border-[3px] transition-all duration-300 shadow-3d-soft shadow-3d-hover relative overflow-hidden ${getNodeColor(node.status)}`}>
                              
                              <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-[#FFFFFF] border-[2px] border-[#000000] rounded-xl text-[#000000] shadow-sm transform group-hover:rotate-6 transition-transform">
                                    {getNodeIcon(node.type)}
                                  </div>
                                  <span className="text-xs font-black bg-[#FFFFFF] border-[2px] border-[#000000] text-[#000000] px-2 py-1 rounded-lg">
                                    {node.type === "LESSON" ? "درس" : node.type === "EXAM" ? "اختبار" : node.type === "DAILY_EXERCISE" ? "تمرين" : "مباشر"}
                                  </span>
                                </div>
                                {getNodeStatusIcon(node.status)}
                              </div>

                              <h4 className="font-black text-lg mb-3 line-clamp-2 relative z-10">{node.title}</h4>
                              
                              <div className="flex items-center justify-between mt-6 relative z-10">
                                {node.status === "NEEDS_REVIEW" ? (
                                  <span className="text-xs font-black bg-[#000000] text-[#FFFFFF] border-[2px] border-[#000000] px-3 py-1.5 rounded-lg shadow-sm">
                                    يحتاج معالجة للأخطاء
                                  </span>
                                ) : node.status === "COMPLETED" && node.score !== undefined ? (
                                  <span className="text-xs font-black bg-[#FFFFFF] text-[#000000] border-[2px] border-[#000000] px-3 py-1.5 rounded-lg shadow-sm">
                                    العلامة: {node.score}/20
                                  </span>
                                ) : (
                                  <span className="text-xs font-black bg-[#F8F9FA] text-[#000000] border-[2px] border-[#000000] px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-[#FACC15] transition-colors">
                                    انقر للعرض
                                  </span>
                                )}
                                
                                <ArrowLeft className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1.5 transition-all" />
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
