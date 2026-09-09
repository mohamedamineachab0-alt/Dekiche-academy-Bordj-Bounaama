"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { DotGrid, SoftOrb, SectionDivider } from "@/components/landing/LandingDecor";

type Student = {
  id: string;
  name: string;
  points: number;
};

export function StoriesSection({ topStudents }: { topStudents: Student[] }) {
  const ranked = topStudents.filter((s) => s.points > 0).slice(0, 6);

  return (
    <section id="stories" dir="rtl" className="py-20 md:py-28 bg-surface relative overflow-hidden">
      <SoftOrb tone="indigo" className="w-60 h-60 -top-10 end-0 opacity-40" />
      <SoftOrb tone="white" className="w-44 h-44 bottom-0 start-10 opacity-35" />
      <DotGrid className="opacity-35" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <p className="rule-label justify-center mb-5">
            <span className="shrink-0">أكثر التلاميذ نشاطاً</span>
          </p>
          <h2 className="display-title text-[clamp(1.7rem,3.2vw,2.6rem)] mb-4">
            الترتيب حسب النقاط
          </h2>
          <p className="text-lg text-muted leading-[1.9] mb-6">
            التلاميذ هنا جمعوا نقاطهم من حل التمارين اليومية والاختبارات على المنصة.
          </p>
          <SectionDivider />
        </div>

        {ranked.length === 0 ? (
          <div className="surface-card p-10 text-center max-w-xl mx-auto">
            <Quote className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-muted">لم تُسجّل نقاط بعد. سيتم عرض أفضل التلاميذ هنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ranked.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.08,
                  type: "spring",
                  damping: 20,
                  stiffness: 100,
                }}
                className="surface-card-interactive p-6"
              >
                <div className="flex items-center gap-1 mb-4 text-primary">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="display-title text-[2rem] text-primary tabular-nums">
                    {student.points.toLocaleString("en-US")}
                  </span>
                  <span className="text-sm text-muted">نقطة</span>
                </div>
                <h3 className="display-title text-lg mb-1">{student.name}</h3>
                <p className="text-sm text-muted">{idx + 1}# في الترتيب</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
