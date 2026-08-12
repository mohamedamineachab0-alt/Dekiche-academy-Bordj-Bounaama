"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { updateUserAvatar } from "@/actions/user";
import { useRouter } from "next/navigation";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Amine",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Samir",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Lina",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Karim",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nour",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Yanis",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Rania",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Walid",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aya",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Omar",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Farah"
];

export function AvatarSelector({ currentAvatarUrl }: { currentAvatarUrl?: string | null }) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    const result = await updateUserAvatar(selectedAvatar);
    if (result.success) {
      router.refresh();
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-[3px] border-[#000000] shadow-3d-soft paper-cut flex flex-col justify-between h-full relative overflow-hidden">
      <div className="relative z-10">
        <div className="w-14 h-14 bg-[#EC4899] text-white rounded-2xl flex items-center justify-center mb-6 border-[3px] border-[#000000] shadow-sm transform rotate-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black text-[#000000] mb-3">الصورة الشخصية</h3>
        <p className="text-gray-600 font-bold text-sm leading-relaxed mb-8">
          اختر صورة شخصية لملفك لتظهر في لوحة التحكم و دردشة القسم
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Presets Grid */}
        <div className="flex flex-wrap gap-4 justify-center">
          {PRESET_AVATARS.map((url, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAvatar(url);
              }}
              className={`relative w-16 h-16 shrink-0 rounded-2xl border-[3px] overflow-hidden transition-all duration-200 group ${
                selectedAvatar === url ? "border-[#000000] scale-110 shadow-3d-soft rotate-3 z-10" : "border-[#000000]/20 hover:border-[#000000] hover:-rotate-3 hover:shadow-3d-hover bg-white"
              }`}
            >
              <img src={url} alt="صورة رمزية" className="w-full h-full object-cover bg-[#F8F9FA]" />
              {selectedAvatar === url && (
                <div className="absolute inset-0 bg-[#7E22CE]/20 flex items-center justify-center backdrop-blur-[1px]">
                  <Check className="w-6 h-6 text-[#000000] font-black bg-[#FACC15] rounded-xl p-1 border-[2px] border-[#000000]" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedAvatar || isSaving || selectedAvatar === currentAvatarUrl}
          className="w-full flex items-center justify-center gap-2 bg-[#7E22CE] text-white py-4 rounded-xl font-black text-lg border-[3px] border-[#000000] hover:-translate-y-1 hover:shadow-3d-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          حفظ الصورة
        </button>
      </div>
    </div>
  );
}
