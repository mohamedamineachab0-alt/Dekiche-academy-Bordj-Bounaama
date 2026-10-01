import { HeroBanner } from "@/components/shared/HeroBanner";
import { Settings, Save, School, GraduationCap, PlusCircle, List } from "lucide-react";
import { getPlatformSettings } from "@/actions/admin-school";
import { getEntityOptions, getEntityLists } from "@/actions/admin-entities";
import { SchoolSettingsForm } from "./SchoolSettingsForm";
import { AddEntityModals } from "@/components/admin/school/AddEntityModals";
import { DataLists } from "@/components/admin/school/DataLists";
import Link from "next/link";

export default async function SchoolManagementPage() {
  const settings = await getPlatformSettings();
  const options = await getEntityOptions();
  const lists = await getEntityLists();

  return (
    <div className="space-y-8 font-sans pb-12">
      <HeroBanner
        variant="hero"
        title="تسيير المدرسة"
        description="إدارة إعدادات المنصة، التسجيلات، والمعلومات العامة."
        icon={School}
      />

      <section className="surface-card p-6 border border-border/50">
        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-primary-mid" />
          إضافة سريع
        </h2>
        <AddEntityModals options={options} />
      </section>

      <section className="surface-card p-6 border border-border/50">
        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
          <List className="w-5 h-5 text-primary-mid" />
          قوائم البيانات (استيراد/تصدير)
        </h2>
        <DataLists lists={lists} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="surface-card p-6 border border-border/50">
            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-mid" />
              الإعدادات العامة
            </h2>
            
            <SchoolSettingsForm initialSettings={settings} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card p-6 border border-border/50">
            <h2 className="text-lg font-bold text-ink mb-4">روابط سريعة</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/admin/teachers"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated transition-colors border border-border/20"
              >
                <div className="p-2 rounded-lg bg-primary-mid/10 text-primary-mid">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-sm">الأساتذة</h3>
                  <p className="text-xs text-muted">إدارة الأساتذة وتعييناتهم</p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

