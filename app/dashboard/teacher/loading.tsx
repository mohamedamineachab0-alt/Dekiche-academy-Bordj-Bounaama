import { Loader2 } from "lucide-react";

export default function TeacherDashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-muted">جاري تحميل بيانات تلاميذك وأخطائهم...</p>
    </div>
  );
}
