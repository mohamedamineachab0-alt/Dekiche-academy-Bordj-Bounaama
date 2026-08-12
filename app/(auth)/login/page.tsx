"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { universalLoginAction, LoginState } from "@/actions/auth-login";
import { User, LogIn, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          جاري التحقق...
        </>
      ) : (
        <>
          <LogIn className="w-5 h-5 text-white" />
          تسجيل الدخول
        </>
      )}
    </button>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl px-4 py-3 text-sm font-medium mb-5 animate-in fade-in zoom-in duration-300">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(universalLoginAction, initialState);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-white font-arabic flex items-center justify-center p-4 py-12 overflow-hidden selection:bg-purple-200 dark:selection:bg-white/50" dir="rtl">
      
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-purple-950 dark:text-purple-950 leading-tight">منصة أكاديمية دقيش التعليمية برج بونعامة</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">
            اصنع مستقبلك بثبات نحو القمة
          </p>
        </div>

        <div className="bg-white dark:bg-white rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-purple-200 overflow-hidden p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-black text-purple-950 dark:text-purple-950">تسجيل الدخول</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form action={formAction} className="space-y-5">
            <ErrorBanner message={state.error} />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-name" className="block text-sm font-bold text-purple-800 dark:text-purple-800">
                  الاسم الكامل <span className="text-purple-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-name"
                    name="fullName"
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-900 dark:text-purple-950 font-medium text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-phone" className="block text-sm font-bold text-purple-800 dark:text-purple-800">
                  رقم الهاتف <span className="text-purple-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-phone"
                    name="phoneNumber"
                    type="tel"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-purple-200 bg-white dark:bg-white text-purple-900 dark:text-purple-950 font-medium text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-purple-700 hover:text-purple-700 font-bold underline underline-offset-4">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
