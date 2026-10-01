import { translateLevel, translateStream } from "@/lib/utils/translations";

export function SubjectName({ subject }: { subject: { title: string, levels?: string[], streams?: string[] } }) {
  if (!subject) return null;
  const levelsText = subject.levels?.map(translateLevel).join("، ") || "";
  const streamsText = subject.streams && subject.streams.length > 0 && subject.streams[0] !== "NONE" ? subject.streams.map(translateStream).join("، ") : "";
  
  return (
    <div className="flex flex-col">
      <span>{subject.title}</span>
      {(levelsText || streamsText) && (
        <span className="text-[10px] text-muted font-normal mt-0.5 leading-tight">
          {levelsText}
          {streamsText && ` - ${streamsText}`}
        </span>
      )}
    </div>
  );
}
