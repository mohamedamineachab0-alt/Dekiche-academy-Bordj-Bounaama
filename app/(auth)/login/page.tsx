"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { universalLoginAction, LoginState } from "@/actions/auth-login";
import { User, LogIn, Loader2, AlertCircle, Phone } from "lucide-react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري التحقق...
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          تسجيل الدخول
        </>
      )}
    </button>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(universalLoginAction, initialState);

  return (
    <AuthPageShell>
        <div className="auth-glass-card p-7 md:p-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-ink mb-1.5">تسجيل الدخول</h1>
            <p className="text-sm text-muted">أدخل اسمك الكامل ورقم هاتفك المسجّل.</p>
          </div>

          <form action={formAction} className="space-y-5">
            <ErrorBanner message={state.error} />

            <div>
              <label htmlFor="login-fullname" className="field-label">
                الاسم الكامل
              </label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-fullname"
                  name="fullName"
                  type="text"
                  dir="rtl"
                  autoComplete="name"
                  placeholder="أدخل اسمك الكامل"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-phone" className="field-label">
                رقم الهاتف
              </label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="login-phone"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="05xxxxxxxx"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-line text-primary focus:ring-primary-mid cursor-pointer accent-[#4c1d95]"
              />
              <span className="text-sm text-muted">تذكرني</span>
            </label>

            <SubmitButton />
          </form>

          <p className="mt-7 pt-6 border-t border-line text-center text-sm text-muted">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
    </AuthPageShell>
  );
}
