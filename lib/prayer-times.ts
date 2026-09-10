export const PRAYER_LABELS = [
  { key: "Fajr", label: "الفجر" },
  { key: "Sunrise", label: "الشروق" },
  { key: "Dhuhr", label: "الظهر" },
  { key: "Asr", label: "العصر" },
  { key: "Maghrib", label: "المغرب" },
  { key: "Isha", label: "العشاء" },
] as const;

export type PrayerKey = (typeof PRAYER_LABELS)[number]["key"];

export type PrayerTimesPayload = {
  dateLabel: string;
  hijriLabel: string;
  method: string;
  times: Record<PrayerKey, string>;
  nextKey: PrayerKey | null;
};

const BORDJ_LAT = 35.8517;
const BORDJ_LNG = 1.6172;
const ALGERIA_METHOD = 19;

function cleanTime(value: string | undefined) {
  return (value || "--:--").replace(/\s*\(.*\)$/, "").trim();
}

function minutesFromMidnight(hhmm: string) {
  const [h, m] = hhmm.split(":").map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function algiersMinutesNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Algiers",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function nextPrayer(times: Record<PrayerKey, string>): PrayerKey | null {
  const now = algiersMinutesNow();
  const salahOrder: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const key of salahOrder) {
    const value = minutesFromMidnight(times[key]);
    if (value != null && value > now) return key;
  }
  return "Fajr";
}

export async function getBordjBounaamaPrayerTimes(): Promise<PrayerTimesPayload | null> {
  try {
    const url = new URL("https://api.aladhan.com/v1/timings");
    url.searchParams.set("latitude", String(BORDJ_LAT));
    url.searchParams.set("longitude", String(BORDJ_LNG));
    url.searchParams.set("method", String(ALGERIA_METHOD));

    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        timings?: Record<string, string>;
        date?: {
          readable?: string;
          hijri?: { date?: string; month?: { ar?: string }; year?: string };
        };
        meta?: { method?: { name?: string } };
      };
    };

    const timings = json.data?.timings;
    if (!timings) return null;

    const times = {
      Fajr: cleanTime(timings.Fajr),
      Sunrise: cleanTime(timings.Sunrise),
      Dhuhr: cleanTime(timings.Dhuhr),
      Asr: cleanTime(timings.Asr),
      Maghrib: cleanTime(timings.Maghrib),
      Isha: cleanTime(timings.Isha),
    };

    const hijri = json.data?.date?.hijri;
    const hijriLabel = hijri?.date
      ? `${hijri.date}${hijri.month?.ar ? ` — ${hijri.month.ar}` : ""}`
      : "";

    return {
      dateLabel: json.data?.date?.readable || "",
      hijriLabel,
      method: json.data?.meta?.method?.name || "وزارة الشؤون الدينية والأوقاف — الجزائر",
      times,
      nextKey: nextPrayer(times),
    };
  } catch {
    return null;
  }
}
