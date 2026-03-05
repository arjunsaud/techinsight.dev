"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const headingElements = Array.from(tempDiv.querySelectorAll("h1, h2, h3"));

    const extractedHeadings = headingElements.map((el, index) => {
      const text = el.textContent || "";
      let id = el.id;

      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        if (!id) id = `heading-${index}`;

        // We'll trust that the main content renderer also adds these IDs
        // or we'll ensure the content is processed consistently.
      }

      return {
        id,
        text,
        level: parseInt(el.tagName.replace("H", ""), 10),
      };
    });

    setHeadings(extractedHeadings);
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="rounded-xl border bg-muted/30 p-4 mb-8">
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block text-sm text-muted-foreground transition-colors hover:text-primary",
              heading.level === 1 && "font-medium text-foreground",
              heading.level === 2 && "pl-4",
              heading.level === 3 && "pl-8",
            )}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(heading.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", `#${heading.id}`);
              }
            }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
