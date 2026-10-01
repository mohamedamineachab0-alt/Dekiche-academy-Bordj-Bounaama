"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginCodesPortal, PortalLoginState } from "@/actions/codes-portal";
import { Key, Phone, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

const initialState: PortalLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>جاري التحقق من الصلاحيات...</span>
        </>
      ) : (
        <>
          <Key className="w-4 h-4" />
          <span>دخول إلى بوابة استخراج الرموز</span>
        </>
      )}
    </button>
  );
}

export function CodesPortalLogin() {
  const [state, formAction] = useActionState(loginCodesPortal, initialState);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-xl shadow-purple-600/30 border border-purple-500/30 mb-2">
            <Key className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            أكاديمية دكيش
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            منظومة استخراج وتوزيع رموز الاشتراكات الرسمية
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              تسجيل الدخول المخصص
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              خاص بالمسؤولين ونقاط التوزيع المعتمدة
            </p>
          </div>

          {state.error && (
            <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                رقم الهاتف المعتمد
              </label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  defaultValue="0663438000"
                  dir="ltr"
                  placeholder="0663438000"
                  className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-purple-500 rounded-xl pr-10 pl-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition font-mono"
                />
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-neutral-500">
              وصول آمن ومشفر بأعلى معايير الحماية
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
