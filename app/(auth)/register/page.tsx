"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import {
  User, GraduationCap, BookOpen,
  UserPlus, ChevronDown, Loader2, AlertCircle,
  Layers, Mail
} from "lucide-react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

function InputField({
  id, label, name, type = "text", placeholder, icon: Icon, dir,
  required = true, autoComplete, value, onChange
}: {
  id: string; label: string; name: string; type?: string;
  placeholder: string; icon: React.ElementType; dir?: string;
  required?: boolean; autoComplete?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const isLtr = dir === "ltr";

  return (
    <div className="w-full">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <div className="relative flex items-center w-full" dir={dir || "rtl"}>
        <span className={`absolute ${isLtr ? "left-3.5" : "right-3.5"} text-muted pointer-events-none`}>
          <Icon className="w-4 h-4" />
        </span>

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          value={value}
          onChange={onChange}
          className={`input-field ${isLtr ? "pl-10 text-left" : "pr-10 text-right"}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  id, label, name, options, icon: Icon, placeholder, value, onChange
}: {
  id: string; label: string; name: string;
  options: { value: string; label: string }[];
  icon: React.ElementType; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <div className="relative flex items-center w-full" dir="rtl">
        <span className="absolute right-3.5 text-muted pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>

        <select
          id={id}
          name={name}
          required
          value={value}
          onChange={onChange}
          className="input-field pr-10 pl-10 appearance-none cursor-pointer"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <ChevronDown className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
      </div>
    </div>
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

export default function RegisterPage() {
  const [role, setRole] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    phase: "",
    level: "",
    stream: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(undefined);
    const { name, value } = e.target;

    setFormData(prev => {
      const next = { ...prev, [name]: value };

      if (name === "phase") {
        next.level = "";
        next.stream = "";
      }
      if (name === "level") {
        next.stream = "";
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsPending(true);
    setError(undefined);

    try {
      const data = new FormData(e.currentTarget);
      const res = await registerUser(data);
      if (res?.error) {
        setIsPending(false);
        const errorMsg = res.error.toLowerCase();
        if (errorMsg.includes("already exists") || errorMsg.includes("unique")) {
          setError("هذا الحساب موجود بالفعل الرجاء تسجيل الدخول");
        } else if (errorMsg.includes("phone") || errorMsg.includes("format")) {
          setError("صيغة رقم الهاتف غير صحيحة");
        } else {
          setError(res.error);
        }
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || (err?.digest && err.digest.startsWith('NEXT_REDIRECT'))) {
        throw err;
      }
      console.error("Registration error caught:", err);
      setError("حدث خطا اثناء الاتصال بالخادم");
      setIsPending(false);
    }
  };

  const currentLevels = formData.phase ? EDUCATION_LEVELS[formData.phase as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = getStreamsForLevel(formData.phase, formData.level);
  const shouldShowStreams = formData.phase === "SECONDARY" && currentStreams.length > 1;

  return (
    <AuthPageShell maxWidthClass="max-w-2xl">
        <div className="auth-glass-card p-7 md:p-9">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-ink mb-1.5">إنشاء حساب جديد</h1>
            <p className="text-sm text-muted">اختر نوع الحساب ثم أكمل بياناتك.</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-surface-muted mb-7">
            <button
              type="button"
              onClick={() => { setRole("STUDENT"); setError(undefined); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
 role === "STUDENT" ? "bg-surface text-primary shadow-3d-soft" : "text-muted hover:text-ink"
 }`}
            >
              حساب تلميذ
            </button>
            <button
              type="button"
              onClick={() => { setRole("PARENT"); setError(undefined); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
 role === "PARENT" ? "bg-surface text-primary shadow-3d-soft" : "text-muted hover:text-ink"
 }`}
            >
              حساب وليّ أمر
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="stream" value={shouldShowStreams ? formData.stream : "NONE"} />

            <ErrorBanner message={error} />

            <div className="space-y-5">
              <InputField id="reg-name" label="الاسم الكامل" name="fullName"
                placeholder="أدخل الاسم الكامل" icon={User} autoComplete="name"
                value={formData.fullName} onChange={handleInputChange} />

              <InputField id="reg-phone" label="البريد الإلكتروني أو رقم الهاتف" name="phoneNumber" type="text"
                placeholder="أدخل بريدك أو رقم هاتفك" icon={Mail} dir="rtl" autoComplete="email"
                value={formData.phoneNumber} onChange={handleInputChange} />
            </div>

            {role === "STUDENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-line">
                <SelectField
                  id="reg-phase" label="الطور التعليمي" name="phase" icon={Layers}
                  placeholder="اختر الطور"
                  options={EDUCATION_STAGES as any}
                  value={formData.phase} onChange={handleInputChange}
                />

                <SelectField
                  id="reg-level" label="المستوى الدراسي" name="level" icon={GraduationCap}
                  placeholder="اختر المستوى"
                  options={currentLevels as any}
                  value={formData.level} onChange={handleInputChange}
                />

                {shouldShowStreams && (
                  <div className="md:col-span-2">
                    <SelectField
                      id="reg-stream" label="الشعبة" name="stream" icon={BookOpen}
                      placeholder="اختر الشعبة"
                      options={currentStreams as any}
                      value={formData.stream} onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </button>
          </form>

          <p className="mt-7 pt-6 border-t border-line text-center text-sm text-muted">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
    </AuthPageShell>
  );
}
