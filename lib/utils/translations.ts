export function translateLevel(level: string | null | undefined): string {
  if (!level) return "";
  
  const translations: Record<string, string> = {
    "PRIMARY_1": "الأولى ابتدائي",
    "PRIMARY_2": "الثانية ابتدائي",
    "PRIMARY_3": "الثالثة ابتدائي",
    "PRIMARY_4": "الرابعة ابتدائي",
    "PRIMARY_5": "الخامسة ابتدائي",
    
    "MIDDLE_1": "الأولى متوسط",
    "MIDDLE_2": "الثانية متوسط",
    "MIDDLE_3": "الثالثة متوسط",
    "MIDDLE_4": "الرابعة متوسط",
    
    "SECONDARY_1": "الأولى ثانوي",
    "SECONDARY_2": "الثانية ثانوي",
    "SECONDARY_3": "الثالثة ثانوي"
  };

  return translations[level] || level;
}

export function translateStream(stream: string | null | undefined): string {
  if (!stream || stream === "NONE") return "";

  const translations: Record<string, string> = {
    "COMMON_SCIENCE": "جذع مشترك علوم وتكنولوجيا",
    "COMMON_LETTERS": "جذع مشترك آداب",
    "EXPERIMENTAL_SCIENCES": "علوم تجريبية",
    "MATHEMATICS": "رياضيات",
    "TECHNICAL_MATH": "تقني رياضي",
    "MANAGEMENT_ECONOMICS": "تسيير واقتصاد",
    "FOREIGN_LANGUAGES": "لغات أجنبية",
    "LITERATURE_PHILOSOPHY": "آداب وفلسفة"
  };

  return translations[stream] || stream;
}

export function formatSubjectsCount(count: number): string {
  if (count === 1) return "مادة واحدة";
  if (count === 2) return "مادتين";
  if (count >= 3 && count <= 10) return `${count} مواد`;
  return `${count} مادة`;
}
