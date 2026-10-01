"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { teacherLoginAction, LoginState } from "@/actions/auth-login";
import { LogIn, Loader2, AlertCircle, Phone, KeyRound } from "lucide-react";
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
          دخول الأستاذ
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

export default function TeacherLoginPage() {
  const [state, formAction] = useActionState(teacherLoginAction, initialState);

  return (
    <AuthPageShell>
        <div className="auth-glass-card p-7 md:p-8 border-purple-500/20 border-2">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-purple-600 mb-1.5">بوابة الأساتذة</h1>
            <p className="text-sm text-muted">الرجاء إدخال رقم الهاتف وكلمة المرور الخاصة بك.</p>
          </div>

          <form action={formAction} className="space-y-5">
            <ErrorBanner message={state.error} />

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

            <div>
              <label htmlFor="login-password" className="field-label">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  dir="ltr"
                  placeholder="كلمة المرور"
                  required
                  className="input-field pr-10"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
    </AuthPageShell>
  );
}
