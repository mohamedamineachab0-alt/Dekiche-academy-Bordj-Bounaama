import { Code2, BookOpenCheck, Camera, Briefcase } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

export function TeamSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-transparent z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        <Reveal delay={100} direction="up">
          <div className="mb-24 pb-8 flex flex-col md:flex-row justify-between items-end gap-12" dir="rtl">
            <div className="relative">
              {/* Layered paper effect for the title */}
              <div className="absolute top-2 left-2 text-[#4C1D95] text-5xl md:text-7xl font-black tracking-tighter opacity-20 pointer-events-none" aria-hidden="true">
                عقول هندسية، بيداغوجية، <br />
                وإبداعية فذة
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-[#000000] mb-4 tracking-tighter relative z-10 text-shadow-sm">
                عقول هندسية، بيداغوجية، <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] to-[#7E22CE]">وإبداعية فذة</span>
              </h2>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[#4C1D95] transform -rotate-3 rounded-2xl"></div>
              <div className="relative bg-[#FFFFFF] text-[#000000] p-6 border-[3px] border-[#000000] transform rotate-2 max-w-md shadow-3d-soft rounded-2xl">
                <p className="text-lg font-bold leading-relaxed">
                  تضافر جهود نخبة من الأكفاء لضمان تجربة تعليمية استثنائية شكلاً ومضموناً.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-16 lg:gap-10" dir="rtl">
          
          {/* Director */}
          <Reveal delay={200} direction="up" className="h-full">
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-[#4C1D95] border-[3px] border-[#000000] transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-5 group-hover:translate-y-5 rounded-tl-3xl rounded-br-3xl"></div>
              <div className="relative bg-[#FFFFFF] border-[3px] border-[#000000] p-8 h-full flex flex-col items-center text-center transition-transform group-hover:-translate-y-2 rounded-tl-3xl rounded-br-3xl shadow-3d-soft paper-cut">
                <div className="w-20 h-20 bg-[#FFFFFF] border-[3px] border-[#000000] text-[#000000] rounded-full flex items-center justify-center mb-6 transform -rotate-6 shadow-3d-soft">
                  <Briefcase className="w-10 h-10" />
                </div>
                <p className="bg-[#000000] text-[#FFFFFF] px-3 py-1 font-black text-xs tracking-widest uppercase mb-4 transform rotate-2">مدير المدرسة</p>
                <h3 className="text-2xl font-black text-[#000000] mb-4">السيد سعيد بيشة</h3>
                <div className="w-12 h-1 bg-[#7E22CE] mb-4 rounded-full"></div>
                <p className="text-[#000000] font-bold leading-relaxed text-sm">
                  خبرة وباع طويل في الإدارة التربوية وتسيير المؤسسات التعليمية بحكمة واحترافية.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Developer */}
          <Reveal delay={300} direction="up" className="h-full">
            <div className="relative group mt-8 md:mt-0 xl:mt-16 h-full">
              <div className="absolute inset-0 bg-[#7E22CE] border-[3px] border-[#000000] transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-5 group-hover:translate-y-5 rounded-tr-3xl rounded-bl-3xl"></div>
              <div className="relative bg-[#000000] text-[#FFFFFF] border-[3px] border-[#000000] p-8 h-full flex flex-col items-center text-center transition-transform group-hover:-translate-y-2 rounded-tr-3xl rounded-bl-3xl shadow-3d-soft paper-cut">
                <div className="w-20 h-20 bg-[#4C1D95] border-[3px] border-[#000000] text-[#FFFFFF] rounded-2xl flex items-center justify-center mb-6 transform rotate-6 shadow-3d-soft">
                  <Code2 className="w-10 h-10" />
                </div>
                <p className="bg-[#FFFFFF] text-[#000000] px-3 py-1 font-black text-xs tracking-widest uppercase mb-4 transform -rotate-2">الإدارة التقنية</p>
                <h3 className="text-2xl font-black text-[#FFFFFF] mb-4">عشاب محمد أمين</h3>
                <div className="w-12 h-1 bg-[#7E22CE] mb-4 rounded-full"></div>
                <p className="text-[#FFFFFF]/90 font-bold leading-relaxed text-sm">
                  هندسة برمجية متطورة تضمن استقرار المنصة وسرعتها الفائقة مع تصميم واجهات عالمية.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Teacher */}
          <Reveal delay={400} direction="up" className="h-full">
            <div className="relative group xl:mt-4 h-full">
              <div className="absolute inset-0 bg-[#000000] border-[3px] border-[#000000] transform -translate-x-3 translate-y-3 transition-transform group-hover:-translate-x-5 group-hover:translate-y-5 rounded-3xl"></div>
              <div className="relative bg-[#FFFFFF] border-[3px] border-[#000000] p-8 h-full flex flex-col items-center text-center transition-transform group-hover:-translate-y-2 rounded-3xl shadow-3d-soft paper-cut">
                <div className="w-20 h-20 bg-[#7E22CE] border-[3px] border-[#000000] text-[#FFFFFF] rounded-full flex items-center justify-center mb-6 transform -rotate-12 shadow-3d-soft">
                  <BookOpenCheck className="w-10 h-10" />
                </div>
                <p className="bg-[#4C1D95] text-[#FFFFFF] px-3 py-1 font-black text-xs tracking-widest uppercase mb-4 transform rotate-1">القيادة البيداغوجية</p>
                <h3 className="text-2xl font-black text-[#000000] mb-4">الأستاذ دقيش علي</h3>
                <div className="w-12 h-1 bg-[#4C1D95] mb-4 rounded-full"></div>
                <p className="text-[#000000] font-bold leading-relaxed text-sm">
                  محتوى تعليمي حصري يغطي كافة تفاصيل المناهج الرسمية لضمان العلامة الكاملة.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Producer */}
          <Reveal delay={500} direction="up" className="h-full">
            <div className="relative group mt-8 md:mt-0 xl:mt-24 h-full">
              <div className="absolute inset-0 bg-[#4C1D95] border-[3px] border-[#000000] transform -translate-x-3 translate-y-3 transition-transform group-hover:-translate-x-5 group-hover:translate-y-5 rounded-full"></div>
              <div className="relative bg-[#FFFFFF] text-[#000000] border-[3px] border-[#000000] p-8 h-full flex flex-col items-center justify-center text-center transition-transform group-hover:-translate-y-2 rounded-full shadow-3d-soft paper-cut aspect-square">
                <div className="w-16 h-16 bg-[#000000] text-[#FFFFFF] rounded-xl flex items-center justify-center mb-4 transform rotate-12 shadow-3d-soft">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="bg-[#7E22CE] text-[#FFFFFF] px-3 py-1 font-black text-[10px] tracking-widest uppercase mb-3 transform -rotate-3 rounded-full">الإنتاج البصري</p>
                <h3 className="text-xl font-black text-[#000000] mb-3">سعاد سيدأحمد</h3>
                <div className="w-8 h-1 bg-[#000000] mb-3 rounded-full"></div>
                <p className="text-[#000000]/90 font-bold leading-relaxed text-xs px-2">
                  إخراج وتصوير احترافي للدروس لضمان جودة بصرية نقية.
                </p>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
