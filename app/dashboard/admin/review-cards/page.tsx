import { prisma } from "@/lib/prisma";
import { STREAMS, LEVELS } from "@/lib/constants";
import { Library, Plus, Trash2 } from "lucide-react";
import { createReviewCard } from "@/actions/review-cards";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ReviewCardFormClient } from "@/components/admin/ReviewCardFormClient";
import { MonthSelect } from "@/components/shared/MonthSelect";

export default async function AdminReviewCardsPage() {
  const cards = await prisma.reviewCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: true }
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, phase: true, level: true, stream: true }
  });

  return (
    <div className="space-y-6">
      <HeroBanner 
        title="بطاقات المراجعة (Flashcards)"
        description="أنشئ بطاقات مراجعة سريعة تفاعلية لمساعدة التلاميذ على تذكر المعلومات الأساسية"
        icon={Library}
        gradientClass="bg-gradient-to-r from-white to-fuchsia-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <ReviewCardFormClient 
            subjects={subjects.map(s => ({
              id: s.id,
              title: s.title,
              phase: s.phase,
              level: s.level,
              stream: s.stream
            }))}
            action={async (formData: FormData) => { 
              "use server"; 
              await createReviewCard(formData); 
            }} 
          />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map(card => {
              const levelStr = LEVELS.find(l => l.value === card.level)?.label;
              const streamStr = STREAMS.find(s => s.value === card.stream)?.label;

              return (
                <div key={card.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-slate-950 text-lg">{card.title}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={async () => {
                        "use server";
                        await prisma.reviewCard.delete({ where: { id: card.id } });
                      }}>
                        <button type="submit" className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-2 flex-1">
                    <div>
                      <span className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-1 block">السؤال</span>
                      <p className="text-sm font-bold text-purple-800 bg-white p-3 rounded-xl border border-slate-100">{card.question}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider mb-1 block">الجواب</span>
                      <p className="text-sm font-medium text-purple-950 bg-purple-50 p-3 rounded-xl border border-purple-100">{card.answer}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                    <span className="bg-purple-50 text-purple-800 text-[10px] font-black px-2 py-1 rounded-md">
                      {card.subject.title}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                      {levelStr} • {streamStr}
                    </span>
                    {card.exerciseRef && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        {card.exerciseRef}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {cards.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                لا توجد بطاقات مراجعة مسجلة بعد
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
