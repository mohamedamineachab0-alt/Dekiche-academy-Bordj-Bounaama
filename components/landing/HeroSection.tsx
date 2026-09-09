"use client";

import { motion } from "framer-motion";
import { CraftedButton } from "@/components/landing/CraftedButton";
import { HeroArt } from "@/components/landing/art/HeroArt";
import {
  DashboardIcon,
  DailyExercisesIcon,
  ExamsReviewIcon,
  ParentFollowIcon,
  VideoLessonsIcon,
} from "@/components/landing/art/HeroIcons";
import { SoftOrb } from "@/components/landing/LandingDecor";
import { ACADEMY_MOTTO, SuccessShipIcon } from "@/components/shared/SuccessShipMotto";

const HERO_TRUST = [
  { label: "حسابك الدراسي", Icon: DashboardIcon },
  { label: "دروس مصوّرة", Icon: VideoLessonsIcon },
  { label: "تمارين يومية", Icon: DailyExercisesIcon },
  { label: "فروض وبطاقات مراجعة", Icon: ExamsReviewIcon },
  { label: "متابعة الأولياء", Icon: ParentFollowIcon },
];

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-visible bg-hero">
      <HeroArt />
      <SoftOrb tone="white" className="w-48 h-48 bottom-[18%] start-[8%] z-[1] opacity-50" />

      <div className="relative z-10 flex flex-col justify-center min-h-[86dvh] px-4 sm:px-6 lg:px-10 pt-28 pb-20 sm:pt-32 lg:py-24">
        <div className="max-w-[1180px] mx-auto w-full">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-2 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="kufi text-xs tracking-wide text-white/95">من الابتدائي إلى الثانوي</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="kufi text-[clamp(2.2rem,6vw,4.25rem)] text-white leading-[1.2] mb-7"
            >
              أول أكاديمية تجمع بين التعليم الحضوري و{" "}
              <span className="marker">
                <span>التعليم الإلكتروني</span>
              </span>{" "}
              في الجزائر
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="naskh text-[1.1rem] md:text-[1.3rem] text-white/85 leading-[1.95] max-w-[640px] mb-10"
            >
              ادرس في القسم، وتابع دروسك وتمارينك وفروضك من المنصة في أي وقت.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-14"
            >
              <CraftedButton
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                variant="gold"
                icon={<SuccessShipIcon className="w-5 h-5" />}
              >
                {ACADEMY_MOTTO}
              </CraftedButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              {HERO_TRUST.map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-full glass-pill px-3.5 py-2"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-md">
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-semibold text-white/95 whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
