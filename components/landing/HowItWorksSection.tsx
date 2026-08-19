"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Trophy, Sparkles } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "التأسيس والتقييم",
    desc: "نبدأ بتقييم مستواك الفعلي من خلال اختبارات ذكية تحدد نقاط ضعفك وقوتك بدقة، لنبني لك مساراً مخصصاً.",
    icon: Target,
    color: "bg-purple-100",
    textColor: "text-[#5B21B6]",
  },
  {
    id: 2,
    title: "الممارسة العميقة",
    desc: "دروس تفاعلية، تمارين يومية، وتطبيقات عملية مستمرة تركز على الفهم العميق وليس الحفظ السطحي.",
    icon: BookOpen,
    color: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    id: 3,
    title: "المتابعة والتصحيح",
    desc: "نراقب تقدمك خطوة بخطوة، ونقدم لك تقارير تحليلية مفصلة مع جلسات دعم لتصحيح المسار فوراً.",
    icon: Sparkles,
    color: "bg-purple-100",
    textColor: "text-[#5B21B6]",
  },
  {
    id: 4,
    title: "حصد التفوق",
    desc: "تصل إلى الاختبارات وأنت في أتم الاستعداد الذهني والعلمي لتحقيق العلامة الكاملة التي تطمح إليها.",
    icon: Trophy,
    color: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
];

export function HowItWorksSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", damping: 20, stiffness: 100 } 
    }
  };

  return (
    <section id="how-it-works" dir="rtl" className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 mt-32">
      
      {/* ── Section Header ── */}
      <div className="flex flex-col items-center text-center mb-24 relative z-10">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-[0_8px_24px_rgba(91,33,182,0.06)] border border-purple-900/5 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <p className="text-[#5B21B6] font-bold text-xs uppercase tracking-widest">
            المنهجية
          </p>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 tracking-tight leading-[1.2] max-w-3xl">
          رحلة ممتعة، <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-500 to-[#5B21B6]">من الصفر إلى القمة.</span>
        </h2>
      </div>

      {/* ── Timeline ── */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative grid grid-cols-1 md:grid-cols-4 gap-8"
      >
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-[60px] left-0 right-0 h-2 bg-white rounded-full shadow-inner border border-purple-900/5 -z-10" />
        <div className="hidden md:block absolute top-[60px] right-0 w-3/4 h-2 bg-gradient-to-l from-[#5B21B6]/30 via-[#5B21B6]/10 to-transparent rounded-full -z-10" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div key={step.id} variants={item} className="relative flex flex-col group">
              
              {/* Timeline Node */}
              <div className="w-32 h-32 mb-10 relative">
                <div className="absolute inset-0 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-purple-900/5 flex items-center justify-center text-gray-400 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(91,33,182,0.1)] transition-all duration-500 z-10 bg-clip-padding">
                  <div className={`w-16 h-16 rounded-[1.25rem] ${step.color} ${step.textColor} flex items-center justify-center transition-all duration-500 group-hover:shadow-xl`}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
                {/* Number Indicator */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#5B21B6]">
                  {step.id}
                </div>
              </div>

              {/* Content */}
              <div className="pr-2">
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-[#5B21B6] transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-[1.8] text-lg">
                  {step.desc}
                </p>
              </div>

            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
