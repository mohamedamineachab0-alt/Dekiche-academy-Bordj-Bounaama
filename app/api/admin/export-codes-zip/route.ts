import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSessionProfile } from '@/actions/user';
import JSZip from 'jszip';

const phaseMap: Record<string, string> = {
  PRIMARY: 'ابتدائي',
  MIDDLE: 'متوسط',
  SECONDARY: 'ثانوي'
};

const levelMap: Record<string, string> = {
  PRIMARY_1: 'الأولى',
  PRIMARY_2: 'الثانية',
  PRIMARY_3: 'الثالثة',
  PRIMARY_4: 'الرابعة',
  PRIMARY_5: 'الخامسة',
  MIDDLE_1: 'الأولى',
  MIDDLE_2: 'الثانية',
  MIDDLE_3: 'الثالثة',
  MIDDLE_4: 'الرابعة',
  SECONDARY_1: 'الأولى',
  SECONDARY_2: 'الثانية',
  SECONDARY_3: 'الثالثة',
};

const streamMap: Record<string, string> = {
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

export async function GET(req: Request) {
  try {
    const user = await getUserSessionProfile();
    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const monthsParam = url.searchParams.get('months');
    
    let codesWhere: any = { accessType: 'MONTHLY', isUsed: false };
    if (monthsParam) {
      const months = monthsParam.split(',').map(Number);
      codesWhere.validMonths = { hasSome: months };
    }

    const subjects = await prisma.subject.findMany({
      include: { 
        teacher: true, 
        codes: {
          where: codesWhere
        } 
      }
    });

    const zip = new JSZip();

    for (const subject of subjects) {
      if (subject.codes.length === 0) continue;

      const phase = phaseMap[subject.phase] || subject.phase;
      const levels = subject.levels.length > 0 
        ? subject.levels.map((l: string) => levelMap[l] || l).join(' و') 
        : 'جميع المستويات';
        
      let csvContent = '\uFEFFالكود\n';
      for (const code of subject.codes) {
        csvContent += `"${code.code}"\n`;
      }

      const streamNames = subject.streams
        .map((s: string) => streamMap[s] || s)
        .filter((s: string) => s && s !== '');
        
      let fileName = `${subject.title} - ${levels} ${phase}`;
      if (streamNames.length > 0) {
        fileName += ` - ${streamNames.join(' و ')}`;
      }
      
      fileName = fileName.replace(/[\/\\?%*:|"<>]/g, '-');
      fileName += '.csv';

      zip.file(fileName, csvContent);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="codes_export.zip"',
      },
    });
  } catch (error) {
    console.error('Error generating codes zip:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
