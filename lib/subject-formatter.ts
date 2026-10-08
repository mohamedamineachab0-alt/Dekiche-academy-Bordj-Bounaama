export const levelMap: Record<string, string> = {
  PRIMARY_1: 'الأولى',
  PRIMARY_2: 'الثانية',
  PRIMARY_3: 'الثالثة',
  PRIMARY_4: 'الرابعة',
  PRIMARY_5: 'الخامسة',
  MIDDLE_1: 'الأولى متوسط',
  MIDDLE_2: 'الثانية متوسط',
  MIDDLE_3: 'الثالثة متوسط',
  MIDDLE_4: 'الرابعة متوسط',
  SECONDARY_1: 'الأولى ثانوي',
  SECONDARY_2: 'الثانية ثانوي',
  SECONDARY_3: 'الثالثة ثانوي',
};

export const streamMap: Record<string, string> = {
  NONE: '',
  GENERAL: 'عام',
  COMMON_SCIENCE: 'جذع مشترك علوم',
  COMMON_LETTERS: 'جذع مشترك آداب',
  EXPERIMENTAL_SCIENCES: 'علوم تجريبية',
  MATHEMATICS: 'رياضيات',
  TECHNICAL_MATH: 'تقني رياضي',
  SCIENCES_MATH_TECH: 'شعب علمية',
  MANAGEMENT_ECONOMY: 'تسيير واقتصاد',
  LITERATURE_PHILOSOPHY: 'آداب وفلسفة',
  FOREIGN_LANGUAGES: 'لغات أجنبية',
};

export function formatSubjectTitle(title: string, levels: string[], streams: string[]) {
  const levelsStr = levels?.length > 0 ? levels.map((l: string) => levelMap[l] || l).join(' و') : '';
  const streamsStr = streams?.map((s: string) => streamMap[s] || s).filter(Boolean).join(' و ') || '';
  
  let fullTitle = title;
  if (levelsStr) fullTitle += ` - ${levelsStr}`;
  if (streamsStr) fullTitle += ` - ${streamsStr}`;
  
  return fullTitle;
}
