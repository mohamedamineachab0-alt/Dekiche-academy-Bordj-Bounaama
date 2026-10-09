import { redirect } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getTeacherSession } from "@/lib/teacher";
import { revalidatePath } from "next/cache";

export default async function TeacherContactPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const tickets = await prisma.teacherTicket.findMany({
    where: { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  async function createTicket(formData: FormData) {
    "use server";
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    if (!subject || !message) return;

    await prisma.teacherTicket.create({
      data: {
        teacherId: session!.user.id,
        subject,
        message,
        status: "OPEN",
      },
    });
    revalidatePath("/dashboard/teacher/contact");
  }

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      <HeroBanner
        variant="hero"
        title="مراسلة الإدارة"
        description="تواصل مع إدارة الأكاديمية لأي استفسار أو مشكلة تواجهك."
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={createTicket} className="surface-panel p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-ink">إرسال رسالة جديدة</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">الموضوع</label>
              <input
                type="text"
                name="subject"
                required
                className="input-field"
                placeholder="عن ماذا تستفسر؟"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">الرسالة</label>
              <textarea
                name="message"
                required
                rows={5}
                className="input-field resize-none"
                placeholder="اكتب رسالتك للإدارة هنا..."
              />
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-2">
              <Send className="w-4 h-4" />
              <span>إرسال للإدارة</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-ink">رسائلك السابقة</h3>
          {tickets.length === 0 ? (
            <div className="surface-card p-8 text-center text-muted">
              لم تقم بإرسال أي رسالة للإدارة بعد.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="surface-card p-6 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-ink">{ticket.subject}</h4>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        ticket.status === "REPLIED"
                          ? "bg-emerald-50 text-emerald-600"
                          : ticket.status === "CLOSED"
                          ? "bg-line text-muted"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {ticket.status === "REPLIED"
                        ? "تم الرد"
                        : ticket.status === "CLOSED"
                        ? "مغلق"
                        : "قيد الانتظار"}
                    </span>
                  </div>
                  <p className="text-sm text-ink/80 bg-surface/50 p-4 rounded-xl border border-line">
                    {ticket.message}
                  </p>
                  
                  {ticket.reply && (
                    <div className="mt-2 bg-primary-soft/30 p-4 rounded-xl border border-primary/20">
                      <p className="text-xs font-bold text-primary mb-1">رد الإدارة:</p>
                      <p className="text-sm text-primary-dark whitespace-pre-wrap">{ticket.reply}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted text-left" dir="ltr">
                    {ticket.createdAt.toLocaleString("ar-DZ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
