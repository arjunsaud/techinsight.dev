import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function createExcerpt(content: string, maxLength = 180) {
  const stripped = content.replace(/<[^>]+>/g, "").trim();
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return `${stripped.slice(0, maxLength).trim()}...`;
}

export function injectHeadingIds(html: string) {
  let index = 0;
  return html.replace(
    /<(h[1-3])([^>]*)>(.*?)<\/h[1-3]>/gi,
    (match, tag, attrs, content) => {
      if (attrs.includes("id=")) return match;

      // Simple slugify for the ID
      const text = content.replace(/<[^>]+>/g, "").trim();
      const id =
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `heading-${index++}`;

      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    },
  );
}
