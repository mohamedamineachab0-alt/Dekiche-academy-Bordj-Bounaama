import { Suspense } from "react";
import { cookies } from "next/headers";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TipsSection } from "@/components/landing/TipsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";
import { PrayerDuaSection } from "@/components/landing/PrayerDuaSection";
import { getBordjBounaamaPrayerTimes } from "@/lib/prayer-times";

async function PrayerTimesBlock() {
  const times = await getBordjBounaamaPrayerTimes();
  return <PrayerDuaSection times={times} />;
}

export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  const isAuthenticated = !!sessionId;

  return (
    <div dir="rtl" className="relative min-h-[100dvh] overflow-x-clip bg-background font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 35% at 80% 10%, rgba(91,33,182,0.1), transparent 60%), radial-gradient(ellipse 40% 30% at 10% 60%, rgba(109,40,217,0.08), transparent 55%)",
        }}
      />
      <Header isAuthenticated={isAuthenticated} />
      <main className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} />
        <WhyChooseUs />
        <HowItWorksSection />
        <Suspense fallback={<PrayerDuaSection times={null} />}>
          <PrayerTimesBlock />
        </Suspense>
        <TipsSection />
        <FaqSection />
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
