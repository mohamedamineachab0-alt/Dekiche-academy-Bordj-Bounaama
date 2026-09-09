import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Map } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { getStudentRoadmap } from "@/actions/roadmap";
import { StudyRoadmap } from "@/components/student/StudyRoadmap";

export const dynamic = "force-dynamic";

export default async function StudentRoadmapPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) redirect("/login");

  const roadmaps = await getStudentRoadmap(sessionId);

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="مسار دراستك"
        description="طريق واضح لكل مادة: ما أنجزته، وما هي خطوتك التالية."
        icon={Map}
      />
      <StudyRoadmap roadmaps={roadmaps} />
    </div>
  );
}
