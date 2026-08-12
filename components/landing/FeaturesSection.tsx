import { MonitorPlay, School, Target, Users, LineChart, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

export function FeaturesSection() {
  const features = [
    {
      title: "التعليم الحضوري والإلكتروني",
      desc: "نظام هجين يجمع بين الحضور الفعلي والمنصة الرقمية المتطورة لضمان الاستمرارية.",
      icon: MonitorPlay,
      bg: "bg-[#4C1D95]",
      text: "text-[#FFFFFF]",
      span: "md:col-span-2",
      align: "justify-center",
      rounded: "rounded-tl-[4rem] rounded-br-2xl",
      rotate: "-rotate-1",
      offset: "z-20 mt-4 md:mt-0"
    },
    {
      title: "قاعات مجهزة ووسائل حديثة",
      desc: "بيئة ذكية ومجهزة بأحدث الوسائل التكنولوجية لتوفير راحة تامة واحترافية أثناء التعلم.",
      icon: School,
      bg: "bg-[#7E22CE]",
      text: "text-[#FFFFFF]",
      span: "md:col-span-1",
      align: "justify-start",
      rounded: "rounded-3xl",
      rotate: "rotate-2",
      offset: "z-10 -ml-4 md:-ml-8 mt-12 md:mt-16"
    },
    {
      title: "برامج ذكية ومتتابعة",
      desc: "خطة دراسية منهجية تصحب كل متعلم خطوة بخطوة من التأسيس إلى التفوق.",
      icon: Target,
      bg: "bg-[#000000]",
      text: "text-[#FFFFFF]",
      span: "md:col-span-1",
      align: "justify-start",
      rounded: "rounded-none",
      rotate: "-rotate-2",
      offset: "z-20 -mr-4 md:-mr-8"
    },
    {
      title: "أساتذة أكفاء وذوو خبرة",
      desc: "طاقم تدريس متميز ونخبة من خيرة الأساتذة لضمان أعلى مستويات الجودة البيداغوجية.",
      icon: Users,
      bg: "bg-[#FFFFFF]",
      text: "text-[#000000]",
      span: "md:col-span-1",
      align: "justify-start",
      rounded: "rounded-tr-[3rem] rounded-bl-[3rem]",
      rotate: "rotate-1",
      offset: "z-10 mt-8"
    },
    {
      title: "متابعة مستمرة",
      desc: "تقارير مفصلة للمستوى ترسل لأولياء الأمور لضمان الإشراف التام.",
      icon: LineChart,
      bg: "bg-[#FFFFFF]",
      text: "text-[#000000]",
      span: "md:col-span-1",
      align: "justify-start",
      rounded: "rounded-xl",
      rotate: "rotate-3",
      offset: "z-30 -mt-6 shadow-3d-deep border-[4px] border-[#7E22CE]",
      isCircle: false
    },
    {
      title: "بيئة منظمة وآمنة بأسعار مناسبة",
      desc: "فضاء آمن محفز، بأسعار مدروسة وعروض موسمية استثنائية تناسب الجميع.",
      icon: ShieldCheck,
      bg: "bg-[#4C1D95]",
      text: "text-[#FFFFFF]",
      span: "md:col-span-3",
      align: "justify-center text-center",
      rounded: "rounded-b-[4rem]",
      rotate: "-rotate-1",
      offset: "z-10 -mt-12"
    }
  ];

  return (
    <section className="py-32 bg-transparent relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <Reveal delay={100} direction="up">
          <div className="mb-24 relative z-40 text-center" dir="rtl">
            <h2 className="text-5xl md:text-7xl font-black text-[#000000] mb-6 tracking-tighter">
              خدمات ومميزات <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] to-[#7E22CE]">الأكاديمية</span>
            </h2>
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-[#7E22CE] transform rotate-2 rounded-lg"></div>
              <p className="relative text-xl text-[#FFFFFF] font-bold px-6 py-3 transform -rotate-1 shadow-3d-soft">
                بيئة تعليمية متكاملة تضمن التفوق الأكاديمي الشامل
              </p>
            </div>
          </div>
        </Reveal>

        {/* The Overlapping 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto] md:auto-rows-[300px] relative" dir="rtl">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Reveal key={idx} delay={idx * 150} direction="up" className={feat.span}>
                <div 
                  className={`
                    relative border-[3px] border-[#000000] p-8 flex flex-col shadow-3d-soft shadow-3d-hover group h-full
                    ${feat.align} ${feat.bg} ${feat.text} ${feat.rounded} ${feat.rotate} ${feat.offset}
                    ${feat.isCircle ? 'aspect-square justify-center items-center text-center p-6' : ''}
                  `}
                >
                  {/* Paper cut inset layer for extra depth */}
                  <div className={`absolute inset-0 opacity-20 pointer-events-none paper-cut ${feat.rounded}`}></div>
                  
                  <div className={`
                    bg-[#FFFFFF] border-[3px] border-[#000000] flex items-center justify-center mb-6 shadow-3d-soft shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6
                    ${feat.isCircle ? 'w-12 h-12 rounded-full absolute top-8' : 'w-16 h-16 rounded-2xl'}
                  `}>
                    <Icon className="w-8 h-8 text-[#000000]" />
                  </div>
                  
                  <div className={`${feat.isCircle ? 'mt-8' : ''} relative z-10`}>
                    <h3 className={`font-black mb-3 leading-tight ${feat.span.includes('col-span-2') || feat.span.includes('col-span-3') ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                      {feat.title}
                    </h3>
                    <p className="font-bold text-lg opacity-90">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
