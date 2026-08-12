"use client";

import { useState, useEffect } from "react";
import { registerUser } from "@/actions/auth";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import {
  User, Phone, Lock, GraduationCap, BookOpen,
  Users, Eye, EyeOff, UserPlus, ChevronDown, Loader2, AlertCircle,
  Layers
} from "lucide-react";
import Link from "next/link";

function InputField({
  id, label, name, type = "text", placeholder, icon: Icon, dir,
  required = true, autoComplete, value, onChange
}: {
  id: string; label: string; name: string; type?: string;
  placeholder: string; icon: React.ElementType; dir?: string;
  required?: boolean; autoComplete?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-purple-900 dark:text-purple-300">
        {label} {required && <span className="text-purple-600">*</span>}
      </label>
      
      <div className="relative flex items-center w-full" dir={dir || "rtl"}>
        <div className="absolute start-4 flex items-center justify-center text-slate-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
        
        <input
          id={id}
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          value={value}
          onChange={onChange}
          className="h-14 w-full bg-gray-50 border border-gray-200 rounded-xl ps-12 pe-4 text-purple-950 font-bold placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent focus:outline-none transition-all duration-300"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute end-4 flex items-center justify-center text-slate-400 hover:text-purple-600 transition-colors"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
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
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-purple-900 dark:text-purple-300">
        {label} <span className="text-purple-600">*</span>
      </label>

      <div className="relative flex items-center w-full" dir="rtl">
        <div className="absolute start-4 flex items-center justify-center text-slate-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>

        <select
          id={id}
          name={name}
          required
          value={value}
          onChange={onChange}
          className="h-14 w-full bg-gray-50 border border-gray-200 rounded-xl ps-12 pe-10 text-purple-950 font-bold appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent focus:outline-none transition-all duration-300"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        
        <ChevronDown className="absolute end-4 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl px-4 py-3 text-sm font-medium mb-6">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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
    stage: "",
    level: "",
    stream: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(undefined);
    const { name, value } = e.target;
    
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Reset dependencies
      if (name === "stage") {
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
        } else if (errorMsg.includes("password")) {
          setError("كلمة المرور ضعيفة جدا");
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

  const currentLevels = formData.stage ? EDUCATION_LEVELS[formData.stage as keyof typeof EDUCATION_LEVELS] : [];
  const currentStreams = getStreamsForLevel(formData.stage, formData.level);
  const shouldShowStreams = formData.stage === "SECONDARY" && currentStreams.length > 1;

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] font-arabic flex items-center justify-center p-4 py-12 overflow-hidden selection:bg-purple-200" dir="rtl">
      {/* Global Background Math Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Branding */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-purple-950 leading-tight">منصة أكاديمية دقيش التعليمية</h1>
          <p className="text-purple-700 font-medium text-base mt-2">
            اصنع مستقبلك بثبات نحو القمة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/10 border border-purple-100 overflow-hidden p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-purple-950">إنشاء حساب جديد</h2>
            <p className="text-purple-600 text-sm font-medium mt-1.5">أكمل البيانات التالية لتسجيل حسابك</p>
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
            <button
              type="button"
              onClick={() => { setRole("STUDENT"); setError(undefined); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === "STUDENT" ? "bg-white text-purple-800 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-purple-700"}`}
            >
              حساب تلميذ
            </button>
            <button
              type="button"
              onClick={() => { setRole("PARENT"); setError(undefined); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === "PARENT" ? "bg-white text-purple-800 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-purple-700"}`}
            >
              حساب ولي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="stream" value={shouldShowStreams ? formData.stream : "NONE"} />
            
            <ErrorBanner message={error} />

            <div className="space-y-6">
              <InputField id="reg-name" label="الاسم الكامل" name="fullName"
                placeholder="أدخل الاسم الكامل" icon={User} autoComplete="name" 
                value={formData.fullName} onChange={handleInputChange} />
                
              <InputField id="reg-phone" label="رقم الهاتف" name="phoneNumber" type="tel"
                placeholder="05XXXXXXXX" icon={Phone} dir="ltr" autoComplete="tel" 
                value={formData.phoneNumber} onChange={handleInputChange} />
            </div>

            {role === "STUDENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <SelectField
                  id="reg-stage" label="الطور التعليمي" name="stage" icon={Layers}
                  placeholder="اختر الطور"
                  options={EDUCATION_STAGES as any}
                  value={formData.stage} onChange={handleInputChange}
                />
                
                <div className="animate-fade-in-up">
                  <SelectField
                    id="reg-level" label="المستوى الدراسي" name="level" icon={GraduationCap}
                    placeholder="اختر المستوى"
                    options={currentLevels as any}
                    value={formData.level} onChange={handleInputChange}
                  />
                </div>
                
                {shouldShowStreams && (
                  <div className="md:col-span-2 animate-fade-in-up">
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

            <button
              type="submit"
              disabled={isPending}
              className="h-14 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-8 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            لديك حساب بالفعل{" "}
            <Link href="/login" className="text-purple-700 hover:text-purple-800 font-bold underline underline-offset-4 transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-8">
          منصة أكاديمية دقيش التعليمية جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
