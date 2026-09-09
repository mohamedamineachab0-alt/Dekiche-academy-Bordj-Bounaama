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
        className="input-field appearance-none cursor-pointer pl-10"
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
        <span className="text-muted">▼</span>
      </div>
    </div>
  );
}
