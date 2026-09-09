export const INACTIVE_DAYS = 5;

export function inactiveSinceDate(now = new Date()) {
  return new Date(now.getTime() - INACTIVE_DAYS * 24 * 60 * 60 * 1000);
}

export function daysSince(date: Date | string | null | undefined, now = new Date()) {
  if (!date) return Infinity;
  const value = typeof date === "string" ? new Date(date) : date;
  return Math.max(0, Math.floor((now.getTime() - value.getTime()) / (1000 * 60 * 60 * 24)));
}

export const LEVEL_ARABIC: Record<string, string> = {
  PRIMARY_1: "السنة الأولى ابتدائي",
  PRIMARY_2: "السنة الثانية ابتدائي",
  PRIMARY_3: "السنة الثالثة ابتدائي",
  PRIMARY_4: "السنة الرابعة ابتدائي",
  PRIMARY_5: "السنة الخامسة ابتدائي",
  MIDDLE_1: "السنة الأولى متوسط",
  MIDDLE_2: "السنة الثانية متوسط",
  MIDDLE_3: "السنة الثالثة متوسط",
  MIDDLE_4: "السنة الرابعة متوسط",
  SECONDARY_1: "السنة الأولى ثانوي",
  SECONDARY_2: "السنة الثانية ثانوي",
  SECONDARY_3: "السنة الثالثة ثانوي",
  AS2: "السنة الثانية ثانوي",
  AS3: "السنة الثالثة ثانوي",
};

export const STREAM_ARABIC: Record<string, string> = {
  NONE: "بدون شعبة",
  COMMON_SCIENCE: "جذع مشترك علوم وتكنولوجيا",
  COMMON_LETTERS: "جذع مشترك آداب",
  EXPERIMENTAL_SCIENCES: "علوم تجريبية",
  MATHEMATICS: "رياضيات",
  TECHNICAL_MATH: "تقني رياضي",
  MANAGEMENT_ECONOMY: "تسيير واقتصاد",
  LITERATURE_PHILOSOPHY: "آداب وفلسفة",
  FOREIGN_LANGUAGES: "لغات أجنبية",
  SCIENCES: "علوم تجريبية",
  MATH: "رياضيات",
  TECH_MATH: "تقني رياضي",
  GESTION: "تسيير واقتصاد",
  LETTRES: "آداب وفلسفة",
  LANGUAGES: "لغات أجنبية",
};

export function labelLevel(level?: string | null) {
  if (!level) return "غير محدد";
  return LEVEL_ARABIC[level] || level;
}

export function labelStream(stream?: string | null) {
  if (!stream) return "غير محدد";
  return STREAM_ARABIC[stream] || stream;
}

function foldTeacherName(name: string) {
  return name
    .normalize("NFC")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ّ/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function bareTeacherName(name?: string | null) {
  return (name || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(الأستاذة|الاستاذة|الأستاذ|الاستاذ)\s+/u, "")
    .trim();
}

export function isFemaleTeacherName(name?: string | null) {
  const raw = (name || "").trim();
  if (!raw) return false;
  if (/أستاذة|استاذة/.test(raw)) return true;

  const folded = foldTeacherName(raw);
  return (
    /اسيا|assia|asia/.test(folded) ||
    /قمور|جمور|gemmeur|guemour|gumeur/.test(folded)
  );
}

export function teacherHonorific(name?: string | null) {
  return isFemaleTeacherName(name) ? "الأستاذة" : "الأستاذ";
}

export function formatTeacherName(name?: string | null) {
  const bare = bareTeacherName(name) || "غير محدد";
  return `${teacherHonorific(name || bare)} ${bare}`;
}
