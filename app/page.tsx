import { cookies } from "next/headers";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { prisma } from "@/lib/prisma";
import { Book, PenTool, Notebook as NotebookIcon, Ruler, Calculator } from "lucide-react";


export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  const isAuthenticated = !!sessionId;

  // Fetch dynamic student statistics
  const totalStudents = await prisma.studentProfile.count();
  const totalParents = await prisma.parentStudentLink.count();
  
  // Fetch top 10 students by points
  const topProfiles = await prisma.studentProfile.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 10,
    include: { user: true }
  });

  const topStudents = topProfiles.map(profile => ({
    id: profile.userId,
    name: profile.user.fullName,
    points: profile.totalPoints
  }));

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-[#F8F9FA] bg-notebook-grid">

      <div className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} />
        <LeaderboardSection totalStudents={totalStudents} totalParents={totalParents} topStudents={topStudents} />
        <FeaturesSection />
        <TeamSection />
        
        {/* Footer brutalist */}
        <footer className="relative py-12 bg-[#000000] text-[#FFFFFF] border-t-8 border-[#7E22CE] text-center">
          <p className="text-lg font-bold tracking-wider">
            جميع الحقوق محفوظة لمنصة أكاديمية دقيش التعليمية برج بونعامة © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
