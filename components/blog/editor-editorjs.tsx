"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";

interface EditorJsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface EditorJsBlock {
  type: string;
  data: Record<string, unknown>;
}

function normalizeHtml(input: string) {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : "<p></p>";
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlToBlocks(html: string): EditorJsBlock[] {
  const normalized = normalizeHtml(html);
  const doc = new DOMParser().parseFromString(normalized, "text/html");
  const elements = Array.from(doc.body.children);

  const blocks = elements
    .map((element): EditorJsBlock | null => {
      const tag = element.tagName.toLowerCase();

      if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
        const level = Number(tag.slice(1));
        return {
          type: "header",
          data: {
            text: element.innerHTML,
            level,
          },
        };
      }

      if (tag === "blockquote") {
        const paragraph = element.querySelector("p");
        return {
          type: "quote",
          data: {
            text: paragraph?.innerHTML ?? element.innerHTML,
            caption: "",
            alignment: "left",
          },
        };
      }

      if (tag === "pre") {
        return {
          type: "code",
          data: {
            code: element.textContent ?? "",
          },
        };
      }

      if (tag === "ul" || tag === "ol") {
        const items = Array.from(element.querySelectorAll(":scope > li"))
          .map((item) => item.innerHTML.trim())
          .filter(Boolean);
        return {
          type: "list",
          data: {
            style: tag === "ol" ? "ordered" : "unordered",
            items,
          },
        };
      }

      if (tag === "hr") {
        return {
          type: "delimiter",
          data: {},
        };
      }

      const image = tag === "img" ? element : element.querySelector("img");
      if (image?.getAttribute("src")) {
        return {
          type: "image",
          data: {
            url: image.getAttribute("src"),
            caption: image.getAttribute("alt") ?? "",
          },
        };
      }

      return {
        type: "paragraph",
        data: {
          text: element.innerHTML || element.textContent || "",
        },
      };
    })
    .filter(Boolean) as EditorJsBlock[];

  return blocks.length > 0 ? blocks : [{ type: "paragraph", data: { text: "" } }];
}

