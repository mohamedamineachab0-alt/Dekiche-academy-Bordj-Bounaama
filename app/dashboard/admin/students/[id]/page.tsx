import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudent360, studentHeuristicInsights } from "@/lib/admin-analytics";
import { Student360Profile } from "@/components/admin/Student360Profile";

export default async function AdminStudentProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const data = await getStudent360(id);
  if (!data) notFound();

  const initialAi = {
    source: "rules" as const,
    summary: `تحليل أولي لـ ${data.fullName}.`,
    items: studentHeuristicInsights(data),
    generatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title={data.fullName}
        description="ملف 360: النشاط، الأخطاء والتصحيحات، ومتابعة ولي الأمر."
        icon={UserRound}
      />
      <Student360Profile data={data} initialAi={initialAi} />
    </div>
  );
}
