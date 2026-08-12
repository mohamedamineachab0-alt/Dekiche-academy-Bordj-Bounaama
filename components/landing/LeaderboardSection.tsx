import { Users, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

type TopStudent = {
  id: string;
  name: string;
  points: number;
};

export function LeaderboardSection({ 
  totalStudents, 
  totalParents,
  topStudents 
}: { 
  totalStudents: number, 
  totalParents: number,
  topStudents: TopStudent[] 
}) {
  return (
    <section className="py-24 border-b-8 border-[#000000] relative bg-transparent">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Dynamic Student and Parent Counts - Brutalist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-24">
          <Reveal delay={100} direction="up" className="h-full">
            <div className="bg-[#4C1D95] text-[#FFFFFF] p-8 border-4 border-[#000000] brutalist-shadow transform -rotate-1 flex flex-col justify-between h-full">
              <div className="w-16 h-16 bg-[#FFFFFF] border-4 border-[#000000] flex items-center justify-center mb-6 brutalist-shadow-sm">
                <Users className="w-8 h-8 text-[#000000]" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2 uppercase tracking-wider">الطلاب المسجلين بالمنصة</p>
                <p className="text-5xl font-black flex items-end gap-3">
                  <span dir="ltr">{totalStudents.toLocaleString("en-US")}</span>
                  <span className="text-2xl text-[#FFFFFF]/80 mb-1">طالب</span>
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} direction="up" className="h-full">
            <div className="bg-[#7E22CE] text-[#FFFFFF] p-8 border-4 border-[#000000] brutalist-shadow transform rotate-1 flex flex-col justify-between mt-8 sm:mt-0 h-full">
              <div className="w-16 h-16 bg-[#FFFFFF] border-4 border-[#000000] flex items-center justify-center mb-6 brutalist-shadow-sm">
                <ShieldCheck className="w-8 h-8 text-[#000000]" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2 uppercase tracking-wider">أولياء الأمور المتابعين</p>
                <p className="text-5xl font-black flex items-end gap-3">
                  <span dir="ltr">{totalParents.toLocaleString("en-US")}</span>
                  <span className="text-2xl text-[#FFFFFF]/80 mb-1">ولي أمر</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* The Letter - Editorial Layout */}
        <Reveal delay={300} direction="up">
          <div className="bg-[#FFFFFF] border-8 border-[#000000] brutalist-shadow p-8 md:p-16 relative" dir="rtl">
            
            {/* Header */}
            <div className="border-b-8 border-[#000000] pb-8 mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-[#000000] tracking-tighter leading-tight">
                رسالة مفتوحة <br />
                <span className="text-[#7E22CE]">عهدٌ من صُنّاع النجاح</span>
              </h2>
            </div>

            {/* Letter Body - Column Layout for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[#000000] font-bold text-lg leading-relaxed">
              <div className="space-y-6">
                <p>
                  إلى من اختار طريق التميز ولم يرضَ بغير القمة بديلاً.. مرحباً بك في معقلك الأكاديمي، منصة أكاديمية دقيش التعليمية برج بونعامة. نحن لم نصمم هذه المنصة لتكون مجرد موقع إلكتروني، بل خضنا حرباً حقيقية لنبني لك ترسانة رقمية وسلاحاً لا يُقهر في رحلتك نحو التفوق.
                </p>

                <p>
                  <span className="bg-[#000000] text-[#FFFFFF] px-2 py-1 mr-[-8px]">في الكواليس المظلمة:</span> سهر مهندسونا وفريقنا التقني ليالٍ طوال، كتبنا آلاف الأسطر البرمجية، وطوّعنا أحدث تقنيات الذكاء الاصطناعي لنخلق لك بيئة صلبة، سريعة كالصاعقة، وخالية تماماً من المشتتات. منصتنا لا تنام، لا تتعب، ومسخرة لخدمتك في كل ثانية.
                </p>
              </div>

              <div className="space-y-6">
                <p>
                  <span className="bg-[#4C1D95] text-[#FFFFFF] px-2 py-1 mr-[-8px]">وفي ساحة العلم:</span> سكب نُخبة أساتذتنا عصارة سنين من الخبرة والحكمة لتعبيد طريقك. لم نضع لك دروساً جامدة فحسب؛ بل فككنا شفرات المنهج، توقّعنا عثراتك قبل أن تقع فيها، وصممنا لك مساراً ذكياً يتحدى عقلك ويرتقي به من الصفر إلى الاحتراف.
                </p>

                <div className="bg-[#000000] text-[#FFFFFF] p-6 border-4 border-[#7E22CE] transform rotate-1 my-8">
                  <p className="text-2xl font-black text-center leading-snug">
                    لقد اجتمع التقني والأستاذ على هدف واحد فقط: <br/>
                    <span className="text-[#7E22CE] text-4xl">أنت.</span>
                  </p>
                </div>

                <p>
                  نحن لم ننم لكي لا تتعثر أنت. لقد جهزنا لك العتاد، ذلّلنا الصعاب، ووضعنا أسباب النجاح بين يديك. الآن.. انتهى دورنا وبدأ دورك! لا مجال للأعذار، ولا وقت للتردد.
                </p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t-8 border-[#000000] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="font-black text-3xl text-[#000000] mb-2">فهل أنت مستعد لكتابة التاريخ؟</p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-bold text-[#000000] mb-1">مع كل الثقة والدعم،</p>
                <p className="font-black text-[#7E22CE] text-xl">جيش الخفاء – فريق منصة أكاديمية دقيش التعليمية</p>
              </div>
            </div>
            
          </div>
        </Reveal>
      </div>
    </section>
  );
}
