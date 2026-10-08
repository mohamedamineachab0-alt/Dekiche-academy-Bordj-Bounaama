import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSessionProfile } from "@/actions/user";

export async function GET(request: Request) {
  const profile = await getUserSessionProfile();
  if (profile?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
      subjects: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // إضافة BOM ليتعرف عليه الإكسيل كملف يدعم العربية
  let csvContent = "\uFEFF";
  csvContent += "اسم الأستاذ,رقم الهاتف,المواد,الأطوار\n";

  teachers.forEach((teacher) => {
    const subjects = teacher.subjects.map((s) => s.title).join(" - ");
    const phases = teacher.phases.map((p) => {
      if (p === "PRIMARY") return "ابتدائي";
      if (p === "MIDDLE") return "متوسط";
      if (p === "SECONDARY") return "ثانوي";
      return p;
    }).join(" - ");

    const row = [
      teacher.name,
      teacher.phone,
      subjects,
      phases
    ].map(val => `"${(val || '').replace(/"/g, '""')}"`).join(',');

    csvContent += row + "\n";
  });

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teachers_export_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
