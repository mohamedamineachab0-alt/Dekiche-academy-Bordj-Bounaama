import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { ParentsTableClient } from "@/components/admin/ParentsTableClient";
import { getStudentsWithParents } from "@/actions/admin-parents";
import { requireUser } from "@/lib/authz";

export default async function AdminParentsPage() {
  const sessionId = (await requireUser()).id;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const students = await getStudentsWithParents();

  return (
    <div className="space-y-8">
      <HeroBanner 
        title="مراسلة الأولياء"
        description="استعرض قائمة التلاميذ المسجلين وتواصل مباشرة مع أوليائهم عبر إرسال إشعارات وتنبيهات بخصوص الغيابات أو التقدم"
        icon={Users}
        bgClass="bg-[#7E22CE]"
      />

      <ParentsTableClient students={students} />
    </div>
  );
}
