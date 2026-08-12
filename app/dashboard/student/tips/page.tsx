import { HUNDRED_TIPS } from "@/lib/hundredTips";
import { Lightbulb, Sparkles } from "lucide-react";



export default function TipsPage() {
  return (
    <div className="space-y-8 font-arabic pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-notebook-grid opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30 shadow-inner">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-3 text-white flex items-center gap-3">
              100 نصيحة ذهبية للتفوق الدراسي والامتحانات
            </h1>
            <p className="text-lg font-bold text-white opacity-95 max-w-2xl leading-relaxed">
              مجموعة مختارة بعناية من أفضل النصائح والتوجيهات لبناء شخصية دراسية قوية، إدارة وقتك بفعالية، وتحقيق التفوق بكل ثقة.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {HUNDRED_TIPS.map((tip, index) => (
          <div 
            key={index}
            className="group bg-white rounded-2xl p-6 border border-purple-100 shadow-md hover:shadow-lg hover:shadow-purple-600/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Number Badge (In-flow to prevent clipping) */}
            <div className="flex justify-between items-center mb-4">
              <span className="bg-purple-100 text-purple-900 px-4 py-1.5 rounded-full font-black text-sm shadow-sm">
                نصيحة {index + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 group-hover:bg-purple-100 transition-colors">
                <Lightbulb className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-purple-950 font-bold leading-loose text-base group-hover:text-purple-950 transition-colors break-words">
                {tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
