"use client";

import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section dir="rtl" className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 mt-32 mb-16">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, type: "spring", damping: 25 }}
        className="relative bg-gradient-to-br from-[#5B21B6] via-[#4C1D95] to-[#3B0764] rounded-[3.5rem] overflow-hidden p-12 md:p-24 text-center flex flex-col items-center justify-center shadow-[0_30px_60px_rgba(91,33,182,0.3)]"
      >
        
        {/* Plush Background Glows (Yellow Accent) */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/20 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-300/20 via-transparent to-transparent opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 blur-xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center mb-10 border border-white/20 shadow-xl">
            <span className="font-black text-3xl text-yellow-400 drop-shadow-md">د</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
            المستقبل يبدأ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-300 to-yellow-100">بقرار.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-purple-200 font-medium max-w-2xl mb-14 leading-[1.8]">
            انضم إلى آلاف الطلاب الذين غيروا مسارهم الأكاديمي معنا. نحن لا نعدك بالنجاح فقط، بل نصنعه معك خطوة بخطوة في بيئة تعليمية تضاهي الأفضل عالمياً.
          </p>

          <Link
            href={isAuthenticated ? "/dashboard/student" : "/register"}
            className="group flex items-center justify-center gap-4 px-12 py-5 bg-yellow-400 text-[#3B0764] rounded-[1.5rem] font-black text-lg shadow-[0_12px_40px_rgba(250,204,21,0.2)] hover:bg-yellow-300 hover:shadow-[0_16px_50px_rgba(250,204,21,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
          >
            <span>{isAuthenticated ? "الذهاب للوحة التحكم" : "ابدأ رحلتك الآن مجاناً"}</span>
            <ArrowUpLeft className="w-6 h-6 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
