/** Normalize AI/JSON LaTeX so KaTeX can render it. */

const EXISTING_MATH =
  /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$]+\$/g;

export function repairLatexEscapes(input: string): string {
  let text = String(input ?? "");

  // \infty stored as a real newline: $+\n$ or $+\nfty$
  text = text.replace(/\$\s*([+\-])\s*\n+f?t?y?\s*\$/g, "$$$1\\infty$");
  text = text.replace(/([+\-])\s*\n+f?t?y?(?=\$)/g, "$1\\infty");

  // JS string leftovers: "\frac" "\to" "\times" "\neq" "\rightarrow"
  text = text.replace(/\u000c\s*rac/g, "\\frac");
  text = text.replace(/\u000c/g, "\\f");
  text = text.replace(/\t(imes|ext|an|o(?![a-zA-Z])|frac|ilde|riangle|au|heta)/g, "\\t$1");
  text = text.replace(/\r(ightarrow|ight|ho|ing)/g, "\\r$1");
  text = text.replace(/\n(eq|otin|abla)(?![a-zA-Z])/g, "\\n$1");

  if (/\\\\[a-zA-Z]+/.test(text)) {
    text = text.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
  }

  return text;
}

function consumeBraced(source: string, start: number): number {
  if (source[start] !== "{") return start;
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return source.length;
}

function consumeParen(source: string, start: number): number {
  if (source[start] !== "(") return start;
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return source.length;
}

function consumeLatexExpr(source: string, start: number): number {
  let index = start;
  const assignment = source.slice(index).match(/^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)?\s*=\s*/);
  if (assignment) index += assignment[0].length;
  if (source[index] === "+" || source[index] === "-") index += 1;

  const consumeUnit = (allowBareIdent: boolean): boolean => {
    const before = index;
    while (source[index] === " ") index += 1;

    if (source[index] === "\\" && /[a-zA-Z]/.test(source[index + 1] || "")) {
      const command = source.slice(index).match(/^\\[a-zA-Z]+\*?/);
      if (!command) {
        index = before;
        return false;
      }
      index += command[0].length;
      while (source[index] === "[" || source[index] === "{") {
        if (source[index] === "[") {
          const close = source.indexOf("]", index);
          index = close >= 0 ? close + 1 : source.length;
        } else {
          index = consumeBraced(source, index);
        }
      }
      if (source[index] === "(") index = consumeParen(source, index);
      return true;
    }

    if (source[index] === "^" || source[index] === "_") {
      index += 1;
      if (source[index] === "{") index = consumeBraced(source, index);
      else if (source[index]) index += 1;
      return true;
    }

    if (source[index] === "{") {
      index = consumeBraced(source, index);
      return true;
    }

    if (allowBareIdent && /[A-Za-z0-9]/.test(source[index] || "")) {
      while (/[A-Za-z0-9]/.test(source[index] || "")) index += 1;
      return true;
    }

    if (allowBareIdent && /[+\-=]/.test(source[index] || "")) {
      index += 1;
      return true;
    }

    index = before;
    return false;
  };

  if (!consumeUnit(false)) return start;
  while (consumeUnit(true)) {
    // keep reading a single math island
  }
  return index;
}

function findLatexStart(source: string, from: number): number {
  for (let index = from; index < source.length; index += 1) {
    if (source[index] !== "\\" || !/[a-zA-Z]/.test(source[index + 1] || "")) {
      continue;
    }

    let start = index;
    if (start > from && (source[start - 1] === "+" || source[start - 1] === "-")) {
      start -= 1;
    }

    const prefix = source.slice(from, start);
    const assignment = prefix.match(/([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)?\s*=\s*)$/);
    if (assignment) start -= assignment[1].length;

    return start;
  }
  return -1;
}

function wrapTextRun(run: string): string {
  if (!run || !/\\[a-zA-Z]+/.test(run)) return run;

  let output = "";
  let cursor = 0;
  while (cursor < run.length) {
    const start = findLatexStart(run, cursor);
    if (start < 0) {
      output += run.slice(cursor);
      break;
    }
    output += run.slice(cursor, start);
    const end = consumeLatexExpr(run, start);
    const chunk = run.slice(start, end).trimEnd();
    if (!chunk || chunk === run.slice(start, start + 1)) {
      output += run[start];
      cursor = start + 1;
      continue;
    }
    output += `$${chunk}$`;
    cursor = start + chunk.length;
  }
  return output;
}

export function wrapBareLatex(input: string): string {
  const text = String(input ?? "");
  if (!/\\[a-zA-Z]+/.test(text)) return text;

  const delimiter = new RegExp(EXISTING_MATH.source, "g");
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = delimiter.exec(text)) !== null) {
    parts.push(wrapTextRun(text.slice(lastIndex, match.index)));
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  parts.push(wrapTextRun(text.slice(lastIndex)));
  return parts.join("");
}

export function sanitizeMathText(input: string): string {
  return wrapBareLatex(repairLatexEscapes(input));
}

export function normalizeLatex(math: string): string {
  let source = repairLatexEscapes(math).trim();
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
