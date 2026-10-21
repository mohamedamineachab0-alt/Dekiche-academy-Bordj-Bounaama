export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Users, Plus, Download, Printer } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import Link from "next/link";
import { CreateTeacherClient } from "@/components/admin/CreateTeacherClient";
import { TeachersDirectoryClient } from "@/components/admin/TeachersDirectoryClient";

export const metadata = {
  title: "فضاء وقائمة الأساتذة | منصة دقيش التعليمية",
  description: "لوحة التحكم المركزية بالأساتذة: اختر أي أستاذ للدخول المباشر إلى فضائه التعليمي، أو أضف أساتذة جدد",
};

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      subjects: {
        select: { id: true, title: true },
      },
    },
  });

  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const serializedTeachers = teachers.map((t) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    phases: t.phases || [],
    levels: t.levels || [],
    streams: t.streams || [],
    subjects: t.subjects || [],
  }));

  return (
    <div className="space-y-8 font-sans pb-16" dir="rtl">
      <HeroBanner
        variant="hero"
        title="فضاء وقائمة الأساتذة"
        description="لوحة التحكم المركزية: اختر أي أستاذ من القائمة للدخول المباشر إلى فضائه التعليمي وإدارته، أو أضف أساتذة جدد واضبط المواد والمستويات."
        icon={Users}
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/dashboard/admin/teachers/credentials"
              target="_blank"
              className="btn-secondary w-full sm:w-auto bg-white hover:bg-gray-50 text-ink shadow-sm"
            >
              <Printer className="w-4 h-4" />
              طباعة حسابات الأساتذة
            </Link>
            <a
              href="/api/admin/export-teachers"
              className="btn-primary w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              تحميل القائمة (CSV)
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Add New Teacher */}
        <div className="xl:col-span-1 order-2 xl:order-1">
          <div className="surface-card p-6 rounded-2xl border border-line sticky top-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line">
              <span className="icon-tile">
                <Plus className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">إضافة أستاذ جديد</h2>
                <p className="text-xs text-muted mt-0.5">تسجيل أستاذ وتعيين مواده وشعبه</p>
              </div>
            </div>

            <CreateTeacherClient subjects={subjects} />
          </div>
        </div>

        {/* Right Column: Teachers Space, Quick Enter & Directory */}
        <div className="xl:col-span-2 order-1 xl:order-2">
          <TeachersDirectoryClient teachers={serializedTeachers} />
        </div>
      </div>
    </div>
  );
}
