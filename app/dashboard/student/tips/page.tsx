import { HUNDRED_TIPS } from "@/lib/hundredTips";
import { Lightbulb } from "lucide-react";

export default function TipsPage() {
  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-[#7E22CE] rounded-2xl p-8 md:p-10 border-[3px] border-[#000000] shadow-3d-deep text-white relative overflow-hidden paper-cut">
        <div className="absolute inset-0 bg-white/5 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-start gap-6">
          <div className="bg-[#000000] p-4 rounded-2xl border-[3px] border-[#000000] shadow-3d-soft transform -rotate-3">
            <Lightbulb className="w-10 h-10 text-[#FACC15]" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-3 text-white flex items-center gap-3">
              100 نصيحة ذهبية للتفوق الدراسي والامتحانات
            </h1>
            <p className="text-lg font-bold text-purple-100 max-w-2xl leading-relaxed">
              مجموعة مختارة بعناية من أفضل النصائح والتوجيهات لبناء شخصية دراسية قوية، إدارة وقتك بفعالية، وتحقيق التفوق بكل ثقة.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {HUNDRED_TIPS.map((tip, index) => {
          // Assign alternating vibrant colors for cards
          const colors = ["bg-[#FACC15]", "bg-[#22C55E]", "bg-[#06B6D4]", "bg-[#EC4899]", "bg-[#F97316]", "bg-[#FFFFFF]"];
          const cardBg = colors[index % colors.length];
          const isDark = cardBg === "bg-[#000000]" || cardBg === "bg-[#4C1D95]" || cardBg === "bg-[#7E22CE]";
          const textColor = isDark ? "text-white" : "text-[#000000]";
          
          return (
          <div 
            key={index}
            className={`group ${cardBg} rounded-2xl p-6 border-[3px] border-[#000000] transition-all duration-300 shadow-3d-soft shadow-3d-hover paper-cut flex flex-col relative overflow-hidden`}
          >
            {/* Number Badge (In-flow to prevent clipping) */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="bg-[#FFFFFF] text-[#000000] px-4 py-1.5 rounded-xl border-[3px] border-[#000000] font-black text-sm shadow-sm">
                نصيحة {index + 1}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#000000] border-[2px] border-[#000000] flex items-center justify-center text-[#FACC15] transform -rotate-6 group-hover:rotate-0 transition-transform shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
              <p className={`${textColor} font-bold leading-loose text-base break-words`}>
                {tip}
              </p>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
