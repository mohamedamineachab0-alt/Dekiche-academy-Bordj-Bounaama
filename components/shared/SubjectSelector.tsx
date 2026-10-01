"use client";

import { useState } from "react";
import { Phase, Level, Stream } from "@/generated/prisma";
import { translateLevel, translateStream } from "@/lib/utils/translations";

function translatePhase(phase: Phase | "ALL"): string {
  if (phase === "PRIMARY") return "الابتدائي";
  if (phase === "MIDDLE") return "المتوسط";
  if (phase === "SECONDARY") return "الثانوي";
  return "الكل";
}

type SubjectData = {
  id: string;
  title: string;
  phase: Phase;
  levels: Level[];
  streams: Stream[];
};

type Props = {
  subjects: SubjectData[];
  name?: string;
  defaultValue?: string;
  required?: boolean;
  allowAll?: boolean;
};

export function SubjectSelector({ subjects, name = "subjectId", defaultValue, required = true, allowAll = false }: Props) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | "ALL">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<Level | "ALL">("ALL");
  const [selectedStream, setSelectedStream] = useState<Stream | "ALL">("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultValue || "");

  const phases: Phase[] = ["PRIMARY", "MIDDLE", "SECONDARY"];

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
    setSelectedSubjectId("");
  };

  const handleLevelChange = (l: Level | "ALL") => {
    setSelectedLevel(l);
    setSelectedStream("ALL");
    setSelectedSubjectId("");
  };

  const handleStreamChange = (s: Stream | "ALL") => {
    setSelectedStream(s);
    setSelectedSubjectId("");
  };

  const filteredSubjects = subjects.filter((s) => {
    if (selectedPhase !== "ALL" && s.phase !== selectedPhase) return false;
    if (selectedLevel !== "ALL" && !s.levels.includes(selectedLevel)) return false;
    if (selectedStream !== "ALL" && !s.streams.includes(selectedStream)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Hidden input to hold the value for forms */}
      <input type="hidden" name={name} value={selectedSubjectId === "ALL" ? filteredSubjects.map(s => s.id).join(",") : selectedSubjectId} required={required} />
      <input type="hidden" name="phase" value={selectedPhase !== "ALL" ? selectedPhase : ""} />
      <input type="hidden" name="level" value={selectedLevel !== "ALL" ? selectedLevel : ""} />
      <input type="hidden" name="stream" value={selectedStream !== "ALL" ? selectedStream : "NONE"} />

      <div className="flex flex-col gap-3 p-4 bg-surface-muted rounded-xl border border-line">
        {/* Phase Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePhaseChange("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedPhase === "ALL" ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
            }`}
          >
            كل الأطوار
          </button>
          {phases.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => handlePhaseChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedPhase === p ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
              }`}
            >
              {translatePhase(p)}
            </button>
          ))}
        </div>

        {/* Level Filter */}
        {selectedPhase !== "ALL" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-line/50">
            <button
              type="button"
              onClick={() => handleLevelChange("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedLevel === "ALL" ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
              }`}
            >
              كل المستويات
            </button>
            {getLevelsForPhase(selectedPhase).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => handleLevelChange(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedLevel === l ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
                }`}
              >
                {translateLevel(l)}
              </button>
            ))}
          </div>
        )}

        {/* Stream Filter */}
        {selectedPhase === "SECONDARY" && selectedLevel !== "ALL" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-line/50">
            <button
              type="button"
              onClick={() => handleStreamChange("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStream === "ALL" ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
              }`}
            >
              كل الشعب
            </button>
            {getStreamsForLevel(selectedLevel).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleStreamChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedStream === s ? "bg-primary text-white" : "bg-white text-muted hover:bg-surface"
                }`}
              >
                {translateStream(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Final Subject Selection */}
      <div>
        <select
          className="input-field"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          required={required}
        >
          <option value="">
            {filteredSubjects.length === 0
              ? "لا توجد مواد بهذه التصفية"
              : "اختر المادة المطلوبة من القائمة..."}
          </option>
          {allowAll && filteredSubjects.length > 0 && (
            <option value="ALL" className="font-bold text-primary">
              توليد لجميع المواد المتوافقة ({filteredSubjects.length})
            </option>
          )}
          {filteredSubjects.map((s) => {
            const levelsText = s.levels?.map(translateLevel).join("، ") || "";
            const streamsText = s.streams?.length > 0 && s.streams[0] !== "NONE" ? s.streams.map(translateStream).join("، ") : "";
            const labelText = s.title + (levelsText ? ` (${levelsText}${streamsText ? ` - ${streamsText}` : ""})` : "");
            return (
              <option key={s.id} value={s.id}>
                {labelText}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
