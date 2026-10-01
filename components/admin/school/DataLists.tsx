"use client";

import { useState, useRef } from "react";
import { Download, Upload, Users, BookOpen, Loader2, Search } from "lucide-react";
import { importStudentsCSV } from "@/actions/admin-entities";
import { translateLevel, translateStream } from "@/lib/utils/translations";

export function DataLists({ lists }: { lists: { students: any[], groups: any[] } }) {
  const [activeTab, setActiveTab] = useState<"students" | "groups">("students");
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = lists.students.filter(s => 
    s.fullName.includes(searchTerm) || 
    s.phoneNumber.includes(searchTerm) || 
    (s.studentProfile?.parentName && s.studentProfile.parentName.includes(searchTerm)) ||
    (s.studentProfile?.parentPhone && s.studentProfile.parentPhone.includes(searchTerm))
  );

  const filteredGroups = lists.groups.filter(g => 
    g.name.includes(searchTerm) || 
    g.subject.title.includes(searchTerm)
  );

  const handleExportCSV = () => {
    let csvContent = "";
    if (activeTab === "students") {
      csvContent = "ID,الاسم,الهاتف,الفوج,المستوى\n";
      lists.students.forEach(s => {
        const groupName = s.enrollments?.[0]?.group?.name || "بدون فوج";
        const level = s.studentProfile?.level || "غير محدد";
        csvContent += `${s.id},${s.fullName},${s.phoneNumber},${groupName},${level}\n`;
      });
    } else {
      csvContent = "ID,الاسم,المادة,الأستاذ,عدد التلاميذ\n";
      lists.groups.forEach(g => {
        csvContent += `${g.id},${g.name},${g.subject.title},${g.teacher?.name || "لا يوجد"},${g._count.enrollments}\n`;
      });
    }

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const studentsData = [];
      
      // Expected CSV format: fullName,phoneNumber,parentName,parentPhone,level,groupId
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [fullName, phoneNumber, parentName, parentPhone, level, groupId] = line.split(",");
        studentsData.push({ fullName, phoneNumber, parentName, parentPhone, level, groupId });
      }

      const res = await importStudentsCSV(studentsData);
      if (res.success) {
        alert(`تم استيراد ${res.count} تلميذ بنجاح.`);
      } else {
        alert("حدث خطأ أثناء الاستيراد: " + res.error);
      }
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="ابحث عن تلميذ، ولي، فوج، مادة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full input-field pr-12 bg-surface border border-line p-2.5 rounded-xl text-ink"
        />
        <Search className="w-5 h-5 text-muted absolute top-1/2 -translate-y-1/2 right-4" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-surface-muted rounded-xl">
          <button 
            onClick={() => setActiveTab("students")} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'students' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            التلاميذ ({lists.students.length})
          </button>
          <button 
            onClick={() => setActiveTab("groups")} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'groups' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            الأفواج ({lists.groups.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "students" && (
            <>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isImporting}
                className="btn-primary py-2 px-4 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                استيراد من CSV
              </button>
            </>
          )}
          <button onClick={handleExportCSV} className="btn-primary py-2 px-4 flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/50 bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="bg-surface-muted text-ink/70">
            {activeTab === "students" ? (
              <tr>
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">الهاتف</th>
                <th className="px-4 py-3 font-semibold">المستوى والشعبة</th>
                <th className="px-4 py-3 font-semibold">معلومات الولي</th>
                <th className="px-4 py-3 font-semibold">الفوج المسجل</th>
              </tr>
            ) : (
              <tr>
                <th className="px-4 py-3 font-semibold">اسم الفوج</th>
                <th className="px-4 py-3 font-semibold">المادة</th>
                <th className="px-4 py-3 font-semibold">عدد التلاميذ</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border/30">
            {activeTab === "students" ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-surface-muted/30">
                  <td className="px-4 py-3 font-medium">{student.fullName}</td>
                  <td className="px-4 py-3" dir="ltr">{student.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{student.studentProfile?.level || "غير محدد"}</span>
                      <span className="text-xs text-muted">{student.studentProfile?.stream || "NONE"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{student.studentProfile?.parentName || "غير محدد"}</span>
                      <span className="text-xs text-muted" dir="ltr">{student.studentProfile?.parentPhone || ""}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{student.enrollments?.[0]?.group?.name || "بدون فوج"}</td>
                </tr>
              ))
            ) : (
              filteredGroups.map((group) => {
                const subject = group.subject;
                const levelsText = subject?.levels?.map(translateLevel).join("، ") || "";
                const streamsText = subject?.streams?.length > 0 && subject.streams[0] !== "NONE" ? subject.streams.map(translateStream).join("، ") : "";
                
                return (
                  <tr key={group.id} className="hover:bg-surface-muted/30">
                    <td className="px-4 py-3 font-medium">{group.name}</td>
                    <td className="px-4 py-3">
                      <div>{subject.title}</div>
                      {(levelsText || streamsText) && (
                        <div className="text-[10px] text-muted mt-0.5">
                          {levelsText}
                          {streamsText && ` - ${streamsText}`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary-mid">{group._count.enrollments}</td>
                  </tr>
                );
              })
            )}
            {((activeTab === "students" && filteredStudents.length === 0) || (activeTab === "groups" && filteredGroups.length === 0)) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  لا توجد بيانات متاحة حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
