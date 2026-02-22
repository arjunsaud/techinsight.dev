"use client";

import dynamic from "next/dynamic";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EditorJsEditor = dynamic(
  () => import("./editor-editorjs").then((module) => module.EditorJsEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[420px] animate-pulse rounded-xl border bg-muted/20 p-6 text-sm text-muted-foreground">
        Loading block editor...
      </div>
    )
  }
);

export function BlogEditor(props: BlogEditorProps) {
  return <EditorJsEditor {...props} />;
}
