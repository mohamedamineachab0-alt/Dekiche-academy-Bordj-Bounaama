import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SoftOrb } from "@/components/landing/LandingDecor";
import { SocialLinks, PhoneLink } from "@/components/landing/art/FacebookIcon";

export function Footer({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <footer dir="rtl" className="bg-hero text-white pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="landing-line-grid absolute inset-0" />
        <div className="hero-orb hidden md:block w-[400px] h-[400px] bg-white/10 top-[-80px] left-1/4" />
        <SoftOrb tone="white" className="w-36 h-36 top-[30%] end-[15%] opacity-50" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 md:p-10 mb-14 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="kufi text-[clamp(1.6rem,2.8vw,2.3rem)] text-white mb-3">
                سجّل وابدأ المراجعة
              </h2>
              <p className="naskh text-white/85 text-lg leading-[1.9] max-w-[540px]">
                سجّل كتلميذ أو كوليّ أمر، واكتشف محتوى منظّم يرافقك من الدروس إلى الامتحان.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap items-center gap-3 lg:justify-end">
              <Link
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                className="btn-primary"
              >
                {isAuthenticated ? "مساحتي" : "إنشاء حساب"}
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors"
                >
                  دخول
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="wordmark text-lg text-white">أكاديمية دقيش</span>
          </Link>
          <div className="flex flex-col items-center gap-3">
            <PhoneLink showNumber className="text-white hover:text-white/80" />
            <SocialLinks includePhone={false} />
          </div>
          <p className="text-white/55 text-sm text-center md:text-start">
            جميع الحقوق محفوظة لأكاديمية دقيش © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
