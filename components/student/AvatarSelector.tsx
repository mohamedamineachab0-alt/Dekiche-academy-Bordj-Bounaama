"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { saveStudentPhotoUrl, uploadStudentPhoto } from "@/actions/user";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const PHOTO_BUCKETS = ["subject-covers", "lesson-materials"] as const;

async function uploadPhotoToStorage(file: File) {
  const fileName = `student-avatars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  for (const bucket of PHOTO_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    }
  }
  return null;
}

export function AvatarSelector({ currentAvatarUrl }: { currentAvatarUrl?: string | null }) {
  const [preview, setPreview] = useState(currentAvatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const publicUrl = await uploadPhotoToStorage(compressed);
      let result: { success?: boolean; url?: string; error?: string };
      if (publicUrl) {
        result = await saveStudentPhotoUrl(publicUrl);
      } else {
        const formData = new FormData();
        formData.set("photo", compressed, "avatar.jpg");
        result = await uploadStudentPhoto(formData);
      }
      if (result.success && result.url) {
        setPreview(result.url);
        setSuccess("تم حفظ صورتك");
        router.refresh();
      } else {
        setError(result.error || "فشل رفع الصورة");
        setPreview(currentAvatarUrl || "");
      }
    } catch {
      setError("تعذّر تجهيز الصورة. جرّب صورة أصغر.");
      setPreview(currentAvatarUrl || "");
    }
    URL.revokeObjectURL(localUrl);
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="surface-panel p-6 md:p-8 h-full">
      <span className="icon-tile-solid mb-5">
        <ImageIcon className="w-6 h-6" />
      </span>
      <h3 className="text-xl font-bold text-ink mb-2">الصورة الشخصية</h3>
      <p className="text-muted text-sm leading-relaxed mb-6">
        ارفع صورتك لتظهر في حسابك ودردشة القسم.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-24 h-24 rounded-[1.4rem] overflow-hidden border border-line bg-[#EDE9FE] shrink-0">
          {preview ? (
            <img src={preview} alt="صورتك" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => handleUpload(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary w-full sm:w-auto"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            ارفع صورتك
          </button>
          <p className="text-xs text-muted mt-2">JPG أو PNG، حتى 3 ميغابايت.</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-primary bg-primary-soft border border-line rounded-xl px-3 py-2 mt-4">{success}</p>
      )}
    </div>
  );
}
