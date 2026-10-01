import { prisma } from "@/lib/prisma";
import { CreateLessonForm } from "@/components/admin/CreateLessonForm";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Video, Sparkles } from "lucide-react";

export const metadata = {
  title: "نشر درس جديد وتخزينه على Vimeo | لوحة تحكم دكيش",
  description: "رفع ملفات الفيديو مباشرة إلى Vimeo وحفظ الدروس في المنصة.",
};

export default async function AdminCreateLessonPage() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return (
    <div className="space-y-6 pb-16 font-sans" dir="rtl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
          <Link href="/dashboard/admin" className="hover:text-purple-950 transition">
            لوحة الإدارة
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <Link href="/dashboard/admin/lessons" className="hover:text-purple-950 transition">
            إدارة الدروس
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <span className="text-purple-950 font-bold">نشر درس جديد</span>
        </div>

        <Link
          href="/dashboard/admin/lessons"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3 py-1.5 rounded-xl transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>العودة للدروس</span>
        </Link>
      </div>

      {/* Render Component */}
      <CreateLessonForm subjects={subjects} />
    </div>
  );
}
