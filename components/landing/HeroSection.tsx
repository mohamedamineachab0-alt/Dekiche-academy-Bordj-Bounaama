import { CraftedButton } from "@/components/landing/CraftedButton";
import { AddToDeviceButton } from "@/components/pwa/AddToDeviceButton";
import { HeroArt } from "@/components/landing/art/HeroArt";
import {
  DashboardIcon,
  DailyExercisesIcon,
  ExamsReviewIcon,
  ParentFollowIcon,
  VideoLessonsIcon,
} from "@/components/landing/art/HeroIcons";
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

      <div className="relative z-10 flex flex-col justify-center min-h-[86dvh] px-4 sm:px-6 lg:px-10 pt-28 pb-20 sm:pt-32 lg:py-24">
        <div className="max-w-295 mx-auto w-full">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white mb-6 shadow-sm transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">من الابتدائي للثانوي</span>
              <span className="text-white/40">|</span>
              <span className="text-xs sm:text-sm text-white/90 font-medium">الابتدائي • المتوسط • الثانوي</span>
            </div>

            <h1 className="kufi text-[clamp(2.2rem,6vw,4.25rem)] text-white leading-[1.2] mb-7">
              أول أكاديمية تجمع بين التعليم الحضوري و{" "}
              <span className="marker">
                <span>التعليم الإلكتروني</span>
              </span>{" "}
              في الجزائر
            </h1>

            <p className="naskh text-[1.1rem] md:text-[1.3rem] text-white/85 leading-[1.95] max-w-160 mb-10">
              ادرس في القسم، وتابع دروسك وتمارينك وفروضك من المنصة في أي وقت — من الابتدائي للثانوي.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-14">
              <CraftedButton
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                variant="gold"
                icon={<SuccessShipIcon className="w-5 h-5" />}
              >
                {ACADEMY_MOTTO}
              </CraftedButton>

              <AddToDeviceButton />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2">
              {HERO_TRUST.map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2.5 rounded-full pe-4 ps-1.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-xs transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center shadow-sm shrink-0">
                      <Icon size={16} />
                    </span>
                    <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
