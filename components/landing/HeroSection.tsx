"use client";

import Link from "next/link";
import { GraduationCap, UserPlus, LogIn, ChevronLeft } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative pt-24 pb-20 border-b-[3px] border-[#000000] z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Content */}
          <div className="lg:col-span-7 flex flex-col justify-center relative z-10">
            <Reveal delay={100} direction="up">
              <div className="inline-flex self-start items-center gap-2 px-4 py-2 bg-[#FFFFFF] border-[3px] border-[#000000] shadow-3d-soft text-[#000000] font-bold text-sm mb-12 transform -rotate-2 rounded-xl">
                <GraduationCap className="w-5 h-5 text-[#7E22CE]" />
                <span>الصرح الرقمي الوطني الأضخم في الجزائر</span>
              </div>
            </Reveal>
            
            <Reveal delay={200} direction="up">
              <div className="relative mb-8">
                <div className="absolute -inset-1 bg-[#4C1D95] transform rotate-1 rounded-3xl opacity-10 blur-lg"></div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#000000] leading-[1.1] tracking-tighter relative">
                  منصة أكاديمية <br />
                  <span className="text-[#FFFFFF] bg-[#4C1D95] px-6 py-2 inline-block transform rotate-2 border-[3px] border-[#000000] shadow-3d-soft mt-4 rounded-tl-3xl rounded-br-3xl">
                    دقيش التعليمية
                  </span>
                </h1>
              </div>
            </Reveal>
            
            <Reveal delay={300} direction="up">
              <div className="relative mb-12 max-w-2xl">
                <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#7E22CE] rounded-full"></div>
                <p className="text-xl md:text-2xl font-bold text-[#000000] leading-relaxed pl-6">
                  المنصة المصممة خصيصاً لمرافقة أبنائنا من الطور الابتدائي إلى الثانوي لضمان التفوق الأكاديمي الشامل وتحقيق معدلات قياسية في جميع المستويات.
                </p>
              </div>
            </Reveal>
            
            <Reveal delay={400} direction="up">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {isAuthenticated ? (
                  <Link 
                    href="/dashboard/student" 
                    className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#7E22CE] text-[#FFFFFF] font-black text-xl border-[3px] border-[#000000] rounded-xl shadow-3d-soft shadow-3d-hover"
                  >
                    <span className="relative z-10">الذهاب للوحة التحكم</span>
                    <ChevronLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-2 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#4C1D95] text-[#FFFFFF] font-black text-xl border-[3px] border-[#000000] rounded-xl shadow-3d-soft shadow-3d-hover"
                    >
                      <UserPlus className="w-6 h-6" />
                      <span>انضم الآن</span>
                    </Link>
                    <Link 
                      href="/login" 
                      className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#FFFFFF] text-[#000000] font-black text-xl border-[3px] border-[#000000] rounded-xl shadow-3d-soft shadow-3d-hover"
                    >
                      <LogIn className="w-6 h-6 text-[#7E22CE]" />
                      <span>دخول</span>
                    </Link>
                  </>
                )}
              </div>
            </Reveal>
          </div>
          
          {/* Distinctive Educational Abstract Composition */}
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 h-[450px] md:h-[550px] w-full flex items-center justify-center font-sans">
            <Reveal delay={300} direction="left" className="w-full h-full">
              <div className="relative w-full max-w-[400px] h-full flex items-center justify-center mx-auto">
                {/* Background large yellow shape */}
                <div className="absolute inset-0 top-10 bottom-10 right-4 left-4 bg-[#FACC15] border-[4px] border-[#000000] rounded-[3rem] transform rotate-3 shadow-3d-deep opacity-90 transition-transform duration-700 hover:rotate-6"></div>
                
                {/* Secondary cyan paper sheet */}
                <div className="absolute top-16 right-0 w-3/4 h-2/3 bg-[#06B6D4] border-[4px] border-[#000000] rounded-2xl transform -rotate-6 shadow-3d-deep flex items-center justify-center paper-cut z-10 transition-transform duration-700 hover:-rotate-2 hover:scale-105">
                  <div className="absolute inset-4 border-[2px] border-[#000000] border-dashed rounded-xl opacity-50"></div>
                  <div className="w-16 h-16 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-full flex items-center justify-center transform -rotate-6 shadow-sm">
                    <span className="font-black text-[#000000] text-2xl">A+</span>
                  </div>
                </div>

                {/* Main white notebook shape */}
                <div className="absolute top-24 left-4 w-4/5 h-[60%] bg-[#FFFFFF] border-[4px] border-[#000000] rounded-xl transform rotate-2 shadow-3d-deep z-20 flex flex-col p-6 paper-cut transition-transform duration-700 hover:rotate-0 hover:-translate-y-2">
                  <div className="w-1/2 h-4 bg-[#EAE4D9] border-[2px] border-[#000000] rounded-full mb-4"></div>
                  <div className="w-3/4 h-4 bg-[#F8F9FA] border-[2px] border-[#000000] rounded-full mb-4"></div>
                  <div className="w-2/3 h-4 bg-[#F8F9FA] border-[2px] border-[#000000] rounded-full mb-auto"></div>
                  
                  <div className="self-end mt-4">
                    <div className="w-24 h-24 bg-[#7E22CE] border-[3px] border-[#000000] rounded-xl transform -rotate-6 flex items-center justify-center shadow-3d-soft">
                      <GraduationCap className="w-12 h-12 text-[#FFFFFF]" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Floating vibrant pink accent */}
                <div className="absolute -bottom-4 right-10 bg-[#EC4899] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-6 py-2 rounded-full transform -rotate-12 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>إبداع، تفوق، تميز</span>
                </div>

                {/* Floating orange accent */}
                <div className="absolute top-0 -right-6 bg-[#F97316] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-5 py-2 rounded-full transform rotate-6 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>منهجية ذكية</span>
                </div>

                {/* Floating blue accent */}
                <div className="absolute top-1/2 -left-16 bg-[#3B82F6] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-5 py-2 rounded-full transform -rotate-6 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>طريقك للنجاح</span>
                </div>
                
                {/* 4. Violet accent */}
                <div className="absolute -bottom-10 left-6 bg-[#8B5CF6] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-5 py-2 rounded-full transform rotate-12 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>متابعة مستمرة</span>
                </div>

                {/* 5. Yellow accent */}
                <div className="absolute top-16 -left-10 bg-[#FACC15] border-[3px] border-[#000000] text-[#000000] font-black px-5 py-2 rounded-full transform -rotate-12 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>أساتذة أكفاء</span>
                </div>

                {/* 6. Red accent */}
                <div className="absolute bottom-1/4 -right-16 bg-[#EF4444] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-5 py-2 rounded-full transform -rotate-3 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>تحديات شيقة</span>
                </div>

                {/* 7. Teal accent */}
                <div className="absolute -top-10 right-16 bg-[#14B8A6] border-[3px] border-[#000000] text-[#000000] font-black px-5 py-2 rounded-full transform rotate-3 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>بيئة تنافسية</span>
                </div>

                {/* 8. Indigo accent */}
                <div className="absolute bottom-1/3 -left-8 bg-[#4F46E5] border-[3px] border-[#000000] text-[#FFFFFF] font-black px-5 py-2 rounded-full transform rotate-6 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>نتائج مبهرة</span>
                </div>

                {/* 9. Lime accent */}
                <div className="absolute -top-12 left-28 bg-[#84CC16] border-[3px] border-[#000000] text-[#000000] font-black px-5 py-2 rounded-full transform -rotate-3 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>شرح مبسط</span>
                </div>

                {/* 10. Cyan accent */}
                <div className="absolute top-1/4 right-0 bg-[#06B6D4] border-[3px] border-[#000000] text-[#000000] font-black px-5 py-2 rounded-full transform rotate-12 shadow-3d-soft z-30 flex items-center gap-2 hover:rotate-0 transition-transform cursor-default">
                  <span>تطوير مستمر</span>
                </div>

                {/* Floating green decorative element */}
                <div className="absolute -top-6 left-12 w-16 h-16 bg-[#22C55E] border-[3px] border-[#000000] rounded-full transform rotate-12 shadow-3d-soft z-30 flex items-center justify-center animate-bounce">
                  <span className="font-black text-[#000000] text-xl">100%</span>
                </div>

                {/* Small scattered graphic elements */}
                <div className="absolute top-1/2 -right-8 w-12 h-12 bg-[#FFFFFF] border-[3px] border-[#000000] rounded-lg transform rotate-45 shadow-sm z-0"></div>
                <div className="absolute bottom-1/4 -left-6 w-10 h-10 bg-[#7E22CE] border-[3px] border-[#000000] rounded-full shadow-sm z-30 opacity-80"></div>
                
                <div className="absolute top-1/3 -left-4 w-4 h-4 bg-[#000000] rounded-full z-40"></div>
                <div className="absolute bottom-1/3 -right-2 w-3 h-3 bg-[#000000] rounded-full z-40"></div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
