import "server-only";
import DOMPurify from "isomorphic-dompurify";

export function sanitizeRichText(input: string) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "blockquote", "code", "pre", "h2", "h3", "a"],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "svg", "math"],
    FORBID_ATTR: ["style", "onerror", "onload"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/)/i,
  });
}
