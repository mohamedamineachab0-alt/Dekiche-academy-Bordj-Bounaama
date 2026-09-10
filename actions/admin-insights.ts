"use server";

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import {
  getAdminAnalyticsHub,
  getStudent360,
  studentHeuristicInsights,
  type InsightItem,
} from "@/lib/admin-analytics";

const CACHE_MS = 6 * 60 * 60 * 1000;

export type AiInsightPayload = {
  source: "cache" | "ai" | "rules";
  summary: string;
  items: InsightItem[];
  generatedAt: string;
};

function parseItems(raw: unknown): InsightItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Partial<InsightItem>;
      const severity: InsightItem["severity"] =
        row.severity === "high" || row.severity === "medium" ? row.severity : "info";
      return {
        title: String(row.title || "").trim(),
        detail: String(row.detail || "").trim(),
        severity,
        href: row.href ? String(row.href) : undefined,
      };
    })
    .filter((item) => item.title && item.detail)
    .slice(0, 8);
}

async function latestInsight(scope: string, studentId?: string) {
  return prisma.adminAiInsight.findFirst({
    where: studentId ? { scope, studentId } : { scope, studentId: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCachedAdminInsights(): Promise<AiInsightPayload | null> {
  const row = await latestInsight("PLATFORM");
  if (!row) return null;
  return {
    source: "cache",
    summary: row.summary,
    items: parseItems(row.items),
    generatedAt: row.createdAt.toISOString(),
  };
}

export async function generatePlatformInsights(): Promise<AiInsightPayload> {
  const data = await getAdminAnalyticsHub();
  const fallback: AiInsightPayload = {
    source: "rules",
    summary: "توصيات مبنية على مؤشرات المنصة الحالية.",
    items: data.heuristicInsights,
    generatedAt: new Date().toISOString(),
  };

  const cached = await latestInsight("PLATFORM");
  if (cached && Date.now() - cached.createdAt.getTime() < CACHE_MS) {
    return {
      source: "cache",
      summary: cached.summary,
      items: parseItems(cached.items).length ? parseItems(cached.items) : data.heuristicInsights,
      generatedAt: cached.createdAt.toISOString(),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `أنت مستشار تربوي لإدارة أكاديمية دقيش في الجزائر.
أرجع JSON فقط:
{"summary":"جملة واحدة","items":[{"title":"...","detail":"...","severity":"high|medium|info","href":"/dashboard/admin/..."}]}
اللغة: العربية الفصحى. توصيات عملية قصيرة للإدارة. لا اختلاق أسماء غير موجودة في البيانات.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            kpis: data.kpis,
            weakestSubjects: data.mistakesBySubject.slice(0, 5),
            inactive: data.inactiveStudents.slice(0, 8),
            levels: data.studentsByLevel,
            rules: data.heuristicInsights,
          }),
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}") as {
      summary?: string;
      items?: InsightItem[];
    };
    const items = parseItems(parsed.items).length ? parseItems(parsed.items) : data.heuristicInsights;
    const summary = String(parsed.summary || fallback.summary).trim();

    const saved = await prisma.adminAiInsight.create({
      data: {
        scope: "PLATFORM",
        summary,
        items,
      },
    });

    return {
      source: "ai",
      summary,
      items,
      generatedAt: saved.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("generatePlatformInsights", error);
    return fallback;
  }
}

export async function generateStudentInsights(studentId: string): Promise<AiInsightPayload> {
  const profile = await getStudent360(studentId);
  if (!profile) {
    return {
      source: "rules",
      summary: "تعذّر العثور على ملف التلميذ.",
      items: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const rules = studentHeuristicInsights(profile);

  const fallback: AiInsightPayload = {
    source: "rules",
    summary: `تحليل أولي لـ ${profile.fullName}.`,
    items: rules,
    generatedAt: new Date().toISOString(),
  };

  const cached = await latestInsight("STUDENT", studentId);
  if (cached && Date.now() - cached.createdAt.getTime() < CACHE_MS) {
    return {
      source: "cache",
      summary: cached.summary,
      items: parseItems(cached.items).length ? parseItems(cached.items) : rules,
      generatedAt: cached.createdAt.toISOString(),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `أنت مستشار تربوي. أرجع JSON:
{"summary":"...","items":[{"title":"...","detail":"...","severity":"high|medium|info"}]}
عربية فصحى. توصيات لإدارة المدرسة عن هذا التلميذ فقط.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            name: profile.fullName,
            level: profile.level,
            stream: profile.stream,
            points: profile.totalPoints,
            daysInactive: profile.daysInactive,
            guardian: profile.guardian,
            mistakesBySubject: profile.mistakesBySubject,
            recentMistakes: profile.mistakes.slice(0, 8).map((m) => ({
              subject: m.subjectTitle,
              mistake: m.mistakeContent,
              correction: m.correctSolution,
            })),
          }),
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}") as {
      summary?: string;
      items?: InsightItem[];
    };
    const items = parseItems(parsed.items).length ? parseItems(parsed.items) : rules;
    const summary = String(parsed.summary || fallback.summary).trim();

    const saved = await prisma.adminAiInsight.create({
      data: {
        scope: "STUDENT",
        studentId,
        summary,
        items,
      },
    });

    return {
      source: "ai",
      summary,
      items,
      generatedAt: saved.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("generateStudentInsights", error);
    return fallback;
  }
}
