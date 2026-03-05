"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useRef, useState } from "react";
import { articleService } from "@/services/article-service";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Type } from "lucide-react";

interface BlockNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  accessToken: string;
}

export default function BlockNoteEditor({
  value,
  onChange,
  accessToken,
}: BlockNoteEditorProps) {
  const isInitialRendering = useRef(true);
  const [fontSize, setFontSize] = useState(1.04);

  const increaseFontSize = () => setFontSize((s) => Math.min(s + 0.1, 2.5));
  const decreaseFontSize = () => setFontSize((s) => Math.max(s - 0.1, 0.8));

  const uploadFile = async (file: File) => {
    const draft = await articleService.getUploadDraft(file.name, accessToken);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", draft.apiKey);
    formData.append("timestamp", draft.timestamp.toString());
    formData.append("signature", draft.signature);
    formData.append("folder", draft.folder);
    if (draft.uploadPreset) {
      formData.append("upload_preset", draft.uploadPreset);
    }

    const response = await fetch(draft.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const result = await response.json();
    return result.secure_url;
  };

  const editor = useCreateBlockNote({
    uploadFile,
  });

  // Initialize editor with HTML content
  useEffect(() => {
    async function loadInitialContent() {
      if (isInitialRendering.current && value) {
        const blocks = await editor.tryParseHTMLToBlocks(value);
        editor.replaceBlocks(editor.document, blocks);
        isInitialRendering.current = false;
      }
    }
    loadInitialContent();
  }, [editor, value]);

  const debounceRef = useRef<number | null>(null);
  const handleChange = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      const html = await editor.blocksToHTMLLossy(editor.document);
      onChange(html);
    }, 200);
  };

  return (
    <div
      className="w-full bg-background"
      style={{ "--bn-font-size": `${fontSize}rem` } as any}
    >
      <div className="mb-2 flex items-center gap-2 border-b pb-2">
        <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={decreaseFontSize}
            title="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
            <Type className="h-3.5 w-3.5" />
            <span>{Math.round(fontSize * 100)}%</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={increaseFontSize}
            title="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
    </div>
  );
}
