import { Code2, BookOpenCheck, Camera, Briefcase } from "lucide-react";

export function TeamSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-purple-950 dark:text-purple-950 mb-4">
            عقول هندسية، بيداغوجية، وإبداعية فذة
          </h2>
          <p className="text-lg text-purple-800 dark:text-purple-600 font-bold max-w-2xl mx-auto">
            تضافر جهود نخبة من الأكفاء لضمان تجربة تعليمية استثنائية شكلا ومضمونا
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Director Card */}
          <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-sm hover:shadow-md hover:shadow-purple-600/10 flex flex-col md:flex-row gap-6 items-center text-center md:text-right group hover:shadow-xl hover:border-purple-700/50 dark:hover:border-purple-700/50 transition-all duration-300">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-white flex items-center justify-center shrink-0 border-4 border-white dark:border-purple-950 group-hover:scale-110 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-all">
              <Briefcase className="w-10 h-10 text-purple-800 dark:text-purple-800 group-hover:text-purple-800 dark:group-hover:text-purple-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-600 dark:text-purple-700 mb-1 tracking-widest uppercase">مدير المدرسة</p>
              <h3 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-3">السيد سعيد بيشة</h3>
              <p className="text-purple-800 dark:text-purple-600 font-bold leading-relaxed">
                خبرة وباع طويل في الإدارة التربوية وتسيير المؤسسات التعليمية بحكمة واحترافية لضمان الانضباط والنجاح المؤسسي.
              </p>
            </div>
          </div>

          {/* Developer Card */}
          <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-sm hover:shadow-md hover:shadow-purple-600/10 flex flex-col md:flex-row gap-6 items-center text-center md:text-right group hover:shadow-xl hover:border-purple-700/50 dark:hover:border-purple-700/50 transition-all duration-300">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-white flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-950 group-hover:scale-110 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-all">
              <Code2 className="w-10 h-10 text-purple-800 dark:text-purple-800 group-hover:text-purple-800 dark:group-hover:text-purple-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-600 dark:text-purple-700 mb-1 tracking-widest uppercase">المبرمج والمطور الهندسي</p>
              <h3 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-3">عشاب محمد أمين</h3>
              <p className="text-purple-800 dark:text-purple-600 font-bold leading-relaxed">
                هندسة برمجية متطورة تضمن استقرار المنصة وسرعتها الفائقة مع تصميم واجهات تفاعلية ترقى لأعلى المعايير العالمية
              </p>
            </div>
          </div>

          {/* Teacher Card */}
          <div className="bg-white dark:bg-white rounded-3xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-sm flex flex-col md:flex-row gap-6 items-center text-center md:text-right group hover:shadow-xl hover:border-purple-700/50 dark:hover:border-purple-700/50 transition-all duration-300">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-white/30 flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-950 group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-10 h-10 text-purple-700 dark:text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-700 dark:text-purple-700 mb-1 tracking-widest uppercase">القيادة البيداغوجية</p>
              <h3 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-3">الأستاذ دقيش علي</h3>
              <p className="text-purple-800 dark:text-purple-600 font-bold leading-relaxed">
                محتوى تعليمي حصري وعالي المستوى يغطي كافة تفاصيل المناهج الرسمية لوزارة التربية الوطنية لضمان العلامة الكاملة
              </p>
            </div>
          </div>

          {/* Producer Card */}
          <div className="bg-white dark:bg-white rounded-3xl p-8 border border-purple-100 dark:border-purple-900/30 shadow-sm flex flex-col md:flex-row gap-6 items-center text-center md:text-right group hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-white/30 flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-950 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-500 dark:text-purple-600 mb-1 tracking-widest uppercase">الإخراج والإنتاج البصري</p>
              <h3 className="text-2xl font-black text-purple-950 dark:text-purple-950 mb-3">سعاد سيدأحمد</h3>
              <p className="text-purple-800 dark:text-purple-600 font-bold leading-relaxed">
                إخراج سينمائي وتصوير احترافي للدروس لضمان أعلى جودة بصرية، مما يمنح التلميذ تجربة مشاهدة نقية ومريحة تدعم التركيز التام.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
