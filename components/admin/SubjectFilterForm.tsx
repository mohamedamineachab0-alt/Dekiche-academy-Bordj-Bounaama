"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SubjectFilterForm({
  subjects,
  selectedSubjectId
}: {
  subjects: { id: string; title: string }[];
  selectedSubjectId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="relative inline-block w-64">
      <select 
        className="w-full p-2.5 pr-4 pl-10 rounded-xl border border-slate-200 bg-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none cursor-pointer"
        value={selectedSubjectId || ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set("subjectId", e.target.value);
          } else {
            params.delete("subjectId");
          }
          router.push(`?${params.toString()}`);
        }}
      >
        <option value="" disabled>المادة</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <span className="text-slate-400">▼</span>
      </div>
    </div>
  );
}
