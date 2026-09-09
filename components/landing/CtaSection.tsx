"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section dir="rtl" className="pb-20 md:pb-28">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", damping: 22, stiffness: 90 }}
          className="rounded-2xl bg-primary text-white px-6 py-14 md:px-16 md:py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <h2 className="kufi text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.15] mb-4">
                افتح حسابك وابدأ المراجعة.
              </h2>
              <p className="text-white/70 text-lg leading-[1.85] max-w-[42ch]">
                سجّل كتلميذ لتفعيل موادك برموز الاشتراك، أو كوليّ أمر لتتابع أبناءك.
              </p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9 lg:text-end">
              <Link
                href={isAuthenticated ? "/dashboard/student" : "/register"}
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                {isAuthenticated ? "مساحتي" : "إنشاء حساب"}
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
