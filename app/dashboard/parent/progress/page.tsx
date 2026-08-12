"use client";

import { HeroBanner } from "@/components/shared/HeroBanner";
import { Activity, TrendingUp, Calendar, Target, Award, BrainCircuit } from "lucide-react";

export default function ParentProgressPage() {
  const students = [
    { name: "أحمد كمال", level: "الثالثة ثانوي", stream: "علوم تجريبية", completion: 85, rank: 3, points: 1240 },
    { name: "سارة كمال", level: "الأولى ثانوي", stream: "جذع مشترك علوم", completion: 65, rank: 12, points: 850 }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        title="تقدم الأبناء"
        description="تابع المؤشرات الأكاديمية ونشاط أبنائك في المنصة بشكل دقيق ومفصل"
        icon={Activity}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {students.map((student, idx) => (
          <div key={idx} className="bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] p-6 relative paper-cut group transition-transform hover:-translate-y-1 hover:shadow-3d-hover">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#FACC15] rounded-2xl border-[3px] border-[#000000] flex items-center justify-center font-black text-2xl text-[#000000] shadow-sm transform -rotate-6 group-hover:rotate-0 transition-transform">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-black text-2xl text-[#000000]">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#EAE4D9] text-[#000000] text-xs font-black px-2 py-1 rounded-md border-[2px] border-[#000000] shadow-sm">{student.level}</span>
                  <span className="bg-[#F8F9FA] text-[#000000] text-xs font-black px-2 py-1 rounded-md border-[2px] border-[#000000] shadow-sm">{student.stream}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border-[3px] border-[#000000] shadow-sm transform rotate-1">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-[#7E22CE]" />
                  <span className="font-black text-[#000000] text-sm">مجموع النقاط</span>
                </div>
                <div className="font-mono font-black text-3xl text-[#000000]">{student.points}</div>
              </div>
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border-[3px] border-[#000000] shadow-sm transform -rotate-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#22C55E]" />
                  <span className="font-black text-[#000000] text-sm">الترتيب الولائي</span>
                </div>
                <div className="font-mono font-black text-3xl text-[#000000]">#{student.rank}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="font-black text-[#000000] text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3B82F6]" /> نسبة إكمال الدروس
                </span>
                <span className="font-mono font-black text-[#000000]">{student.completion}%</span>
              </div>
              <div className="w-full h-4 bg-[#F8F9FA] rounded-full border-[2px] border-[#000000] overflow-hidden">
                <div 
                  className="h-full bg-[#3B82F6] border-r-[2px] border-[#000000]"
                  style={{ width: `${student.completion}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t-[3px] border-[#000000] border-dashed grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-black text-gray-500 mb-1">التمارين المحلولة</p>
                <p className="font-mono font-black text-xl text-[#000000]">45</p>
              </div>
              <div className="text-center border-r-[3px] border-[#000000] border-dashed">
                <p className="text-xs font-black text-gray-500 mb-1">المعدل العام</p>
                <p className="font-mono font-black text-xl text-[#000000]">16.5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
