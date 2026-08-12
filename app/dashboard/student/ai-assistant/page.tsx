import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { AiChatClient } from "@/components/student/AiChatClient";
import { prisma } from "@/lib/prisma";
import { EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";

export default async function AiAssistantPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      studentProfile: true,
      mistakes: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user || !user.studentProfile) {
    redirect("/login");
  }

  const rawPhase = user.studentProfile.phase;
  const rawLevel = user.studentProfile.level;
  const rawStream = user.studentProfile.stream;

  const levelsForPhase = EDUCATION_LEVELS[rawPhase as keyof typeof EDUCATION_LEVELS] || [];
  const levelStr = levelsForPhase.find((l: any) => l.value === rawLevel)?.label || rawLevel;

  const streamsForLevel = getStreamsForLevel(rawPhase, rawLevel);
  const streamStr = streamsForLevel.find((s: any) => s.value === rawStream)?.label || rawStream;

  const studentName = user.fullName;
  
  // If there's no stream (e.g. PRIMARY or MIDDLE), don't show the stream part
  const studentLevelStr = rawStream !== "NONE" && streamStr !== "بدون شعبة" 
    ? `${levelStr} - ${streamStr}` 
    : levelStr;
    
  const greetingText = rawStream !== "NONE" && streamStr !== "بدون شعبة"
    ? `أنت طالب في ${levelStr} في شعبة ${streamStr}`
    : `أنت طالب في ${levelStr}`;

  const studentMistakesStr = user.mistakes.length > 0
    ? user.mistakes.map(m => m.mistakeContent).join('، ')
    : 'لا توجد اخطاء مسجلة حتى الان';

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6 pt-2 font-sans pb-4">
      <HeroBanner
        title="dekiche academy"
        description="متصل بمعرفتك ومستواك وأخطائك"
        icon={Bot}
      />
      <div className="flex-1 min-h-0 bg-[#FFFFFF] rounded-3xl shadow-3d-soft border-[3px] border-[#000000] overflow-hidden flex flex-col paper-cut relative z-10">
        <AiChatClient
          studentId={sessionId}
          greetingText={greetingText}
          userAvatarUrl={user.avatarUrl}
          studentName={studentName}
          studentLevel={studentLevelStr}
          studentMistakes={studentMistakesStr}
        />
      </div>
    </div>
  );
}
