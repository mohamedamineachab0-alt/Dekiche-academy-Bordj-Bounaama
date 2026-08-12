import { Trophy, Medal, Users, Sparkles, ShieldCheck } from "lucide-react";

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
    <section className="py-24 border-b border-purple-100/50 dark:border-purple-200/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-purple-700/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Dynamic Student and Parent Counts */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="flex items-center gap-4 bg-white dark:bg-white px-8 py-4 rounded-3xl border border-purple-50 dark:border-purple-200 shadow-sm w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-white/30 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-purple-700 dark:text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-700 dark:text-purple-600 mb-1">الطلاب المسجلين بالمنصة</p>
              <p className="text-3xl font-black text-purple-950 dark:text-purple-950 flex items-center gap-2">
                <span dir="ltr">{totalStudents.toLocaleString("en-US")}</span>
                <span className="text-lg text-purple-700 dark:text-purple-500">طالب وطالبة</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-white px-8 py-4 rounded-3xl border border-purple-50 dark:border-purple-200 shadow-sm w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-purple-700 dark:text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-700 dark:text-purple-600 mb-1">أولياء الأمور المتابعين</p>
              <p className="text-3xl font-black text-purple-950 dark:text-purple-950 flex items-center gap-2">
                <span dir="ltr">{totalParents.toLocaleString("en-US")}</span>
                <span className="text-lg text-purple-700 dark:text-purple-500">ولي أمر</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 border-t-4 border-t-purple-600 border-x border-b border-purple-50 shadow-xl relative overflow-hidden group hover:shadow-purple-600/10 transition-shadow duration-500" dir="rtl">
          {/* Background Accent Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center shrink-0 border border-purple-100 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-purple-950 tracking-tight flex items-center gap-2">
                رسالة مفتوحة: عهدٌ من صُنّاع النجاح
              </h2>
            </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-6 text-purple-800 font-medium text-[15px] md:text-base leading-loose md:leading-relaxed text-right">
            <p>
              إلى من اختار طريق التميز ولم يرضَ بغير القمة بديلاً.. مرحباً بك في معقلك الأكاديمي، منصة أكاديمية دقيش التعليمية برج بونعامة. نحن لم نصمم هذه المنصة لتكون مجرد موقع إلكتروني، بل خضنا حرباً حقيقية لنبني لك ترسانة رقمية وسلاحاً لا يُقهر في رحلتك نحو التفوق.
            </p>

            <p>
              <span className="font-black text-purple-700 text-lg">في الكواليس المظلمة:</span> سهر مهندسونا وفريقنا التقني ليالٍ طوال، كتبنا آلاف الأسطر البرمجية، وطوّعنا أحدث تقنيات الذكاء الاصطناعي لنخلق لك بيئة صلبة، سريعة كالصاعقة، وخالية تماماً من المشتتات. منصتنا لا تنام، لا تتعب، ومسخرة لخدمتك في كل ثانية.
            </p>

            <p>
              <span className="font-black text-purple-700 text-lg">وفي ساحة العلم:</span> سكب نُخبة أساتذتنا عصارة سنين من الخبرة والحكمة لتعبيد طريقك. لم نضع لك دروساً جامدة فحسب؛ بل فككنا شفرات المنهج، توقّعنا عثراتك قبل أن تقع فيها، وصممنا لك مساراً ذكياً يتحدى عقلك ويرتقي به من الصفر إلى الاحتراف.
            </p>

            <p className="text-xl md:text-2xl font-black text-purple-950 text-center py-4 bg-purple-50 rounded-xl border border-purple-200">
              لقد اجتمع التقني والأستاذ على هدف واحد فقط: <span className="text-purple-800">أنت.</span>
            </p>

            <p>
              نحن لم ننم لكي لا تتعثر أنت. لقد جهزنا لك العتاد، ذلّلنا الصعاب، ووضعنا أسباب النجاح بين يديك. الآن.. انتهى دورنا وبدأ دورك! لا مجال للأعذار، ولا وقت للتردد. اعلم أن خلف هذه الشاشة جيشاً كاملاً يؤمن بك ولن يقبل لك سوى الصدارة.
            </p>

            <p className="font-black text-xl text-purple-950 pt-4">
              فهل أنت مستعد لكتابة التاريخ؟
            </p>

            <div className="pt-6 border-t border-purple-50 mt-8">
              <p className="font-bold text-purple-900">مع كل الثقة والدعم،</p>
              <p className="font-black text-purple-700 text-lg mt-1">جيش الخفاء – فريق منصة أكاديمية دقيش التعليمية برج بونعامة</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
