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
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mb-4 border border-purple-100">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-purple-950 mb-2">الصورة الشخصية</h3>
        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
          اختر صورة شخصية لملفك لتظهر في لوحة التحكم و دردشة القسم
        </p>
      </div>

      <div className="space-y-4">
        {/* Presets Grid */}
        <div className="flex flex-wrap gap-4 justify-center">
          {PRESET_AVATARS.map((url, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAvatar(url);
              }}
              className={`relative w-16 h-16 shrink-0 rounded-full border-2 overflow-hidden transition-all duration-200 group ${
                selectedAvatar === url ? "border-purple-700 scale-110 shadow-md" : "border-slate-100 hover:border-purple-300"
              }`}
            >
              <img src={url} alt="صورة رمزية" className="w-full h-full rounded-full object-cover bg-white" />
              {selectedAvatar === url && (
                <div className="absolute inset-0 bg-purple-800/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-800 font-bold bg-white/80 rounded-full p-1" />
                </div>
              )}
            </button>
          ))}
        </div>



        <button
          onClick={handleSave}
          disabled={!selectedAvatar || isSaving || selectedAvatar === currentAvatarUrl}
          className="w-full flex items-center justify-center gap-2 bg-purple-800 text-white py-3 rounded-xl font-bold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-200"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ الصورة
        </button>
      </div>
    </div>
  );
}
