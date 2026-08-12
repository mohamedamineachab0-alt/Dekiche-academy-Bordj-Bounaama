"use client";

import { useState } from "react";
import { registerUser } from "@/actions/auth";
import { EDUCATION_STAGES, EDUCATION_LEVELS, getStreamsForLevel } from "@/lib/constants/education";
import {
  User, Phone, Lock, GraduationCap, BookOpen,
  Users, UserPlus, ChevronDown, Loader2, AlertCircle,
  Layers, Mail
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
  const isLtr = dir === "ltr";

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-[#000000]">
        {label} {required && <span className="text-[#7E22CE]">*</span>}
      </label>
      
      <div className="relative flex items-center w-full" dir={dir || "rtl"}>
        <div className={`absolute ${isLtr ? 'left-4' : 'right-4'} flex items-center justify-center text-[#000000] pointer-events-none`}>
          <Icon className="w-5 h-5" />
        </div>
        
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
          className={`w-full ${isLtr ? 'pl-12 pr-4 text-left' : 'pr-12 pl-4 text-right'} py-3.5 rounded-xl border-[3px] border-[#000000] bg-white text-[#000000] font-bold text-base placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm`}
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
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="block text-sm font-bold text-[#000000]">
        {label} <span className="text-[#7E22CE]">*</span>
      </label>

      <div className="relative flex items-center w-full" dir="rtl">
        <div className="absolute right-4 flex items-center justify-center text-[#000000] pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>

        <select
          id={id}
          name={name}
          required
          value={value}
          onChange={onChange}
          className="w-full pr-12 pl-10 py-3.5 rounded-xl border-[3px] border-[#000000] bg-white text-[#000000] font-bold text-base appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7E22CE]/20 transition-all shadow-sm"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        
        <ChevronDown className="absolute left-4 w-5 h-5 text-[#000000] pointer-events-none" />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border-[3px] border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-bold mb-6 shadow-3d-soft animate-in fade-in zoom-in duration-300">
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
    <div className="relative min-h-screen font-sans flex items-center justify-center p-4 py-12" dir="rtl">
      
      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Decorative Background Card */}
        <div className="absolute inset-0 bg-[#4C1D95] rounded-3xl transform -rotate-1 border-[3px] border-[#000000] shadow-3d-deep"></div>

        <div className="relative bg-[#FFFFFF] rounded-3xl border-[3px] border-[#000000] overflow-hidden p-8 md:p-10 shadow-3d-deep paper-cut">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#000000] rounded-2xl border-[3px] border-[#000000] shadow-3d-soft mb-6 transform rotate-3">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#000000] leading-tight mb-2">إنشاء حساب جديد</h1>
            <h2 className="text-xl font-bold text-[#7E22CE]">أكاديمية دقيش</h2>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-[#EAE4D9] p-1.5 rounded-2xl mb-8 border-[3px] border-[#000000]">
            <button
              type="button"
              onClick={() => { setRole("STUDENT"); setError(undefined); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 ${role === "STUDENT" ? "bg-[#FFFFFF] text-[#000000] border-[3px] border-[#000000] shadow-3d-soft" : "text-gray-500 hover:text-[#7E22CE]"}`}
            >
              حساب تلميذ
            </button>
            <button
              type="button"
              onClick={() => { setRole("PARENT"); setError(undefined); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 ${role === "PARENT" ? "bg-[#FFFFFF] text-[#000000] border-[3px] border-[#000000] shadow-3d-soft" : "text-gray-500 hover:text-[#7E22CE]"}`}
            >
              حساب ولي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t-[3px] border-[#000000]/10 border-dashed">
                <SelectField
                  id="reg-phase" label="الطور التعليمي" name="phase" icon={Layers}
                  placeholder="اختر الطور"
                  options={EDUCATION_STAGES as any}
                  value={formData.phase} onChange={handleInputChange}
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
              className="w-full flex items-center justify-center gap-2 bg-[#7E22CE] hover:bg-[#6B21A8] text-white font-black py-4 rounded-xl shadow-3d-soft shadow-3d-hover mt-6 disabled:opacity-70 disabled:cursor-not-allowed border-[3px] border-[#000000]"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t-[3px] border-[#000000]/10">
            <p className="text-[#000000] text-sm font-bold">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-[#7E22CE] hover:text-[#4C1D95] font-black underline underline-offset-4 transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