function renderListItems(items: unknown[]): string {
  return items
    .map((item) => {
      if (typeof item === "string") {
        return `<li>${item}</li>`;
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      const content = typeof (item as { content?: unknown }).content === "string"
        ? ((item as { content: string }).content)
        : "";
      const nestedItems = Array.isArray((item as { items?: unknown[] }).items)
        ? ((item as { items: unknown[] }).items)
        : [];

      const nestedHtml = nestedItems.length > 0
        ? `<ul>${renderListItems(nestedItems)}</ul>`
        : "";

      return `<li>${content}${nestedHtml}</li>`;
    })
    .join("");
}

function blocksToHtml(blocks: EditorJsBlock[]) {
  const html = blocks
    .map((block) => {
      if (block.type === "paragraph") {
        const text = typeof block.data.text === "string" ? block.data.text : "";
        return `<p>${text}</p>`;
      }

      if (block.type === "header") {
        const text = typeof block.data.text === "string" ? block.data.text : "";
        const rawLevel = typeof block.data.level === "number" ? block.data.level : 2;
        const level = Math.max(1, Math.min(6, Math.floor(rawLevel)));
        return `<h${level}>${text}</h${level}>`;
      }

      if (block.type === "quote") {
        const text = typeof block.data.text === "string" ? block.data.text : "";
        const caption = typeof block.data.caption === "string" ? block.data.caption : "";
        return caption
          ? `<blockquote><p>${text}</p><cite>${caption}</cite></blockquote>`
          : `<blockquote><p>${text}</p></blockquote>`;
      }

      if (block.type === "code") {
        const code = typeof block.data.code === "string" ? block.data.code : "";
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }

      if (block.type === "list") {
        const style = block.data.style === "ordered" ? "ol" : "ul";
        const items = Array.isArray(block.data.items) ? block.data.items : [];
        const itemsHtml = renderListItems(items);
        if (!itemsHtml) {
          return "";
        }
        return `<${style}>${itemsHtml}</${style}>`;
      }

      if (block.type === "delimiter") {
        return "<hr />";
      }

      if (block.type === "image") {
        const url = typeof block.data.url === "string"
          ? block.data.url
          : typeof (block.data.file as { url?: unknown } | undefined)?.url === "string"
          ? ((block.data.file as { url: string }).url)
          : "";
        const caption = typeof block.data.caption === "string" ? block.data.caption : "";
        if (!url) {
          return "";
        }
        return `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(caption)}" />${
          caption ? `<figcaption>${caption}</figcaption>` : ""
        }</figure>`;
      }

      return "";
    })
    .filter(Boolean)
    .join("");

  return html || "<p></p>";
}

function computeStatsFromHtml(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.length > 0 ? text.split(" ").length : 0;
  const minutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
  return { words, minutes };
}

export function EditorJsEditor({ value, onChange }: EditorJsEditorProps) {
  const holderId = useMemo(
    () => `editorjs-holder-${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  const editorRef = useRef<EditorJS | null>(null);
  const isReadyRef = useRef(false);
  const syncingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef(normalizeHtml(value));
  const [stats, setStats] = useState(() => computeStatsFromHtml(lastHtmlRef.current));

  onChangeRef.current = onChange;

  const syncFromHtml = useCallback(async (html: string) => {
    if (!editorRef.current || !isReadyRef.current) {
      return;
    }

    const normalized = normalizeHtml(html);
    if (normalized === lastHtmlRef.current) {
      return;
    }

    syncingRef.current = true;
    const nextBlocks = htmlToBlocks(normalized);
    await editorRef.current.render({ blocks: nextBlocks });
    const syncedHtml = blocksToHtml(nextBlocks);
    lastHtmlRef.current = syncedHtml;
    setStats(computeStatsFromHtml(syncedHtml));
    syncingRef.current = false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const [
        { default: EditorJSClass },
        { default: Header },
        { default: List },
        { default: Quote },
        { default: Code },
        { default: Delimiter },
        { default: SimpleImage },
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/quote"),
        import("@editorjs/code"),
        import("@editorjs/delimiter"),
        import("@editorjs/simple-image"),
      ]);

      if (!isMounted) {
        return;
      }

      const initialBlocks = htmlToBlocks(value);
      const initialHtml = blocksToHtml(initialBlocks);
      lastHtmlRef.current = initialHtml;
      setStats(computeStatsFromHtml(initialHtml));

      const instance = new EditorJSClass({
        holder: holderId,
        data: { blocks: initialBlocks },
        autofocus: false,
        inlineToolbar: true,
        placeholder: "Write your blog post...",
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          code: Code,
          delimiter: Delimiter,
          image: {
            class: SimpleImage,
            inlineToolbar: true,
          },
        },
        onReady: () => {
          isReadyRef.current = true;
        },
        onChange: async () => {
          if (syncingRef.current || !editorRef.current) {
            return;
          }

          const saved = (await editorRef.current.save()) as { blocks: EditorJsBlock[] };
          const html = blocksToHtml(saved.blocks ?? []);
          lastHtmlRef.current = html;
          setStats(computeStatsFromHtml(html));
          onChangeRef.current(html);
        },
      } as any);

      editorRef.current = instance as unknown as EditorJS;
    };

    void init();

    return () => {
      isMounted = false;
      isReadyRef.current = false;
      if (editorRef.current) {
        void editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [holderId, value]);

  useEffect(() => {
    void syncFromHtml(value);
  }, [syncFromHtml, value]);

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-card">
      <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span>Editor.js</span>
        <span className="ml-2">
          {stats.words} words
          {stats.minutes > 0 ? ` • ${stats.minutes} min read` : ""}
        </span>
      </div>
      <div className="min-h-[460px] bg-background p-4">
        <div id={holderId} className="editorjs-holder min-h-[420px]" />
      </div>
    </div>
  );
}
