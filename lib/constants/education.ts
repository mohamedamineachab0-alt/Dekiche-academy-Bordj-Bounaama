export const EDUCATION_STAGES = [
  { value: 'PRIMARY', label: 'الطور الابتدائي' },
  { value: 'MIDDLE', label: 'الطور المتوسط' },
  { value: 'SECONDARY', label: 'الطور الثانوي' },
] as const;

export const EDUCATION_LEVELS = {
  PRIMARY: [
    { value: 'PRIMARY_1', label: 'السنة الأولى ابتدائي' },
    { value: 'PRIMARY_2', label: 'السنة الثانية ابتدائي' },
    { value: 'PRIMARY_3', label: 'السنة الثالثة ابتدائي' },
    { value: 'PRIMARY_4', label: 'السنة الرابعة ابتدائي' },
    { value: 'PRIMARY_5', label: 'السنة الخامسة ابتدائي' },
  ],
  MIDDLE: [
    { value: 'MIDDLE_1', label: 'السنة الأولى متوسط' },
    { value: 'MIDDLE_2', label: 'السنة الثانية متوسط' },
    { value: 'MIDDLE_3', label: 'السنة الثالثة متوسط' },
    { value: 'MIDDLE_4', label: 'السنة الرابعة متوسط' },
  ],
  SECONDARY: [
    { value: 'SECONDARY_1', label: 'السنة الأولى ثانوي' },
    { value: 'SECONDARY_2', label: 'السنة الثانية ثانوي' },
    { value: 'SECONDARY_3', label: 'السنة الثالثة ثانوي' },
  ],
} as const;

export const SECONDARY_STREAMS = {
  SECONDARY_1: [
    { value: 'COMMON_SCIENCE', label: 'جذع مشترك علوم وتكنولوجيا' },
    { value: 'COMMON_LETTERS', label: 'جذع مشترك آداب' },
  ],
  SECONDARY_2: [
    { value: 'EXPERIMENTAL_SCIENCES', label: 'علوم تجريبية' },
    { value: 'MATHEMATICS', label: 'رياضيات' },
    { value: 'TECHNICAL_MATH', label: 'تقني رياضي' },
    { value: 'MANAGEMENT_ECONOMY', label: 'تسيير واقتصاد' },
    { value: 'LITERATURE_PHILOSOPHY', label: 'آداب وفلسفة' },
    { value: 'FOREIGN_LANGUAGES', label: 'لغات أجنبية' },
  ],
  SECONDARY_3: [
    { value: 'EXPERIMENTAL_SCIENCES', label: 'علوم تجريبية' },
    { value: 'MATHEMATICS', label: 'رياضيات' },
    { value: 'TECHNICAL_MATH', label: 'تقني رياضي' },
    { value: 'MANAGEMENT_ECONOMY', label: 'تسيير واقتصاد' },
    { value: 'LITERATURE_PHILOSOPHY', label: 'آداب وفلسفة' },
    { value: 'FOREIGN_LANGUAGES', label: 'لغات أجنبية' },
  ],
} as const;

export function getStreamsForLevel(stage: string, level: string) {
  if (stage !== 'SECONDARY') return [{ value: 'NONE', label: 'بدون شعبة' }];
  
  if (level === 'SECONDARY_1') return SECONDARY_STREAMS.SECONDARY_1;
  if (level === 'SECONDARY_2') return SECONDARY_STREAMS.SECONDARY_2;
  if (level === 'SECONDARY_3') return SECONDARY_STREAMS.SECONDARY_3;
  
  return [{ value: 'NONE', label: 'بدون شعبة' }];
}
