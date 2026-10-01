"use client";

import { useState, useRef } from "react";
import { BookOpen, Edit, Trash2, Image as ImageIcon, Upload, Loader2, ImagePlus } from "lucide-react";
import Link from "next/link";
import { deleteSubject, updateSubjectImage, bulkUpdateSubjectImages } from "@/actions/subjects";
import { Phase, Level, Stream } from "@/generated/prisma";
import { translateLevel, translateStream } from "@/lib/utils/translations";

function translatePhase(phase: Phase | "ALL"): string {
  if (phase === "PRIMARY") return "الابتدائي";
  if (phase === "MIDDLE") return "المتوسط";
  if (phase === "SECONDARY") return "الثانوي";
  return "الكل";
}

// We need to define types for the subject coming from Prisma
type SubjectData = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  phase: Phase;
  levels: Level[];
  streams: Stream[];
};

type Props = {
  subjects: SubjectData[];
};

export function AdminSubjectsFilterClient({ subjects }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | "ALL">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<Level | "ALL">("ALL");
  const [selectedStream, setSelectedStream] = useState<Stream | "ALL">("ALL");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Determine available phases based on data (or just hardcode them)
  const phases: Phase[] = ["PRIMARY", "MIDDLE", "SECONDARY"];

  // Determine available levels based on the selected phase
  const getLevelsForPhase = (phase: Phase): Level[] => {
    switch (phase) {
      case "PRIMARY":
        return ["PRIMARY_1", "PRIMARY_2", "PRIMARY_3", "PRIMARY_4", "PRIMARY_5"];
      case "MIDDLE":
        return ["MIDDLE_1", "MIDDLE_2", "MIDDLE_3", "MIDDLE_4"];
      case "SECONDARY":
        return ["SECONDARY_1", "SECONDARY_2", "SECONDARY_3"];
      default:
        return [];
    }
  };

  // Determine streams for secondary
  const getStreamsForLevel = (level: Level): Stream[] => {
    if (level === "SECONDARY_1") {
      return ["COMMON_SCIENCE", "COMMON_LETTERS"];
    }
    if (level === "SECONDARY_2" || level === "SECONDARY_3") {
      return [
        "EXPERIMENTAL_SCIENCES",
        "MATHEMATICS",
        "TECHNICAL_MATH",
        "MANAGEMENT_ECONOMY",
        "LITERATURE_PHILOSOPHY",
        "FOREIGN_LANGUAGES",
      ];
    }
    return [];
  };

  const handlePhaseChange = (p: Phase | "ALL") => {
    setSelectedPhase(p);
    setSelectedLevel("ALL");
    setSelectedStream("ALL");
  };

  const handleLevelChange = (l: Level | "ALL") => {
    setSelectedLevel(l);
    setSelectedStream("ALL");
  };

  // Filter logic
  const filteredSubjects = subjects.filter((s) => {
    if (selectedPhase !== "ALL" && s.phase !== selectedPhase) return false;
    if (selectedLevel !== "ALL" && !s.levels.includes(selectedLevel)) return false;
    if (selectedStream !== "ALL" && !s.streams.includes(selectedStream)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="surface-card p-5 space-y-4">
        {/* Phases Filter */}
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">الطور التعليمي</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePhaseChange("ALL")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedPhase === "ALL" ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
              }`}
            >
              الكل
            </button>
            {phases.map((p) => (
              <button
                key={p}
                onClick={() => handlePhaseChange(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedPhase === p ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
                }`}
              >
                {translatePhase(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Levels Filter (Visible if a specific phase is selected) */}
        {selectedPhase !== "ALL" && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">المستوى الدراسي</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleLevelChange("ALL")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedLevel === "ALL" ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
                }`}
              >
                كل المستويات
              </button>
              {getLevelsForPhase(selectedPhase).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLevelChange(l)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    selectedLevel === l ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
                  }`}
                >
                  {translateLevel(l)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Streams Filter (Visible only for Secondary levels) */}
        {selectedPhase === "SECONDARY" && selectedLevel !== "ALL" && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">الشعبة</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStream("ALL")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedStream === "ALL" ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
                }`}
              >
                كل الشعب
              </button>
              {getStreamsForLevel(selectedLevel).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStream(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    selectedStream === s ? "bg-primary text-white" : "bg-surface-muted text-muted hover:bg-line"
                  }`}
                >
                  {translateStream(s)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">نتائج التصفية ({filteredSubjects.length})</h3>
          
          <form
            action={async (formData) => {
              setBulkUploading(true);
              await bulkUpdateSubjectImages(formData);
              setBulkUploading(false);
            }}
            className="relative"
          >
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              onChange={(e) => {
                if (e.target.files?.length) {
                  e.target.form?.requestSubmit();
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="تطبيق صورة كغلاف لجميع المواد"
            />
            <div className={`btn-primary !py-2 !px-4 flex items-center gap-2 pointer-events-none ${bulkUploading ? 'opacity-70' : ''}`}>
              {bulkUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              تطبيق صورة واحدة لجميع المواد
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((subject) => (
          <article key={subject.id} className="surface-card overflow-hidden flex flex-col">
            <div className="aspect-video w-full relative bg-surface-muted flex items-center justify-center overflow-hidden">
              {subject.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={subject.image} alt={subject.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted" />
              )}

              <div className="absolute top-2 left-2 flex items-center gap-2">
                <form
                  action={async (formData) => {
                    setUploadingId(subject.id);
                    await updateSubjectImage(subject.id, formData);
                    setUploadingId(null);
                  }}
                  className="relative"
                >
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        e.target.form?.requestSubmit();
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="تغيير صورة الغلاف"
                  />
                  <div className="bg-white/90 hover:bg-white p-1.5 rounded-lg text-green-600 flex items-center justify-center pointer-events-none">
                    {uploadingId === subject.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </div>
                </form>
                <Link
                  href={`/dashboard/admin/subjects/${subject.id}/edit`}
                  className="bg-white/90 hover:bg-white p-1.5 rounded-lg text-primary z-20 relative"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <form action={deleteSubject.bind(null, subject.id)} className="z-20 relative">
                  <button
                    type="submit"
                    className="bg-red-50 hover:bg-red-100 p-1.5 rounded-lg text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-ink line-clamp-1">{subject.title}</h3>
              <p className="text-[10px] text-muted mt-0.5">
                {subject.levels.map(translateLevel).join("، ")}
                {subject.streams.length > 0 && subject.streams[0] !== "NONE" && ` - ${subject.streams.map(translateStream).join("، ")}`}
              </p>
              <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
            </div>
          </article>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full surface-card px-6 py-16 text-center">
            <span className="icon-tile mx-auto mb-4">
              <BookOpen className="w-5 h-5" />
            </span>
            <p className="text-sm text-muted">لا توجد مواد تعليمية تطابق التصفية المحددة.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
