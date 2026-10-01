"use client";

import { useState } from "react";
import { updatePlatformSetting } from "@/actions/admin-school";
import { Save, Loader2 } from "lucide-react";

export function SchoolSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [isPending, setIsPending] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      const updates = [
        updatePlatformSetting("SCHOOL_NAME", formData.get("SCHOOL_NAME") as string, "اسم المؤسسة"),
        updatePlatformSetting("CONTACT_PHONE", formData.get("CONTACT_PHONE") as string, "رقم هاتف الدعم"),
        updatePlatformSetting("CONTACT_EMAIL", formData.get("CONTACT_EMAIL") as string, "البريد الإلكتروني"),
        updatePlatformSetting("REGISTRATION_OPEN", formData.get("REGISTRATION_OPEN") === "on" ? "true" : "false", "حالة التسجيلات")
      ];

      await Promise.all(updates);
      setMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح" });
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsPending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked.toString() : e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">اسم المؤسسة</label>
          <input
            type="text"
            name="SCHOOL_NAME"
            defaultValue={settings.SCHOOL_NAME || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-mid/20 transition-all text-ink"
            placeholder="مثال: أكاديمية دكيش"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">رقم هاتف الدعم</label>
          <input
            type="text"
            name="CONTACT_PHONE"
            defaultValue={settings.CONTACT_PHONE || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-mid/20 transition-all text-ink"
            placeholder="05xx xx xx xx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">البريد الإلكتروني للدعم</label>
          <input
            type="email"
            name="CONTACT_EMAIL"
            defaultValue={settings.CONTACT_EMAIL || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-mid/20 transition-all text-ink text-left dir-ltr"
            placeholder="support@example.com"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-surface">
          <div>
            <h4 className="font-semibold text-ink text-sm">التسجيلات مفتوحة</h4>
            <p className="text-xs text-muted mt-0.5">السماح بتسجيل تلاميذ جدد في المنصة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="REGISTRATION_OPEN"
              className="sr-only peer"
              defaultChecked={settings.REGISTRATION_OPEN !== "false"}
            />
            <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-mid"></div>
          </label>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full md:w-auto"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ التغييرات
        </button>
      </div>
    </form>
  );
}
