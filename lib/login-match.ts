function toWesternDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export function phoneVariants(raw: string) {
  const digits = toWesternDigits(raw).replace(/\D/g, "");
  const variants = new Set<string>();
  if (!digits) return [];

  variants.add(digits);
  if (digits.startsWith("213") && digits.length >= 12) {
    variants.add(`0${digits.slice(3)}`);
    variants.add(digits.slice(3));
  }
  if (digits.startsWith("0") && digits.length >= 9) {
    variants.add(digits.slice(1));
    variants.add(`213${digits.slice(1)}`);
  }
  if (!digits.startsWith("0") && digits.length === 9) {
    variants.add(`0${digits}`);
  }

  return [...variants];
}

export function normalizeLoginName(raw: string) {
  return raw
    .normalize("NFC")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ّ/g, "")
    .replace(/^مثال[:：]?\s*/u, "")
    .replace(/^(ال)?(استاذه|استاذ|سيده|سيد)\s+/u, "")
    .replace(/عبد\s+/g, "عبد")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function namesMatch(stored: string, typed: string) {
  const left = normalizeLoginName(stored);
  const right = normalizeLoginName(typed);
  if (!left || !right) return false;
  if (left === right) return true;

  const sortTokens = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .sort()
      .join(" ");

  return sortTokens(left) === sortTokens(right);
}
