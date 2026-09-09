/** Normalize AI/JSON LaTeX so KaTeX can render it. */
export function sanitizeMathText(input: string): string {
  let text = String(input ?? "");

  // \infty stored as a real newline: $+\n$ or $+\nfty$
  text = text.replace(/\$\s*([+\-])\s*\n+f?t?y?\s*\$/g, "$$$1\\infty$");
  text = text.replace(/([+\-])\s*\n+f?t?y?(?=\$)/g, "$1\\infty");

  // form-feed leftover from a JS "\frac" escape
  text = text.replace(/\u000c\s*rac/g, "\\frac");
  text = text.replace(/\u000c/g, "\\f");

  return text;
}

export function normalizeLatex(math: string): string {
  let source = sanitizeMathText(math).trim();
  source = source.replace(/^\$+|\$+$/g, "").trim();

  if (/\\\\[a-zA-Z]+/.test(source)) {
    source = source.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
  }

  source = source.replace(/([+\-])\s*\n+/g, "$1\\infty");
  source = source.replace(/\\nfty/g, "\\infty");
  source = source.replace(/\\inf\b/g, "\\infty");
  source = source.replace(/\\infinity\b/g, "\\infty");

  return source;
}

export type MathSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; block: boolean };

export function splitMathSegments(input: string): MathSegment[] {
  const text = sanitizeMathText(input);
  if (!text) return [];

  const pattern =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$]+)\$/g;
  const segments: MathSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[1] != null || match[2] != null) {
      segments.push({
        type: "math",
        value: normalizeLatex(match[1] ?? match[2] ?? ""),
        block: true,
      });
    } else {
      segments.push({
        type: "math",
        value: normalizeLatex(match[3] ?? match[4] ?? ""),
        block: false,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

export function sanitizeQuizField(value: unknown): string {
  return sanitizeMathText(String(value ?? ""));
}
