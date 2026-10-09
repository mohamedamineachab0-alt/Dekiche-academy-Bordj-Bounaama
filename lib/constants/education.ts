export const EDUCATION_STAGES = [
  { value: 'PRIMARY', label: 'التعليم الابتدائي' },
  { value: 'MIDDLE', label: 'التعليم المتوسط' },
  { value: 'SECONDARY', label: 'التعليم الثانوي' },
] as const;

export const EDUCATION_LEVELS = {
  PRIMARY: [
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

export const EDUCATION_STREAMS = {
  PRIMARY_2: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  PRIMARY_3: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  PRIMARY_4: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  PRIMARY_5: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  MIDDLE_1: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  MIDDLE_2: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  MIDDLE_3: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  MIDDLE_4: [{ value: 'GENERAL', label: 'عام (لا توجد)' }],
  SECONDARY_1: [
    { value: 'COMMON_SCIENCE', label: 'جذع مشترك علوم وتكنولوجيا' },
  ],
  SECONDARY_2: [
    { value: 'SCIENCES_MATH_TECH', label: 'علوم تجريبية / رياضيات / تقني رياضي' },
    { value: 'LITERATURE_PHILOSOPHY', label: 'آداب وفلسفة' },
    { value: 'FOREIGN_LANGUAGES', label: 'لغات أجنبية' },
  ],
  SECONDARY_3: [
    { value: 'SCIENCES_MATH_TECH', label: 'علوم تجريبية / رياضيات / تقني رياضي' },
    { value: 'MANAGEMENT_ECONOMY', label: 'تسيير واقتصاد' },
    { value: 'LITERATURE_PHILOSOPHY', label: 'آداب وفلسفة' },
    { value: 'FOREIGN_LANGUAGES', label: 'لغات أجنبية' },
  ],
} as const;

export const SUBJECTS_MAP: Record<string, { value: string; label: string }[]> = {
  'PRIMARY_2_GENERAL': [
    { value: 'ARABIC_MATH_COMBINED', label: 'اللغة العربية + رياضيات' }
  ],
  'PRIMARY_3_GENERAL': [
    { value: 'ARABIC_MATH_COMBINED', label: 'اللغة العربية + رياضيات' },
    { value: 'ENGLISH', label: 'اللغة الإنجليزية' }
  ],
  'PRIMARY_4_GENERAL': [
    { value: 'ARABIC_MATH_COMBINED', label: 'اللغة العربية + رياضيات' },
    { value: 'FRENCH', label: 'اللغة الفرنسية' },
    { value: 'ENGLISH', label: 'اللغة الإنجليزية' }
  ],
  'PRIMARY_5_GENERAL': [
    { value: 'ARABIC_MATH_COMBINED', label: 'اللغة العربية + رياضيات' },
    { value: 'FRENCH', label: 'اللغة الفرنسية' },
    { value: 'ENGLISH', label: 'اللغة الإنجليزية' }
  ],
  'SECONDARY_1_COMMON_SCIENCE': [
    { value: 'MATH', label: 'الرياضيات' },
    { value: 'PHYSICS', label: 'العلوم الفيزيائية' },
    { value: 'SCIENCE', label: 'علوم الطبيعة والحياة' }
  ],
  'SECONDARY_2_SCIENCES_MATH_TECH': [
    { value: 'MATH', label: 'الرياضيات' },
    { value: 'PHYSICS', label: 'العلوم الفيزيائية' },
    { value: 'SCIENCE', label: 'علوم الطبيعة والحياة' }
  ],
  'SECONDARY_2_LITERATURE_PHILOSOPHY': [
    { value: 'PHILOSOPHY', label: 'الفلسفة' },
    { value: 'ARABIC', label: 'اللغة العربية وآدابها' }
  ],
  'SECONDARY_2_FOREIGN_LANGUAGES': [
    { value: 'PHILOSOPHY', label: 'الفلسفة' },
    { value: 'ARABIC', label: 'اللغة العربية وآدابها' }
  ],
  'SECONDARY_3_SCIENCES_MATH_TECH': [
    { value: 'MATH', label: 'الرياضيات' },
    { value: 'PHYSICS', label: 'العلوم الفيزيائية' },
    { value: 'SCIENCE', label: 'علوم الطبيعة والحياة' }
  ],
  'SECONDARY_3_MANAGEMENT_ECONOMY': [
    { value: 'MATH', label: 'الرياضيات' },
    { value: 'ACCOUNTING', label: 'التسيير المحاسبي والمالي' }
  ],
  'SECONDARY_3_LITERATURE_PHILOSOPHY': [
    { value: 'PHILOSOPHY', label: 'الفلسفة' },
    { value: 'ARABIC', label: 'اللغة العربية وآدابها' },
    { value: 'FRENCH', label: 'اللغة الفرنسية' },
    { value: 'ENGLISH', label: 'اللغة الإنجليزية' }
  ],
  'SECONDARY_3_FOREIGN_LANGUAGES': [
    { value: 'PHILOSOPHY', label: 'الفلسفة' },
    { value: 'ARABIC', label: 'اللغة العربية وآدابها' },
    { value: 'FRENCH', label: 'اللغة الفرنسية' },
    { value: 'ENGLISH', label: 'اللغة الإنجليزية' },
    { value: 'SPANISH', label: 'اللغة الإسبانية' }
  ],
};

export function getStreamsForLevel(level: keyof typeof EDUCATION_STREAMS) {
  return EDUCATION_STREAMS[level] || [{ value: 'GENERAL', label: 'عام (لا توجد)' }];
}

export function getSubjectsForLevelAndStream(level: string, stream: string) {
  const key = `${level}_${stream}`;
  return SUBJECTS_MAP[key] || [];
}
