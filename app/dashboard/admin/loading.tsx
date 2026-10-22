import { Loader2 } from "lucide-react";

export default function AdminDashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Animated Progress Loading Bar */}
      <div className="w-full bg-purple-100/50 dark:bg-purple-950/20 h-1.5 rounded-full overflow-hidden relative">
        <div className="h-full bg-linear-to-r from-purple-600 via-indigo-500 to-amber-400 rounded-full animate-progress-indeterminate shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
      </div>

      {/* Header Loading Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/60 rounded-lg animate-pulse mt-1.5" />
            </div>
          </div>
        </div>
        <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 animate-pulse" />
            </div>
            <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-14 w-full bg-gray-50 dark:bg-gray-800/40 rounded-xl animate-pulse flex items-center px-4 justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
