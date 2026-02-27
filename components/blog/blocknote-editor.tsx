"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useRef } from "react";

interface BlockNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BlockNoteEditor({
  value,
  onChange,
}: BlockNoteEditorProps) {
  const isInitialRendering = useRef(true);

  const editor = useCreateBlockNote();

  // Initialize editor with HTML content
  useEffect(() => {
    async function loadInitialContent() {
      if (isInitialRendering.current && value) {
        const blocks = await editor.tryParseHTML(value);
        editor.replaceBlocks(editor.document, blocks);
        isInitialRendering.current = false;
      }
    }
    loadInitialContent();
  }, [editor, value]);

  const handleChange = () => {
    const pushChanges = async () => {
      const html = await editor.blocksToHTMLLossy(editor.document);
      onChange(html);
    };
    pushChanges();
  };

  return (
    <div className="min-h-[460px] bg-background">
      <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
    </div>
  );
}
