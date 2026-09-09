"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { GeoAccents, SoftOrb } from "@/components/landing/LandingDecor";
const TIPS = [
  "فعّل موادك برمز الاشتراك، ثم ابدأ بالدروس المسجّلة حسب الشهر.",
  "حلّ التمرين اليومي بعد كل درس لترسيخ الفهم وجمع النقاط.",
  "راجع بطاقات المراجعة وبنك الأخطاء قبل الفرض أو الاختبار.",
];

export function TipsSection() {
  return (
    <section dir="rtl" className="py-20 md:py-28 bg-hero text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="landing-line-grid absolute inset-0" />
        <div className="hero-orb w-[500px] h-[500px] bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-orb w-[700px] h-[700px] bg-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <SoftOrb tone="white" className="w-40 h-40 top-[15%] end-[12%] opacity-60" />
        <SoftOrb tone="white" className="w-56 h-56 bottom-[10%] start-[8%] opacity-40" />
      </div>
      <GeoAccents variant="dark" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-[640px] mx-auto mb-14">
          <p className="inline-flex items-center gap-2 glass-pill px-3.5 py-1.5 text-white text-sm font-bold tracking-wide mb-4">
            <Lightbulb className="w-4 h-4" />
            <span>نصيحة</span>
          </p>
          <h2 className="kufi text-[clamp(1.7rem,3.2vw,2.6rem)] text-white mb-4">
            نصائح للمراجعة
          </h2>
          <p className="naskh text-white/75 text-lg leading-[1.9]">
            خطوات بسيطة تساعدك على الدراسة بانتظام قبل الامتحان.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {TIPS.map((tip, idx) => (
            <article
              key={idx}
              className="rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-md p-7"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-primary mb-5">
                <Lightbulb className="w-5 h-5" />
              </span>
              <p className="text-white/90 leading-[1.85] font-medium">{tip}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
