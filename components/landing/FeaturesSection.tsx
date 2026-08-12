import { MonitorPlay, School, Target, Users, LineChart, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "التعليم الحضوري والإلكتروني",
      desc: "نظام هجين يجمع بين الحضور الفعلي في الأكاديمية والمنصة الرقمية المتطورة لضمان الاستمرارية.",
      icon: MonitorPlay,
      color: "bg-purple-800 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-700",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "قاعات مجهزة ووسائل حديثة",
      desc: "بيئة ذكية ومجهزة بأحدث الوسائل التكنولوجية لتوفير راحة تامة واحترافية أثناء التعلم.",
      icon: School,
      color: "bg-purple-800 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-700",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "برامج ذكية ومتتابعة",
      desc: "خطة دراسية منهجية تصحب كل متعلم خطوة بخطوة من التأسيس إلى التفوق والاحتراف.",
      icon: Target,
      color: "bg-purple-700 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-700",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "أساتذة أكفاء وذوو خبرة",
      desc: "طاقم تدريس متميز ونخبة من خيرة الأساتذة لضمان أعلى مستويات الجودة البيداغوجية.",
      icon: Users,
      color: "bg-purple-800 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-700",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "متابعة مستمرة وتقارير دورية",
      desc: "تقارير مفصلة للمستوى ترسل لأولياء الأمور لضمان الإشراف التام على تطور الأبناء.",
      icon: LineChart,
      color: "bg-purple-700 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-500",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "بيئة منظمة وآمنة بأسعار مناسبة",
      desc: "فضاء آمن محفز، بأسعار مدروسة وعروض موسمية استثنائية تناسب جميع فئات المجتمع.",
      icon: ShieldCheck,
      color: "bg-purple-700 text-white shadow-purple-200 dark:shadow-purple-950/20 border-purple-500",
      iconBg: "bg-white/20 text-white"
    }
  ];

  return (
    <section className="py-24 border-b border-purple-100/50 dark:border-purple-200/50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-purple-950 dark:text-purple-950 mb-4">
            خدمات ومميزات الأكاديمية
          </h2>
          <p className="text-lg text-purple-800 dark:text-purple-600 font-bold max-w-2xl mx-auto">
            بيئة تعليمية متكاملة تضمن التفوق الأكاديمي الشامل لجميع الأطوار التعليمية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`group relative rounded-3xl p-8 border shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden ${feat.color}`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feat.iconBg}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-xl font-black text-white mb-3">
                  {feat.title}
                </h3>
                <p className="relative z-10 text-white/90 font-bold leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
