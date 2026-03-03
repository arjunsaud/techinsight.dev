"use client";

import dynamic from "next/dynamic";

interface ArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const BlockNoteEditor = dynamic(() => import("./blocknote-editor"), {
  ssr: false,
  loading: () => (
    <div className="w-full animate-pulse rounded-xl border text-sm">
      Loading block editor...
    </div>
  ),
});

export function ArticleEditor(props: ArticleEditorProps) {
  return <BlockNoteEditor {...props} />;
}
