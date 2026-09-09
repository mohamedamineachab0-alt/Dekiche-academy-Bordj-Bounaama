import { notFound, redirect } from "next/navigation";
import { UserRound } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudent360, studentHeuristicInsights } from "@/lib/admin-analytics";
import { Student360Profile } from "@/components/admin/Student360Profile";
import { getTeacherSession } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function TeacherStudentProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getTeacherSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const enrolled = await prisma.enrollment.findFirst({
    where: {
      studentId: id,
      subjectId: { in: session.subjectIds },
    },
    select: { id: true },
  });
  if (!enrolled) notFound();

  const data = await getStudent360(id, { subjectIds: session.subjectIds });
  if (!data) notFound();

  const initialAi = {
    source: "rules" as const,
    summary: `متابعة ${data.fullName} في موادك.`,
    items: studentHeuristicInsights(data),
    generatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title={data.fullName}
        description="ملف التلميذ: الأخطاء، الدروس غير المشاهَدة، والتمارين والكويزات المعلّقة."
        icon={UserRound}
      />
      <Student360Profile
        data={data}
        initialAi={initialAi}
        showAi={false}
        backHref="/dashboard/teacher"
        backLabel="العودة إلى تلاميذك"
      />
    </div>
  );
}
