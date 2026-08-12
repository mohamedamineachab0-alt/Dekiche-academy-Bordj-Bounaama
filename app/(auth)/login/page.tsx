"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { universalLoginAction, LoginState } from "@/actions/auth-login";
import { User, LogIn, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-black py-4 rounded-xl shadow-3d-soft shadow-3d-hover mt-6 disabled:opacity-70 disabled:cursor-not-allowed border-[3px] border-[#000000]"
    >
      {pending ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          جاري التحقق...
        </>
      ) : (
        <>
          <LogIn className="w-6 h-6 text-white" />
          تسجيل الدخول
        </>
      )}
    </button>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border-[3px] border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-bold mb-5 shadow-3d-soft animate-in fade-in zoom-in duration-300">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(universalLoginAction, initialState);

  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-4 py-12" dir="rtl">
      
      <div className="relative z-10 w-full max-w-md">
        
        {/* Decorative Background Card */}
        <div className="absolute inset-0 bg-[#4C1D95] rounded-3xl transform rotate-3 border-[3px] border-[#000000] shadow-3d-deep"></div>

        <div className="relative bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] overflow-hidden p-8 shadow-3d-deep paper-cut">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7E22CE] rounded-2xl border-[3px] border-[#000000] shadow-3d-soft mb-6 transform -rotate-3">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#000000] leading-tight mb-2">أكاديمية دقيش</h1>
            <h2 className="text-xl font-bold text-[#4C1D95]">تسجيل الدخول</h2>
          </div>

          <form action={formAction} className="space-y-6">
            <ErrorBanner message={state.error} />

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-phone" className="block text-sm font-bold text-[#000000]">
                  البريد الإلكتروني أو رقم الهاتف <span className="text-[#7E22CE]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="login-phone"
                    name="phoneNumber" // Keeping for backend compatibility
                    type="text"
                    dir="rtl"
                    placeholder="أدخل بريدك أو رقم هاتفك"
                    required
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl border-[3px] border-[#000000] bg-white text-[#000000] font-bold text-base placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-fullname" className="block text-sm font-bold text-[#000000]">
                  الاسم الكامل <span className="text-[#7E22CE]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    id="login-fullname"
                    name="fullName"
                    type="text"
                    dir="rtl"
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl border-[3px] border-[#000000] bg-white text-[#000000] font-bold text-base placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded-md border-[2px] border-[#000000] text-[#7E22CE] focus:ring-[#7E22CE] cursor-pointer" />
                <span className="text-sm font-bold text-[#000000] group-hover:text-[#7E22CE] transition-colors">تذكرني</span>
              </label>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-8 text-center pt-6 border-t-[3px] border-[#000000]/10">
            <p className="text-[#000000] text-sm font-bold">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-[#7E22CE] hover:text-[#4C1D95] font-black underline underline-offset-4 transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
