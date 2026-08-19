"use client";

import Link from "next/link";
import { useScroll, motion, useTransform } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

export function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className={`flex items-center justify-between rounded-2xl transition-all duration-500 ${
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04] px-6 py-3" 
            : "bg-transparent px-2 py-2"
        }`}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#5B21B6] text-white flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(91,33,182,0.3)] group-hover:scale-105 transition-transform duration-300">
              د
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">أكاديمية دقيش</span>
          </Link>

          {/* Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <Link href="#features" className="hover:text-[#5B21B6] transition-colors">المميزات</Link>
            <Link href="#how-it-works" className="hover:text-[#5B21B6] transition-colors">طريقة العمل</Link>
            <Link href="#team" className="hover:text-[#5B21B6] transition-colors">فريقنا</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link 
                href="/dashboard/student" 
                className="px-6 py-2.5 bg-[#5B21B6] text-white text-sm font-bold rounded-xl hover:bg-[#4C1D95] hover:shadow-[0_4px_12px_rgba(91,33,182,0.25)] transition-all duration-300"
              >
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-[#5B21B6] text-sm font-bold transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  دخول
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#5B21B6] text-white text-sm font-bold rounded-xl hover:bg-[#4C1D95] hover:shadow-[0_4px_12px_rgba(91,33,182,0.25)] transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  حساب جديد
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </motion.header>
  );
}
